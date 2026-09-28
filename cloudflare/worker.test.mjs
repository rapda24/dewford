import {test, before, after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare, convertV4MiniflareOptions} from 'miniflare';
import {readFile} from 'node:fs/promises';

let mf, options, db;
const password = 'local-integration-test-only-2026';
const base = 'https://dewford.test';
let counter = 0;
before(async () => {
  const bundle = await build({entryPoints: ['cloudflare/worker.mjs'], bundle: true, format: 'esm', write: false, platform: 'browser', target: 'es2022'});
  options = {
    modules: true, script: bundle.outputFiles[0].text, compatibilityDate: '2026-09-26',
    d1Databases: {DB: 'test-db'}, bindings: {ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: password},
    serviceBindings: {ASSETS: () => new Response('public-static-asset')}
  };
  mf = new Miniflare(convertV4MiniflareOptions(options));
  await mf.ready;
  db = await mf.getD1Database('DB');
});
async function resetOptions(opts) { await mf.setOptions(convertV4MiniflareOptions(opts)); }
after(async () => { await mf?.dispose(); });
async function request(path, {method = 'GET', data, cookie, csrf, ip = '192.0.2.1', headers = {}} = {}) {
  const res = await mf.dispatchFetch(base + path, {method, headers: {
    'Content-Type': 'application/json', 'CF-Connecting-IP': ip,
    ...(cookie ? {Cookie: cookie} : {}), ...(csrf ? {'X-CSRF-Token': csrf} : {}), ...headers
  }, ...(data === undefined ? {} : {body: JSON.stringify(data)})});
  const value = res.headers.get('Content-Type')?.includes('application/json') ? await res.json() : await res.text();
  return {status: res.status, value, headers: res.headers};
}
async function login() {
  const res = await request('/api/login', {method: 'POST', ip: `192.0.2.${++counter + 10}`, data: {username: 'admin', password}});
  assert.equal(res.status, 200, JSON.stringify(res.value));
  const cookie = res.headers.get('Set-Cookie').split(';')[0];
  const session = await request('/api/session', {cookie});
  assert.equal(session.value.authenticated, true);
  return {cookie, csrf: session.value.csrf};
}
const postData = {board: 'event', title: '연결 검증 이벤트', date: '2026-09-28', description: '본문', paragraphs: ['본문'], image: ''};

test('initializes D1 and seeds once under simultaneous first requests', async () => {
  const results = await Promise.all(Array.from({length: 5}, () => request('/api/posts')));
  results.forEach(result => {assert.equal(result.status, 200, JSON.stringify(result.value)); assert.equal(result.value.length, 6);});
  assert.equal((await db.prepare('SELECT COUNT(*) AS count FROM posts').first()).count, 6);
});

test('anonymous reads are public, inquiry reads and all mutations require authentication', async () => {
  assert.deepEqual((await request('/api/session')).value, {authenticated: false, username: null, csrf: null});
  assert.equal((await request('/api/inquiries')).status, 401);
  assert.equal((await request('/api/posts', {method: 'POST', data: postData})).status, 401);
  assert.equal((await request('/api/posts/event-01', {method: 'DELETE', data: {}})).status, 401);
  assert.equal((await request('/api/unknown')).status, 404);
  assert.equal((await request('/api/posts', {method: 'PATCH', data: {}})).status, 405);
});

test('bad credentials, forged cookie, cross-origin requests, CSRF and invalid bodies are rejected', async () => {
  assert.equal((await request('/api/login', {method: 'POST', data: {username: 'admin', password: 'wrong'}})).status, 401);
  assert.equal((await request('/api/session', {cookie: 'dewford_session=' + 'a'.repeat(64) + '.' + 'b'.repeat(64)})).value.authenticated, false);
  const auth = await login();
  assert.equal((await request('/api/posts', {method: 'POST', data: postData, cookie: auth.cookie})).status, 403);
  assert.equal((await request('/api/posts', {method: 'POST', data: postData, ...auth, headers: {Origin: 'https://another.test'}})).status, 403);
  assert.equal((await request('/api/login', {method: 'POST', data: {}, headers: {'Content-Type': 'text/plain'}})).status, 415);
  assert.equal((await request('/api/login', {method: 'POST', data: []})).status, 400);
  assert.equal((await request('/api/posts', {method: 'POST', data: {content: 'x'.repeat(200001)}, ...auth})).status, 413);
});

