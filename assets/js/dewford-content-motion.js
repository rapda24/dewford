/* Reveal content groups together; preserve sticky cards and existing interactive controls. */
(function () {
 'use strict';
 function init() {
  var root=document.querySelector('main');
  if(!root) return;
  root.classList.add('dewford-content-motion');
  root.querySelectorAll('.wow,.pxl-split-text').forEach(function(el){
   el.classList.remove('wow','pxl-split-text','fadeInUp','fadeIn','split-in-fade','split-in-up');
   el.classList.add('dewford-motion-reset');
   el.style.removeProperty('visibility');el.style.removeProperty('animation-name');
  });
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches || !('IntersectionObserver' in window)) return;
  var selectors=[
   '.dewford-page-intro-body','.dewford-vision-pair > .e-con',
   '.dewford-enrollment-approach > *','.dewford-philosophy-approach > *',
   '.dewford-enrollment-step','.dewford-level-card','.dewford-class-card',
   '.dewford-enrollment-faq-photo img','[data-ui-role="section-title"]','[data-ui-role="section-label"]',
   '.dewford-program-heading','.dewford-learning-intro','.dewford-location-info',
   '.dewford-esl-journey-overview','.dewford-esl-journey-steps > li',
   '.dewford-program-learning > *','.dewford-program-card',
   '.pxl-portfolio-accordion1 .pxl--item',
   '.dewford-calendar-toolbar','.dewford-calendar-grid','.dewford-calendar-details',
   '.dewford-calendar-events','.dewford-events-intro','.dewford-contact-intro',
   '.dewford-events-main .pxl-post--inner',
   '.elementor-element-462e0e0 > .e-con',
   '.elementor-element-842d290 > .e-con',
   '.elementor-element-8a7c622','.dewford-journey-layout',
   '.tabs-content-stacked .pxl-item--content','.tabs-content-stacked .pxl-post--featured',
   '.elementor-widget-pxl_heading','.elementor-widget-pxl_text_editor','.elementor-widget-pxl_image'
  ].join(',');
  var candidates=Array.from(root.querySelectorAll(selectors));
  // A heading, paragraph and image in a selected group share a single entrance.
  var elements=candidates.filter(function(el){
   if(el.closest('.dewford-subpage-emblem,.dewford-native-portfolio')) return false;
   return !candidates.some(function(parent){return parent!==el && parent.contains(el);});
  });
  var observer=new IntersectionObserver(function(entries){
   entries.forEach(function(entry){
    if(!entry.isIntersecting) return;
    var el=entry.target;
    el.classList.remove('dewford-reveal-pending');
    el.classList.add('dewford-reveal-visible');observer.unobserve(el);
   });
  },{threshold:0,rootMargin:'0px 0px -32px 0px'});
  elements.forEach(function(el){
   var rect=el.getBoundingClientRect();
   if(!rect.width || !rect.height || rect.top < window.innerHeight-32) return;
   el.classList.add('dewford-reveal-item');
   var index=Array.prototype.indexOf.call(el.parentElement.children,el);
   el.style.setProperty('--dewford-reveal-delay',Math.min(index%3,2)*75+'ms');
   el.classList.add('dewford-reveal-pending');observer.observe(el);
  });
  function showAll(){elements.forEach(function(el){el.classList.remove('dewford-reveal-pending');});observer.disconnect();}
  root.addEventListener('focusin',function(event){var el=event.target.closest('.dewford-reveal-pending');if(el){el.classList.remove('dewford-reveal-pending');observer.unobserve(el);}});
  reduce.addEventListener('change',function(event){if(event.matches)showAll();});
  window.addEventListener('beforeprint',showAll);
  window.addEventListener('pageshow',function(event){if(event.persisted)showAll();});
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
