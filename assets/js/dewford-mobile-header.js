/* Match the mobile header surface to the actual scroll position. */
(function () {
  'use strict';
  function update() {
    document.body.classList.toggle('dewford-mobile-scrolled', window.scrollY > 0);
  }
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('pageshow', update);
})();
