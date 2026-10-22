import { mkdir, writeFile, cp, rename, rm, lstat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readCatalog } from './catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function generateCatalog({ checkOnly = false } = {}) {
  const entries = await readCatalog(resolve(root, 'entries'));
  if (checkOnly) return entries;
  const output = resolve(root, '.generated');
  if (dirname(output) !== resolve(root)) throw new Error('Generated output must remain inside the repository');
  try { if ((await lstat(output)).isSymbolicLink()) throw new Error('Generated output cannot be a symbolic link'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  // Publish only current reviewed input; never carry removed entries into a new build.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp(resolve(root, 'public'), output, { recursive: true });
  const resources = [];
  for (const { record, files, revision } of entries) {
    const prefix = `data/${record.id}/${revision}/`;
    for (const { name, data } of files) {
      const target = resolve(output, prefix, name);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, data);
    }
    await writeFile(resolve(output, prefix, 'resource.json'), JSON.stringify(record));
    const release = record.versions.find(v => v.version === record.recommended) || [...record.versions].sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))[0];
    resources.push({ id: record.id, type: record.type, name: record.name, summary: record.summary,
      author: record.author, platforms: record.platforms, tags: record.tags || [],
      version: release.version, status: release.status, updatedAt: release.releasedAt,
      cover: record.cover ? prefix + record.cover : null, detail: prefix + 'resource.json' });
  }
  await writeFile(resolve(output, 'catalog.json.tmp'), JSON.stringify({ schemaVersion: 1, sourceRevision: process.env.GITHUB_SHA || null, resources }, null, 2));
  await rename(resolve(output, 'catalog.json.tmp'), resolve(output, 'catalog.json'));
  return entries;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const entries = await generateCatalog({ checkOnly: process.argv.includes('--check') });
  console.log(`Catalog validated: ${entries.length} resources.`);
}
