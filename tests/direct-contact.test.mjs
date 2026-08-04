import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('contact page uses compact direct email cards and a direct phone action', () => {
  const html = read('contact/index.html');
  assert.doesNotMatch(html, /<form\b|data-form=|forms\.js/);

  for (const id of ['consulting', 'small-business', 'education']) {
    const card = html.match(new RegExp(`<article[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?<\\/article>`));
    assert.ok(card, `missing ${id} inquiry card`);
    assert.match(card[0], /mailto:greatysb@naver\.com/);
  }

  assert.match(html, /tel:01026658630/);

  assert.equal(existsSync(new URL('../assets/js/forms.js', import.meta.url)), false);
  assert.equal(existsSync(new URL('../functions/api', import.meta.url)), false);
});

test('public copy no longer promises a web form', () => {
  assert.doesNotMatch(read('index.html'), /문의 폼/);

  const privacy = read('privacy/index.html');
  assert.match(privacy, /홈페이지는 개인정보 입력 폼을 운영하지 않습니다/);
  assert.match(privacy, /상담 종료 후 6개월/);
  assert.doesNotMatch(privacy, /문의 폼|이메일 발송 서비스|별도의 데이터베이스/);
});
