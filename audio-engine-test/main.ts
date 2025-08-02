// Entry point
import { AudioEngine } from './audio-engine.js';
import { playerController } from './playerController.js';
import { debugInfo } from './debug-info.js';

document.addEventListener('DOMContentLoaded', () => {
  const audio1 = document.getElementById('audio-player-1') as HTMLAudioElement;
  const audio2 = document.getElementById('audio-player-2') as HTMLAudioElement;

  const engine = new AudioEngine(audio1, audio2);

  // Simple state management function
  const updateAllServices = (state) => {
    playerController.updateState(state);
    debugInfo.updateState(state);
  };

  engine.setCallbacks(updateAllServices);

  // Initialize services
  playerController.init(engine);
  debugInfo.init(engine);
});