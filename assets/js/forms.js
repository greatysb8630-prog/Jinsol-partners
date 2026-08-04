/* forms.js — 문의 폼 3종 (WU-06)
   기획안 9장 : 수집 항목과 후속 대응이 달라 폼을 분리합니다.
   기획안 13-3 C : 1차는 데이터베이스 없이 이메일 발송만 합니다.
   클라이언트 검증은 편의용이며, 서버가 다시 검증합니다. */
(function () {
  'use strict';

  var ENDPOINT = { consulting: '/api/contact-consulting', 'small-business': '/api/contact-small', education: '/api/contact-education' };
  var loadedAt = Date.now();

  function setStatus(form, msg, ok) {
    var el = form.querySelector('.form-status');
    if (!el) return;
    el.textContent = msg;
    el.style.borderColor = ok ? 'var(--signal)' : 'var(--line-firm)';
  }

  function clearErrors(form) {
    form.querySelectorAll('.field__err').forEach(function (n) { n.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }

  function showError(input, msg) {
    input.setAttribute('aria-invalid', 'true');
    var p = document.createElement('span');
    p.className = 'field__err';
    p.textContent = msg;
    input.parentNode.appendChild(p);
  }

  function validate(form) {
    clearErrors(form);
    var first = null;
    form.querySelectorAll('[required]').forEach(function (input) {
      var empty = input.type === 'checkbox' ? !input.checked : !input.value.trim();
      if (empty) {
        showError(input, input.type === 'checkbox' ? '동의하셔야 접수됩니다.' : '입력해 주십시오.');
        if (!first) first = input;
      }
    });
    var email = form.querySelector('input[type="email"]');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, '이메일 형식을 확인해 주십시오.');
      if (!first) first = email;
    }
    if (first) { first.focus(); setStatus(form, '입력하지 않으신 항목이 있습니다.', false); }
    return !first;
  }

  document.querySelectorAll('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;

      var kind = form.getAttribute('data-form');
      var btn = form.querySelector('button[type="submit"]');
      var body = {};
      new FormData(form).forEach(function (v, k) { body[k] = v; });
      body.elapsed = Date.now() - loadedAt;   // 봇 대응 : 제출 간격

      btn.disabled = true;
      setStatus(form, '접수 중입니다.', true);

      fetch(ENDPOINT[kind], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.d && res.d.message);
          form.reset();
          setStatus(form, '접수되었습니다. 영업일 기준 1일 이내에 연락드리겠습니다.', true);
        })
        .catch(function () {
          setStatus(form, '접수에 실패했습니다. 번거로우시겠지만 010-2665-8630으로 전화 주시거나 greatysb@naver.com으로 보내 주십시오.', false);
        })
        .then(function () { btn.disabled = false; });
    });
  });
})();
