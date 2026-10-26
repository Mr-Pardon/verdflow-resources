import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import MarkdownIt from 'markdown-it';

const markdown = new MarkdownIt();
const repository = 'https://github.com/Mr-Pardon/verdflow-resources';
const examples = [
  { type: 'assets', id: 'dts-library', version: '6.0.0' },
  { type: 'strategies', id: 'lawn-feature-groups', version: '1.0.2' },
  { type: 'plans', id: 'flowerbed-accents', version: '1.0.0' },
];

test('each submission example matches a published package and all form fields', async () => {
  const form = (await readFile(new URL('../.github/ISSUE_TEMPLATE/resource-submission.yml', import.meta.url), 'utf8')).replaceAll('\r\n', '\n');
  const headings = ['资源类型', '资源名称与版本', '介绍与预览图', '包文件链接与关联资源', '作者署名', '许可与素材来源', '投稿确认'];
  for (const { type, id, version } of examples) {
    const url = new URL(`../docs/submission-examples/${type}.md`, import.meta.url);
    const source = (await readFile(url, 'utf8')).replaceAll('\r\n', '\n');
    const record = JSON.parse(await readFile(new URL(`../entries/${type}/${id}/resource.json`, import.meta.url), 'utf8'));
    const release = record.versions.find(item => item.version === version);
    assert.equal(release?.status, 'published');
    assert.ok(source.includes(`${record.name} / ${version}`));
    assert.ok(source.includes(`## 作者署名\n\n${record.author}\n`), `${type}: example author must match resource attribution`);
    assert.ok(source.includes(release.package.url));
    assert.ok(form.includes(`${repository}/blob/main/docs/submission-examples/${type}.md`));
    for (const heading of headings) {
      assert.ok(source.includes(`## ${heading}\n`), `${type}: missing ${heading}`);
      assert.ok(form.includes(`label: ${heading}\n`));
    }
    for (const block of markdown.parse(source, {})) {
      for (const token of block.children || []) {
        const href = token.type === 'image' ? token.attrGet('src') : token.type === 'link_open' ? token.attrGet('href') : null;
        if (href && !href.startsWith('https://')) {
          assert.ok((await stat(new URL(href, url))).isFile(), `${type}: missing ${href}`);
        }
      }
    }
  }
});
