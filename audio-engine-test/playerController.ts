import { audioFiles } from './test-audio/mock-audio.js';
import { AudioEngine } from './audio-engine.js';

const playerController = {
  playBtn: undefined as HTMLButtonElement | undefined,
  volume1Slider: undefined as HTMLInputElement | undefined,
  volume2Slider: undefined as HTMLInputElement | undefined,
  timeSlider: undefined as HTMLInputElement | undefined,
  currentTimeDisplay: undefined as HTMLSpanElement | undefined,
  totalTimeDisplay: undefined as HTMLSpanElement | undefined,
  engine: undefined as AudioEngine | undefined,

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

    this.timeSlider = document.getElementById('time-slider') as HTMLInputElement;
    this.currentTimeDisplay = document.getElementById('current-time') as HTMLSpanElement;
    this.totalTimeDisplay = document.getElementById('total-time') as HTMLSpanElement;

    this.timeSlider?.addEventListener('input', () => {
      this.handleTimeSliderChange();
    });

    this.initTrackLists();
  },

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  handleTimeSliderChange() {
    if (!this.engine || !this.timeSlider) return;
    
    const state = this.engine.getState();
    const duration = state.player1.duration;
    if (duration > 0) {
      const newTime = (parseFloat(this.timeSlider.value) / 100) * duration;
      this.engine.seek(newTime);
    }
  },

  updateState(state) {
    if (this.playBtn) {
      const player1Playing = state.player1.isPlaying;
      const player2Playing = state.player2.isPlaying;
      this.playBtn.textContent = (player1Playing || player2Playing) ? 'Pause' : 'Play';
    }
    
    if (this.volume1Slider) {
      this.volume1Slider.value = state.player1.volume.toString();
    }
    
    if (this.volume2Slider) {
      this.volume2Slider.value = state.master.volume.toString();
    }

    if (this.currentTimeDisplay && this.totalTimeDisplay && this.timeSlider) {
      const currentTime = state.player1.currentTime;
      const duration = state.player1.duration;
      
      this.currentTimeDisplay.textContent = this.formatTime(currentTime);
      this.totalTimeDisplay.textContent = this.formatTime(duration);
      
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        this.timeSlider.value = progress.toString();
      }
    }
  },

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
    const player1Playing = state.player1.isPlaying;
    const player2Playing = state.player2.isPlaying;
    
    if (player1Playing || player2Playing) {
      this.engine.pause(1);
      this.engine.pause(2);
    } else {
      this.engine.play(1);
      this.engine.play(2);
    }
  }
};
export { playerController }; 