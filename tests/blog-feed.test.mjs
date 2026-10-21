import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseFeed } from '../functions/_lib/blog-feed.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const item = ({ title, link, pub, category, img = '' }) => `<item>
  <title>${title}</title>
  <link>${link}</link>
  <description>&lt;p&gt;${img ? `&lt;img src=&quot;${img}&quot;&gt;` : ''}본문&lt;/p&gt;</description>
  <category>${category}</category>
  <category>태그</category>
  <pubDate>${pub}</pubDate>
</item>`;

const base = 'https://truenorth-solution.tistory.com';
const feed = `<rss><channel><title>블로그</title>
${item({ title: '옛 글 &amp; 제목', link: `${base}/entry/old`, pub: 'Wed, 2 Jul 2025 10:26:36 +0900', category: '02_컨설팅사례' })}
${item({ title: '새 글', link: `${base}/entry/new`, pub: 'Mon, 19 Oct 2026 08:36:30 +0900', category: '03_정부지원사업', img: 'https://images.example.com/a.jpg?q=80&amp;amp;w=1200' })}
${item({ title: '회사소개', link: `${base}/entry/about`, pub: 'Tue, 1 Jul 2025 10:00:00 +0900', category: '01_회사소개' })}
${item({ title: '고정 페이지', link: `${base}/pages/about`, pub: 'Tue, 1 Jul 2025 10:00:00 +0900', category: '' })}
${item({ title: '자리표시 이미지', link: `${base}/entry/ph`, pub: 'Mon, 1 Jun 2026 09:00:00 +0900', category: '02_컨설팅사례', img: 'https://YOUR_TISTORY_URL/upload/profile.jpg' })}
</channel></rss>`;

test('RSS를 최신순 글 목록으로 바꾸고 번호 접두사·HTML 엔티티를 정리한다', () => {
  const items = parseFeed(feed);
  assert.deepEqual(items.map((i) => i.title), ['새 글', '자리표시 이미지', '옛 글 & 제목']);
  assert.deepEqual(items.map((i) => i.category), ['정부지원사업', '컨설팅사례', '컨설팅사례']);
  assert.equal(items[0].date, '2026-10-19');
});

test('회사소개 분류와 고정 페이지(/pages/)는 제외한다', () => {
  const titles = parseFeed(feed).map((i) => i.title);
  assert.ok(!titles.includes('회사소개'));
  assert.ok(!titles.includes('고정 페이지'));
});

test('대표 이미지는 본문의 첫 https 이미지이고 자리표시 주소는 건너뛴다', () => {
  const items = parseFeed(feed);
  assert.equal(items[0].thumb, 'https://images.example.com/a.jpg?q=80&w=1200');
  assert.equal(items[1].thumb, '');
});

test('한국 시간 기준 날짜를 쓴다 (UTC로는 전날인 월요일 오전)', () => {
  const [first] = parseFeed(item({ title: 't', link: `${base}/entry/x`, pub: 'Mon, 19 Oct 2026 08:36:30 +0900', category: 'a' }));
  assert.equal(first.date, '2026-10-19');
});

test('최대 4개만 돌려준다', () => {
  const many = Array.from({ length: 6 }, (_, n) => item({ title: `글${n}`, link: `${base}/entry/${n}`, pub: `Mon, 1 Jun 2026 0${n}:00:00 +0900`, category: '02_컨설팅사례' })).join('');
  assert.equal(parseFeed(`<rss>${many}</rss>`).length, 4);
});

test('홈은 기본 글 목록과 피드 렌더 훅을 갖고 blog.js를 불러온다', async () => {
  const html = await read('index.html');
  const section = html.match(/<section[^>]*id="insights"[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.match(section, /data-blog-feed/);
  assert.equal((section.match(/<article class="home-post/g) ?? []).length, 4);
  assert.match(section, /매주 월요일/);
  assert.match(html, /\/assets\/js\/blog\.js\?v=[0-9a-f]{8}/);
});
