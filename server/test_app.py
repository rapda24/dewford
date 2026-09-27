import http.client
import json
from pathlib import Path
import tempfile
import threading
import unittest
import app


class AdminIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        app.DATA = Path(cls.temp.name)
        app.initialize()
        salt = '12' * 16
        with app.connect() as db:
            db.execute('INSERT INTO admins VALUES (?,?,?)', ('test-admin', salt, app.password_hash('integration-password', salt)))
        cls.server = app.ThreadingHTTPServer(('127.0.0.1', 0), app.Handler)
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()
        cls.port = cls.server.server_port

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.temp.cleanup()

    def request(self, path, method='GET', data=None, cookie='', csrf='', origin=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.port)
        headers = {'Content-Type': 'application/json', 'Cookie': cookie, 'X-CSRF-Token': csrf}
        if origin:
            headers['Origin'] = origin
        conn.request(method, path, body=json.dumps(data) if data is not None else None, headers=headers)
        response = conn.getresponse()
        raw = response.read().decode()
        result = (response.status, json.loads(raw) if response.getheader('Content-Type', '').startswith('application/json') else raw, response.getheader('Set-Cookie'))
        conn.close()
        return result

    def login(self):
        status, _, cookie = self.request('/api/login', 'POST', {'username': 'test-admin', 'password': 'integration-password'})
        self.assertEqual(status, 200)
        self.assertIn('HttpOnly', cookie)
        _, session, _ = self.request('/api/session', cookie=cookie)
        return cookie, session['csrf']

    def test_full_workflow_and_access_control(self):
        self.assertEqual(self.request('/api/inquiries')[0], 401)
        self.assertEqual(self.request('/api/posts','POST',{'title':'unauthorized'})[0],401)
        self.assertEqual(self.request('/api/login','POST',{'username':'test-admin','password':'wrong'})[0],401)
        cookie, csrf = self.login()
        self.assertEqual(self.request('/api/posts','POST',{},cookie=cookie)[0],403)
        self.assertEqual(self.request('/api/posts','POST',{},cookie,csrf,'https://evil.example')[0],403)
        payload={'board':'event','title':'관리자 테스트','description':'본문','paragraphs':['본문'],'date':'2026-09-27'}
        status, post, _ = self.request('/api/posts','POST',payload,cookie,csrf)
        self.assertEqual(status,201)
        ident=post['id']
        self.assertIn(ident,self.request('/assets/data/dewford-events.js')[1])
        self.assertEqual(self.request('/api/posts/'+ident+'/reorder','POST',{'direction':'down'},cookie,csrf)[0],200)
        payload.update(board='preschool',title='이동한 일정')
        self.assertEqual(self.request('/api/posts/'+ident,'PUT',payload,cookie,csrf)[0],200)
        self.assertNotIn(ident,self.request('/assets/data/dewford-events.js')[1])
        self.assertEqual(self.request('/assets/data/dewford-calendar.json')[1]['preschool'][0]['title'],'이동한 일정')
        payload['date']='2026-02-31'
        self.assertEqual(self.request('/api/posts/'+ident,'PUT',payload,cookie,csrf)[0],400)
        self.assertEqual(self.request('/api/posts/'+ident,'DELETE',{},cookie,csrf)[0],200)
        self.assertEqual(self.request('/api/posts/'+ident,'DELETE',{},cookie,csrf)[0],404)
        inquiry={'parent':'테스트 학부모','email':'test@example.com','message':'상담 확인','consent':True}
        self.assertEqual(self.request('/api/inquiries','POST',dict(inquiry,consent=False))[0],400)
        self.assertEqual(self.request('/api/inquiries','POST',inquiry)[0],201)
        _, rows, _=self.request('/api/inquiries',cookie=cookie)
        self.assertEqual(rows[0]['message'],'상담 확인')
        iid=rows[0]['id']
        self.assertEqual(self.request('/api/inquiries/'+iid,'PUT',{'status':'done'},cookie,csrf)[0],200)
        self.assertEqual(self.request('/api/inquiries',cookie=cookie)[1][0]['status'],'done')
        self.assertEqual(self.request('/api/inquiries/'+iid,'DELETE',{},cookie,csrf)[0],200)
        app.initialize()
        self.assertNotIn(ident,[p['id'] for p in app.posts()])
        self.assertEqual(self.request('/api/logout','POST',{},cookie,csrf)[0],200)
        self.assertFalse(self.request('/api/session',cookie=cookie)[1]['authenticated'])
        self.assertEqual(self.request('/api/inquiries',cookie=cookie)[0],401)

    def test_static_boundaries_and_pages(self):
        for path in ('/.git/config','/.dewford-data/dewford.sqlite3','/server/app.py','/../server/app.py','/%2e%2e/server/app.py'):
            self.assertEqual(self.request(path)[0],404,path)
        for path in ('/','/admin.html','/admin-login.html','/event.html','/assets/js/dewford-admin.js'):
            self.assertEqual(self.request(path)[0],200,path)

    def test_validation(self):
        cookie,csrf=self.login()
        for data in ({'board':'bad','title':'x'},{'board':'event','title':''},{'board':'event','title':'x','image':'javascript:alert(1)'},{'board':'event','title':'x','paragraphs':[{}]}):
            self.assertEqual(self.request('/api/posts','POST',data,cookie,csrf)[0],400)


if __name__ == '__main__':
    unittest.main()
