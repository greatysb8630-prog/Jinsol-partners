/* blog.js — 홈 "현장에서 쓰는 글" 섹션
   HTML에 최신 글이 기본으로 들어 있고, /api/blog 가 응답하면 최신 목록으로 교체합니다.
   실패하면 기본 HTML을 그대로 둡니다. 발행 7일 이내 글에는 NEW 를 붙입니다. */
(function () {
  'use strict';

  var root = document.querySelector('[data-blog-feed]');
  if (!root) return;

  var NEW_DAYS = 7;

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function safeUrl(u) {
    return typeof u === 'string' && u.indexOf('https://') === 0 ? u : '';
  }

  function card(it, index) {
    var featured = index === 0;
    var thumb = featured ? safeUrl(it.thumb) : '';
    return '<article class="home-post' + (featured ? ' home-post--featured' : '') + '" data-date="' + esc(it.date) + '">' +
      '<a href="' + esc(safeUrl(it.url)) + '" target="_blank" rel="noopener">' +
      (thumb ? '<span class="home-post__thumb"><img src="' + esc(thumb) + '" width="1200" height="750" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>' : '') +
      '<span class="home-post__body">' +
      '<span class="home-post__meta mono">' + esc(it.category || '블로그') + ' · ' + esc(String(it.date).replace(/-/g, '.')) + '</span>' +
      '<h3 class="home-post__title">' + esc(it.title) + '</h3>' +
      '</span></a></article>';
  }

  function markNew() {
    var kst = new Date(Date.now() + 9 * 3600 * 1000);
    var today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
    Array.prototype.forEach.call(root.querySelectorAll('[data-date]'), function (el) {
      var p = String(el.getAttribute('data-date')).split('-');
      var days = (today - Date.UTC(+p[0], +p[1] - 1, +p[2])) / 86400000;
      var meta = el.querySelector('.home-post__meta');
      if (!meta || meta.querySelector('.home-post__new')) return;
      if (days >= 0 && days < NEW_DAYS) {
        meta.insertAdjacentHTML('beforeend', ' <span class="home-post__new">NEW</span>');
      }
    });
  }

  markNew();

  fetch('/api/blog', { headers: { Accept: 'application/json' } })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (data) {
      if (!data || !Array.isArray(data.items) || !data.items.length) return;
      root.innerHTML = data.items.filter(function (it) { return safeUrl(it.url); }).map(card).join('');
      markNew();
    })
    .catch(function () { /* 기본 HTML 유지 */ });
})();
