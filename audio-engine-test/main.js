import { AudioEngine } from './audio-engine.js';
import { playerController } from './playerController.js';
import { debugInfo } from './debug-info.js';
document.addEventListener('DOMContentLoaded', () => {
    const audio1 = document.getElementById('audio-player-1');
    const audio2 = document.getElementById('audio-player-2');
    const engine = new AudioEngine(audio1, audio2);
    const updateAllServices = (state) => {
        playerController.updateState(state);
        debugInfo.updateState(state);
    };
    engine.setCallbacks(updateAllServices);
    playerController.init(engine);
    debugInfo.init(engine);
});
