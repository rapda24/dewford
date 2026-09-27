/* Same-origin admin client. Authorization is enforced again by the server. */
(async function () {
  'use strict';
  window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); });
  const $ = s => document.querySelector(s);
  const labels = {event:'이벤트 게시판', preschool:'유치부 캘린더', elementary:'초등부 캘린더', inquiries:'상담 신청 내역'};
  const states = {new:'신규', reviewing:'상담 중', done:'완료'};
  const urls = {event:'event.html', preschool:'preschool-calendar.html', elementary:'elementary-calendar.html'};
  let session, allPosts = [], inquiries = [], activePost = null;
  const params = new URLSearchParams(location.search);
  let preview = !!window.DEWFORD_ADMIN_PREVIEW && (location.protocol==='file:' || params.get('preview')==='1');
  const board = Object.hasOwn(labels, params.get('board')) ? params.get('board') : 'event';
  function node(tag, text, cls) { const n=document.createElement(tag); if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; }
  async function api(path, method='GET', data) {
    if(preview)return window.DEWFORD_ADMIN_PREVIEW.request(path,method,data);
    let response;
    try { response=await fetch('/api/'+path,{method,headers:{'Content-Type':'application/json','X-CSRF-Token':session?.csrf||''},body:data===undefined?undefined:JSON.stringify(data),cache:'no-store'}); }
    catch { throw Error('서버에 연결할 수 없습니다. 연결 상태를 확인해 주세요.'); }
    let result;try {result=await response.json();}catch {throw Error('관리 서버에 연결할 수 없습니다. Dewford 서버로 접속해 주세요.');}
    if(!response.ok){if(response.status===401 && path!=='login'){location.href='admin-login.html';}throw Error(result.error||'요청을 처리하지 못했습니다.');}return result;
  }
  function action(text, fn, cls) {const b=node('button',text,cls);b.type='button';b.addEventListener('click',async()=>{b.disabled=true;try{await fn();}catch(e){$('#df-status').textContent=e.message;}finally{b.disabled=false;}});return b;}
  function returnPath(){const raw=params.get('next');return raw && /^admin\.html(?:\?[^#]*)?$/.test(raw)?raw:'admin.html';}
  try {session=await api('session');} catch(e){
    if($('#df-dashboard')&&window.DEWFORD_ADMIN_PREVIEW){preview=true;session=await api('session');}
    else {($('#df-login-status')||$('#df-auth-loading')).textContent=e.message;return;}
  }
  if($('#df-login-form')){
    if(session.authenticated){location.replace(returnPath());return;}
    $('#df-password-toggle').addEventListener('click',e=>{const input=$('[name=password]');const show=input.type==='password';input.type=show?'text':'password';e.currentTarget.textContent=show?'숨기기':'표시';e.currentTarget.setAttribute('aria-pressed',String(show));});
    $('#df-login-form').addEventListener('submit',async e=>{e.preventDefault();const button=e.target.querySelector('[type=submit]');button.disabled=true;$('#df-login-status').textContent='로그인 중입니다.';try{await api('login','POST',Object.fromEntries(new FormData(e.target)));location.replace(returnPath());}catch(error){$('#df-login-status').textContent=error.message;button.disabled=false;}});return;
  }
  if(!session.authenticated){location.replace('admin-login.html?next='+encodeURIComponent('admin.html'+location.search));return;}
  $('#df-auth-loading').hidden=true;$('#df-dashboard').hidden=false;
  $('#df-admin-name').textContent=preview?'PREVIEW · 샘플 데이터':session.username+' 님';
  if(preview){
    const banner=node('div',undefined,'df-preview-banner');
    const copy=node('div');copy.append(node('strong','관리자 화면 미리보기'),node('p','로그인 없이 확인하는 예시 화면입니다. 변경 사항은 이 브라우저의 미리보기에만 적용되며 실제 사이트에는 저장되지 않습니다.'));
    const reset=node('button','예시 초기화');reset.type='button';reset.onclick=()=>{window.DEWFORD_ADMIN_PREVIEW.reset();location.reload();};banner.append(copy,reset);$('.df-page').prepend(banner);
    const logout=$('[data-logout]');logout.textContent='미리보기 나가기';
    document.querySelectorAll('a[href]').forEach(a=>{const href=a.getAttribute('href');if(href.startsWith('?board=')||href==='admin.html'){const url=new URL(href,location.href);url.searchParams.set('preview','1');a.href=url.href;}});
  }
  $('[data-nav="'+board+'"]').setAttribute('aria-current','page');
  $('#df-page-title').textContent=labels[board];
  $('#df-page-description').textContent=board==='inquiries'?'학부모님의 상담 내용을 확인하고 진행 상태를 관리하세요.':'새로운 소식과 배움의 순간을 등록하고 관리하세요.';
  $('#df-create').hidden=board==='inquiries';$('#df-status-filter-wrap').hidden=board!=='inquiries';$('#df-public-link').hidden=board==='inquiries';$('#df-public-link').href=urls[board]||'#';
  $('[data-logout]').addEventListener('click',async()=>{if(preview){location.href='index.html';return;}try{await api('logout','POST',{});location.replace('admin-login.html');}catch(e){$('#df-status').textContent=e.message;}});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  async function refresh(){[allPosts,inquiries]=await Promise.all([api('posts'),api('inquiries')]);$('#df-event-count').textContent=allPosts.filter(p=>p.board==='event').length;$('#df-calendar-count').textContent=allPosts.filter(p=>p.board!=='event').length;$('#df-inquiry-count').textContent=inquiries.filter(p=>p.status==='new').length;render();}
  function render(){
    const q=$('#df-search').value.trim().toLowerCase(),state=$('#df-status-filter').value;
    const rows=(board==='inquiries'?inquiries:allPosts.filter(p=>p.board===board)).filter(p=>(board!=='inquiries'||!state||p.status===state)&&[p.title,p.parent,p.email,p.message,p.description].filter(Boolean).join(' ').toLowerCase().includes(q));
    $('#df-result-count').textContent='총 '+rows.length+'건';const list=$('#df-list');list.replaceChildren();
    if(!rows.length){list.append(node('p',q||state?'검색 결과가 없습니다.':board==='inquiries'?'접수된 상담 신청이 없습니다.':'등록된 게시글이 없습니다. 첫 소식을 작성해 주세요.','df-empty'));return;}
    const wrap=node('div',undefined,'df-table-wrap'),table=node('table',undefined,'df-table'),head=node('thead'),hr=node('tr');
    (board==='inquiries'?['신청자 / 관심 과정','신청일','상태','관리']:['게시글','날짜','관리']).forEach(t=>{const th=node('th',t);th.scope='col';hr.append(th);});head.append(hr);table.append(head);const body=node('tbody');
    rows.forEach(p=>{const tr=node('tr');
      if(board==='inquiries'){
        const cell=node('td');cell.append(node('strong',p.parent),node('div',p.program||p.topic||'일반 상담','df-muted'));tr.append(cell,node('td',new Date(p.created).toLocaleDateString('ko-KR')),node('td'));
        tr.lastChild.append(node('span',states[p.status],'df-badge'));const td=node('td'),buttons=node('div',undefined,'df-row-actions');buttons.append(action('내용 보기',()=>showInquiry(p)));td.append(buttons);tr.append(td);
      }else{
        const td=node('td'),cell=node('div',undefined,'df-post-cell');if(p.board==='event'){const img=node('img');img.src=p.image;img.alt='';img.loading='lazy';cell.append(img);}const copy=node('div');copy.append(node('strong',p.title),node('small',p.category||labels[p.board]));cell.append(copy);td.append(cell);tr.append(td,node('td',p.date||'—'));
        const controls=node('td'),buttons=node('div',undefined,'df-row-actions');const link=node('a','보기');link.href=p.board==='event'?'detail.html?id='+encodeURIComponent(p.id):urls[p.board]+'?date='+encodeURIComponent(p.date);buttons.append(link,action('수정',()=>edit(p)),action('이동',()=>edit(p,true)),action('↑',async()=>{await api('posts/'+p.id+'/reorder','POST',{direction:'up'});await refresh();}),action('↓',async()=>{await api('posts/'+p.id+'/reorder','POST',{direction:'down'});await refresh();}),action('삭제',async()=>{if(confirm('“'+p.title+'” 게시글을 삭제할까요? 삭제 후 복구할 수 없습니다.')){await api('posts/'+p.id,'DELETE',{});await refresh();}},'df-danger'));
        buttons.children[3].setAttribute('aria-label','게시글 위로 이동');buttons.children[4].setAttribute('aria-label','게시글 아래로 이동');controls.append(buttons);tr.append(controls);
      }body.append(tr);
    });table.append(body);wrap.append(table);list.append(wrap);
  }
  function updateFields(){const event=$('#df-editor-form').elements.board.value==='event';$('#df-event-fields').hidden=!event;$('#df-editor-form').elements.date.required=!event;}
  function edit(post,move=false){
    activePost=post||null;const form=$('#df-editor-form');form.reset();const values=post||{board:board==='inquiries'?'event':board,date:params.get('date')||'',category:'SCHOOL LIFE'};
    ['id','board','date','title','category','alt','image','excerpt'].forEach(key=>{form.elements[key].value=values[key]||'';});
    form.elements.description.value=values.board==='event'?(values.paragraphs?.join('\n\n')||values.description||''):(values.description||'');
    ['headings','gallery'].forEach(key=>{form.elements[key].value=(values[key]||[]).join('\n');});
    $('#df-editor-title').textContent=move?'게시판 이동':post?'게시글 수정':'글쓰기';$('#df-editor-status').textContent=move?'이동할 게시판을 선택하고 저장해 주세요. 캘린더로 이동할 때는 날짜가 필요합니다.':'';updateFields();$('#df-editor').showModal();if(move)form.elements.board.focus();
  }
  $('#df-create').addEventListener('click',()=>edit());$('#df-editor-form').elements.board.addEventListener('change',updateFields);
  $('#df-editor-form').addEventListener('submit',async e=>{
    e.preventDefault();const form=e.target,button=form.querySelector('[type=submit]'),data=Object.fromEntries(new FormData(form));
    data.headings=data.headings.split('\n').map(s=>s.trim()).filter(Boolean);data.gallery=data.gallery.split('\n').map(s=>s.trim()).filter(Boolean);
    data.paragraphs=data.description.split(/\n\s*\n/).map(s=>s.trim()).filter(Boolean);
    if(!data.headings.length)data.headings=[data.title];if(!data.excerpt)data.excerpt=data.description.slice(0,200);
    button.disabled=true;$('#df-editor-status').textContent='저장 중입니다.';
    try{await api('posts'+(activePost?'/'+activePost.id:''),activePost?'PUT':'POST',data);$('#df-editor').close();if(data.board!==board){location.href='admin.html?board='+data.board+(preview?'&preview=1':'');}else{await refresh();$('#df-status').textContent=preview?'미리보기에 반영했습니다. 실제 사이트에는 저장되지 않습니다.':'저장했습니다.';}}
    catch(error){$('#df-editor-status').textContent=error.message;}finally{button.disabled=false;}
  });
  function showInquiry(p){
    const box=$('#df-inquiry-body');box.replaceChildren();const dl=node('dl');
    [['신청일',new Date(p.created).toLocaleString('ko-KR')],['학부모 성함',p.parent],['이메일',p.email],['연락처',p.phone],['연령 / 학년',p.grade],['관심 과정',p.program],['상담 주제',p.topic],['상담 내용',p.message],['접수 페이지',p.source]].forEach(([k,v])=>dl.append(node('dt',k),node('dd',v||'—')));box.append(dl);
    const label=node('label','처리 상태'),select=node('select');Object.entries(states).forEach(([value,text])=>{const option=node('option',text);option.value=value;option.selected=value===p.status;select.append(option);});label.append(select);box.append(label);
    const status=node('p');status.setAttribute('role','status');box.append(status);
    select.addEventListener('change',async()=>{select.disabled=true;try{await api('inquiries/'+p.id,'PUT',{status:select.value});p.status=select.value;await refresh();status.textContent='상담 상태를 변경했습니다.';}catch(e){select.value=p.status;status.textContent=e.message;}finally{select.disabled=false;}});
    const remove=action('상담 내역 삭제',async()=>{if(!confirm('상담 내역을 영구 삭제할까요?'))return;try{await api('inquiries/'+p.id,'DELETE',{});$('#df-inquiry-detail').close();await refresh();}catch(e){status.textContent=e.message;}},'df-danger');box.append(remove);$('#df-inquiry-detail').showModal();
  }
  $('#df-search').addEventListener('input',render);$('#df-status-filter').addEventListener('change',render);
  try{await refresh();if(params.get('edit')){const p=allPosts.find(p=>p.id===params.get('edit'));if(p)edit(p,params.has('move'));else $('#df-status').textContent='게시글을 찾을 수 없습니다.';}else if(params.has('new'))edit();}catch(e){$('#df-status').textContent=e.message;}
})();
