/* data.js — 정적 JSON 렌더러 (WU-00)
   기획안 12-4 : 서비스·도구·교육과정을 HTML에 반복 작성하지 않고 JSON으로 분리.
   기획안 13-3 A : DB·외부 API 호출 없음. 정적 파일만 읽습니다.

   사용법:  <div data-render="services" data-track="consulting"></div>
   실패 시: 빈 화면이 아니라 폴백 문구를 남깁니다. (하네스 P-09) */
(function () {
  'use strict';

  var BASE = '/data/';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* {{TBD:...}} 토큰은 눈에 띄게 표시합니다. 숨기지 않습니다. (개발지시서 §9) */
  function txt(v) {
    var s = esc(v);
    return s.replace(/\{\{TBD:[A-Z0-9_]+\}\}/g, function (m) {
      return '<span class="tbd">' + m + '</span>';
    });
  }

  function li(list) {
    if (!Array.isArray(list)) return txt(list);
    return list.map(function (x) { return txt(x); }).join(' · ');
  }

  function fail(el, label) {
    el.innerHTML = '<p class="lead">' + esc(label) +
      ' 정보를 불러오지 못했습니다. 전화 010-2665-8630 또는 ' +
      '<a class="btn--text" href="/contact/">문의 페이지</a>로 문의해 주십시오.</p>';
  }

  /* ── 서비스 : 표준 6항목 (개발지시서 §4-6) ── */
  function service(s) {
    return '<article class="card" data-service="' + esc(s.id) + '">' +
      '<h3>' + txt(s.name) + '</h3>' +
      '<dl class="std">' +
      '<dt>적합한 고객</dt><dd>' + txt(s.fitFor) + '</dd>' +
      '<dt>해결하는 문제</dt><dd>' + txt(s.problem) + '</dd>' +
      '<dt>진행 기간</dt><dd>' + txt(s.duration) + '</dd>' +
      '<dt>제공 결과물</dt><dd>' + li(s.deliverables) + '</dd>' +
      '<dt>고객이 준비할 자료</dt><dd>' + li(s.clientPrepares) + '</dd>' +
      '<dt>비용</dt><dd class="price">' + txt(s.price) + '</dd>' +
      '</dl></article>';
  }

  function summaryList(list) {
    if (!Array.isArray(list)) return txt(list);
    return txt(list[0]) + (list.length > 1 ? ' 외 ' + (list.length - 1) + '개' : '');
  }

  function serviceSummary(s) {
    return '<article class="summary-card" data-service="' + esc(s.id) + '">' +
      '<h3>' + txt(s.name) + '</h3>' +
      '<p>' + txt(s.fitFor) + '</p>' +
      '<dl class="summary-meta">' +
      '<dt>기간</dt><dd>' + txt(s.duration) + '</dd>' +
      '<dt>결과물</dt><dd>' + summaryList(s.deliverables) + '</dd>' +
      '<dt>비용</dt><dd class="price">' + txt(s.price) + '</dd>' +
      '</dl></article>';
  }

  /* ── 사례 : 표준 6항목 (개발지시서 §4-7) ── */
  function tool(t) {
    return '<article class="card" data-case="' + esc(t.id) + '">' +
      '<h3>' + txt(t.title) + '</h3>' +
      '<div class="shot"><img src="' + esc(t.screenshot) + '" width="' + esc(t.screenshotWidth) +
      '" height="' + esc(t.screenshotHeight) + '" alt="' + esc(t.screenshotAlt) + '" loading="lazy"></div>' +
      '<dl class="std">' +
      '<dt>문제</dt><dd>' + txt(t.problem) + '</dd>' +
      '<dt>기존 방식</dt><dd>' + txt(t.asIs) + '</dd>' +
      '<dt>개선 도구</dt><dd>' + txt(t.tool) + '</dd>' +
      '<dt>검증 방식</dt><dd>' + txt(t.verification) + '</dd>' +
      '<dt>기대 효과</dt><dd>' + txt(t.expectedEffect) + '</dd>' +
      '<dt>화면</dt><dd>' + txt(t.screenNote) + '</dd>' +
      '</dl></article>';
  }

  function toolDetail(t, index) {
    return '<article class="case-detail" data-case="' + esc(t.id) + '">' +
      '<div class="case-detail__copy">' +
      '<span class="case-detail__number mono">0' + (index + 1) + '</span>' +
      '<h3>' + txt(t.title) + '</h3>' +
      '<dl class="summary-meta">' +
      '<dt>문제</dt><dd>' + txt(t.problem) + '</dd>' +
      '<dt>개선 도구</dt><dd>' + txt(t.tool) + '</dd>' +
      '<dt>검증 방식</dt><dd>' + txt(t.verification) + '</dd>' +
      '<dt>기대 효과</dt><dd>' + txt(t.expectedEffect) + '</dd>' +
      '</dl></div>' +
      '<figure class="case-detail__media"><img src="' + esc(t.screenshot) +
      '" width="' + esc(t.screenshotWidth) + '" height="' + esc(t.screenshotHeight) +
      '" alt="' + esc(t.screenshotAlt) + '" loading="lazy" decoding="async">' +
      '<figcaption>' + txt(t.screenNote) + '</figcaption></figure>' +
      '</article>';
  }

  function toolShowcase(t, index) {
    return '<article class="home-case" data-case="' + esc(t.id) + '">' +
      '<div class="home-case__copy"><span class="home-case__number mono">0' + (index + 1) + '</span>' +
      '<h3>' + txt(t.title) + '</h3><p>' + txt(t.expectedEffect) + '</p></div>' +
      '<figure class="home-case__media"><img src="' + esc(t.screenshot) +
      '" width="' + esc(t.screenshotWidth) + '" height="' + esc(t.screenshotHeight) +
      '" alt="' + esc(t.screenshotAlt) + '" loading="lazy" decoding="async"></figure>' +
      '</article>';
  }

  /* ── 교육과정 : 표준 7항목 (개발지시서 §4-8) ── */
  function course(c) {
    return '<article class="card" data-course="' + esc(c.id) + '">' +
      '<div class="card__no mono">' + txt(c.hours) + '시간</div>' +
      '<h3>' + txt(c.name) + '</h3>' +
      '<dl class="std">' +
      '<dt>교육 대상</dt><dd>' + txt(c.target) + '</dd>' +
      '<dt>권장 인원</dt><dd>' + txt(c.headcount) + '</dd>' +
      '<dt>총 교육시간</dt><dd>' + txt(c.totalHours) + '</dd>' +
      '<dt>사전 준비 수준</dt><dd>' + txt(c.prerequisite) + '</dd>' +
      '<dt>주요 학습내용</dt><dd>' + li(c.syllabus) + '</dd>' +
      '<dt>실습 결과물</dt><dd>' + txt(c.output) + '</dd>' +
      '<dt>교육 후 현업 적용방법</dt><dd>' + txt(c.application) + '</dd>' +
      '</dl></article>';
  }

  function courseSummary(c) {
    return '<article class="course-summary" data-course="' + esc(c.id) + '">' +
      '<span class="course-summary__hours mono">' + txt(c.hours) + '시간</span>' +
      '<h3>' + txt(c.name) + '</h3>' +
      '<p><strong>대상</strong> ' + txt(c.target) + '</p>' +
      '<p><strong>결과물</strong> ' + txt(c.output) + '</p>' +
      '</article>';
  }

  function partnerCourse(c) {
    return '<tr><th scope="row">' + txt(c.name) + '</th>' +
      '<td class="mono">' + txt(c.totalHours) + '시간</td>' +
      '<td class="mono">' + txt(c.myHours) + '시간</td>' +
      '<td>' + txt(c.cycle) + '</td></tr>';
  }

  function partnerSummary(p) {
    return '<article class="partner-summary"><div><p class="sec-head__eyebrow">Public Program</p>' +
      '<h3>' + txt(p.programName) + '</h3><p>' + txt(p.org) + ' · ' + txt(p.approval) + '</p></div>' +
      '<div class="partner-summary__rows">' + p.courses.map(function (c) {
        return '<p><strong>' + txt(c.name) + '</strong><span>' + txt(c.totalHours) +
          '시간 중 변용섭 담당 ' + txt(c.myHours) + '시간 · ' + txt(c.cycle) + '</span></p>';
      }).join('') + '</div><p>' + txt(p.place) + ' · 문의 ' + txt(p.orgContact) + '</p></article>';
  }

  function post(p) {
    return '<li><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
      '<span class="mono">' + esc(p.date) + '</span> · ' + esc(p.category) + '<br>' +
      '<strong>' + esc(p.title) + '</strong></a></li>';
  }

  var RENDER = {
    services: function (el, d) {
      var track = el.getAttribute('data-track');
      var rows = d.items.filter(function (s) { return !track || s.track === track; });
      var renderer = el.getAttribute('data-layout') === 'summary' ? serviceSummary : service;
      el.innerHTML = '<div class="' + (renderer === serviceSummary ? 'summary-grid' : 'grid') + '">' +
        rows.map(renderer).join('') + '</div>' +
        '<p class="price-note">' + esc(d.priceNote) + '</p>';
    },
    tools: function (el, d) {
      var layout = el.getAttribute('data-layout');
      if (layout === 'showcase') {
        el.innerHTML = '<div class="home-case-list">' + d.items.map(toolShowcase).join('') + '</div>';
        return;
      }
      if (layout === 'detail') {
        el.innerHTML = '<div class="case-detail-list">' + d.items.map(toolDetail).join('') + '</div>';
        return;
      }
      el.innerHTML = '<div class="grid">' + d.items.map(tool).join('') + '</div>';
    },
    courses: function (el, d) {
      var renderer = el.getAttribute('data-layout') === 'summary' ? courseSummary : course;
      el.innerHTML = '<div class="' + (renderer === courseSummary ? 'course-summary-grid' : 'grid') + '">' +
        d.own.map(renderer).join('') + '</div>';
    },
    partner: function (el, d) {
      if (el.getAttribute('data-layout') === 'summary') {
        el.innerHTML = partnerSummary(d.partner);
        return;
      }
      var p = d.partner;
      el.innerHTML =
        '<table><caption class="sr">해썹경영교육원 정규 과정과 담당 시간</caption><thead><tr>' +
        '<th scope="col">과정</th><th scope="col">총 시간</th>' +
        '<th scope="col">변용섭 담당</th><th scope="col">진행</th></tr></thead><tbody>' +
        p.courses.map(partnerCourse).join('') + '</tbody></table>' +
        '<p class="price-note">' + esc(p.org) + ' · ' + esc(p.orgContact) + ' · ' + esc(p.orgHours) +
        '<br>' + esc(p.approval) + '<br>' + esc(p.place) +
        '<br>수강신청은 교육기관에 전화로 문의해 주십시오.</p>';
    },
    posts: function (el, d) {
      el.innerHTML = '<ul class="stack">' + d.items.map(post).join('') + '</ul>';
    }
  };

  var FILE = { services: 'services', tools: 'tools', courses: 'courses', partner: 'courses', posts: 'posts' };

  document.querySelectorAll('[data-render]').forEach(function (el) {
    var key = el.getAttribute('data-render');
    if (!RENDER[key]) return;
    fetch(BASE + FILE[key] + '.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { RENDER[key](el, d); })
      .catch(function () { fail(el, el.getAttribute('data-label') || key); });
  });
})();
