import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildImportDocuments } from '../scripts/import-documents.mjs';
import { buildStarter } from '../scripts/starter.mjs';
import { readCatalog } from '../scripts/catalog.mjs';

function fixture() {
  const entries = ['assets', 'strategies', 'plans'].map(type => ({ record: {
    id: type, name: type, type, recommended: '1.0.0', versions: [{ version: '1.0.0', status: 'published',
      package: { identity: type, filename: `${type}.${{ assets: 'vfa', strategies: 'vfs', plans: 'vfp' }[type]}`,
        bytes: 100, sha256: 'a'.repeat(64), url: `https://example.invalid/${type}` } }],
  } }));
  const resources = entries.map(({ record: r }) => ({ id: r.id, name: r.name, kind: r.type, version: '1.0.0',
    status: 'published', ...r.versions[0].package,
    page_url: `https://mr-pardon.github.io/verdflow-resources/?type=${r.type}&id=${r.id}&version=1.0.0`,
    ...(r.type === 'assets' ? { target_type: 'dts' } : {}),
    ...(r.type === 'strategies' ? { strategy_hash: `sha256:${'b'.repeat(64)}` } : {}),
    ...(r.type === 'plans' ? { plan: { profile_id: 'plans', semantic_hash: `sha256:${'c'.repeat(64)}`,
      strategy_id: 'strategies', strategy_version: '1.0.0', strategy_hash: `sha256:${'b'.repeat(64)}`,
      catalogs: [{ target_type: 'dts', catalog_id: 'assets' }] } } : {}),
  }));
  return { entries, inspection: { schemaVersion: 1, resources }, selection: { schemaVersion: 1,
    resources: entries.map(({ record }) => ({ id: record.id, version: 'recommended' })) } };
}

test('v2 includes plans and inspected optional sources; v1 is an unchanged explicit projection', () => {
  const { entries, inspection, selection } = fixture();
  const docs = buildImportDocuments(selection, entries, inspection);
  assert.equal(docs.starter.schemaVersion, 2);
  assert.equal(docs.starter.resources.length, 3);
  assert.equal(docs.starter.resources[2].plan.catalogs[0].catalog_id, 'assets');
  assert.deepEqual(docs.legacy, buildStarter({ ...selection, resources: selection.resources.slice(0, 2) }, entries));
});

test('stale archives, missing inspections and manual-only plan relations fail closed', () => {
  for (const mutate of [
    value => { value.entries[0].record.versions[0].package.sha256 = 'd'.repeat(64); },
    value => { value.inspection.resources.pop(); },
    value => { delete value.inspection.resources[2].plan; },
  ]) {
    const value = fixture(); mutate(value);
    assert.throws(() => buildImportDocuments(value.selection, value.entries, value.inspection));
  }
});

test('withdrawn resources are not offered and cannot remain in the selected recommendations', () => {
  const value = fixture();
  value.entries[1].record.versions[0].status = 'withdrawn';
  assert.throws(() => buildImportDocuments(value.selection, value.entries, value.inspection));
  value.selection.resources = value.selection.resources.filter(item => item.id !== 'strategies');
  assert.equal(buildImportDocuments(value.selection, value.entries, value.inspection).index.resources.length, 2);
});

test('reviewed production selection matches inspected packages and keeps legacy clients compatible', async () => {
  const selection = JSON.parse(await readFile(new URL('../collections/starter.json', import.meta.url), 'utf8'));
  const inspection = JSON.parse(await readFile(new URL('../collections/package-inspections.json', import.meta.url), 'utf8'));
  const entries = await readCatalog(fileURLToPath(new URL('../entries', import.meta.url)));
  const docs = buildImportDocuments(selection, entries, inspection);
  assert.deepEqual(docs.starter.resources.map(item => item.id), selection.resources.map(item => item.id));
  assert.deepEqual(new Set(docs.starter.resources.map(item => item.kind)), new Set(['assets', 'strategies', 'plans']));
  assert.deepEqual(docs.legacy.resources.map(item => item.id), docs.starter.resources.filter(item => item.kind !== 'plans').map(item => item.id));
  assert.equal(docs.legacy.schemaVersion, 1);
  assert.equal(docs.starter.schemaVersion, 2);
  assert.equal(docs.index.schemaVersion, 1);
});
