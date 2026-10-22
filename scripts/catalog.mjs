import { readFile, readdir, realpath, lstat } from 'node:fs/promises';
import { resolve, relative, sep, extname, basename } from 'node:path';
import { createHash } from 'node:crypto';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import MarkdownIt from 'markdown-it';

const schema = JSON.parse(await readFile(new URL('../schemas/resource.schema.json', import.meta.url), 'utf8'));
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const extensions = { assets: '.vfa', strategies: '.vfs', plans: '.vfp' };
const markdown = new MarkdownIt({ html: false });

export function validateRecord(record) {
  if (!validate(record)) throw new Error(ajv.errorsText(validate.errors));
  const versions = new Set();
  for (const release of record.versions) {
    if (versions.has(release.version)) throw new Error('Duplicate version');
    versions.add(release.version);
    if (!release.readme.endsWith('.md')) throw new Error('README must be Markdown');
    if (extname(release.package.filename) !== extensions[record.type]) throw new Error('Wrong package extension');
    const url = new URL(release.package.url);
    if (url.hostname !== 'github.com' || !/^\/[^/]+\/[^/]+\/releases\/download\/[^/]+\/[^/]+$/.test(url.pathname)
      || url.username || url.password || url.search || url.hash
      || decodeURIComponent(basename(url.pathname)) !== release.package.filename) throw new Error('Expected a versioned GitHub Release asset URL');
    if (release.status === 'withdrawn' && !release.withdrawalReason) throw new Error('Withdrawal requires a reason');
    for (const link of release.relations) {
      if (link.kind === 'pak' && (!link.url || link.resourceId)) throw new Error('PAK must be an external URL');
      if (link.url && (new URL(link.url).username || new URL(link.url).password)) throw new Error('External URLs cannot contain credentials');
      if (link.kind !== 'pak' && link.url) throw new Error('Resource relationships use resourceId, not URL');
      if (link.version && !link.resourceId) throw new Error('A related version requires resourceId');
    }
  }
  if (record.recommended === null) {
    if (record.versions.some(v => v.status === 'published')) throw new Error('A published resource needs a recommended version');
  } else if (!record.versions.some(v => v.version === record.recommended && v.status === 'published')) throw new Error('Recommended version must be published');
  if (new Set(record.versions.map(v => v.package.identity)).size !== 1) throw new Error('Package identity cannot change between versions');
  return record;
}

export async function containedPath(root, name) {
  if (name.includes('\\') || name.split('/').some(part => !part || part === '.' || part === '..')) throw new Error('Unsafe content path');
  const target = resolve(root, name);
  const actualRoot = await realpath(root);
  const actual = await realpath(target);
  const rel = relative(actualRoot, actual);
  if (!rel || rel.startsWith(`..${sep}`) || rel === '..' || resolve(actualRoot, rel) !== actual) throw new Error('Content path escapes its entry');
  if ((await lstat(target)).isSymbolicLink()) throw new Error('Symbolic links are not publishable');
  return actual;
}

async function collectFiles(root, dir = '') {
  const files = [];
  for (const item of await readdir(resolve(root, dir), { withFileTypes: true })) {
    const name = dir ? `${dir}/${item.name}` : item.name;
    if (item.isSymbolicLink()) throw new Error('Symbolic links are not publishable');
    if (item.isDirectory()) files.push(...await collectFiles(root, name));
    else if (item.isFile() && (name.endsWith('.md') || /\.(png|jpe?g|webp)$/i.test(name))) {
      const data = await readFile(await containedPath(root, name));
      if (data.length > (name.endsWith('.md') ? 256_000 : 5_000_000)) throw new Error(`Content too large: ${name}`);
      files.push({ name, data });
    } else if (item.name !== 'resource.json') throw new Error(`Unexpected publication file: ${name}`);
  }
  return files.sort((a, b) => a.name.localeCompare(b.name));
}

export async function readCatalog(root) {
  const entries = [];
  for (const type of Object.keys(extensions)) {
    const directory = resolve(root, type);
    let children;
    try {
      if ((await lstat(directory)).isSymbolicLink()) throw new Error('Symbolic catalog directories are not publishable');
      children = await readdir(directory, { withFileTypes: true });
    }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    for (const child of children) {
      if (child.isSymbolicLink() || !child.isDirectory()) throw new Error(`Expected entry directory: ${child.name}`);
      const folder = resolve(directory, child.name);
      const record = validateRecord(JSON.parse(await readFile(await containedPath(folder, 'resource.json'), 'utf8')));
      if (record.id !== child.name || record.type !== type) throw new Error(`Entry path disagrees with record: ${child.name}`);
      const files = await collectFiles(folder);
      const names = new Set(files.map(file => file.name));
      for (const release of record.versions) {
        await containedPath(folder, release.readme);
        if (!names.has(release.readme)) throw new Error('Missing version README');
      }
      for (const file of files.filter(item => item.name.endsWith('.md'))) {
        const queue = [...markdown.parse(file.data.toString('utf8'), {})];
        while (queue.length) {
          const token = queue.shift();
          if (token.children) queue.push(...token.children);
          if (token.type !== 'image') continue;
          const imageUrl = new URL(token.attrGet('src'), `https://content.invalid/${file.name}`);
          const imagePath = decodeURIComponent(imageUrl.pathname.slice(1));
          if (imageUrl.origin !== 'https://content.invalid' || imageUrl.search || !/\.(png|jpe?g|webp)$/i.test(imagePath) || !names.has(imagePath)) throw new Error(`README image must be a local raster file: ${file.name}`);
        }
      }
      if (record.cover && (!names.has(record.cover) || !/\.(png|jpe?g|webp)$/i.test(record.cover))) throw new Error('Missing raster cover');
      const hash = createHash('sha256').update(JSON.stringify(record));
      for (const file of files) hash.update(file.name).update(file.data);
      entries.push({ record, files, revision: hash.digest('hex').slice(0, 20) });
    }
  }
  const byId = new Map(entries.map(entry => [entry.record.id, entry.record]));
  if (byId.size !== entries.length) throw new Error('Duplicate resource ID');
  for (const { record } of entries) for (const version of record.versions) for (const link of version.relations) {
    if (!link.resourceId) continue;
    const target = byId.get(link.resourceId);
    if (!target || target.type !== (link.kind === 'strategy' ? 'strategies' : 'assets')) throw new Error(`Invalid relation: ${link.resourceId}`);
    if (link.version && !target.versions.some(v => v.version === link.version)) throw new Error('Related version does not exist');
  }
  return entries.sort((a, b) => a.record.id.localeCompare(b.record.id));
}
