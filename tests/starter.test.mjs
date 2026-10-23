import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarter } from '../scripts/starter.mjs';

const entry = { record: { id: 'sample', name: 'Sample', type: 'strategies', recommended: '1.1.0',
  versions: ['1.0.0', '1.1.0'].map(version => ({ version, status: 'published', package: { identity: 'sample', filename: `sample-${version}.vfs`, bytes: 1, sha256: 'a'.repeat(64), url: `https://example.invalid/${version}` } })) } };
const selection = version => ({ schemaVersion: 1, resources: [{ id: 'sample', version }] });

test('starter resolves reviewed recommendations, pins versions and derives a content revision', () => {
  const latest = buildStarter(selection('recommended'), [entry]);
  assert.equal(latest.resources[0].version, '1.1.0');
  assert.equal(latest.resources[0].identity, 'sample');
  assert.equal(buildStarter(selection('recommended'), [entry]).revision, latest.revision);
  assert.notEqual(buildStarter(selection('1.0.0'), [entry]).revision, latest.revision);
  assert.equal(new URL(latest.resources[0].page_url).searchParams.get('id'), 'sample');
});

test('withdrawn, missing, duplicate and plan entries cannot silently enter starter imports', () => {
  assert.throws(() => buildStarter(selection('missing'), [entry]));
  assert.throws(() => buildStarter(selection('recommended'), []));
  assert.throws(() => buildStarter({ schemaVersion: 1, resources: [...selection('recommended').resources, ...selection('recommended').resources] }, [entry]));
  assert.throws(() => buildStarter(selection('recommended'), [{ record: { ...entry.record, type: 'plans' } }]));
  assert.throws(() => buildStarter(selection('recommended'), [{ record: { ...entry.record, versions: [{ ...entry.record.versions[1], status: 'withdrawn' }] } }]));
  assert.equal(buildStarter({ schemaVersion: 1, resources: [] }, []).resources.length, 0);
});
