/* Run before the template initializes its carousel and gallery. */
(function () {
  'use strict';
  var posts = window.DEWFORD_EVENTS;
  if (!Array.isArray(posts)) return;

  function fill(card, post, home) {
    var url = 'detail.html?id=' + encodeURIComponent(post.id);
    card.dataset.eventId = post.id;
    card.querySelectorAll('a').forEach(function (link) { link.href = url; });
    var image = card.querySelector('.pxl-post--featured img');
    if (image) {
      image.src = post.image;
      image.alt = post.alt || post.title;
      image.removeAttribute('srcset');
      image.removeAttribute('title');
      image.width = 600;
      image.height = 600;
    }
    var title = card.querySelector(home ? '.pxl-post--title a' : '.pxl-item--title a');
    if (title) title.textContent = post.title;
    var category = card.querySelector('.pxl-item--category');
    if (category) {
      var label = category.querySelector('a') || category;
      label.textContent = post.category || 'EVENT';
    }
    var excerpt = card.querySelector('.pxl-post--content');
    if (excerpt) excerpt.textContent = post.excerpt || '';
    card.querySelectorAll('.pxl-post--date, .pxl-item--author').forEach(function (el) { el.remove(); });
    card.querySelectorAll('.btn-readmore, .pxl-button--arrow a').forEach(function (link) {
      link.setAttribute('aria-label', post.title + ' 자세히 보기');
    });
    return card;
  }

  var track = document.querySelector('#event-list .pxl-swiper-wrapper');
  if (track) {
    var slide = track.querySelector('.pxl-swiper-slide');
    if (slide) {
      var template = slide.cloneNode(true);
      track.replaceChildren();
      posts.forEach(function (post) { track.appendChild(fill(template.cloneNode(true), post, true)); });
    }
  }
  var grid = document.querySelector('.dewford-events-main .pxl-grid-inner');
  if (grid) {
    var item = grid.querySelector('.pxl-grid-item');
    var sizer = grid.querySelector('.grid-sizer');
    if (item) {
      var cardTemplate = item.cloneNode(true);
      grid.replaceChildren();
      posts.forEach(function (post) { grid.appendChild(fill(cardTemplate.cloneNode(true), post, false)); });
      if (sizer) grid.appendChild(sizer);
      var widget = grid.closest('.pxl-grid');
      if (widget) {
        widget.dataset.total = String(posts.length);
        widget.dataset.perpage = String(posts.length);
        widget.dataset.maxPages = '1';
      }
    }
  }
})();
