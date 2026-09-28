/* Independent, keyboard-accessible drawer accordions; no animation plugin dependency. */
(function(){
  'use strict';
  const source=document.querySelector('#pxl-header-elementor .dewford-navigation');
  document.querySelectorAll('.pxl-hidden-panel-popup .dewford-navigation').forEach(menu=>{
    if(source&&!menu.querySelector('.sub-menu'))menu.replaceChildren(...Array.from(source.children,c=>c.cloneNode(true)));
  });
  let sequence=0;
  document.querySelectorAll('.pxl-header-menu .dewford-navigation,.pxl-hidden-panel-popup .dewford-navigation').forEach(menu=>{
    menu.classList.add('df-touch-navigation');
    menu.querySelectorAll('li').forEach(item=>{
      const sub=item.querySelector(':scope > .sub-menu'),link=item.querySelector(':scope > a');if(!sub||!link)return;
      sub.id='df-submenu-'+(++sequence);sub.hidden=true;
      const button=document.createElement('button');button.type='button';button.className='df-submenu-toggle';button.textContent='+';
      button.setAttribute('aria-label',link.textContent.trim()+' 하위 메뉴');button.setAttribute('aria-controls',sub.id);button.setAttribute('aria-expanded','false');item.append(button);
      function toggle(e){e.preventDefault();e.stopImmediatePropagation();const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));button.textContent=open?'−':'+';sub.hidden=!open;item.classList.toggle('df-menu-expanded',open);}
      button.addEventListener('click',toggle,true);link.addEventListener('click',toggle,true);
    });
  });
  const trigger=document.querySelector('#pxl-nav-mobile'),drawer=document.querySelector('.pxl-header-menu');
  if(!trigger||!drawer)return;
  trigger.setAttribute('role','button');trigger.tabIndex=0;trigger.setAttribute('aria-label','메뉴 열기');trigger.setAttribute('aria-expanded','false');
  drawer.id=drawer.id||'df-mobile-drawer';trigger.setAttribute('aria-controls',drawer.id);
  const close=drawer.querySelector('.pxl-menu-close');if(close){close.setAttribute('role','button');close.setAttribute('aria-label','메뉴 닫기');close.tabIndex=0;}
  function setOpen(open){drawer.classList.toggle('active',open);trigger.classList.toggle('active',open);trigger.setAttribute('aria-expanded',String(open));document.body.classList.toggle('body-overflow',open);if(open)(close||drawer.querySelector('a')).focus();else trigger.focus();}
  trigger.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();setOpen(!drawer.classList.contains('active'));},true);
  document.querySelectorAll('.pxl-menu-close,.pxl-header-menu-backdrop').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();setOpen(false);},true));
  [trigger,close].filter(Boolean).forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}}));
  document.addEventListener('keydown',e=>{
    if(!drawer.classList.contains('active'))return;
    if(e.key==='Escape'){e.preventDefault();setOpen(false);}
    if(e.key==='Tab'){const items=Array.from(drawer.querySelectorAll('a,button,[tabindex="0"]')).filter(el=>el.getClientRects().length);const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
  });
})();