test('post create, edit, board move, date validation, public assets and delete stay consistent', async () => {
  const auth = await login();
  const created = await request('/api/posts', {method: 'POST', data: postData, ...auth});
  assert.equal(created.status, 201, JSON.stringify(created.value));
  const id = created.value.id;
  let publicJS = await request('/assets/data/dewford-events.js');
  assert.ok(publicJS.value.includes(id));
  assert.equal(publicJS.headers.get('Cache-Control'), 'no-store');
  let res = await request('/api/posts/' + id, {method: 'PUT', data: {...postData, board: 'preschool', title: '유치부 일정'}, ...auth});
  assert.equal(res.status, 200);
  assert.equal((await request('/assets/data/dewford-calendar.json')).value.preschool.find(p => p.id === id).title, '유치부 일정');
  assert.ok(!(await request('/assets/data/dewford-events.js')).value.includes(id));
  assert.equal((await request('/api/posts/' + id, {method: 'PUT', data: {...postData, board: 'elementary', date: '2026-02-30'}, ...auth})).status, 400);
  assert.equal((await request('/api/posts/' + id, {method: 'PUT', data: {...postData, board: 'elementary'}, ...auth})).status, 200);
  assert.ok((await request('/assets/data/dewford-calendar.json')).value.elementary.some(p => p.id === id));
  assert.equal((await request('/api/posts/' + id, {method: 'DELETE', data: {}, ...auth})).status, 200);
  assert.equal((await request('/api/posts/' + id, {method: 'DELETE', data: {}, ...auth})).status, 404);
});

test('moving items up/down and hitting list boundaries preserves order and uniqueness', async () => {
  const auth = await login();
  const original = (await request('/api/posts')).value.map(p => p.id);
  const middle = original[2];
  assert.equal((await request('/api/posts/' + middle + '/reorder', {method: 'POST', data: {direction: 'up'}, ...auth})).status, 200);
  let expected = [...original]; [expected[1], expected[2]] = [expected[2], expected[1]];
  assert.deepEqual((await request('/api/posts')).value.map(p => p.id), expected);
  await request('/api/posts/' + middle + '/reorder', {method: 'POST', data: {direction: 'down'}, ...auth});
  assert.deepEqual((await request('/api/posts')).value.map(p => p.id), original);
  await request('/api/posts/' + original[0] + '/reorder', {method: 'POST', data: {direction: 'up'}, ...auth});
  assert.deepEqual((await request('/api/posts')).value.map(p => p.id), original);
});

test('invalid post inputs and executable image URLs never reach D1', async () => {
  const auth = await login();
  for (const data of [{...postData, title: ''}, {...postData, board: 'other'}, {...postData, image: 'javascript:alert(1)'}, {...postData, gallery: ['data:text/html,evil']}, {...postData, paragraphs: [{}]}]) {
    assert.equal((await request('/api/posts', {method: 'POST', data, ...auth})).status, 400);
  }
});

test('inquiries require consent, remain private, and support state changes/deletion', async () => {
  const data = {parent: '연결 검증 학부모', email: 'test@example.com', message: '검증용 상담', consent: true};
  assert.equal((await request('/api/inquiries', {method: 'POST', data: {...data, consent: false}})).status, 400);
  assert.equal((await request('/api/inquiries', {method: 'POST', data})).status, 201);
  assert.equal((await request('/api/inquiries')).status, 401);
  const auth = await login();
  const res = await request('/api/inquiries', auth);
  assert.equal(res.headers.get('Cache-Control'), 'no-store');
  const record = res.value.find(p => p.email === data.email);
  assert.equal(record.message, data.message);
  assert.equal((await request('/api/inquiries/' + record.id, {method: 'PUT', data: {status: 'invalid'}, ...auth})).status, 400);
  assert.equal((await request('/api/inquiries/' + record.id, {method: 'PUT', data: {status: 'done'}, ...auth})).status, 200);
  assert.equal((await request('/api/inquiries', auth)).value.find(p => p.id === record.id).status, 'done');
  assert.equal((await request('/api/inquiries/' + record.id, {method: 'DELETE', data: {}, ...auth})).status, 200);
  assert.ok(!(await request('/api/inquiries', auth)).value.some(p => p.id === record.id));
});

test('login throttling is atomic for concurrent attempts', async () => {
  const results = await Promise.all(Array.from({length: 12}, () => request('/api/login', {method: 'POST', ip: '192.0.2.200', data: {username: 'admin', password: 'wrong'}})));
  assert.equal(results.filter(r => r.status === 401).length, 10);
  assert.equal(results.filter(r => r.status === 429).length, 2);
});

test('session expiry and logout revoke access; cookies are secure and HTTP-only', async () => {
  const res = await request('/api/login', {method: 'POST', ip: '192.0.2.201', data: {username: 'admin', password}});
  assert.match(res.headers.get('Set-Cookie'), /HttpOnly; SameSite=Strict; Path=\/; Max-Age=28800; Secure/);
  const auth = await login();
  assert.equal((await request('/api/logout', {method: 'POST', data: {}, ...auth})).status, 200);
  assert.equal((await request('/api/session', auth)).value.authenticated, false);
  const expired = await login();
  await db.prepare('UPDATE sessions SET expires=0').run();
  assert.equal((await request('/api/inquiries', expired)).status, 401);
});

