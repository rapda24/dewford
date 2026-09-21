/* Local background images; the foreground stays fixed during crossfades. */
(function () {
  'use strict';
  var hero = document.querySelector('.dewford-title-slideshow');
  if (!hero) return;
  var slides = Array.from(hero.querySelectorAll('.dewford-title-slide'));
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var index = 0;
  var timer;
  var started = false;
  var zooms = [];
  function zoom(slide) {
    var image = slide.querySelector('img');
    image.getAnimations().forEach(function (animation) { animation.cancel(); });
    if (!motion.matches) {
      zooms = zooms.filter(function (animation) { return animation.playState !== 'idle'; });
      zooms.push(image.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }],
        { duration: 5000, easing: 'linear', fill: 'forwards' }));
    }
  }
  function schedule() {
    clearTimeout(timer);
    if (!started || motion.matches || document.hidden) return;
    timer = setTimeout(function () {
      var next = (index + 1) % slides.length;
      var image = slides[next].querySelector('img');
      // Keep the current image if the next asset has not loaded successfully.
      if (image.complete && image.naturalWidth > 0) {
        zoom(slides[next]);
        slides[next].classList.add('is-active');
        slides[index].classList.remove('is-active');
        index = next;
      }
      schedule();
    }, 4000);
  }
  function start() {
    if (started) return;
    started = true;
    zoom(slides[index]);
    schedule();
  }
  document.addEventListener('visibilitychange', function () {
    zooms.forEach(function (animation) { document.hidden ? animation.pause() : animation.play(); });
    schedule();
  });
  motion.addEventListener('change', function () {
    zooms.forEach(function (animation) { animation.cancel(); });
    zooms = [];
    if (started) zoom(slides[index]);
    schedule();
  });
  if (document.getElementById('dewford-intro')) document.addEventListener('dewford:intro-complete', start, { once: true });
  else start();
})();
