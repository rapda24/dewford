/* Fade from bottom to top with a moving gradient mask; the screen stays still. */
(function () {
  'use strict';
  var intro = document.getElementById('dewford-intro');
  if (!intro) return;
  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var started = performance.now();
  var exiting = false;
  var finished = false;
  var animations = [];
  var revealTimer;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(revealTimer);
    clearTimeout(safetyTimer);
    root.classList.remove('dewford-intro-active');
    intro.remove();
    document.dispatchEvent(new Event('dewford:intro-complete'));
    animations.forEach(function (animation) { animation.cancel(); });
    document.removeEventListener('keydown', onKey, true);
  }
  function onKey(event) {
    if (event.key === 'Escape') finish();
    if (event.key === 'Tab') event.preventDefault();
  }
  function reveal() {
    if (exiting || finished) return;
    exiting = true;
    if (reducedMotion || !intro.animate) { finish(); return; }
    animations.push(intro.animate([
      { maskPosition: '0% 0%', webkitMaskPosition: '0% 0%' },
      { maskPosition: '0% 100%', webkitMaskPosition: '0% 100%' }
    ], { duration: 1400, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' }));
    Promise.all(animations.map(function (animation) { return animation.finished; })).then(finish, finish);
  }
  function ready() {
    if (finished) return;
    revealTimer = setTimeout(reveal, Math.max(0, 1000 - (performance.now() - started)));
  }
  var safetyTimer = setTimeout(finish, 6000);
  if (reducedMotion) { finish(); return; }
  root.classList.add('dewford-intro-active');
  document.addEventListener('keydown', onKey, true);
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready, { once: true });
  window.addEventListener('pageshow', function (event) { if (event.persisted) finish(); });
})();
