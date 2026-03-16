// Script to scan audio folders and generate metadata
// Run with: node scripts/scan-audio.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const audioExtensions = ['.ogg', '.wav', '.mp3', '.flac', '.aiff'];
const rootDir = path.join(__dirname, '..');

// Get all subdirectories that might contain audio
function getCollections(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const collections = [];
  
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'cc0-sounds-web') {
      const collectionPath = path.join(dir, item.name);
      const files = fs.readdirSync(collectionPath);
      const audioFiles = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return audioExtensions.includes(ext) && !f.startsWith('.');
      });
      
      if (audioFiles.length > 0) {
        collections.push({
          id: item.name,
          name: formatName(item.name),
          count: audioFiles.length,
          description: getDescription(item.name),
          path: collectionPath,
          files: audioFiles.map(f => ({
            name: f,
            src: `/${item.name}/${f}`,
            size: fs.statSync(path.join(collectionPath, f)).size
          }))
        });
      }
    }
  }
  
  return collections.sort((a, b) => a.name.localeCompare(b.name));
}

function formatName(name) {
  // Clean up folder names
  return name
    .replace(/-/g, ' ')
    .replace(/cc0/gi, 'CC0')
    .replace(/sfx/gi, 'SFX')
    .replace(/\d+/g, (m) => m) // Keep numbers
    .replace(/vol\s*\d+/gi, (m) => m.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}

function getDescription(name) {
  const descriptions = {
    '100-CC0-SFX': 'Basic sound effects - doors, glass, metal',
    '100-cc0-sfx-2': 'Extended sound effects pack',
    '100-CC0-wood-metal-SFX': 'Wood and metal interaction sounds',
    '25-CC0-bang-sfx': 'Explosions, shots, cannon sounds',
    '25-CC0-mud-sfx': 'Wet, muddy sound effects',
    '30-cc0-sfx-loops': 'Ambient and machine loop sounds',
    '30-cc0-weird-sfx': 'Unusual and experimental sounds',
    '40-cc0-water-splash-slime-sfx': 'Water, splash, bubble sounds',
    '50-CC0-retro-synth-SFX': 'Retro gaming synth sounds',
    '50-cc0-sci-fi-sfx': 'Science fiction sound effects',
    '60-sci-fi-sfx': 'Science fiction sounds volume 2',
    '75-cc0-breaking-falling-hit-sfx': 'Impact and breaking sounds',
    '80-CC0-creature-SFX': 'Creature and monster sounds',
    '80-CC0-creature-sfx-2': 'More creature sounds',
    '80-CC0-RPG-SFX': 'Role-playing game sounds',
    'kenney': 'Kenney Game Assets - quality game sounds',
    'bb ': 'Blender Boy audio samples',
    'Micro Pack': 'Micro sound packs',
    'warfork': 'Warfork game audio',
    'beast_or_animal': 'Animal and creature sounds',
    'MissLavs': 'Voice and vocal sounds',
    'sci-fi-sounds': 'Additional sci-fi sounds',
    'MMRetroArcade': 'Retro arcade game sounds',
    'LQ_interface': 'Low-quality interface sounds',
    'metal_interactions': 'Metal interaction sounds',
  };
  
  for (const [key, desc] of Object.entries(descriptions)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return desc;
    }
  }
  
  return 'Sound effects collection';
}

// Scan and output
const collections = getCollections(rootDir);

const output = {
  generated: new Date().toISOString(),
  totalCollections: collections.length,
  totalFiles: collections.reduce((sum, c) => sum + c.count, 0),
  collections: collections.map(({ path, ...rest }) => rest)
};

console.log(JSON.stringify(output, null, 2));
