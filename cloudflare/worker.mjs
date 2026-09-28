/** Same-origin API for Dewford's existing HTML pages. Secrets stay in Worker bindings. */
import seed from './seed.json';

const BOARDS = ['event', 'preschool', 'elementary'];
const COOKIE = 'dewford_session';
const SESSION_SECONDS = 8 * 60 * 60;
const MAX_BODY = 200000;
const encoder = new TextEncoder();
const initialized = new WeakMap();

class HttpError extends Error {
  constructor(status, message, code) { super(message); this.status = status; this.code = code; }
}
function reply(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin',
    'X-Frame-Options': 'SAMEORIGIN', ...headers
  }});
}
const hex = bytes => Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
const random = () => hex(crypto.getRandomValues(new Uint8Array(32)));
const hash = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
const decodeHex = text => Uint8Array.from(text.match(/../g), b => parseInt(b, 16));
const nowSeconds = () => Math.floor(Date.now() / 1000);
const statement = (db, sql, ...args) => db.prepare(sql).bind(...args);

async function initialize(db) {
  if (!db) throw new HttpError(503, '데이터베이스 연결을 준비 중입니다. 잠시 후 다시 시도해 주세요.', 'DATABASE_NOT_CONFIGURED');
  if (initialized.has(db)) return initialized.get(db);
  const ready = (async () => {
    await db.batch([
      db.prepare('CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY)'),
      db.prepare('CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, board TEXT NOT NULL, position INTEGER NOT NULL, data TEXT NOT NULL)'),
      db.prepare('CREATE INDEX IF NOT EXISTS posts_board_position ON posts(board, position, id)'),
      db.prepare('CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, created TEXT NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL)'),
      db.prepare('CREATE INDEX IF NOT EXISTS inquiries_created ON inquiries(created DESC)'),
      db.prepare('CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, csrf TEXT NOT NULL, expires INTEGER NOT NULL)'),
      db.prepare('CREATE INDEX IF NOT EXISTS sessions_expires ON sessions(expires)'),
      db.prepare('CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires INTEGER NOT NULL)'),
      db.prepare('CREATE INDEX IF NOT EXISTS rate_limits_expires ON rate_limits(expires)')
    ]);
    // Conditional inserts and marker are atomic. Re-deploying never restores deleted posts.
    if (!await db.prepare("SELECT key FROM metadata WHERE key='seeded-v1'").first()) {
      const inserts = seed.map((p, i) => statement(db,
        "INSERT OR IGNORE INTO posts(id,board,position,data) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM metadata WHERE key='seeded-v1')",
        p.id, p.board, i, JSON.stringify(p)));
      await db.batch([...inserts, db.prepare("INSERT OR IGNORE INTO metadata(key) VALUES ('seeded-v1')")]);
    }
  })();
  initialized.set(db, ready);
  try { await ready; } catch (error) { initialized.delete(db); throw error; }
}

