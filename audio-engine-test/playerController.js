import { audioFiles } from './test-audio/mock-audio.js';
const playerController = {
    playBtn: undefined,
    volume1Slider: undefined,
    volume2Slider: undefined,
    timeSlider: undefined,
    currentTimeDisplay: undefined,
    totalTimeDisplay: undefined,
    backBtn: undefined,
    fwdBtn: undefined,
    engine: undefined,
    currentTrackIndex: -1,
    trackList: [],
    init(engine) {
        this.engine = engine;
        this.trackList = audioFiles.player1Files;
        this.playBtn = document.getElementById('play-btn');
        this.playBtn.addEventListener('click', () => this.togglePlayPause());
        this.backBtn = document.getElementById('back-btn');
        this.backBtn.addEventListener('click', () => this.previousTrack());
        this.fwdBtn = document.getElementById('fwd-btn');
        this.fwdBtn.addEventListener('click', () => this.nextTrack());
        this.volume1Slider = document.getElementById('submission-volume');
        this.volume1Slider.addEventListener('input', () => {
            this.engine?.setVolume(1, parseFloat(this.volume1Slider?.value || '0'));
        });
        this.volume2Slider = document.getElementById('master-volume');
        this.volume2Slider.addEventListener('input', () => {
            this.engine?.setMasterVolume(parseFloat(this.volume2Slider?.value || '0'));
        });
        this.timeSlider = document.getElementById('time-slider');
        this.currentTimeDisplay = document.getElementById('current-time');
        this.totalTimeDisplay = document.getElementById('total-time');
        this.timeSlider?.addEventListener('input', () => {
            this.handleTimeSliderChange();
        });
        engine.loadSource(2, audioFiles.player2Files[0]);
        this.initTrackLists();
        this.updateTransportButtons();
    },
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },
    handleTimeSliderChange() {
        if (!this.engine || !this.timeSlider)
            return;
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
        const list1 = document.getElementById('player-1-list');
        if (!list1)
            return;
        list1.innerHTML = '';
        this.trackList.forEach((path, index) => {
            const li = document.createElement('li');
            li.textContent = path;
            li.addEventListener('click', () => this.loadTrack(index));
            list1.appendChild(li);
        });
    },
    togglePlayPause() {
        if (!this.engine)
            return;
        const state = this.engine.getState();
        const player1Playing = state.player1.isPlaying;
        const player2Playing = state.player2.isPlaying;
        if (player1Playing || player2Playing) {
            this.engine.pause();
        }
        else {
            this.engine.play();
        }
    },
    nextTrack() {
        if (this.currentTrackIndex < this.trackList.length - 1) {
            this.currentTrackIndex++;
            const trackPath = this.trackList[this.currentTrackIndex];
            this.engine?.loadAndPlay(1, trackPath);
            this.updateTransportButtons();
        }
    },
    previousTrack() {
        if (this.currentTrackIndex > 0) {
            this.currentTrackIndex--;
            const trackPath = this.trackList[this.currentTrackIndex];
            this.engine?.loadAndPlay(1, trackPath);
            this.updateTransportButtons();
        }
    },
    loadTrack(index) {
        if (index >= 0 && index < this.trackList.length) {
            this.currentTrackIndex = index;
            const trackPath = this.trackList[index];
            this.engine?.loadAndPlay(1, trackPath);
            this.updateTransportButtons();
        }
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
