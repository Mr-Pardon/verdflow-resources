import { createHash } from 'node:crypto';

export function buildStarter(selection, entries) {
  if (selection?.schemaVersion !== 1 || !Array.isArray(selection.resources) || selection.resources.length > 32) {
    throw new Error('Invalid starter collection');
  }
  const seen = new Set();
  const resources = selection.resources.map(item => {
    const record = entries.find(entry => entry.record.id === item.id)?.record;
    if (!record || seen.has(item.id) || !['assets', 'strategies'].includes(record.type)) {
      throw new Error(`Invalid or duplicate starter resource: ${item.id}`);
    }
    seen.add(item.id);
    const version = item.version === 'recommended' ? record.recommended : item.version;
    const release = record.versions.find(release => release.version === version);
    if (!release || release.status !== 'published') throw new Error(`Starter version is unavailable: ${item.id}`);
    return { id: record.id, name: record.name, kind: record.type, version,
      ...release.package, page_url: `https://mr-pardon.github.io/verdflow-resources/?type=${record.type}&id=${record.id}&version=${version}` };
  });
  const revision = createHash('sha256').update(JSON.stringify(resources)).digest('hex');
  return { schemaVersion: 1, revision, resources };
}
