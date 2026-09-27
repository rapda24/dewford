(function () {
  'use strict';
  const ready = async () => {
    let session;
    try {const res=await fetch('/api/session',{cache:'no-store'});if(!res.ok)return;session=await res.json();}catch{return;}
    if(!session.authenticated)return;
    const root=document.querySelector('[data-dewford-calendar],.dewford-events-main,.dewford-detail-main');if(!root)return;
    const board=root.dataset.dewfordCalendar||'event';
    function link(text,href){const a=document.createElement('a');a.textContent=text;a.href=href;return a;}
    const bar=document.createElement('div');bar.className='df-public-tools df-public-toolbar';const label=document.createElement('strong');label.textContent='관리자 모드';bar.append(label,link('+ 글쓰기','admin.html?board='+board+'&new=1'),link('관리자 페이지','admin.html?board='+board));
    const logout=document.createElement('button');logout.type='button';logout.textContent='로그아웃';logout.onclick=async()=>{logout.disabled=true;try{const r=await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf},body:'{}'});if(!r.ok)throw Error();location.reload();}catch{alert('로그아웃하지 못했습니다. 다시 시도해 주세요.');logout.disabled=false;}};bar.append(logout);root.prepend(bar);
    function decorate(){root.querySelectorAll('[data-event-id], [data-calendar-id]').forEach(add);if(root.dataset.eventId)add(root);}
    function add(item){
      if(item.querySelector(':scope > .df-post-tools'))return;
      const id=item.dataset.eventId||item.dataset.calendarId;if(!id)return;
      const tools=document.createElement('div');tools.className='df-public-tools df-post-tools';
      tools.append(link('수정','admin.html?board='+board+'&edit='+encodeURIComponent(id)),link('이동','admin.html?board='+board+'&edit='+encodeURIComponent(id)+'&move=1'));
      const del=document.createElement('button');del.type='button';del.dataset.delete='';del.textContent='삭제';
      del.addEventListener('click',async e=>{e.preventDefault();e.stopPropagation();if(!confirm('이 게시글을 삭제할까요? 삭제 후 복구할 수 없습니다.'))return;del.disabled=true;try{const r=await fetch('/api/posts/'+encodeURIComponent(id),{method:'DELETE',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf},body:'{}'});if(!r.ok){const data=await r.json();throw Error(data.error);}location.href=root.matches('.dewford-detail-main')?'event.html':location.href;}catch(error){alert(error.message||'삭제하지 못했습니다.');del.disabled=false;}});tools.append(del);item.append(tools);
    }
    decorate();if(root.dataset.dewfordCalendar)new MutationObserver(decorate).observe(root.querySelector('[data-calendar-details]'),{childList:true,subtree:true});
    window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
