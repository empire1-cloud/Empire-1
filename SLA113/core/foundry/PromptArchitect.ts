export const OBSIDIAN_PALETTE = {
  primary: '#050505',
  accent: '#D4AF37',
  highlight: '#00C8FF'
};

export interface GamePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  palette: typeof OBSIDIAN_PALETTE;
}

export const GAME_PRESETS: Record<string, GamePreset> = {
  'arcade_classic': {
    id: 'arcade_classic',
    name: 'Arcade Classic',
    category: 'arcade',
    description: 'Retro arcade experience with coin-op mechanics',
    tags: ['retro', 'arcade', 'coin-op', 'pixel'],
    palette: OBSIDIAN_PALETTE
  },
  'fish_shooting': {
    id: 'fish_shooting',
    name: 'Fish Shooting',
    category: 'arcade',
    description: 'Underwater shooter with catch mechanics',
    tags: ['underwater', 'shooter', 'casual', 'multiplayer'],
    palette: OBSIDIAN_PALETTE
  },
  'slot_machine': {
    id: 'slot_machine',
    name: 'Slot Machine',
    category: 'slots',
    description: 'Casino slot with bonus rounds',
    tags: ['casino', 'slots', 'gambling', 'bonus'],
    palette: OBSIDIAN_PALETTE
  },
  'open_world_rpg': {
    id: 'open_world_rpg',
    name: 'Open World RPG',
    category: 'rpg',
    description: 'Massive open world adventure',
    tags: ['open-world', 'adventure', 'fantasy', 'sandbox'],
    palette: OBSIDIAN_PALETTE
  },
  'battle_royale': {
    id: 'battle_royale',
    name: 'Battle Royale',
    category: 'multiplayer',
    description: '100-player competitive shooter',
    tags: ['fps', 'multiplayer', 'competitive', 'survival'],
    palette: OBSIDIAN_PALETTE
  },
  'cod_warfare': {
    id: 'cod_warfare',
    name: 'COD Warfare',
    category: 'action',
    description: 'Tactical realism shooter',
    tags: ['fps', 'military', 'tactical', 'realism'],
    palette: OBSIDIAN_PALETTE
  }
};

export class PromptArchitect {
  private preset: GamePreset;
  private customSpecs: string;

  constructor(presetId: string = 'arcade_classic', customSpecs: string = '') {
    this.preset = GAME_PRESETS[presetId] || GAME_PRESETS['arcade_classic'];
    this.customSpecs = customSpecs;
  }

  setPreset(presetId: string): void {
    this.preset = GAME_PRESETS[presetId] || GAME_PRESETS['arcade_classic'];
  }

  setCustomSpecs(specs: string): void {
    this.customSpecs = specs;
  }

  architect(): string {
    const parts: string[] = [
      `Create a sovereign game OS build for: ${this.preset.name}`,
      `Category: ${this.preset.category}`,
      `Description: ${this.preset.description}`,
      '',
      'Design Requirements:',
      `- Obsidian Blue palette: Primary ${OBSIDIAN_PALETTE.primary}, Accent ${OBSIDIAN_PALETTE.accent}, Highlight ${OBSIDIAN_PALETTE.highlight}`,
      '- Industrial foundry aesthetic',
      '- Cloud GPU and local CPU rendering support',
      '- Modular game architecture',
      '- Multi-tenant capable'
    ];

    if (this.preset.tags.length > 0) {
      parts.push(`Tags: ${this.preset.tags.join(', ')}`);
    }

    if (this.customSpecs) {
      parts.push('', 'Custom Specifications:', this.customSpecs);
    }

    return parts.join('\n');
  }

  getMetadata() {
    return {
      preset: this.preset,
      palette: OBSIDIAN_PALETTE,
      customSpecs: this.customSpecs,
      renderModes: ['cloud_gpu', 'local_cpu']
    };
  }
}

export function enforcePalette(hexColor: string): boolean {
  const validColors = Object.values(OBSIDIAN_PALETTE);
  return validColors.includes(hexColor.toUpperCase()) || validColors.includes(hexColor.toLowerCase());
}

export function generateSpritePrompt(
  character: string,
  action: string,
  frameCount: number = 1
): string {
  return `Sprite sheet: ${character} ${action}, ${frameCount} frames, Obsidian Blue (#050505) background, Gold (#D4AF37) highlights, Cyan (#00C8FF) accents, industrial foundry style, pixel art, game-ready`;
}
