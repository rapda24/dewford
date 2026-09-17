/* Load Kakao Roughmap once; the visible address link remains available on failure. */
(function () {
 'use strict';
 var target = document.getElementById('daumRoughmapContainer1789613347343');
 if (!target) return;
 function render() {
  if (!window.daum || !daum.roughmap || !daum.roughmap.Lander || target.dataset.rendered) return;
  target.dataset.rendered = 'true';
  new daum.roughmap.Lander({timestamp:'1789613347343',key:'2waxjjqtpr62',mapWidth:String(target.parentElement.clientWidth),mapHeight:String(target.parentElement.clientHeight)}).render();
 }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',render,{once:true});
 else render();
})();
