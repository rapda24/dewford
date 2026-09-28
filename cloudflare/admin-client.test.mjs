import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../assets/js/dewford-admin.js',import.meta.url),'utf8');
function client(fetch){
  const elements=Object.fromEntries(['#df-login-form','#df-password-toggle','[name=password]','#df-login-status','#df-login-form [type=submit]'].map(key=>[key,{listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},setAttribute(key,value){this[key]=value;}}]));
  elements['[name=password]'].type='password';
  elements['#df-login-form'].querySelector=()=>elements['#df-login-form [type=submit]'];
  const location={search:'',protocol:'https:',replace(path){this.redirect=path;}};
  const context={window:{addEventListener(){}},document:{querySelector:s=>elements[s]},location,URLSearchParams,AbortController,setTimeout,clearTimeout,fetch,FormData:class {constructor(){return [['username','admin'],['password','test-only-password']];}}};
  const completion=vm.runInNewContext(source,context);
  return {elements,location,completion};
}
test('login controls work while session request is pending',async()=>{
  let finishSession;
  const c=client(path=>path.endsWith('/session')?new Promise(resolve=>{finishSession=resolve;}):Promise.resolve({ok:true,json:async()=>({ok:true})}));
  const toggle=c.elements['#df-password-toggle'];
  toggle.listeners.click({currentTarget:toggle});
  assert.equal(c.elements['[name=password]'].type,'text');
  assert.equal(toggle['aria-pressed'],'true');
  toggle.listeners.click({currentTarget:toggle});
  assert.equal(c.elements['[name=password]'].type,'password');
  let prevented=false;
  await c.elements['#df-login-form'].listeners.submit({preventDefault(){prevented=true;},target:c.elements['#df-login-form']});
  assert.equal(prevented,true);
  assert.equal(c.location.redirect,'admin.html');
  finishSession({ok:true,json:async()=>({authenticated:false})});
  await c.completion;
});
test('setup failure keeps password toggle and login retry available',async()=>{
  const c=client(async()=>({ok:false,status:503,json:async()=>({error:'관리자 계정 설정을 준비 중입니다.'})}));
  await c.completion;
  assert.match(c.elements['#df-login-status'].textContent,/관리자 계정/);
  const toggle=c.elements['#df-password-toggle'];
  toggle.listeners.click({currentTarget:toggle});
  assert.equal(c.elements['[name=password]'].type,'text');
  await c.elements['#df-login-form'].listeners.submit({preventDefault(){},target:c.elements['#df-login-form']});
  assert.equal(c.elements['#df-login-form [type=submit]'].disabled,false);
  assert.equal(c.location.redirect,undefined);
});
