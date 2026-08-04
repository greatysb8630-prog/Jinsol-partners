import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (path) => readFile(new URL(path, root), 'utf8');

test('제목 보조라벨은 14~16px 전용 크기를 사용하고 실제 부가정보는 12px을 유지한다', async () => {
  const [tokens, components, home, details] = await Promise.all([
    read('assets/css/tokens.css'),
    read('assets/css/components.css'),
    read('assets/css/pages/home.css'),
    read('assets/css/pages/details.css'),
  ]);

  assert.match(tokens, /--fs-label:\s*clamp\(14px,\s*1\.4vw,\s*16px\);/);
  assert.match(tokens, /--fs-micro:\s*12px;/);

  assert.match(components, /\.sec-head__eyebrow\s*\{[^}]*font-size:var\(--fs-label\)/s);
  assert.match(components, /\.card__no\s*\{[^}]*font-size:var\(--fs-label\)/s);
  assert.match(home, /\.home-case__number\s*\{[^}]*font-size:var\(--fs-label\)/s);
  assert.match(details, /\.course-summary__hours\s*\{[^}]*font-size:var\(--fs-label\)/s);
  assert.match(details, /\.case-detail__number\s*\{[^}]*font-size:var\(--fs-label\)/s);

  assert.match(components, /\.site-footer h3\s*\{[^}]*font-size:var\(--fs-micro\)/s);
  assert.match(details, /figcaption\s*\{[^}]*font-size:var\(--fs-micro\)/s);
});
