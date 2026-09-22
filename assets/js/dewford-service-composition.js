/* Accessible interaction for the original Service 4 accordion structure. */
(function () {
 const root=document.querySelector('.dewford-service-composition');
 if(!root)return;
 root.addEventListener('click',function(event){
  const trigger=event.target.closest('.pxl-portfolio-accordion1 .pxl-accordion-title');
  if(!trigger)return;
  event.preventDefault();event.stopImmediatePropagation();
  const item=trigger.closest('.pxl--item');const open=!item.classList.contains('active');
  item.parentElement.querySelectorAll(':scope > .pxl--item').forEach(function(row){
   const active=row===item&&open;row.classList.toggle('active',active);
   row.querySelector('.pxl-accordion-title').setAttribute('aria-expanded',String(active));
   row.querySelector('.pxl-accordion-content').style.display=active?'block':'none';
  });
  if(window.ScrollTrigger)ScrollTrigger.refresh();
 },true);
 root.addEventListener('keydown',function(event){
  if((event.key==='Enter'||event.key===' ')&&event.target.matches('.pxl-portfolio-accordion1 .pxl-accordion-title')){event.preventDefault();event.target.click();}
 });
})();
/* Keep direct links to the EEP section usable inside the detailed accordion. */
(function(){
 function revealHash(){
  if(!location.hash)return;
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  const item=target&&target.closest('.dewford-service-composition .pxl-portfolio-accordion1 .pxl--item');
  if(item&&!item.classList.contains('active'))item.querySelector('.pxl-accordion-title').click();
 }
 window.addEventListener('hashchange',revealHash);revealHash();
})();
