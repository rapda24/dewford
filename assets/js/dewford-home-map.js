/* Render the supplied Kakao embed at the map region's responsive dimensions. */
(function () {
  'use strict';
  var target = document.getElementById('daumRoughmapContainer1789966626792');
  if (!target) return;
  var region = target.parentElement;
  var lastSize = '';
  var timer;
  function render() {
    if (!window.daum || !window.daum.roughmap || !window.daum.roughmap.Lander) return;
    var width = Math.round(region.clientWidth);
    var height = Math.max(1, Math.round(region.clientHeight));
    var size = width + 'x' + height;
    if (!width || size === lastSize) return;
    lastSize = size;
    target.replaceChildren();
    new window.daum.roughmap.Lander({
      timestamp: '1789966626792',
      key: '2wijqwgjohjv',
      mapWidth: String(width),
      mapHeight: String(height)
    }).render();
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(render, 200);
  }
  function init() {
    render();
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(region);
    else window.addEventListener('resize', schedule, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  window.addEventListener('load', render, { once: true });
})();
