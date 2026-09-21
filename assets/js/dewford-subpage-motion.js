(function () {
 'use strict';
 var root = document.querySelector('.dewford-redesigned');
 if (!root) return;
 var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
 if ('IntersectionObserver' in window && !reduce.matches) {
   var elements = root.querySelectorAll('[data-dewford-reveal]');
   var observer = new IntersectionObserver(function (entries) {
     entries.forEach(function (entry) {
       if (entry.isIntersecting) { entry.target.classList.add('dewford-in-view'); observer.unobserve(entry.target); }
     });
   }, { threshold: 0, rootMargin: '0px 0px -35px 0px' });
   root.classList.add('dewford-motion-ready');
   elements.forEach(function (el) { observer.observe(el); });
 }
 root.querySelectorAll('.dewford-accordion').forEach(function (accordion) {
   accordion.classList.add('dewford-accordion-enhanced');
   var items = Array.from(accordion.querySelectorAll('.dewford-accordion-item'));
   function set(item, open) {
     item.classList.toggle('active',open);
     item.querySelector('button').setAttribute('aria-expanded',String(open));
     item.querySelector('.dewford-accordion-panel').inert = !open;
   }
   items.forEach(function (item,index) {
     set(item,index === 0);
     item.querySelector('button').addEventListener('click',function () {
       var open = !item.classList.contains('active');
       items.forEach(function (other) { set(other,other === item && open); });
     });
   });
 });
 root.querySelectorAll('[role=tablist]').forEach(function (list) {
   var tabs=Array.from(list.querySelectorAll('[role=tab]'));
   function select(tab) {
     tabs.forEach(function (t) {
       var active = t===tab;
       t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;
       document.getElementById(t.getAttribute('aria-controls')).hidden=!active;
     });
   }
   tabs.forEach(function (tab,index) {
     tab.addEventListener('click',function () { select(tab); });
     tab.addEventListener('keydown',function (event) {
       var next;
       if(event.key==='ArrowRight') next=tabs[(index+1)%tabs.length];
       if(event.key==='ArrowLeft') next=tabs[(index+tabs.length-1)%tabs.length];
       if(event.key==='Home') next=tabs[0];
       if(event.key==='End') next=tabs[tabs.length-1];
       if(next){event.preventDefault();select(next);next.focus();}
     });
   });
 });
})();
