/* Keep the compact header visible in either scroll direction. */
(function () {
  'use strict';
  var main = document.querySelector('.pxl-header-elementor-main');
  var sticky = document.querySelector('.pxl-header-elementor-sticky');
  if (!main || !sticky) return;
  var desktop = window.matchMedia('(min-width: 1200px)');
  var scheduled = false;
  function update() {
    scheduled = false;
    var scrolled = window.scrollY > 40;
    document.body.classList.toggle('dewford-header-scrolled', scrolled);
    main.inert = desktop.matches && scrolled;
    sticky.inert = desktop.matches && !scrolled;
  }
  function schedule() {
    if (!scheduled) { scheduled = true; window.requestAnimationFrame(update); }
  }
  update();
  document.body.classList.add('dewford-header-ready');
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('pageshow', update);
  desktop.addEventListener('change', update);
})();
