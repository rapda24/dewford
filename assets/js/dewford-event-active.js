/* Fixed photos with smoothly expanding detail panels and a continuous track. */
(function () {
  'use strict';
  var container = document.querySelector('#event-list .pxl-swiper-container');
  if (!container) return;
  var ready = false;
  function connect() {
    if (ready || !container.swiper) return;
    ready = true;
    observer.disconnect();
    var swiper = container.swiper;
    if (swiper.autoplay) swiper.autoplay.stop();
    if (swiper.params.loop) swiper.loopDestroy();
    var track = container.querySelector('.pxl-swiper-wrapper');
    var originals = Array.from(track.children).filter(function (el) { return el.classList.contains('pxl-swiper-slide'); });
    swiper.destroy(true, true);
    track.innerHTML = '';
    var count = originals.length;
    if (!count) return;
    var repeats = Math.max(5, Math.ceil(window.screen.width / (count * 572)) * 2 + 3);
    for (var group = 0; group < repeats; group++) {
      originals.forEach(function (original) {
        var slide = original.cloneNode(true);
        slide.removeAttribute('style');
        slide.removeAttribute('id');
        slide.className = 'pxl-swiper-slide';
        slide.querySelectorAll('[id]').forEach(function (el) { el.removeAttribute('id'); });
        slide.querySelector('.pxl-post--inner').classList.remove('active');
        track.appendChild(slide);
      });
    }
    container.classList.add('dewford-events-ready');
    var slides = Array.from(track.children);
    var base = Math.floor(repeats / 2) * count;
    var current = base;
    var moving = false;
    var paused = false;
    var timer;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function position() {
      // A photo and its detail panel share one responsive unit.
      var gap = container.clientWidth < 768 ? 20 : 32;
      var unit = Math.min(540, (container.clientWidth - 24) / 2);
      container.style.setProperty('--event-gap', gap + 'px');
      container.style.setProperty('--event-unit', unit + 'px');
      track.style.transform = 'translate3d(' + (container.clientWidth / 2 - current * (unit + gap) - unit) + 'px,0,0)';
    }
    function paint() {
      slides.forEach(function (slide, index) {
        var active = index === current;
        slide.classList.toggle('swiper-slide-active', active);
        slide.querySelector('.pxl-post--inner').classList.toggle('active', active);
        var holder = slide.querySelector('.pxl-post--holder');
        holder.inert = !active;
        holder.setAttribute('aria-hidden', String(!active));
      });
      position();
    }
    function reset() {
      container.classList.add('dewford-events-reset');
      current = base + ((current % count) + count) % count;
      paint();
      void track.offsetWidth;
      container.classList.remove('dewford-events-reset');
    }
    function schedule() {
      clearTimeout(timer);
      if (!paused && !document.hidden && !reduced) timer = setTimeout(function () { go(current + 1); }, 3000);
    }
    function go(index) {
      if (moving || index === current) return;
      clearTimeout(timer);
      moving = true;
      current = index;
      paint();
      setTimeout(function () { reset(); moving = false; schedule(); }, reduced ? 0 : 680);
    }
    container.addEventListener('click', function (event) {
      var slide = event.target.closest('.pxl-swiper-slide');
      if (!slide) return;
      var index = slides.indexOf(slide);
      if (index !== current || moving) { event.preventDefault(); go(index); }
    });
    var down;
    container.addEventListener('pointerdown', function (e) { down = e.clientX; });
    container.addEventListener('dragstart', function (e) { e.preventDefault(); });
    container.addEventListener('pointerup', function (e) {
      if (down != null && Math.abs(e.clientX - down) > 45) go(current + (e.clientX < down ? 1 : -1));
      down = null;
    });
    container.addEventListener('pointercancel', function () { down = null; });
    container.addEventListener('mouseenter', function () { paused = true; clearTimeout(timer); });
    container.addEventListener('mouseleave', function () { paused = container.contains(document.activeElement); schedule(); });
    container.addEventListener('focusin', function () { paused = true; clearTimeout(timer); });
    container.addEventListener('focusout', function () { requestAnimationFrame(function () { paused = container.matches(':hover') || container.contains(document.activeElement); schedule(); }); });
    document.addEventListener('visibilitychange', schedule);
    var resizeObserver = new ResizeObserver(function () { position(); });
    resizeObserver.observe(container);
    reset();
    schedule();
  }
  var observer = new MutationObserver(connect);
  observer.observe(container, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', connect, { once: true });
  connect();
})();
