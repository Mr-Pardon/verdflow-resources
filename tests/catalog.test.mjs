import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { record } from './fixtures.mjs';
import { validateRecord, readCatalog, containedPath } from '../scripts/catalog.mjs';

test('valid catalog record and explicit recommended release', () => assert.equal(validateRecord(record()).id, 'test.catalog'));
test('wrong schema, extension, dates, identities and extra fields are rejected', () => {
  for (const change of [{ schemaVersion: 2 }, { id: '../path' }, { surprise: true }, { recommended: '2.0.0' }]) assert.throws(() => validateRecord(record(change)));
  for (const patch of [{ releasedAt: '2026-99-10' }, { status: 'draft' }]) {
    const value = record(); Object.assign(value.versions[0], patch); assert.throws(() => validateRecord(value));
  }
  const value = record(); value.versions[0].package.filename = 'catalog.vfs'; assert.throws(() => validateRecord(value));
});
test('download URLs cannot point to local files, raw branches or arbitrary services', () => {
  for (const url of ['file:///private.vfa', 'https://example.com/test.vfa', 'https://github.com/a/b/raw/main/test.vfa', 'https://user:pass@github.com/a/b/releases/download/v1/catalog.vfa', 'https://github.com/a/b/releases/download/v1/wrong.vfa']) {
    const value = record(); value.versions[0].package.url = url; assert.throws(() => validateRecord(value));
  }
});
test('withdrawals require explanation and cannot be recommended', () => {
  const value = record(); value.versions[0].status = 'withdrawn'; assert.throws(() => validateRecord(value));
  value.versions[0].withdrawalReason = 'Test'; assert.throws(() => validateRecord(value));
  value.recommended = null; assert.doesNotThrow(() => validateRecord(value));
});
test('PAK remains external; source catalog may be recorded without installed dependency', () => {
  const value = record(); value.versions[0].relations = [{ kind: 'pak', name: 'PAK', url: 'https://example.com/download' }, { kind: 'source-catalog', name: 'Unavailable source' }];
  assert.doesNotThrow(() => validateRecord(value));
  value.versions[0].relations[0].resourceId = 'test.pak'; assert.throws(() => validateRecord(value));
});
test('entry files stay contained, snapshots change with README, relationships are checked', async t => {
  const root = await mkdtemp(join(tmpdir(), 'verdflow-resources-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const folder = join(root, 'assets', 'test.catalog');
  await mkdir(join(folder, 'media'), { recursive: true });
  await writeFile(join(folder, 'media/cover.png'), Buffer.from([1, 2, 3]));
  const value = record();
  await writeFile(join(folder, 'resource.json'), JSON.stringify(value));
  await writeFile(join(folder, 'README.md'), '# Test');
  const first = await readCatalog(root);
  await writeFile(join(folder, 'README.md'), '# Revised');
  assert.notEqual((await readCatalog(root))[0].revision, first[0].revision);
  await writeFile(join(folder, 'README.md'), '![missing](media/missing.png)');
  await assert.rejects(readCatalog(root), /local raster/);
  await writeFile(join(folder, 'README.md'), '# Restored');
  await assert.rejects(containedPath(folder, '../resource.json'));
  await assert.rejects(containedPath(folder, '/README.md'));
  value.versions[0].readme = '../README.md';
  await writeFile(join(folder, 'resource.json'), JSON.stringify(value));
  await assert.rejects(readCatalog(root));
  value.versions[0].readme = 'README.md';
  value.versions[0].relations = [{ kind: 'strategy', name: 'Missing strategy', resourceId: 'missing.strategy' }];
  await writeFile(join(folder, 'resource.json'), JSON.stringify(value));
  await assert.rejects(readCatalog(root), /Invalid relation/);
});
test('public entries contain no invented resource', async () => {
  const entries = await readCatalog(resolve('entries'));
  assert.ok(entries.every(entry => !entry.record.id.startsWith('test.')));
});
