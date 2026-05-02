#!/usr/bin/env node
// Location: /root/backend/scripts/batch_queue.js
// Role: Batch queue multiple prompts for the Night-Shift Daemon

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateAAA_Prompt, PresetKey } from '../app/core/foundry/PromptArchitect.js';

// Configuration
const QUEUE_DIR = '/root/backend/vault/queue';
const BATCH_NAME = process.argv[2] || 'BATCH_DEFAULT';
const TARGET_COUNT = parseInt(process.argv[3]) || 10;
const PRESET = (process.argv[4] || 'GENERIC_GAME') as PresetKey;
const CONCEPT_PREFIX = process.argv[5] || 'Target';

// Ensure queue directory exists
if (!existsSync(QUEUE_DIR)) {
  mkdirSync(QUEUE_DIR, { recursive: true });
  console.log(`Created queue directory: ${QUEUE_DIR}`);
}

console.log('==========================================');
console.log(`BATCH QUEUE: ${BATCH_NAME}`);
console.log(`Preset: ${PRESET}`);
console.log(`Count: ${TARGET_COUNT}`);
console.log('==========================================\n');

let queued = 0;
let skipped = 0;

for (let i = 1; i <= TARGET_COUNT; i++) {
  const concept = `${CONCEPT_PREFIX} ${i.toString().padStart(3, '0')}`;
  
  try {
    // Generate the AAA prompt using PromptArchitect
    const fullPrompt = generateAAA_Prompt({
      concept,
      preset: PRESET,
      size: 'sprite',
      seed: Math.floor(Math.random() * 1000000)
    });
    
    // Create filename
    const filename = `${BATCH_NAME}_${i.toString().padStart(3, '0')}.txt`;
    const filepath = join(QUEUE_DIR, filename);
    
    // Write prompt to queue
    writeFileSync(filepath, fullPrompt);
    
    console.log(`[${i}/${TARGET_COUNT}] Queued: ${filename}`);
    queued++;
    
  } catch (error) {
    console.error(`[${i}/${TARGET_COUNT}] Failed: ${concept}`, error);
    skipped++;
  }
}

console.log('\n==========================================');
console.log(`BATCH COMPLETE`);
console.log(`Queued: ${queued}`);
console.log(`Skipped: ${skipped}`);
console.log(`Total: ${TARGET_COUNT}`);
console.log(`Queue Dir: ${QUEUE_DIR}`);
console.log('==========================================\n');

// Helper function to display usage
function showUsage() {
  console.log(`
Usage: node batch_queue.js [BATCH_NAME] [COUNT] [PRESET] [CONCEPT_PREFIX]

Examples:
  node batch_queue.js WARFARE_BOSS 50 COD_WARFARE Boss
  node batch_queue.js FISH_SERIES 24 AAA_FISH_SLOT Fish
  node batch_queue.js MYTHICAL_CREATURES 10 FANTASY_RPG Creature

Available Presets:
  - AAA_FISH_SLOT
  - AAA_FISH_SLOT_RETRO
  - GTA5_TYPE
  - COD_WARFARE
  - MINECRAFT_BLOCKY
  - STREET_FIGHTER
  - POKEMON_STYLE
  - FORTNITE_STYLE
  - PACMAN_STYLE
  - RACING_SIM
  - HORROR_GAME
  - FANTASY_RPG
  - CYBERPUNK
  - SOUTHERN_BARRIO
  - GENERIC_GAME
`);
}

// If run with --help or no args
if (process.argv.includes('--help') || process.argv.length < 3) {
  showUsage();
}
