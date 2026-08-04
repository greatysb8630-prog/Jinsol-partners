/* nav.js — 헤더 내비게이션 (WU-00)
   - 모바일 햄버거 토글
   - 스크롤 시 헤더 축소 (기획안 12-1)
   외부 라이브러리 없음. */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('nav-drawer');

  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        drawer.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  var header = document.querySelector('.site-header');
  if (header) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        header.classList.toggle('is-compact', window.scrollY > 80);
        ticking = false;
      });
    }, { passive: true });
  }
})();
