import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const mainOf = (html) => html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';
const sectionCount = (html) => (mainOf(html).match(/<section\b/g) ?? []).length;
const occurrences = (text, pattern) => (text.match(pattern) ?? []).length;

test('서비스 상세 페이지가 핵심 섹션만 유지한다', async () => {
  const [consulting, smallBusiness] = await Promise.all([
    read('consulting/index.html'),
    read('small-business/index.html'),
  ]);

  assert.equal(sectionCount(consulting), 3);
  assert.equal(sectionCount(smallBusiness), 3);
  assert.match(consulting, /data-layout="summary"/);
  assert.match(smallBusiness, /data-layout="summary"/);
  assert.doesNotMatch(consulting, /상세 진단 내용은 곧 공개합니다/);
  assert.doesNotMatch(smallBusiness, /class="card"[^>]*><h3>매일 하는 계산/);
  assert.match(consulting, /상담 후 결정/);
  assert.match(smallBusiness, /상담 후 결정/);
});

test('교육 페이지는 3개 섹션과 4항목 과정 요약을 사용한다', async () => {
  const education = await read('education/index.html');

  assert.equal(sectionCount(education), 3);
  assert.match(education, /data-render="courses"[^>]*data-layout="summary"/);
  assert.match(education, /data-render="partner"[^>]*data-layout="summary"/);
  assert.doesNotMatch(education, /profile-byun\.webp/);
  assert.doesNotMatch(education, /class="kpi"/);
  assert.doesNotMatch(education, /내려받기 자료|사업자등록증/);
  assert.doesNotMatch(education, /강의계획서 · 전체 프로필/);
  assert.equal(occurrences(education, /강사 프로필 PDF/g), 1);
});

test('도구 페이지는 넓은 상세 사례 레이아웃을 사용한다', async () => {
  const tools = await read('tools/index.html');

  assert.equal(sectionCount(tools), 3);
  assert.match(tools, /data-render="tools"[^>]*data-layout="detail"/);
  assert.doesNotMatch(mainOf(tools), /6가지를 같은 서식/);
});

test('문의 페이지는 유형별 반복 섹션을 하나로 합친다', async () => {
  const contact = await read('contact/index.html');

  assert.equal(sectionCount(contact), 2);
  assert.match(contact, /id="consulting"/);
  assert.match(contact, /id="small-business"/);
  assert.match(contact, /id="education"/);
  assert.equal(occurrences(contact, /이메일에 적어 주세요/g), 0);
  assert.equal(occurrences(contact, /바로 문의하기/g), 0);
});

test('프로필은 상세 정보는 보존하고 중복 PDF CTA를 제거한다', async () => {
  const profile = await read('education/profile/index.html');

  assert.equal(occurrences(profile, /이 페이지를 PDF로 저장/g), 1);
  assert.doesNotMatch(profile, /profile__quote/);
  assert.match(profile, /한국중소벤처기업유통원\(판판대로\) 기술지도평가위원/);
  assert.match(profile, /현장형 AX전문강사양성과정 수료/);
});

test('개인정보 본문과 공통 모바일 연락 바를 유지한다', async () => {
  const privacy = await read('privacy/index.html');

  assert.match(privacy, /상담 종료 후 6개월/);
  assert.match(privacy, /제3자 제공과 처리 위탁/);
  assert.match(privacy, /class="consult-bar/);
});

test('상세 페이지는 폼·카카오·Resend를 추가하지 않는다', async () => {
  const paths = [
    'consulting/index.html',
    'small-business/index.html',
    'education/index.html',
    'tools/index.html',
    'contact/index.html',
  ];

  for (const path of paths) {
    const html = await read(path);
    assert.doesNotMatch(mainOf(html), /<form\b|카카오|Resend/i, path);
  }
});

test('각 페이지 하단의 기존 푸터를 유지한다', async () => {
  const standardPages = [
    'index.html',
    'consulting/index.html',
    'small-business/index.html',
    'education/index.html',
    'tools/index.html',
    'contact/index.html',
    'privacy/index.html',
  ];

  for (const path of standardPages) {
    const html = await read(path);
    assert.match(html, /class="site-footer"/, path);
    assert.match(html, /class="site-footer__cols"/, path);
    assert.match(html, /중소기업·소상공인 업무자동화 길잡이/, path);
    assert.match(html, /010-2665-8630/, path);
    assert.match(html, /greatysb@naver\.com/, path);
    assert.match(html, /인사이트 블로그/, path);
  }

  const profile = await read('education/profile/index.html');
  assert.match(profile, /class="site-footer no-print"/);
  assert.match(profile, /010-2665-8630/);
  assert.match(profile, /greatysb@naver\.com/);
});

test('화면에서 감춘 원본 상세 데이터는 JSON에 보존한다', async () => {
  const [services, courses, tools] = await Promise.all([
    read('data/services.json').then(JSON.parse),
    read('data/courses.json').then(JSON.parse),
    read('data/tools.json').then(JSON.parse),
  ]);

  for (const item of services.items) {
    for (const key of ['fitFor', 'problem', 'duration', 'deliverables', 'clientPrepares', 'price']) {
      assert.ok(item[key], `${item.id}.${key}`);
    }
  }
  for (const item of courses.own) {
    for (const key of ['target', 'headcount', 'totalHours', 'prerequisite', 'syllabus', 'output', 'application']) {
      assert.ok(item[key], `${item.id}.${key}`);
    }
  }
  for (const item of tools.items) {
    for (const key of ['problem', 'asIs', 'tool', 'verification', 'expectedEffect', 'screenNote']) {
      assert.ok(item[key], `${item.id}.${key}`);
    }
  }
});
