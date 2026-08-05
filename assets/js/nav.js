/* nav.js — 헤더 내비게이션 (WU-00)
   - 모바일 햄버거 토글
   - 스크롤 시 헤더 축소 (기획안 12-1)
   - 신뢰 문구 1회 페이드업 (기획안 11-5)
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

  /* 화면에 들어올 때 한 번만 페이드업. IntersectionObserver 가 없으면 아무것도 하지 않고
     CSS 의 .js 게이트도 걸지 않으므로 문구는 처음부터 그대로 보입니다. */
  var trust = document.querySelector('.home-trust');
  if (trust && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    io.observe(trust);
  }
})();
