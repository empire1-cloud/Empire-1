import { emit, subscribe } from './sensory_bus.js';

const CINEMATIC_CONFIG = {
  STATES: ['IDLE', 'BUILD', 'CREST', 'RELEASE', 'AFTERMATH'],
  THRESHOLD_CREST: 0.85,
  THRESHOLD_BUILD: 0.40
};

export const initCinematicEngine = () => {
  console.log("INITIALIZING_CINEMATIC_ENGINE...");
  
  subscribe('SLA113_PULSE_TICK', (pulse) => {
    let targetState = 'IDLE';
    
    if (pulse.volatility > CINEMATIC_CONFIG.THRESHOLD_CREST) {
      targetState = 'CREST';
    } else if (pulse.intensity > CINEMATIC_CONFIG.THRESHOLD_BUILD) {
      targetState = 'BUILD';
    }

    emit('SLA113_CINEMATIC_STATE', {
      state: targetState,
      intensity: pulse.intensity,
      visual_shift: targetState === 'CREST' ? 'GLITCH_GOLD' : 'SMOOTH_OBSIDIAN',
      timestamp: Date.now()
    });
  });
};
