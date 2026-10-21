/* GET /api/blog — 티스토리 최신 글 목록(JSON)
   티스토리 RSS는 CORS를 허용하지 않아 브라우저가 직접 읽을 수 없으므로 여기서 중계합니다.
   글은 월요일 오전에 올라오므로 30분 캐시합니다. */
import { BLOG_URL, FEED_URL, parseFeed } from '../_lib/blog-feed.js';

const HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=300, s-maxage=1800',
};

export async function onRequestGet({ request, waitUntil }) {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const res = await fetch(FEED_URL, { headers: { 'User-Agent': 'jinsolpartners.com blog feed' } });
    if (!res.ok) throw new Error('feed ' + res.status);
    const items = parseFeed(await res.text());
    if (!items.length) throw new Error('no items');
    const response = new Response(JSON.stringify({ blogUrl: BLOG_URL, items }), { headers: HEADERS });
    waitUntil(cache.put(request, response.clone()));
    return response;
  } catch {
    /* 실패 시 캐시하지 않고, 홈의 기본 HTML이 그대로 보이게 둡니다. */
    return new Response(JSON.stringify({ error: 'feed unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
}
