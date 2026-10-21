/* blog-feed.js — 티스토리 RSS를 홈 카드용 JSON으로 변환합니다.
   글 본문은 가져오지 않습니다. 제목·날짜·분류·링크·대표 이미지만 씁니다. */

export const FEED_URL = 'https://truenorth-solution.tistory.com/rss';
export const BLOG_URL = 'https://truenorth-solution.tistory.com/';
export const MAX_ITEMS = 4;
/* 글(/entry/)만 노출합니다. 고정 페이지(/pages/)는 제외됩니다.
   홈에 노출하지 않는 분류 (티스토리 분류명, 앞의 번호 포함) */
export const EXCLUDED_CATEGORIES = ['01_회사소개'];

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" };

function decode(s) {
  return s.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, k) => ENTITIES[k]);
}

function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '>([^]*?)</' + name + '>'));
  return m ? decode(m[1].trim()) : '';
}

/* RSS의 첫 category가 분류, 나머지는 태그입니다. 앞의 "02_" 번호는 떼어냅니다. */
function categoryOf(block) {
  const m = block.match(/<category>([\s\S]*?)<\/category>/);
  return m ? decode(m[1].trim()) : '';
}

function thumbOf(block) {
  const desc = tag(block, 'description');
  for (const m of desc.matchAll(/<img[^>]+src=["']([^"']+)["']/g)) {
    const src = m[1];
    if (src.startsWith('https://') && !/YOUR_TISTORY_URL|no-image/.test(src)) return decode(src);
  }
  return '';
}

/* 한국 시간 기준 YYYY-MM-DD */
function kstDate(pubDate) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(d.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export function parseFeed(xml) {
  const items = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const rawCategory = categoryOf(block);
    if (EXCLUDED_CATEGORIES.includes(rawCategory)) continue;
    const url = tag(block, 'link');
    const title = tag(block, 'title');
    const date = kstDate(tag(block, 'pubDate'));
    if (!title || !date || !url.startsWith('https://') || !url.includes('/entry/')) continue;
    items.push({
      title,
      url,
      date,
      category: rawCategory.replace(/^\d+_/, ''),
      thumb: thumbOf(block),
    });
  }
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return items.slice(0, MAX_ITEMS);
}
