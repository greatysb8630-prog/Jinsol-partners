import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const siteRoot = new URL('https://jinsolpartners.test/');
const read = (path) => readFile(new URL(path, root), 'utf8');
const versionFor = (content) => createHash('sha256')
  .update(content.replace(/\r\n/g, '\n'))
  .digest('hex')
  .slice(0, 8);

async function findHtmlPages(relativeDir = '') {
  const entries = await readdir(new URL(relativeDir || './', root), { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    const relativePath = `${relativeDir}${entry.name}`;
    if (entry.isDirectory() && !['.git', 'node_modules'].includes(entry.name)) {
      pages.push(...await findHtmlPages(`${relativePath}/`));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      pages.push(relativePath);
    }
  }

  return pages;
}

function localAssetReferences(html, page) {
  const pageUrl = new URL(page, siteRoot);

  return [...html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)]
    .map(([, , value]) => {
      let resolved;
      try {
        resolved = new URL(value, pageUrl);
      } catch {
        return null;
      }

      if (resolved.origin !== siteRoot.origin) return null;
      const assetPath = resolved.pathname.match(/^\/(.*?assets\/(?:css|js)\/[^/].*)$/)?.[1];
      return assetPath ? { assetPath, params: resolved.searchParams } : null;
    })
    .filter(Boolean);
}

test('로컬 자산 주소는 브라우저와 같은 기준으로 상대경로와 쿼리를 해석한다', () => {
  const references = localAssetReferences(`
    <link href="/assets/css/base.css?v=6e68f2ec">
    <script src="../assets/js/nav.js?v=88731470"></script>
    <script src='../../assets/js/nav.js?v=88731470?stale'></script>
    <link href="https://cdn.example.com/assets/css/external.css?v=12345678">
  `, 'education/profile/index.html');

  assert.deepEqual(
    references.map(({ assetPath }) => assetPath),
    ['assets/css/base.css', 'education/assets/js/nav.js', 'assets/js/nav.js'],
  );
  assert.equal(references[2].params.get('v'), '88731470?stale');
});

test('모든 HTML은 CSS·JS 내용 해시를 자산 버전으로 사용한다', async () => {
  const pages = await findHtmlPages();

  for (const page of pages) {
    const html = await read(page);
    const references = localAssetReferences(html, page);

    assert.ok(references.length > 0, `${page}: CSS·JS 참조가 없습니다`);

    for (const { assetPath, params } of references) {
      assert.deepEqual(
        [...params.keys()],
        ['v'],
        `${page}: /${assetPath}에는 v 캐시 버전만 사용해야 합니다`,
      );

      const content = await read(assetPath);
      const expectedVersion = versionFor(content);
      assert.equal(
        params.get('v'),
        expectedVersion,
        `${page}: /${assetPath}의 캐시 버전은 ${expectedVersion}이어야 합니다`,
      );
    }
  }
});
