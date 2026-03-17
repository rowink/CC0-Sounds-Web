const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '..', 'public', 'sounds');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'collections.ts');

// Audio file extensions to scan
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];

// Description mappings for known collections (matches existing collections.ts)
const DESCRIPTION_MAP = {
  '100-CC0-SFX': 'Basic sound effects - doors, glass, metal, doors',
  '100-cc0-sfx-2': 'Extended sound effects pack',
  '100-CC0-wood-metal-SFX': 'Wood and metal interaction sounds',
  '25-CC0-bang-sfx': 'Explosions, shots, cannon sounds',
  '25-CC0-mud-sfx': 'Wet, muddy sound effects',
  '30-cc0-sfx-loops': 'Ambient and machine loop sounds',
  '30-cc0-weird-sfx': 'Unusual and experimental sounds',
  '40-cc0-water-splash-slime-sfx': 'Water, splash, bubble sounds',
  '50-CC0-retro-synth-SFX': 'Retro gaming synth sounds',
  '50-cc0-sci-fi-sfx': 'Science fiction sound effects',
  '60-sci-fi-sfx': 'More sci-fi sound effects',
  '75-cc0-breaking-falling-hit-sfx': 'Impact and breaking sounds',
  '80-CC0-creature-SFX': 'Creature and monster sounds',
  '80-CC0-creature-sfx-2': 'More creature sounds',
  '80-CC0-RPG-SFX': 'Role-playing game sounds',
  'angerdog': 'Game audio samples',
  'beast_or_animal': 'Animal sound effects',
  'kenney_casinoaudio': 'Casino game sounds',
  'kenney_digitalaudio': 'Digital UI sounds',
  'kenney_impactsounds': 'Impact and hit sounds',
  'kenney_interfacesounds': 'Interface sound effects',
  'kenney_musicjingles': 'Music jingles and stings',
  'kenney_rpgaudio': 'RPG game audio',
  'kenney_uiaudio': 'User interface sounds',
  'kenney_voiceoverfighter': 'Fighting game voice',
  'kenney_voiceoverpack': 'Voice over sounds',
  'warfork-cc0': 'Warfork game sounds',
  'MissLavs-Sounds': 'Voice and vocal sounds',
  'sci-fi-sounds': 'Additional sci-fi sounds',
  'MMRetroArcadeSoundsPack1_0_5': 'Retro arcade game sounds',
};

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
    const description = DESCRIPTION_MAP[id] || `${name} sound effects`;
    
    collections.push({
      id,
      name,
      count,
      description,
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
    lines.push(`  { id: '${col.id}', name: '${col.name}', count: ${col.count}, description: '${col.description}' },`);
  }
  
  lines.push('];');
  
  return lines.join('\n');
}

function main() {
  console.log('Scanning audio files...');
  
  const collections = scanSounds();
  
  console.log(`Found ${collections.length} collections`);
  
  const content = generateTypeScript(collections);
  fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
  
  console.log(`Written to ${OUTPUT_FILE}`);
}

main();
