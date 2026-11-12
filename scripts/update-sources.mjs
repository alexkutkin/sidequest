import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const cataloguePath = path.join(root, 'src/content/catalogue.json');
const args = process.argv.slice(2);
const write = args.includes('--write');
const ids = args.filter(arg => arg !== '--write');

if (ids.length > 1 || ids.some(id => !/^[a-z0-9-]+$/.test(id))) {
  throw new Error('Usage: node scripts/update-sources.mjs [prompt-id] [--write]');
}

const catalogue = JSON.parse(await readFile(cataloguePath, 'utf8'));
const originalCatalogue = JSON.stringify(catalogue);
const selected = catalogue.filter(entry => entry.source && (!ids.length || ids.includes(entry.id)));
if (!selected.length) throw new Error('No matching imported prompts.');

const today = new Date().toISOString().slice(0, 10);
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'sidequest-source-updater' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

function localFile(directory, filename) {
  if (path.basename(filename) !== filename || !filename) throw new Error('Invalid saved filename.');
  return path.join(root, 'src/content', directory, filename);
}

async function request(url, api = false) {
  const response = await fetch(url, {
    headers: api ? headers : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
  return response;
}

const encodedPath = value => value.split('/').map(encodeURIComponent).join('/');
const text = bytes => new TextDecoder('utf-8', { fatal: true }).decode(bytes);
const optionalDocument = /^(?:readme(?:\.md|\.txt)?|licen[cs]e(?:\.md|\.txt)?|notice(?:\.md|\.txt)?)$/i;

function dependencyReason(tree, source, promptText) {
  const directory = path.posix.dirname(source.path);
  const folder = directory === '.' ? '' : directory + '/';
  const neighbours = tree.filter(item => item.path.startsWith(folder) && item.path !== source.path);
  const extra = neighbours.find(item => item.type !== 'blob' || item.mode === '120000' || !optionalDocument.test(item.path.slice(folder.length)));
  if (extra) return `Additional skill resource: ${extra.path}`;

  const destinations = [
    ...promptText.matchAll(/!?\[[^\]]*\]\(\s*<?([^\s)>]+)/g),
    ...promptText.matchAll(/^\s*\[[^\]]+\]:\s*<?([^\s>]+)/gm),
  ].map(match => match[1]);
  const local = destinations.find(destination => {
    if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(destination)) return false;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(source.path), destination.split('#')[0]));
    return target !== source.path && target !== source.license.path;
  });
  return local ? `Relative supporting-file reference: ${local}` : null;
}

function stopped(entry, state, reason, detail) {
  entry.source.update = { state, checkedAt: today, reason };
  console.log(`${entry.id}: ${state}; keeping saved text. ${detail}`);
  process.exitCode = 1;
}

for (const entry of selected) {
  const source = entry.source;
  const api = `https://api.github.com/repos/${encodeURIComponent(source.owner)}/${encodeURIComponent(source.repo)}`;
  try {
    const commit = await (await request(`${api}/commits/${encodeURIComponent(source.ref)}`, true)).json();
    const revision = commit.sha;
    if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Source did not return a commit revision.');
    const listing = await (await request(`${api}/git/trees/${revision}?recursive=1`, true)).json();
    if (listing.truncated || !Array.isArray(listing.tree)) throw new Error('Cannot inspect the complete source tree.');
    const prompt = listing.tree.find(item => item.path === source.path && item.type === 'blob' && item.mode !== '120000');
    if (!prompt) throw new Error('Source prompt is missing.');

    const rawBase = `https://raw.githubusercontent.com/${encodeURIComponent(source.owner)}/${encodeURIComponent(source.repo)}/${revision}/`;
    const raw = Buffer.from(await (await request(rawBase + encodedPath(source.path))).arrayBuffer());
    const promptText = text(raw);
    const dependency = dependencyReason(listing.tree, source, promptText);
    if (dependency) {
      stopped(entry, 'frozen', 'scripts-or-dependencies', dependency);
      continue;
    }

    let license;
    try {
      const licenseFile = listing.tree.find(item => item.path === source.license.path && item.type === 'blob' && item.mode !== '120000');
      if (!licenseFile) throw new Error('Source license is missing or is a symbolic link.');
      license = Buffer.from(await (await request(rawBase + encodedPath(source.license.path))).arrayBuffer());
      if (!text(license).trim()) throw new Error('License is empty.');
    } catch (error) {
      stopped(entry, 'frozen', 'license-unavailable', error.message);
      continue;
    }

    const promptPath = localFile('prompts', `${entry.id}.md`);
    const licensePath = localFile('licenses', source.license.file);
    const saved = await readFile(promptPath);
    const savedLicense = await readFile(licensePath);
    const changed = !saved.equals(raw) || !savedLicense.equals(license);
    if (changed) {
      console.log(`${entry.id}: ${write ? 'updating' : 'update available'} at ${revision}`);
      if (write) {
        await writeFile(promptPath, raw);
        await writeFile(licensePath, license);
        source.revision = revision;
        source.savedAt = today;
      }
    } else {
      console.log(`${entry.id}: saved text and license match ${revision}`);
    }
    source.update = { state: 'current' };
  } catch (error) {
    stopped(entry, 'unavailable', 'source-unavailable', error.message);
  }
}

if (write) {
  if (JSON.stringify(catalogue) !== originalCatalogue) {
    await writeFile(cataloguePath, JSON.stringify(catalogue, null, 2) + '\n');
  }
  console.log('Review git diff, including EN/RU descriptions, before publishing.');
} else {
  console.log('No files changed. Run with --write to save eligible updates and source status.');
}