function credentials(env) {
  const username = env.ADMIN_USERNAME || 'admin';
  if (typeof env.ADMIN_PASSWORD !== 'string' || env.ADMIN_PASSWORD.length < 16 || env.ADMIN_PASSWORD.length > 256 || typeof username !== 'string' || username.length > 100) {
    throw new HttpError(503, '관리자 계정 설정을 준비 중입니다.', 'ADMIN_NOT_CONFIGURED');
  }
  return {username, password: env.ADMIN_PASSWORD};
}
async function signingKey(env) {
  const {username, password} = credentials(env);
  return crypto.subtle.importKey('raw', encoder.encode(`${username}\0${password}`), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign', 'verify']);
}
async function getSession(request, env) {
  const cookie = (request.headers.get('Cookie') || '').split(';').map(v => v.trim()).find(v => v.startsWith(COOKIE + '='));
  if (!cookie) return null;
  const token = cookie.slice(COOKIE.length + 1);
  if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return null;
  const [id, signature] = token.split('.');
  if (!await crypto.subtle.verify('HMAC', await signingKey(env), decodeHex(signature), encoder.encode(id))) return null;
  return statement(env.DB, 'SELECT * FROM sessions WHERE token_hash=? AND expires>?', await hash(id), nowSeconds()).first();
}
async function equalText(left, right) {
  const a = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(left)));
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(right)));
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}
function cookieHeader(request, value, maxAge) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `${COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`;
}
async function limit(db, request, scope, cap, seconds) {
  const now = nowSeconds();
  const key = scope + ':' + await hash(request.headers.get('CF-Connecting-IP') || 'local');
  // One atomic statement for rate checking even across concurrent Worker instances.
  const row = await statement(db, `INSERT INTO rate_limits(key,hits,expires) VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN expires<=? THEN 1 ELSE hits+1 END,
    expires=CASE WHEN expires<=? THEN excluded.expires ELSE expires END RETURNING hits`, key, now + seconds, now, now).first();
  if (row.hits > cap) throw new HttpError(429, '요청이 많습니다. 잠시 후 다시 시도해 주세요.');
  await statement(db, 'DELETE FROM rate_limits WHERE expires<=?', now).run();
}
async function readBody(request) {
  if (request.headers.get('Origin') && request.headers.get('Origin') !== new URL(request.url).origin || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    throw new HttpError(403, '허용되지 않은 요청입니다.');
  }
  if ((request.headers.get('Content-Type') || '').split(';')[0].trim() !== 'application/json') {
    throw new HttpError(415, 'JSON 요청이 필요합니다.');
  }
  if (Number(request.headers.get('Content-Length')) > MAX_BODY) throw new HttpError(413, '입력 내용이 너무 큽니다.');
  const reader = request.body?.getReader();
  const chunks = []; let total = 0;
  if (reader) {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY) { await reader.cancel(); throw new HttpError(413, '입력 내용이 너무 큽니다.'); }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let data;
  try { data = JSON.parse(new TextDecoder().decode(bytes) || '{}'); } catch { throw new HttpError(400, '입력 형식을 확인해 주세요.'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new HttpError(400, '입력 형식을 확인해 주세요.');
  return data;
}
function textField(data, field, max = 400) {
  const value = data[field] ?? '';
  if (typeof value !== 'string' || value.length > max) throw new HttpError(400, '입력 내용의 길이와 형식을 확인해 주세요.');
  return value.trim();
}
function safeImage(value) {
  if (!value) return true;
  if (/^assets\/[\w./% -]+\.(png|jpe?g|webp|gif)$/i.test(value) && !value.includes('..')) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password; } catch { return false; }
}
function validatePost(data) {
  if (!BOARDS.includes(data.board)) throw new HttpError(400, '게시판을 선택해 주세요.');
  const post = {board: data.board};
  for (const [field, max] of Object.entries({title: 200, description: 20000, excerpt: 1000, category: 100, alt: 300, date: 10, image: 2000})) {
    post[field] = textField(data, field, max);
  }
  if (!post.title) throw new HttpError(400, '제목을 입력해 주세요.');
  if (post.board !== 'event' || post.date) {
    const date = new Date(post.date + 'T00:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== post.date) throw new HttpError(400, '올바른 일정 날짜를 입력해 주세요.');
  }
  for (const field of ['gallery', 'headings', 'paragraphs']) {
    const values = data[field] ?? [];
    if (!Array.isArray(values) || values.length > 30 || values.some(v => typeof v !== 'string' || v.length > (field === 'gallery' ? 2000 : 20000))) throw new HttpError(400, '본문 또는 이미지 형식을 확인해 주세요.');
    post[field] = values;
  }
  if (![post.image, ...post.gallery].every(safeImage)) throw new HttpError(400, '이미지는 assets 경로 또는 HTTPS 주소를 사용해 주세요.');
  if (post.board === 'event' && !post.image) post.image = 'assets/images/dewford/events/event-01.png';
  return post;
}
async function listPosts(db) {
  const {results} = await db.prepare('SELECT * FROM posts ORDER BY position, id').all();
  return results.map(row => ({...JSON.parse(row.data), id: row.id, board: row.board, position: row.position}));
}
async function handle(request, env) {
  const path = new URL(request.url).pathname;
  const dynamic = path.startsWith('/api/') || path === '/assets/data/dewford-events.js' || path === '/assets/data/dewford-calendar.json';
  if (!dynamic) return env.ASSETS.fetch(request);
  await initialize(env.DB);
  if (request.method === 'GET') {
    if (path === '/api/session') {
      credentials(env);
      const session = await getSession(request, env);
      return reply({authenticated: !!session, username: session?.username || null, csrf: session?.csrf || null});
    }
    if (path === '/api/posts') return reply(await listPosts(env.DB));
    if (path === '/assets/data/dewford-events.js') {
      const posts = (await listPosts(env.DB)).filter(p => p.board === 'event');
      return new Response('window.DEWFORD_EVENTS = ' + JSON.stringify(posts) + ';', {headers: {'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
    }
    if (path === '/assets/data/dewford-calendar.json') {
      const posts = await listPosts(env.DB);
      return reply(Object.fromEntries(BOARDS.slice(1).map(board => [board, posts.filter(p => p.board === board)])));
    }
    if (path === '/api/inquiries') {
      if (!await getSession(request, env)) throw new HttpError(401, '관리자 로그인이 필요합니다.');
      const {results} = await env.DB.prepare('SELECT * FROM inquiries ORDER BY created DESC, id').all();
      return reply(results.map(r => ({...JSON.parse(r.data), id: r.id, created: r.created, status: r.status})));
    }
    throw new HttpError(404, '요청을 찾을 수 없습니다.');
  }
  if (!['POST', 'PUT', 'DELETE'].includes(request.method)) throw new HttpError(405, '허용되지 않은 작업입니다.');
  const data = await readBody(request);
  if (path === '/api/login' && request.method === 'POST') {
    const expected = credentials(env);
    await limit(env.DB, request, 'login', 10, 900);
    const username = textField(data, 'username', 100);
    if (typeof data.password !== 'string' || data.password.length > 256) throw new HttpError(400, '아이디와 비밀번호를 확인해 주세요.');
    const valid = await equalText(`${username}\0${data.password}`, `${expected.username}\0${expected.password}`);
    if (!valid) throw new HttpError(401, '아이디 또는 비밀번호가 올바르지 않습니다.');
    const id = random(), csrf = random();
    const signature = hex(await crypto.subtle.sign('HMAC', await signingKey(env), encoder.encode(id)));
    const previous = await getSession(request, env);
    await env.DB.batch([
      statement(env.DB, 'DELETE FROM sessions WHERE expires<=? OR token_hash=?', nowSeconds(), previous?.token_hash || ''),
      statement(env.DB, 'INSERT INTO sessions(token_hash,username,csrf,expires) VALUES (?,?,?,?)', await hash(id), expected.username, csrf, nowSeconds() + SESSION_SECONDS)
    ]);
    return reply({ok: true}, 200, {'Set-Cookie': cookieHeader(request, id + '.' + signature, SESSION_SECONDS)});
  }
  if (path === '/api/inquiries' && request.method === 'POST') {
    const inquiry = {};
    for (const field of ['parent', 'email', 'phone', 'grade', 'program', 'topic', 'message', 'source']) inquiry[field] = textField(data, field, field === 'message' ? 5000 : 400);
    if (!inquiry.parent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) throw new HttpError(400, '성함과 이메일을 확인해 주세요.');
    if (data.consent !== true) throw new HttpError(400, '개인정보 수집 및 이용에 동의해 주세요.');
    await limit(env.DB, request, 'inquiry', 20, 3600);
    inquiry.consent = true;
    await statement(env.DB, 'INSERT INTO inquiries(id,created,status,data) VALUES (?,?,?,?)', random(), new Date().toISOString(), 'new', JSON.stringify(inquiry)).run();
    return reply({ok: true}, 201);
  }
  const session = await getSession(request, env);
  if (!session) throw new HttpError(401, '로그인이 만료되었습니다. 다시 로그인해 주세요.');
  if (!await equalText(request.headers.get('X-CSRF-Token') || '', session.csrf)) throw new HttpError(403, '페이지를 새로고침한 후 다시 시도해 주세요.');
  if (path === '/api/logout' && request.method === 'POST') {
    await statement(env.DB, 'DELETE FROM sessions WHERE token_hash=?', session.token_hash).run();
    return reply({ok: true}, 200, {'Set-Cookie': cookieHeader(request, '', 0)});
  }
  if (path === '/api/posts' && request.method === 'POST') {
    const post = {...validatePost(data), id: random()};
    await statement(env.DB, 'INSERT INTO posts(id,board,position,data) VALUES (?,?,(SELECT COALESCE(MIN(position),0)-1 FROM posts),?)', post.id, post.board, JSON.stringify(post)).run();
    return reply(post, 201);
  }
  const postMatch = path.match(/^\/api\/posts\/([\w-]+)(\/reorder)?$/);
  if (postMatch) {
    const row = await statement(env.DB, 'SELECT * FROM posts WHERE id=?', postMatch[1]).first();
    if (!row) throw new HttpError(404, '게시글을 찾을 수 없습니다.');
    if (postMatch[2] && request.method === 'POST') {
      if (!['up', 'down'].includes(data.direction)) throw new HttpError(400, '이동 방향을 확인해 주세요.');
      // Normalize and swap in a single SQL statement (no lost concurrent inserts).
      const offset = data.direction === 'up' ? -1 : 1;
      await statement(env.DB, `WITH ordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY position,id) AS rank FROM posts WHERE board=?
      ), current AS (SELECT rank FROM ordered WHERE id=?), adjacent AS (
        SELECT id, rank FROM ordered WHERE rank=(SELECT rank FROM current)+?
      ) UPDATE posts SET position=(SELECT CASE
        WHEN ordered.id=? AND EXISTS(SELECT 1 FROM adjacent) THEN (SELECT rank FROM adjacent)
        WHEN ordered.id=(SELECT id FROM adjacent) THEN (SELECT rank FROM current)
        ELSE ordered.rank END FROM ordered WHERE ordered.id=posts.id)
        WHERE board=?`, row.board, row.id, offset, row.id, row.board).run();
    } else if (!postMatch[2] && request.method === 'PUT') {
      const post = {...validatePost(data), id: row.id};
      await statement(env.DB, 'UPDATE posts SET board=?, data=? WHERE id=?', post.board, JSON.stringify(post), row.id).run();
    } else if (!postMatch[2] && request.method === 'DELETE') {
      await statement(env.DB, 'DELETE FROM posts WHERE id=?', row.id).run();
    } else throw new HttpError(405, '허용되지 않은 작업입니다.');
    return reply({ok: true});
  }
  const inquiryMatch = path.match(/^\/api\/inquiries\/([\w-]+)$/);
  if (inquiryMatch && ['PUT', 'DELETE'].includes(request.method)) {
    if (!await statement(env.DB, 'SELECT id FROM inquiries WHERE id=?', inquiryMatch[1]).first()) throw new HttpError(404, '상담 내역을 찾을 수 없습니다.');
    if (request.method === 'DELETE') await statement(env.DB, 'DELETE FROM inquiries WHERE id=?', inquiryMatch[1]).run();
    else {
      if (!['new', 'reviewing', 'done'].includes(data.status)) throw new HttpError(400, '상담 상태를 확인해 주세요.');
      await statement(env.DB, 'UPDATE inquiries SET status=? WHERE id=?', data.status, inquiryMatch[1]).run();
    }
    return reply({ok: true});
  }
  throw new HttpError(404, '요청을 찾을 수 없습니다.');
}
export default {
  async fetch(request, env) {
    try { return await handle(request, env); }
    catch (error) {
      if (error instanceof HttpError) return reply({error: error.message, code: error.code}, error.status);
      // Never include SQL, inquiry contents, credentials or bindings in public errors/logs.
      return reply({error: '서버 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'}, 500);
    }
  }
};
