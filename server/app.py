"""Dewford same-origin website and admin API (Python standard library)."""
import argparse
import datetime as dt
import getpass
import hashlib
import hmac
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import sqlite3
import threading
import time
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DATA = Path(os.environ.get('DEWFORD_DATA_DIR', str(ROOT / '.dewford-data'))).resolve()
BOARDS = ('event', 'preschool', 'elementary')
SESSIONS = {}
ATTEMPTS = {}
LOCK = threading.Lock()


def connect():
    db = sqlite3.connect(DATA / 'dewford.sqlite3')
    db.row_factory = sqlite3.Row
    return db


def initialize():
    DATA.mkdir(mode=0o700, parents=True, exist_ok=True)
    with connect() as db:
        db.executescript('''CREATE TABLE IF NOT EXISTS admins (username TEXT PRIMARY KEY, salt TEXT, password TEXT);
        CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, board TEXT NOT NULL, position INTEGER NOT NULL, data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, created TEXT NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY);''')
        if not db.execute("SELECT 1 FROM metadata WHERE key='seeded'").fetchone():
            source = (ROOT / 'assets/data/dewford-events.js').read_text()
            posts = json.loads(source[source.index('['):].strip().rstrip(';'))
            for i, post in enumerate(posts):
                db.execute('INSERT INTO posts VALUES (?,?,?,?)', (post['id'], 'event', i, json.dumps(post)))
            calendar = json.loads((ROOT / 'assets/data/dewford-calendar.json').read_text())
            for board, entries in calendar.items():
                for i, post in enumerate(entries):
                    post['id'] = secrets.token_hex(12)
                    db.execute('INSERT INTO posts VALUES (?,?,?,?)', (post['id'], board, i, json.dumps(post)))
            db.execute("INSERT INTO metadata VALUES ('seeded')")


def posts():
    with connect() as db:
        return [dict(json.loads(r['data']), id=r['id'], board=r['board'], position=r['position'])
                for r in db.execute('SELECT * FROM posts ORDER BY position, id')]


def password_hash(password, salt):
    return hashlib.pbkdf2_hmac('sha256', password.encode(), bytes.fromhex(salt), 600000).hex()


