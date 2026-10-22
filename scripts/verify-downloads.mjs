import { createHash } from 'node:crypto';
import { readCatalog } from './catalog.mjs';
import { fileURLToPath } from 'node:url';

const entries = await readCatalog(fileURLToPath(new URL('../entries/', import.meta.url)));
const checked = new Map();
for (const { record } of entries) for (const version of record.versions) {
  if (version.status === 'withdrawn') continue;
  const pkg = version.package;
  const fingerprint = `${pkg.bytes}:${pkg.sha256}`;
  if (checked.has(pkg.url)) {
    if (checked.get(pkg.url) !== fingerprint) throw new Error('Conflicting metadata for one download URL');
    continue;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 300_000);
  try {
    const response = await fetch(pkg.url, { signal: controller.signal });
    if (!response.ok || !response.body) throw new Error(`Download failed: ${response.status}`);
    const hash = createHash('sha256');
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > pkg.bytes) { controller.abort(); throw new Error('Download exceeds declared size'); }
      hash.update(chunk);
    }
    if (size !== pkg.bytes || hash.digest('hex') !== pkg.sha256) throw new Error(`Download mismatch: ${record.id} ${version.version}`);
    checked.set(pkg.url, fingerprint);
    console.log(`Verified ${record.id} ${version.version}`);
  } finally { clearTimeout(timer); }
}
console.log(`Verified ${checked.size} published downloads. PAK links are not fetched.`);
