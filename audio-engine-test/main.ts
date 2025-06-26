// Entry point
import { AudioEngine } from './audio-engine.js';
import { playerController } from './playerController.js';

document.addEventListener('DOMContentLoaded', () => {
  const audio1 = document.getElementById('audio-player-1') as HTMLAudioElement;
  const audio2 = document.getElementById('audio-player-2') as HTMLAudioElement;

  const engine = new AudioEngine(audio1, audio2);

  playerController.init((path, id) => engine.loadAndPlay(id, path));
});