/* profile-print.js — 프로필 PDF 저장 (WU-02)
   정적 PDF 파일을 생성할 빌드 단계가 없으므로 브라우저 인쇄로 PDF를 만듭니다.
   이 페이지의 <title>이 곧 저장 파일명이 되므로
   진솔파트너스_강사프로필_변용섭_2026.pdf 로 저장됩니다. (기획안 8-3 파일명 규칙) */
(function () {
  'use strict';

  function print() { window.print(); }

  ['print-btn', 'print-btn-2'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('click', print);
  });

  // /education 의 'PDF' 버튼에서 ?pdf=1 로 들어온 경우 바로 인쇄 대화상자를 엽니다.
  if (new URLSearchParams(window.location.search).get('pdf') === '1') {
    window.addEventListener('load', function () { window.setTimeout(print, 300); });
  }
})();
