import { audioFiles } from './test-audio/mock-audio.js';
import { AudioEngine } from './audio-engine.js';

const playerController = {
  playBtn: undefined as HTMLButtonElement | undefined,
  volume1Slider: undefined as HTMLInputElement | undefined,
  volume2Slider: undefined as HTMLInputElement | undefined,
  engine: undefined as AudioEngine | undefined,
  currentPlayer: 1 as 1 | 2,

  init(engine: AudioEngine) {
    this.engine = engine;
    
    this.playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    this.playBtn.addEventListener('click', () => this.togglePlayPause());
    
    this.volume1Slider = document.getElementById('submission-volume') as HTMLInputElement;
    this.volume1Slider.addEventListener('input', () => {
      this.engine?.setVolume(1, parseFloat(this.volume1Slider?.value || '0'));
    });
    this.volume2Slider = document.getElementById('master-volume') as HTMLInputElement;
    this.volume2Slider.addEventListener('input', () => {
      this.engine?.setMasterVolume(parseFloat(this.volume2Slider?.value || '0'));
    });

    this.initTrackLists();
  },

  updateState(state) {
    // Update UI based on state changes
    if (this.playBtn) {
      const currentPlayerState = this.currentPlayer === 1 ? state.player1 : state.player2;
      this.playBtn.textContent = currentPlayerState.isPlaying ? 'Pause' : 'Play';
    }
    
    if (this.volume1Slider) {
      this.volume1Slider.value = state.player1.volume.toString();
    }
    
    if (this.volume2Slider) {
      this.volume2Slider.value = state.master.volume.toString();
    }
  },

  /* ---------- private helpers ---------- */
  initTrackLists() {
    const list1 = document.getElementById('player-1-list') as HTMLUListElement;
    const list2 = document.getElementById('player-2-list') as HTMLUListElement;

    if (!list1 || !list2) return;

    list1.innerHTML = '';
    list2.innerHTML = '';

    audioFiles.player1Files.forEach(path => {
      const li = document.createElement('li');
      li.textContent = path;
      li.addEventListener('click', () => this.engine?.loadAndPlay(1, path));
      list1.appendChild(li);
    });

    audioFiles.player2Files.forEach(path => {
      const li = document.createElement('li');
      li.textContent = path;
      li.addEventListener('click', () => this.engine?.loadAndPlay(2, path));
      list2.appendChild(li);
    });
  },

  togglePlayPause() {
    if (!this.engine) return;
    
    const state = this.engine.getState();
    const currentPlayerState = this.currentPlayer === 1 ? state.player1 : state.player2;
    
    if (currentPlayerState.isPlaying) {
      this.engine.pause(this.currentPlayer);
    } else {
      this.engine.play(this.currentPlayer);
    }
  }
};

export { playerController }; 