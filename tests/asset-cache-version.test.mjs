import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
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

test('모든 HTML은 CSS·JS 내용 해시를 자산 버전으로 사용한다', async () => {
  const pages = await findHtmlPages();

  for (const page of pages) {
    const html = await read(page);
    const references = [...html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)]
      .map(([, , value]) => value)
      .filter((value) => !/^(?:[a-z]+:)?\/\//i.test(value))
      .map((value) => {
        const [withoutFragment] = value.split('#', 1);
        const [pathname, query = ''] = withoutFragment.split('?', 2);
        const assetPath = pathname.match(/(?:^|\/)(assets\/(?:css|js)\/[^/].*)$/)?.[1];
        return assetPath ? { assetPath, query } : null;
      })
      .filter(Boolean);

    assert.ok(references.length > 0, `${page}: CSS·JS 참조가 없습니다`);

    for (const { assetPath, query } of references) {
      const params = new URLSearchParams(query);
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
