/* Form delivery and keyboard support only. The template owns layout and animation. */
(function () {
 'use strict';
 var root=document.querySelector('.dewford-native-main'); if(!root)return;
 root.querySelectorAll('.pxl-accordion--title').forEach(function (title) {
  title.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();title.click();}});
  var item=title.closest('.pxl--item');
  new MutationObserver(function(){title.setAttribute('aria-expanded',String(item.classList.contains('active')));}).observe(item,{attributes:true,attributeFilter:['class']});
 });
 root.querySelectorAll('[data-native-consultation]').forEach(function(form){
  form.addEventListener('submit',function(e){
   e.preventDefault();e.stopImmediatePropagation();if(!form.reportValidity())return;
   var data=new FormData(form);
   var body=['학부모 성함: '+data.get('parent'),'이메일: '+data.get('email'),'아이의 연령 / 학년: '+data.get('grade'),'관심 프로그램: '+data.get('program'),'','상담 내용',data.get('message')].join('\n');
   window.location.href='mailto:ADMIN@DEWFORD.COM?subject='+encodeURIComponent('[Dewford] 개별 상담 신청')+'&body='+encodeURIComponent(body);
   form.querySelector('[role=status]').textContent='이메일 앱에서 내용을 확인한 후 보내 주세요. 아직 상담 신청이 전송된 것은 아닙니다.';
  },true);
 });
})();
