// Location: /root/backend/app/core/foundry/PromptArchitect.ts
// Role: Translates raw concepts into AAA-Industrial Visual Specs

const ENGINE_PRESETS = {
  AAA_FISH_SLOT: "casino-grade 3D render, luxury obsidian materials, neon gold filigree, high-stakes aesthetic, unreal engine 5, octane render, 8k, sharp focus, raytraced reflections",
  
  AAA_FISH_SLOT_RETRO: "retro arcade aesthetic, pixel perfect, 16-bit style, neon glow, classic casino, bright colors, saturated, nostalgic gaming",
  
  GTA5_TYPE: "open-world cinematic, hyper-realistic urban grit, 4k textures, dramatic sunset lighting, high-contrast shadows, rockstar games aesthetic, detailed mechanical parts, volumetric fog",
  
  COD_WARFARE: "tactical military realism, matte black polymer, industrial metal wear, pbr materials, photorealistic, harsh overhead lighting, modern warfare 2024 aesthetic, gritty surface detail",
  
  MINECRAFT_BLOCKY: "minecraft style, blocky voxels, low poly, cute pixel art, 8-bit, chunky, colorful blocks, voxel art game aesthetic",
  
  STREET_FIGHTER: "2D fighting game, capcom style, bold outlines, dynamic pose, anime art, high energy, character select screen, pixel perfect sprites",
  
  POKEMON_STYLE: "pokemon style, cute creatures, vibrant colors, gba graphics, creature design, pocket monsters, animated, collectible card game art",
  
  FORTNITE_STYLE: "fortnite aesthetic, battle royale, cartoony graphics, vibrant, stylized, battle pass, epic games, colorful, warzone",
  
  PACMAN_STYLE: "maze game, classic arcade, retro, neon labyrinth, 80s aesthetic, pixel art, glowing dots, ghost enemies",
  
  RACING_SIM: "racing game, forza horizon, gran turismo, photorealistic cars, detailed vehicles, track environment, speed motion blur, professional racing",
  
  HORROR_GAME: "survival horror, dark atmospheric, psychological terror, silent hill vibes, foggy, decaying, unsettling, grim, blood splatter, ominous lighting",
  
  FANTASY_RPG: "fantasy rpg, dungeons and dragons, magical, epic quest, mythical creatures, medieval fantasy, sword and sorcery, mystical, detailed fantasy art",
  
  CYBERPUNK: "cyberpunk 2077, neon city, futuristic, dystopian, chrome, holographic, rain-soaked streets, blade runner aesthetic, cyber augmentation",
  
  SOUTHERN_BARRIO: "chicano art, lowrider, barrio streets, socal, urban, pride, lowrider cars, murals, cultural, brown and gold colors, custom",
  
  GENERIC_GAME: "game asset, sprite, clean lines, professional quality, game ready, commercial use, high detail"
};

export type PresetKey = keyof typeof ENGINE_PRESETS;

export interface PromptOptions {
  concept: string;
  preset: PresetKey;
  customStyle?: string;
  size?: 'sprite' | 'background' | 'character' | 'boss' | 'ui';
  seed?: number;
}

// SLA113 OBSIDIAN BLUE PALETTE - MUST ENFORCE IN EVERY PROMPT
const PALETTE = {
  obsidian: "#050505",
  gold: "#D4AF37", 
  cyan: "#00C8FF",
  white: "#FFFFFF"
};

// Required framing for every prompt - sprite extraction
const REQUIRED_INSTRUCTIONS = `
COLOR_PALETTE: Obsidian ${PALETTE.obsidian}, Gold ${PALETTE.gold}, Cyan ${PALETTE.cyan}.
IMPORTANT: Isolated on deep black ${PALETTE.obsidian} background for clean sprite sheet extraction.
Background must be solid ${PALETTE.obsidian} - NO transparency, NO gradients, NO environmental context.
This ensures automated background removal is clean and production-ready.
`.trim();

export function generateAAA_Prompt(options: PromptOptions): string {
  const { concept, preset, customStyle, size = 'sprite', seed } = options;
  
  // Get base preset
  const baseSpec = ENGINE_PRESETS[preset] || ENGINE_PRESETS.GENERIC_GAME;
  
  // Clean the user concept
  const cleanedConcept = concept.trim().toUpperCase();
  
  // Size-specific modifiers
  const sizeModifiers = {
    sprite: "sprite sheet, game character, transparent PNG, isolated, game-ready",
    background: "game background, environment art, detailed scene, seamless",
    character: "character design, hero, protagonist, full body",
    boss: "boss enemy, intimidating, large, detailed, final boss, epic",
    ui: "game UI element, clean, functional, button, icon, menu item"
  };
  
  // Build the master prompt
  let masterPrompt = `MASTER_SPEC: ${cleanedConcept}. STYLE: ${baseSpec}. ${sizeModifiers[size]}`;
  
  // Add custom style if provided
  if (customStyle) {
    masterPrompt += `. CUSTOM: ${customStyle}`;
  }
  
  // Industrial framing
  masterPrompt += `. MATERIALS: Obsidian, Brushed Steel, Neon #00C8FF, Gold #D4AF37. COMPOSITION: Macro view, center-weighted, isolated on deep black #050505 background for sprite extraction.`;
  
  // OBSIDIAN BLUE PALETTE - ENFORCED IN EVERY PROMPT
  masterPrompt += `. COLOR_PALETTE: Obsidian ${PALETTE.obsidian}, Gold ${PALETTE.gold}, Cyan ${PALETTE.cyan}`;
  
  // CRITICAL: Background isolation for sprite extraction
  masterPrompt += `. ISOLATION: ${REQUIRED_INSTRUCTIONS}`;
  
  // Version seed
  masterPrompt += ` --v 2026.1${seed ? ` --seed ${seed}` : ''}`;
  
  return masterPrompt;
}

// Helper to get preset list
export function getPresetList(): { key: PresetKey; name: string }[] {
  return [
    { key: 'AAA_FISH_SLOT', name: 'Fish Shooting (Luxury)' },
    { key: 'AAA_FISH_SLOT_RETRO', name: 'Fish Shooting (Retro)' },
    { key: 'GTA5_TYPE', name: 'Open World (GTA Style)' },
    { key: 'COD_WARFARE', name: 'Tactical FPS (COD Style)' },
    { key: 'MINECRAFT_BLOCKY', name: 'Block World (Minecraft)' },
    { key: 'STREET_FIGHTER', name: 'Fighting Game' },
    { key: 'POKEMON_STYLE', name: 'Creature Collection' },
    { key: 'FORTNITE_STYLE', name: 'Battle Royale' },
    { key: 'PACMAN_STYLE', name: 'Arcade Maze' },
    { key: 'RACING_SIM', name: 'Racing Game' },
    { key: 'HORROR_GAME', name: 'Horror' },
    { key: 'FANTASY_RPG', name: 'Fantasy RPG' },
    { key: 'CYBERPUNK', name: 'Cyberpunk' },
    { key: 'SOUTHERN_BARRIO', name: 'Southern Barrio' },
    { key: 'GENERIC_GAME', name: 'Generic Game Asset' }
  ];
}

export default generateAAA_Prompt;
