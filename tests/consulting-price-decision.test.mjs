import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const siteRoot = new URL('../', import.meta.url);
const services = JSON.parse(
  await readFile(new URL('data/services.json', siteRoot), 'utf8'),
);

const consultationTracks = new Set(['consulting', 'small-business']);
const consultationItems = services.items.filter((item) =>
  consultationTracks.has(item.track),
);

assert.ok(consultationItems.length > 0, '컨설팅 상품이 있어야 합니다.');
for (const item of consultationItems) {
  assert.equal(
    item.price,
    '상담 후 결정',
    `${item.id}의 비용은 "상담 후 결정"이어야 합니다.`,
  );
}

const consultingPage = await readFile(
  new URL('consulting/index.html', siteRoot),
  'utf8',
);
const smallBusinessPage = await readFile(
  new URL('small-business/index.html', siteRoot),
  'utf8',
);
const toolsPage = await readFile(new URL('tools/index.html', siteRoot), 'utf8');

for (const [name, page] of [
  ['중소기업 컨설팅', consultingPage],
  ['소상공인 컨설팅', smallBusinessPage],
]) {
  assert.match(page, /상담 후 결정/, `${name} 페이지에 새 비용 안내가 필요합니다.`);
  assert.doesNotMatch(
    page,
    /(?:15|45|60|240|400|500)만 원|정해진 금액|비용 범위를 모두 공개|비용을 모두 밝힙니다/,
    `${name} 페이지에 기존 비용 안내가 남아 있으면 안 됩니다.`,
  );
}

assert.doesNotMatch(
  consultingPage + toolsPage,
  /무료 간이진단|비용은 없습니다/,
  '간이진단 상품을 무료로 안내하는 기존 문구가 남아 있으면 안 됩니다.',
);

console.log(`PASS: 컨설팅 상품 ${consultationItems.length}개의 비용 문구와 상세 페이지 안내가 일치합니다.`);