test('restarts do not resurrect a deleted seed post and secret rotation invalidates sessions', async () => {
  const auth = await login();
  await request('/api/posts/event-06', {method: 'DELETE', data: {}, ...auth});
  await resetOptions({...options, bindings: {...options.bindings, ADMIN_PASSWORD: 'a-different-test-secret-for-rotation'}});
  assert.ok(!(await request('/api/posts')).value.some(p => p.id === 'event-06'));
  assert.equal((await request('/api/session', auth)).value.authenticated, false);
  await resetOptions(options);
});

test('missing credentials fail closed instead of accepting preview login', async () => {
  await resetOptions({...options, bindings: {}});
  const res = await request('/api/session');
  assert.equal(res.status, 503);
  assert.equal(res.value.code, 'ADMIN_NOT_CONFIGURED');
  assert.equal((await request('/api/posts')).status, 200);
  await resetOptions(options);
});

test('production config routes API and live data through Worker; source and DB are excluded', async () => {
  const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
  assert.equal(config.main, 'cloudflare/worker.mjs');
  assert.equal(config.d1_databases[0].binding, 'DB');
  assert.deepEqual(config.assets.run_worker_first, ['/api/*', '/assets/data/dewford-events.js', '/assets/data/dewford-calendar.json']);
  const ignored = await readFile('.assetsignore', 'utf8');
  for (const path of ['/cloudflare/', '/server/', '/.dewford-data/', '/node_modules/', '/package-lock.json']) assert.ok(ignored.includes(path));
});

test('image attachments require admin and CSRF, persist bytes, and appear in public post data', async () => {
  const auth=await login();
  const content='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9xkAAAAASUVORK5CYII=';
  assert.equal((await request('/api/media',{method:'POST',data:{content}})).status,401);
  assert.equal((await request('/api/media',{method:'POST',cookie:auth.cookie,data:{content}})).status,403);
  assert.equal((await request('/api/media',{method:'POST',...auth,data:{content:btoa('<svg onload="alert(1)"></svg>')}})).status,400);
  assert.equal((await request('/api/media',{method:'POST',...auth,data:{content},headers:{Origin:'https://other.test'}})).status,403);
  const upload=await request('/api/media',{method:'POST',...auth,data:{content}});
  assert.equal(upload.status,201,JSON.stringify(upload.value));
  const media=await mf.dispatchFetch(base+upload.value.url);
  assert.equal(media.headers.get('Content-Type'),'image/png');
  assert.deepEqual(Buffer.from(await media.arrayBuffer()),Buffer.from(content,'base64'));
  const duplicate=await request('/api/media',{method:'POST',...auth,data:{content}});
  assert.equal(duplicate.value.url,upload.value.url);
  const post=await request('/api/posts',{method:'POST',...auth,data:{...postData,image:upload.value.url,gallery:[upload.value.url]}});
  assert.equal(post.status,201);
  assert.ok((await request('/assets/data/dewford-events.js')).value.includes(upload.value.url));
  const moved=await request('/api/posts/'+post.value.id,{method:'PUT',...auth,data:{...post.value,board:'preschool'}});
  assert.equal(moved.status,200);
  assert.ok((await request('/assets/data/dewford-calendar.json')).value.preschool.some(p=>p.image===upload.value.url));
  assert.equal((await request('/api/media/'+'0'.repeat(64))).status,404);
  const oversized=Buffer.alloc(1000001);oversized.set([255,216,255]);
  assert.equal((await request('/api/media',{method:'POST',...auth,data:{content:oversized.toString('base64')}})).status,413);
});

test('rich text formatting persists and unsafe embeds or arbitrary attributes are rejected',async()=>{
  const auth=await login();
  const content={ops:[{insert:'작은 발견',attributes:{bold:true}},{insert:'\n',attributes:{header:2}},{insert:'오늘의 소식',attributes:{size:'large'}},{insert:'\n',attributes:{list:'bullet'}}]};
  const post=await request('/api/posts',{method:'POST',...auth,data:{...postData,content}});
  assert.equal(post.status,201);assert.deepEqual(post.value.content,content);
  assert.deepEqual((await request('/api/posts')).value.find(p=>p.id===post.value.id).content,content);
  for(const invalid of [{ops:[{insert:{image:'javascript:alert(1)'}}]},{ops:[{insert:'bad',attributes:{onclick:'alert(1)'}}]},{ops:[{insert:'bad',attributes:{size:'url(bad)'}}]},{ops:[{insert:'x'.repeat(20002)}]}]){
    assert.equal((await request('/api/posts',{method:'POST',...auth,data:{...postData,content:invalid}})).status,400);
  }
});