def validate_post(data):
    board = data.get('board')
    if board not in BOARDS:
        raise ValueError('게시판을 선택해 주세요.')
    for field, limit in [('title', 200), ('description', 20000), ('excerpt', 1000), ('category', 100), ('alt', 300), ('date', 10), ('image', 2000)]:
        value = data.get(field, '')
        if not isinstance(value, str) or len(value) > limit:
            raise ValueError('입력 내용이 너무 길거나 형식이 올바르지 않습니다.')
        data[field] = value.strip()
    if not data['title']:
        raise ValueError('제목을 입력해 주세요.')
    if board != 'event' or data['date']:
        try:
            dt.date.fromisoformat(data['date'])
        except ValueError:
            raise ValueError('올바른 일정 날짜를 입력해 주세요.')
    for field in ('gallery', 'headings', 'paragraphs'):
        values = data.get(field, [])
        if not isinstance(values, list) or len(values) > 30 or any(not isinstance(v, str) or len(v) > 20000 for v in values):
            raise ValueError('본문 또는 이미지 형식을 확인해 주세요.')
        data[field] = values
    for image in [data['image']] + data['gallery']:
        if image and not (re.fullmatch(r'assets/[\w./% -]+\.(?:png|jpg|jpeg|webp|gif)', image, re.I) and '..' not in image or re.match(r'^https://[^\s]+$', image)):
            raise ValueError('이미지는 assets 경로 또는 HTTPS 주소를 사용해 주세요.')
    if board == 'event' and not data['image']:
        data['image'] = 'assets/images/dewford/events/event-01.png'
    return {key: data[key] for key in ('board', 'title', 'date', 'description', 'excerpt', 'category', 'image', 'alt', 'gallery', 'headings', 'paragraphs')}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        # Do not log request bodies, credentials or inquiry contents.
        super().log_message(fmt, *args)

    def end_headers(self):
        if urlsplit(self.path).path in ('/admin.html', '/admin-login.html'):
            self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        super().end_headers()

    def reply(self, status, payload, cookie=None, content_type='application/json; charset=utf-8'):
        raw = (json.dumps(payload, ensure_ascii=False) if content_type.startswith('application/json') else payload).encode()
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Cache-Control', 'no-store')
        if cookie:
            self.send_header('Set-Cookie', cookie)
        self.end_headers()
        self.wfile.write(raw)

    def session(self):
        jar = cookies.SimpleCookie()
        try:
            jar.load(self.headers.get('Cookie', ''))
        except cookies.CookieError:
            return None
        token = jar.get('dewford_session')
        with LOCK:
            session = SESSIONS.get(token.value if token else '')
            return session if session and session['expires'] > time.time() else None

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/session':
            session = self.session()
            return self.reply(200, {'authenticated': bool(session), 'csrf': session['csrf'] if session else None, 'username': session['username'] if session else None})
        if path == '/api/posts':
            return self.reply(200, posts())
        if path == '/api/inquiries':
            if not self.session():
                return self.reply(401, {'error': '관리자 로그인이 필요합니다.'})
            with connect() as db:
                rows = [dict(json.loads(r['data']), id=r['id'], created=r['created'], status=r['status']) for r in db.execute('SELECT * FROM inquiries ORDER BY created DESC')]
            return self.reply(200, rows)
        if path == '/assets/data/dewford-events.js':
            return self.reply(200, 'window.DEWFORD_EVENTS = ' + json.dumps([p for p in posts() if p['board'] == 'event'], ensure_ascii=False) + ';', content_type='text/javascript; charset=utf-8')
        if path == '/assets/data/dewford-calendar.json':
            return self.reply(200, {b: [p for p in posts() if p['board'] == b] for b in BOARDS[1:]})
        if path.startswith('/api/'):
            return self.reply(404, {'error': '요청을 찾을 수 없습니다.'})
        target = Path(self.translate_path(path)).resolve()
        # Serve only public website resources, never database, source or hidden files.
        if not target.is_relative_to(ROOT) or any(p.startswith('.') for p in target.relative_to(ROOT).parts) or target.is_relative_to(DATA) or target.suffix.lower() not in ('.html', '.css', '.js', '.json', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.mp4', '.webm', '.pdf', '.map') and path != '/':
            return self.reply(404, {'error': '파일을 찾을 수 없습니다.'})
        return super().do_GET()

    def do_HEAD(self):
        # Static serving restrictions must also apply to HEAD requests.
        self.send_error(405)

    def do_POST(self):
        self.mutate()

    def do_PUT(self):
        self.mutate()

    def do_DELETE(self):
        self.mutate()

    def mutate(self):
        try:
            path = urlsplit(self.path).path
            origin = self.headers.get('Origin')
            expected = os.environ.get('DEWFORD_ORIGIN', 'http://' + self.headers.get('Host', ''))
            if origin and origin != expected or self.headers.get('Sec-Fetch-Site') == 'cross-site':
                return self.reply(403, {'error': '허용되지 않은 요청입니다.'})
            if self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
                return self.reply(415, {'error': 'JSON 요청이 필요합니다.'})
            size = int(self.headers.get('Content-Length', '0'))
            if size < 0 or size > 200000:
                return self.reply(413, {'error': '입력 내용이 너무 큽니다.'})
            data = json.loads(self.rfile.read(size) or b'{}')
            if not isinstance(data, dict):
                raise ValueError('입력 형식을 확인해 주세요.')
            if path == '/api/login' and self.command == 'POST':
                ip = self.client_address[0]
                with LOCK:
                    attempts = [t for t in ATTEMPTS.get(ip, []) if t > time.time() - 900]
                    ATTEMPTS[ip] = attempts
                    if len(attempts) >= 10:
                        return self.reply(429, {'error': '로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'})
                    attempts.append(time.time())
                username, password = data.get('username', ''), data.get('password', '')
                if not isinstance(username, str) or not isinstance(password, str) or len(password) > 1024:
                    raise ValueError('아이디와 비밀번호를 확인해 주세요.')
                with connect() as db:
                    row = db.execute('SELECT * FROM admins WHERE username=?', (username,)).fetchone()
                candidate = password_hash(password, row['salt'] if row else '00' * 16)
                if not row or not hmac.compare_digest(candidate, row['password']):
                    return self.reply(401, {'error': '아이디 또는 비밀번호가 올바르지 않습니다.'})
                token = secrets.token_urlsafe(32)
                with LOCK:
                    ATTEMPTS.pop(ip, None)
                    for old in list(SESSIONS):
                        if SESSIONS[old]['expires'] <= time.time():
                            del SESSIONS[old]
                    SESSIONS[token] = {'username': username, 'csrf': secrets.token_urlsafe(32), 'expires': time.time() + 28800}
                secure = '; Secure' if expected.startswith('https:') else ''
                return self.reply(200, {'ok': True}, f'dewford_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800{secure}')
            if path == '/api/inquiries' and self.command == 'POST':
                inquiry = {}
                for key in ('parent', 'email', 'phone', 'grade', 'program', 'topic', 'message', 'source'):
                    value = data.get(key, '')
                    if not isinstance(value, str) or len(value) > (5000 if key == 'message' else 400):
                        raise ValueError('상담 입력 내용을 확인해 주세요.')
                    inquiry[key] = value.strip()
                if not inquiry['parent'] or not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', inquiry['email']):
                    raise ValueError('성함과 이메일을 확인해 주세요.')
                if data.get('consent') is not True:
                    raise ValueError('개인정보 수집 및 이용에 동의해 주세요.')
                ip = 'inquiry:' + self.client_address[0]
                with LOCK:
                    recent = [t for t in ATTEMPTS.get(ip, []) if t > time.time() - 3600]
                    if len(recent) >= 20:
                        return self.reply(429, {'error': '잠시 후 다시 신청해 주세요.'})
                    ATTEMPTS[ip] = recent + [time.time()]
                inquiry['consent'] = True
                with connect() as db:
                    db.execute('INSERT INTO inquiries VALUES (?,?,?,?)', (secrets.token_hex(12), dt.datetime.now(dt.timezone.utc).isoformat(), 'new', json.dumps(inquiry)))
                return self.reply(201, {'ok': True})
            session = self.session()
            if not session:
                return self.reply(401, {'error': '로그인이 만료되었습니다. 다시 로그인해 주세요.'})
            if not hmac.compare_digest(self.headers.get('X-CSRF-Token', ''), session['csrf']):
                return self.reply(403, {'error': '페이지를 새로고침한 후 다시 시도해 주세요.'})
            if path == '/api/logout' and self.command == 'POST':
                with LOCK:
                    for key in list(SESSIONS):
                        if SESSIONS[key] is session:
                            del SESSIONS[key]
                return self.reply(200, {'ok': True}, 'dewford_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
            if path == '/api/posts' and self.command == 'POST':
                post = validate_post(data)
                post['id'] = secrets.token_hex(12)
                with connect() as db:
                    position = db.execute('SELECT COALESCE(MIN(position),0)-1 FROM posts').fetchone()[0]
                    db.execute('INSERT INTO posts VALUES (?,?,?,?)', (post['id'], post['board'], position, json.dumps(post)))
                return self.reply(201, post)
            match = re.fullmatch(r'/api/posts/([\w-]+)(/reorder)?', path)
            if match:
                with connect() as db:
                    row = db.execute('SELECT * FROM posts WHERE id=?', (match[1],)).fetchone()
                    if not row:
                        return self.reply(404, {'error': '게시글을 찾을 수 없습니다.'})
                    if match[2] and self.command == 'POST':
                        if data.get('direction') not in ('up', 'down'):
                            raise ValueError('이동 방향을 확인해 주세요.')
                        ids = [r[0] for r in db.execute('SELECT id FROM posts WHERE board=? ORDER BY position,id', (row['board'],))]
                        i = ids.index(row['id'])
                        j = i + (-1 if data['direction'] == 'up' else 1)
                        if 0 <= j < len(ids):
                            ids[i], ids[j] = ids[j], ids[i]
                            for position, ident in enumerate(ids):
                                db.execute('UPDATE posts SET position=? WHERE id=?', (position, ident))
                    elif not match[2] and self.command == 'PUT':
                        post = validate_post(data)
                        post['id'] = row['id']
                        db.execute('UPDATE posts SET board=?, data=? WHERE id=?', (post['board'], json.dumps(post), row['id']))
                    elif not match[2] and self.command == 'DELETE':
                        db.execute('DELETE FROM posts WHERE id=?', (row['id'],))
                    else:
                        return self.reply(405, {'error': '허용되지 않은 작업입니다.'})
                return self.reply(200, {'ok': True})
            match = re.fullmatch(r'/api/inquiries/([\w-]+)', path)
            if match and self.command in ('PUT', 'DELETE'):
                with connect() as db:
                    if not db.execute('SELECT 1 FROM inquiries WHERE id=?', (match[1],)).fetchone():
                        return self.reply(404, {'error': '상담 내역을 찾을 수 없습니다.'})
                    if self.command == 'DELETE':
                        db.execute('DELETE FROM inquiries WHERE id=?', (match[1],))
                    else:
                        if data.get('status') not in ('new', 'reviewing', 'done'):
                            raise ValueError('상담 상태를 확인해 주세요.')
                        db.execute('UPDATE inquiries SET status=? WHERE id=?', (data['status'], match[1]))
                return self.reply(200, {'ok': True})
            return self.reply(404, {'error': '요청을 찾을 수 없습니다.'})
        except (ValueError, TypeError) as error:
            return self.reply(400, {'error': str(error) if isinstance(error, ValueError) else '입력 형식을 확인해 주세요.'})
        except Exception:
            return self.reply(500, {'error': '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    parser.add_argument('--create-admin', metavar='USERNAME')
    args = parser.parse_args()
    initialize()
    if args.create_admin:
        password = getpass.getpass('관리자 비밀번호 (12자 이상): ')
        if len(password) < 12:
            parser.error('비밀번호는 12자 이상이어야 합니다.')
        if password != getpass.getpass('비밀번호 확인: '):
            parser.error('비밀번호가 일치하지 않습니다.')
        salt = secrets.token_hex(16)
        with connect() as db:
            db.execute('INSERT OR REPLACE INTO admins VALUES (?,?,?)', (args.create_admin, salt, password_hash(password, salt)))
        print('관리자 계정을 저장했습니다.')
        return
    print(f'Dewford: http://{args.host}:{args.port}/admin-login.html', flush=True)
    ThreadingHTTPServer((args.host, args.port), Handler).serve_forever()


if __name__ == '__main__':
    main()
