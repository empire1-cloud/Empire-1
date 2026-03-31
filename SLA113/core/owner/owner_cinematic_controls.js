import { emit } from '../foundry/sensory_bus.js';

export const owner_cinematic_controls = {
  forceCrest: () => {
    console.log("OWNER_OVERRIDE: FORCING_CREST_PHASE");
    emit('SLA113_CINEMATIC_OVERRIDE', { state: 'CREST', duration: 10000 });
  },
  setVisualIntensity: (value) => {
    emit('SLA113_VISUAL_MODULATION', { intensity: value });
  }
};
