import { audioFiles } from './test-audio/mock-audio.js';
import { AudioEngine } from './audio-engine.js';

const playerController = {
  playBtn: undefined as HTMLButtonElement | undefined,
  volume1Slider: undefined as HTMLInputElement | undefined,
  volume2Slider: undefined as HTMLInputElement | undefined,
  timeSlider: undefined as HTMLInputElement | undefined,
  currentTimeDisplay: undefined as HTMLSpanElement | undefined,
  totalTimeDisplay: undefined as HTMLSpanElement | undefined,
  backBtn: undefined as HTMLButtonElement | undefined,
  fwdBtn: undefined as HTMLButtonElement | undefined,
  engine: undefined as AudioEngine | undefined,
  currentTrackIndex: -1,
  backingTrackSrc: audioFiles.player2Files[0] as string,
  trackList: [] as string[],
  pastStagePlayback: true as boolean,
  pastStageTracklist: [] as string[],

  init(engine: AudioEngine) {
    this.engine = engine;
    this.trackList = audioFiles.player1Files;
    this.pastStageTracklist = audioFiles.pastStageFiles;
    
    this.playBtn = document.getElementById('play-btn') as HTMLButtonElement;
    this.playBtn.addEventListener('click', () => this.togglePlayPause());
    
    this.backBtn = document.getElementById('back-btn') as HTMLButtonElement;
    this.backBtn.addEventListener('click', () => this.previousTrack());
    
    this.fwdBtn = document.getElementById('fwd-btn') as HTMLButtonElement;
    this.fwdBtn.addEventListener('click', () => this.nextTrack());
    
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

    engine.loadSource(2, this.backingTrack);

    this.initTrackLists();
    this.initPastStagesList();
    this.updateTransportButtons();
  },

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  handleTimeSliderChange() {
    if (!this.engine || !this.timeSlider) return;

    const state = this.engine.getState();
    const duration = this.pastStagePlayback ? state.player2.duration : state.player1.duration;
    if (duration > 0) {
      const newTime = (parseFloat(this.timeSlider.value) / 100) * duration;
      this.engine.seek(newTime, this.pastStagePlayback);
    }
  },
  // TODO dont seek the other player when in pastStagePlayback mode!!!

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
      // listen display data from player2 if in pastSubmission mode
      const currentTime = !this.pastStagePlayback ? state.player1.currentTime : state.player2.currentTime;
      const duration = !this.pastStagePlayback ? state.player1.duration : state.player2.duration;
      
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

    if (!list1) return;

    list1.innerHTML = '';

    this.trackList.forEach((path, index) => {
      const li = document.createElement('li');
      li.textContent = path;
      li.addEventListener('click', () => this.playSubmission(index));
      list1.appendChild(li);
    });
  },

  initPastStagesList() {
    const pastStagesList = document.getElementById('past-stages-list') as HTMLUListElement;
    pastStagesList.innerHTML = '';

    this.pastStageTracklist.forEach((path, index) => {
      const li = document.createElement('li');
      li.textContent = path;
      li.addEventListener('click', () => this.playPastSubmission(index));
      pastStagesList.appendChild(li);
    });
  },

  togglePlayPause() {
    if (!this.engine) return; // when outside constraints, freeze instead of randomy floating around!
    
    if (this.pastStagePlayback){
      this.engine.toggleP2();
    } else {
      this.engine.toggleBoth();
    }
  },

  nextTrack() {
    if (this.currentTrackIndex < this.trackList.length - 1) {
      this.playSubmission(this.currentTrackIndex + 1);
    }
  },
  previousTrack() {
    if (this.currentTrackIndex > 0) {
      this.playSubmission(this.currentTrackIndex - 1);
    }
  },
  
  playSubmission(index: number) {
    if (index >= 0 && index < this.trackList.length) {
      if (this.pastStagePlayback) { this.pastStagePlayback = false; }
      this.currentTrackIndex = index;
      const trackPath = this.trackList[index];
      this.engine?.playSubmission(trackPath, this.backingTrackSrc);
      this.updateTransportButtons();
    }
  },

  playPastSubmission(index: number) {
    if (!this.pastStagePlayback) {
      this.pastStagePlayback = true;
    }
    this.engine.playPastStage(this.pastStageTracklist[index]);
  },

  updateTransportButtons() {
    if (this.backBtn) {
      this.backBtn.disabled = this.currentTrackIndex <= 0;
    }
    if (this.fwdBtn) {
      this.fwdBtn.disabled = this.currentTrackIndex >= this.trackList.length - 1;
    }
  }
};
export { playerController }; 