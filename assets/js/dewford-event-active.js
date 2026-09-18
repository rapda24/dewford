(function () {
  var el = document.querySelector('#event-list .pxl-swiper-container');
  if (!el) return;
  var connected = false;
  function connect() {
    if (connected || !el.swiper) return;
    connected = true;
    observer.disconnect();
    var swiper = el.swiper;
    // Advance by one card, including at responsive breakpoints.
    [swiper.params, swiper.originalParams].forEach(function (params) {
      params.slidesPerGroup = 1;
      params.slidesPerGroupAuto = false;
      Object.values(params.breakpoints || {}).forEach(function (point) {
        point.slidesPerGroup = 1;
        point.slidesPerGroupAuto = false;
      });
    });
    function sync() {
      Array.from(swiper.slides).forEach(function (slide, index) {
        var card = slide.querySelector('.pxl-post--inner');
        var holder = slide.querySelector('.pxl-post--holder');
        var active = index === swiper.activeIndex;
        card.classList.toggle('active', active);
        holder.inert = !active;
        holder.setAttribute('aria-hidden', String(!active));
      });
    }
    swiper.on('slideChange', sync);
    swiper.on('loopFix', sync);
    sync();
  }
  var observer = new MutationObserver(connect);
  observer.observe(el, {attributes:true, attributeFilter:['class']});
  window.addEventListener('load', connect, {once:true});
  connect();
})();
