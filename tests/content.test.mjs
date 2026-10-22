import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderReadme } from '../web/lib/content.js';
import { parseRoute } from '../web/lib/route.js';
const url = 'https://example.com/resources/data/a/hash/README.md';
test('Markdown headings, tables and relative raster images render', () => {
  const html = renderReadme('# 资源介绍\n\n![Image](media/cover.png)\n\n| A | B |\n|---|---|\n| 1 | 2 |', url);
  assert.match(html, /id="资源介绍"/); assert.match(html, /<table>/);
  assert.match(html, /https:\/\/example.com\/resources\/data\/a\/hash\/media\/cover.png/);
});
test('README cannot execute HTML, script, unsafe URLs, SVG or remote tracking images', () => {
  const html = renderReadme('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[Bad](javascript:alert)\n\n![Remote](https://other.test/pixel.png)\n\n![SVG](media/evil.svg)\n\n{{ process.env }}', url);
  assert.doesNotMatch(html, /<script|<img|href="javascript:/);
  assert.match(html, /&lt;script&gt;/);
});
test('external links receive safe navigation attributes', () => {
  const html = renderReadme('[Manual](https://example.org/manual)', url);
  assert.match(html, /rel="noopener noreferrer"/);
});
test('query routes retain search and normalize unknown modes', () => {
  assert.equal(parseRoute('?type=plans&q=grass&id=author.plan&version=1.0.0').q, 'grass');
  assert.equal(parseRoute('?type=bad&sort=bad&view=bad').type, 'assets');
  assert.equal(parseRoute('?type=bad&sort=bad&view=bad').sort, 'updated');
});
