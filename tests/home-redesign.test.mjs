import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');
const pages = [
  'index.html',
  'consulting/index.html',
  'small-business/index.html',
  'education/index.html',
  'education/profile/index.html',
  'tools/index.html',
  'contact/index.html',
  'privacy/index.html',
];

test('모든 페이지가 압축된 나침반 브랜드 이미지를 사용한다', async () => {
  await access(new URL('assets/images/compass-brand.webp', root));
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /class="site-header__compass"/, page);
    assert.match(html, /\/assets\/images\/compass-brand\.webp/, page);
  }
});

test('홈페이지가 승인된 5단계 흐름을 제공한다', async () => {
  const html = await read('index.html');
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';

  assert.equal((main.match(/<section\b/g) ?? []).length, 5);
  assert.match(main, /반복 업무는 줄이고,[\s\S]*현장은 스스로 움직이게/);
  assert.equal((main.match(/class="home-screen-stage__image/g) ?? []).length, 3);
  assert.match(main, /현장을 아는 사람이 <span class="hl">AI<\/span>를 다룹니다/);
  assert.match(main, /경영지도사\(생산관리\)[\s\S]*AX 강사 자격자[\s\S]*실제 업무도구 직접 구축/);
  assert.match(main, /data-render="tools"[^>]*data-layout="showcase"/);
  assert.equal((main.match(/class="compass-rule"/g) ?? []).length, 2);
});

test('홈페이지가 승인된 컨설턴트 소개 구도를 유지한다', async () => {
  const html = await read('index.html');

  assert.match(html, /제조현장 경험을 AI·AX 실행 역량으로 연결합니다/);
  assert.match(html, /profile-byun\.webp/);
  assert.match(html, /변용섭 · 경영지도사\(생산관리\)/);
  assert.match(html, /자격·위원 활동 전체 보기/);
  assert.match(html, /강사 프로필 PDF/);
});

test('홈페이지가 중복 설명과 금지 요소를 제거한다', async () => {
  const html = await read('index.html');
  const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] ?? '';

  assert.doesNotMatch(main, /class="bearing"/);
  assert.doesNotMatch(main, /상담에서 드리는 것|상담에서 하지 않는 것/);
  assert.doesNotMatch(main, /<form\b|카카오|Resend|TrueNorth/i);
  assert.match(main, /greatysb@naver\.com/);
  assert.match(main, /010-2665-8630/);
});
