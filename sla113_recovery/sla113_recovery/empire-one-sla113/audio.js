const GlobalMixer = {
    duckMusic: function(active) {
        const music = document.getElementById('bg_cruise');
        music.volume = active ? 0.2 : 1.0; 
        console.log(active ? "[SYSTEM] DUCKING: VOX PRIORITY" : "[SYSTEM] FULL CRUISE");
    }
}; 

/**
 * EMPIRE ONE GLOBAL SYNC
 * ELEVENLABS (VOX) + SUNO (RADIO)
 */

const SovereignAudio = {
    playBroadcast: function(voxID, radioID) {
        console.log(`[SYNC] Playing VOX: ${voxID} over RADIO: ${radioID}`);
        
        // 1. Start Suno Track (Low Volume)
        const radio = document.getElementById(radioID);
        radio.volume = 0.4;
        radio.play();

        // 2. Trigger ElevenLabs Vox (Authority)
        const vox = document.getElementById(voxID);
        
        vox.onplay = () => {
            // Sidechain: Duck the Radio
            radio.animateVolume(0.4, 0.1, 200); 
            console.log("[SYSTEM] SIDECHAIN ACTIVE: VOX PRIORITY");
        };

        vox.onended = () => {
            // Restore Radio Volume
            radio.animateVolume(0.1, 0.4, 600);
            console.log("[SYSTEM] SIDECHAIN RELEASED");
        };

        vox.play();
    }
}; 
