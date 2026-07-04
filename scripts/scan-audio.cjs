const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'collections.ts');

// Audio file extensions to scan
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];

function folderToId(folderName) {
  return folderName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function folderToName(folderName) {
  return folderName
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isAudioFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return AUDIO_EXTENSIONS.includes(ext);
}

function countAudioFiles(dir) {
  let count = 0;

  if (!fs.existsSync(dir)) {
    return 0;
  }

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      count += countAudioFiles(fullPath);
    } else if (item.isFile() && isAudioFile(item.name)) {
      count++;
    }
  }

  return count;
}

function scanSounds() {
  if (!fs.existsSync(SOUNDS_DIR)) {
    console.error(`Sounds directory not found: ${SOUNDS_DIR}`);
    process.exit(1);
  }

  const folders = fs.readdirSync(SOUNDS_DIR, { withFileTypes: true });
  const collections = [];

  for (const folder of folders) {
    if (!folder.isDirectory()) continue;

    const folderName = folder.name;
    const folderPath = path.join(SOUNDS_DIR, folderName);
    const count = countAudioFiles(folderPath);

    if (count === 0) continue;

    const id = folderToId(folderName);
    const name = folderToName(folderName);

    collections.push({
      id,
      name,
      count,
    });
  }

  collections.sort((a, b) => a.name.localeCompare(b.name));

  return collections;
}

function generateTypeScript(collections) {
  const lines = [
    "import type { Collection } from '../types';",
    '',
    'export const collections: Collection[] = [',
  ];

  for (const col of collections) {
    lines.push(`  { id: '${col.id}', name: '${col.name}', count: ${col.count} },`);
  }

  lines.push('];');

  return lines.join('\n');
}

/**
 * Generate a search index JSON file (public/search-index.json)
 * containing all audio file entries with compact field names
 * to minimize file size: { n: "filename_without_ext", s: "/sounds/.../file.wav" }
 */
const SEARCH_INDEX_FILE = path.join(__dirname, '..', 'public', 'search-index.json');

function generateSearchIndex() {
  console.log('Generating search index...');

  const searchIndex = [];

  function scanFiles(dir) {
    let items;
    try {
      items = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        scanFiles(fullPath);
      } else if (item.isFile() && isAudioFile(item.name)) {
        const relativePath = path.relative(SOUNDS_DIR, fullPath);
        const urlPath = '/sounds/' + relativePath.split(path.sep).join('/');
        const name = path.parse(item.name).name;
        searchIndex.push({ n: name, s: urlPath });
      }
    }
  }

  scanFiles(SOUNDS_DIR);
  fs.writeFileSync(SEARCH_INDEX_FILE, JSON.stringify(searchIndex), 'utf-8');

  const sizeKb = (Buffer.byteLength(JSON.stringify(searchIndex), 'utf-8') / 1024).toFixed(1);
  console.log(`Search index written to ${SEARCH_INDEX_FILE} (${searchIndex.length} entries, ${sizeKb} KB)`);
}

function main() {
  console.log('Scanning audio files...');

  const collections = scanSounds();

  console.log(`Found ${collections.length} collections`);

  const content = generateTypeScript(collections);
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');

  console.log(`Written to ${OUTPUT_FILE}`);

  generateSearchIndex();
}

main();
