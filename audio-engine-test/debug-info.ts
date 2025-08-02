import { AudioEngine } from './audio-engine.js';

const debugInfo = {
  engine: undefined as AudioEngine | undefined,
  elements: {} as Record<string, HTMLElement>,

  init(engine: AudioEngine) {
    this.engine = engine;
    this.cacheElements();
    
    if (!this.elements['context']) {
      console.error('Debug elements not found');
      return;
    }

    // Initial display
    this.updateDisplay(this.engine.getState());
  },

  updateState(state) {
    this.updateDisplay(state);
  },

  cacheElements() {
    this.elements = {
      masterVolume: document.getElementById('debug-master-volume') as HTMLElement,
      player1Status: document.getElementById('debug-player1-status') as HTMLElement,
      player1Source: document.getElementById('debug-player1-source') as HTMLElement,
      player1Time: document.getElementById('debug-player1-time') as HTMLElement,
      player1Volume: document.getElementById('debug-player1-volume') as HTMLElement,
      player2Status: document.getElementById('debug-player2-status') as HTMLElement,
      player2Source: document.getElementById('debug-player2-source') as HTMLElement,
      player2Time: document.getElementById('debug-player2-time') as HTMLElement,
      player2Volume: document.getElementById('debug-player2-volume') as HTMLElement,
    };
  },

  updateDisplay(state) {
    if (this.elements.player1Status) {
      this.elements.player1Status.textContent = state.player1.isPlaying ? 'Playing' : 'Stopped';
    }
    if (this.elements.player1Source) {
      this.elements.player1Source.textContent = state.player1.source ? state.player1.source.split('/').pop() || 'Unknown' : 'None';
    }
    if (this.elements.player1Time) {
      this.elements.player1Time.textContent = `${state.player1.currentTime.toFixed(1)}s / ${state.player1.duration.toFixed(1)}s`;
    }
    if (this.elements.player1Volume) {
      this.elements.player1Volume.textContent = state.player1.volume.toFixed(2);
    }

    if (this.elements.player2Status) {
      this.elements.player2Status.textContent = state.player2.isPlaying ? 'Playing' : 'Stopped';
    }
    if (this.elements.player2Source) {
      this.elements.player2Source.textContent = state.player2.source ? state.player2.source.split('/').pop() || 'Unknown' : 'None';
    }
    if (this.elements.player2Time) {
      this.elements.player2Time.textContent = `${state.player2.currentTime.toFixed(1)}s / ${state.player2.duration.toFixed(1)}s`;
    }
    if (this.elements.player2Volume) {
      this.elements.player2Volume.textContent = state.player2.volume.toFixed(2);
    }
    if (this.elements.masterVolume) {
      this.elements.masterVolume.textContent = state.master.volume.toFixed(2);
    }
  }
};

export { debugInfo }; 