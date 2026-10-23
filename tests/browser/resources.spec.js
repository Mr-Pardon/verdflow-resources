import { test, expect } from '@playwright/test';
import { record } from '../fixtures.mjs';

async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
}
test('empty catalog, categories, contribution and responsive assets', async ({ page }) => {
  await page.route('**/catalog.json', route => route.fulfill({ json: { schemaVersion: 1, resources: [] } }));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('./');
    await expect(page.getByRole('heading', { name: '首批资产库正在整理' })).toBeVisible();
    expect(await page.locator('.brand img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    const heading = await page.locator('.catalog-heading').boundingBox();
    expect(heading.height).toBeLessThanOrEqual(120);
    await noOverflow(page);
    await page.screenshot({ path: `verification/catalog-${width}.png`, fullPage: true });
  }
  await page.getByRole('navigation', { name: '资源分类' }).getByRole('link', { name: /种植方案/ }).click();
  await expect(page.getByRole('heading', { name: '种植方案尚未上架' })).toBeVisible();
  await page.getByRole('link', { name: '投稿资源', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: '分享你的种植作品。' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '通过 PR 贡献' })).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test('published resources, thumbnails and PAK links work across viewport sizes', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('./');
    await expect(page.locator('.resource-card')).toHaveCount(1);
    await expect(page.locator('.resource-card')).toContainText('DTS_Library_v6');
    await expect(page.locator('.resource-cover img')).toBeVisible();
    await expect.poll(() => page.locator('.resource-cover img').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    expect((await page.locator('.catalog-heading').boundingBox()).height).toBeLessThanOrEqual(120);
    await noOverflow(page);
    await page.screenshot({ path: `verification/published-assets-${width}.png`, fullPage: true });
    await page.locator('.resource-card').click();
    await expect(page.locator('.readme')).toContainText('596 项资产');
    await expect(page.getByRole('link', { name: /下载 .vfa/ })).toHaveAttribute('href', /releases\/download\/assets-dts-library-v6.0.0\/DTS_Library_v6.vfa$/);
    await expect(page.locator('a[href="https://pan.baidu.com/s/1Te07ATBL0UrvJVowNR5k8w?pwd=sp4c"]').first()).toBeVisible();
    await noOverflow(page);
    await page.screenshot({ path: `verification/published-detail-${width}.png`, fullPage: true });
    await page.goto('./?type=strategies');
    await expect(page.locator('.resource-card')).toHaveCount(3);
    await expect(page.locator('.resource-card').filter({ hasText: '通用自然聚落' })).toHaveCount(0);
    await expect.poll(() => page.locator('.resource-cover img').evaluateAll(images => images.length === 3 && images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    await noOverflow(page);
    await page.screenshot({ path: `verification/published-strategies-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  for (const id of ['layered-ecological-community', 'lawn-feature-groups', 'universal-street-tree']) {
    await page.goto(`./?type=strategies&id=${id}`);
    await expect(page.locator('.readme')).toContainText('Mr_Pardon');
    await expect(page.getByRole('link', { name: /下载 .vfs/ })).toBeVisible();
    await expect.poll(() => page.locator('.readme img').evaluateAll(images => images.length > 0 && images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
});

test('contribution page links to all three submission examples and the Issue form', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('./?view=contribute');
    const examples = page.getByRole('navigation', { name: '投稿填写示例' });
    await expect(examples.getByRole('link')).toHaveCount(3);
    for (const [id, name] of [['assets', '资产库'], ['strategies', '策略'], ['plans', '种植方案']]) {
      const link = examples.getByRole('link', { name: `${name}示例`, exact: true });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', `https://github.com/Mr-Pardon/verdflow-resources/blob/main/docs/submission-examples/${id}.md`);
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    await expect(page.getByRole('link', { name: '提交资源', exact: true })).toHaveAttribute('href', 'https://github.com/Mr-Pardon/verdflow-resources/issues/new/choose');
    await noOverflow(page);
    await page.screenshot({ path: `verification/submission-examples-${width}.png`, fullPage: true });
  }
});

test('published plans show presets and navigate to their strategy and source catalog', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('./?type=plans');
    await expect(page.locator('.resource-card')).toHaveCount(2);
    await expect(page.locator('.resource-card').filter({ hasText: '花坛点景' })).toHaveCount(1);
    await expect(page.locator('.resource-card').filter({ hasText: '草坪铺设' })).toHaveCount(1);
    await expect.poll(() => page.locator('.resource-cover img').evaluateAll(images => images.length === 2 && images.every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    await noOverflow(page);
    await page.screenshot({ path: `verification/published-plans-${width}.png`, fullPage: true });
    for (const id of ['flowerbed-accents', 'lawn-cover']) {
      const href = `./?type=plans&id=${id}`;
      await page.goto(href);
      await expect(page.getByRole('link', { name: /下载 .vfp/ })).toHaveAttribute('href', new RegExp(`/plan-${id}-v1.0.0/${id}-1.0.0.vfp$`));
      await expect(page.locator('.readme')).toContainText(id === 'lawn-cover' ? '仅启用' : '7 种植被');
      await expect(page.locator('.related-section a[href="https://pan.baidu.com/s/1Te07ATBL0UrvJVowNR5k8w?pwd=sp4c"]')).toBeVisible();
      await noOverflow(page);
      await page.screenshot({ path: `verification/plan-${id}-${width}.png`, fullPage: true });
      await page.locator('.related-section').getByRole('link', { name: '草坪点景组团', exact: true }).click();
      await expect(page.locator('.detail-heading h1')).toHaveText('草坪点景组团');
      await page.goto(href);
      await page.locator('.related-section').getByRole('link', { name: 'DTS_Library_v6', exact: true }).click();
      await expect(page.locator('.detail-heading h1')).toHaveText('DTS_Library_v6');
    }
  }
  expect(errors).toEqual([]);
});

test('search, dynamic README, history, withdrawals and mobile detail using isolated fixtures', async ({ page }) => {
  const base = new URL(test.info().project.use.baseURL).pathname;
  const item = record();
  item.name = '测试资源 · 仅用于界面验证';
  item.versions.push({ ...structuredClone(item.versions[0]), version: '0.9.0', readme: 'old.md', status: 'withdrawn', withdrawalReason: '测试撤回版本', notes: '' });
  item.versions[0].relations = [{ kind: 'source-catalog', name: '测试来源', note: '来源关系，不是必须安装项' }, { kind: 'pak', name: '外部 PAK 测试入口', url: 'https://example.com/pak' }];
  const items = Array.from({ length: 15 }, (_, n) => ({ id: n ? `test.resource${n}` : item.id, type: 'assets', name: n ? `测试资源 ${n}` : item.name,
    summary: '自动化测试数据，不是真实发布资源。', author: 'Test author', platforms: ['DTS'], tags: ['测试'], version: '1.0.0', updatedAt: '2026-10-22', cover: null, detail: 'data/test/resource.json' }));
  await page.route('**/catalog.json', route => route.fulfill({ json: { schemaVersion: 1, resources: items } }));
  await page.route('**/data/test/resource.json', route => route.fulfill({ json: item }));
  let readmeRequests = 0;
  await page.route('**/data/test/README.md', route => { readmeRequests++; return route.fulfill({ body: '# 测试说明\n\n该内容仅供回归验证。\n\n![本地图片](media/test.png)\n\n<script>window.injected = true</script>' }); });
  await page.route('**/data/test/old.md', route => route.fulfill({ body: '# 旧版本说明\n\n此说明仅属于旧版。' }));
  await page.route('**/data/test/media/test.png', route => route.fulfill({ contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aRZkAAAAASUVORK5CYII=', 'base64') }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('./');
  await expect(page.locator('.resource-card')).toHaveCount(12);
  expect(readmeRequests).toBe(0);
  await page.getByRole('button', { name: '加载更多' }).click();
  await expect(page.locator('.resource-card')).toHaveCount(15);
  await noOverflow(page);
  await page.screenshot({ path: 'verification/cards-fixture-desktop.png', fullPage: true });
  await page.getByRole('searchbox', { name: '搜索资源' }).fill('仅用于界面验证');
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await page.locator('.resource-card').click();
  await expect(page.getByRole('heading', { name: '测试说明' })).toBeVisible();
  expect(readmeRequests).toBe(1);
  expect(await page.evaluate(() => window.injected)).toBeUndefined();
  await expect(page.getByRole('link', { name: /下载 .vfa/ })).toHaveAttribute('href', item.versions[0].package.url);
  await expect(page.locator('.readme img')).toHaveAttribute('src', new RegExp(`${base}data/test/media/test.png`));
  await page.screenshot({ path: 'verification/detail-fixture-desktop.png', fullPage: true });
  await page.getByLabel('选择资源版本').selectOption('0.9.0');
  await expect(page.getByRole('heading', { name: '旧版本说明' })).toBeVisible();
  await expect(page.getByRole('link', { name: /下载 .vfa/ })).toHaveCount(0);
  await page.getByRole('tab', { name: '资源介绍' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /版本记录/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await page.reload();
  await expect(page.getByRole('heading', { name: '旧版本说明' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({ path: 'verification/detail-fixture-mobile.png', fullPage: true });
  await page.getByRole('link', { name: '返回资源列表' }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('仅用于界面验证');
  await page.getByRole('searchbox').fill('no matching result');
  await expect(page.getByRole('heading', { name: '没有找到匹配的资源' })).toBeVisible();
});

test('README failure retries and leaving a slow request does not overwrite the next view', async ({ page }) => {
  const item = record();
  const summary = { id: item.id, type: item.type, name: item.name, summary: item.summary, author: item.author, platforms: item.platforms,
    tags: [], version: item.recommended, updatedAt: '2026-10-22', cover: null, detail: 'data/retry/resource.json' };
  await page.route('**/catalog.json', route => route.fulfill({ json: { schemaVersion: 1, resources: [summary] } }));
  await page.route('**/data/retry/resource.json', route => route.fulfill({ json: item }));
  let failed = true;
  await page.route('**/data/retry/README.md', route => failed ? route.fulfill({ status: 503, body: '' }) : route.fulfill({ body: '# 恢复后的正文' }));
  await page.goto('./?id=test.catalog');
  await expect(page.getByRole('heading', { name: '暂时无法查看这项资源' })).toBeVisible();
  failed = false;
  await page.getByRole('button', { name: '重试', exact: true }).click();
  await expect(page.getByRole('heading', { name: '恢复后的正文' })).toBeVisible();
  let finish;
  const gate = new Promise(resolve => { finish = resolve; });
  await page.unroute('**/data/retry/README.md');
  await page.route('**/data/retry/README.md', async route => { await gate; await route.fulfill({ body: '# 不应出现的旧请求' }).catch(() => {}); });
  await page.reload();
  await expect(page.getByRole('heading', { name: '正在加载资源' })).toBeVisible();
  await page.getByRole('link', { name: '返回资源列表' }).click();
  finish();
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: '不应出现的旧请求' })).toHaveCount(0);
});

test('failed catalog request can retry and unknown resource has a return path', async ({ page }) => {
  let failed = true;
  await page.route('**/catalog.json', route => failed ? route.fulfill({ status: 503, body: '' }) : route.fulfill({ json: { schemaVersion: 1, resources: [] } }));
  await page.goto('./');
  await expect(page.getByRole('heading', { name: '资源列表暂时无法加载' })).toBeVisible();
  failed = false;
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.getByRole('heading', { name: '首批资产库正在整理' })).toBeVisible();
  await page.goto('./?id=unknown.resource');
  await expect(page.getByRole('heading', { name: '暂时无法查看这项资源' })).toBeVisible();
  await page.getByRole('link', { name: '返回资源列表' }).click();
  await expect(page.getByRole('heading', { name: '首批资产库正在整理' })).toBeVisible();
});
