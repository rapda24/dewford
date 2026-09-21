(function () {
  'use strict';
  var posts = window.DEWFORD_EVENTS || [];
  var id = new URLSearchParams(window.location.search).get('id');
  var index = id ? posts.findIndex(function (post) { return post.id === id; }) : 0;
  var post = posts[index];
  var root = document.querySelector('.dewford-detail-main');
  if (!root) return;
  if (!post) {
    var box = document.createElement('div');
    box.className = 'container dewford-detail-missing';
    var title = document.createElement('h1'); title.textContent = '게시글을 찾을 수 없습니다.';
    var back = document.createElement('a'); back.href = 'event.html'; back.textContent = '갤러리 목록으로';
    box.append(title, back); root.replaceChildren(box); return;
  }
  document.title = post.title + ' | Dewford';
  root.dataset.eventId = post.id;
  root.querySelector('[data-detail-category]').textContent = post.category;
  root.querySelectorAll('[data-detail-heading]').forEach(function (node) {
    node.textContent = post.headings[Number(node.dataset.detailHeading)] || post.title;
  });
  root.querySelectorAll('[data-detail-paragraph]').forEach(function (node) {
    node.textContent = post.paragraphs[Number(node.dataset.detailParagraph)] || post.excerpt;
  });
  var images = [post.image].concat(post.gallery || []);
  if (!post.gallery || !post.gallery.length) {
    root.classList.add('dewford-detail-single-image');
    root.querySelectorAll('.elementor-element-e0236d4, .elementor-element-5956eb5').forEach(function (section) { section.hidden = true; });
  }

  root.querySelectorAll('[data-detail-image]').forEach(function (node) {
    var n = Number(node.dataset.detailImage);
    if (!images[n]) { node.hidden = true; return; }
    node.src = images[n];
    node.alt = n === 0 ? post.alt : post.title + ' — 배움의 순간 ' + n;
  });
  function nav(selector, nextIndex) {
    var link = root.querySelector(selector);
    var next = posts[nextIndex];
    if (!next) { link.hidden = true; return; }
    link.href = 'detail.html?id=' + encodeURIComponent(next.id);
    link.title = next.title;
  }
  nav('[data-detail-prev]', index - 1);
  nav('[data-detail-next]', index + 1);
  var related = root.querySelector('[data-detail-related]');
  posts.filter(function (item) { return item.id !== post.id; }).slice(0, 3).forEach(function (item) {
    var row = document.createElement('div'); row.className = 'pxl--item';
    var imageBox = document.createElement('div'); imageBox.className = 'pxl-item--img pxl-mr-20';
    var link = document.createElement('a'); link.href = 'detail.html?id=' + encodeURIComponent(item.id);
    var img = document.createElement('img'); img.src = item.image; img.alt = item.alt; img.width = 592; img.height = 408; img.loading = 'lazy';
    link.appendChild(img); imageBox.appendChild(link);
    var holder = document.createElement('div'); holder.className = 'pxl-item--holder';
    var heading = document.createElement('h6'); heading.className = 'pxl-item--title';
    var titleLink = document.createElement('a'); titleLink.href = link.href; titleLink.textContent = item.title;
    heading.appendChild(titleLink); holder.appendChild(heading); row.append(imageBox, holder); related.appendChild(row);
  });
})();
