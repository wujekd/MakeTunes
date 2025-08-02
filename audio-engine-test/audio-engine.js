export class AudioEngine {
    constructor(player1, player2) {
        this.player1Source = null;
        this.player2Source = null;
        this.player1Gain = null;
        this.player2Gain = null;
        this.masterGain = null;
        this.player1 = player1;
        this.player2 = player2;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.setupAudioRouting();
        this.connectPlayerToAudioContext(1);
        this.connectPlayerToAudioContext(2);
        this.state = {
            player1: { isPlaying: false, currentTime: 0, duration: 0, volume: 1, source: null, hasEnded: false, error: null },
            player2: { isPlaying: false, currentTime: 0, duration: 0, volume: 1, source: null, hasEnded: false, error: null },
            master: { volume: 1 }
        };
        this.setupAudioEventListeners();
    }
    setupAudioRouting() {
        this.player1Gain = this.audioContext.createGain();
        this.player2Gain = this.audioContext.createGain();
        this.masterGain = this.audioContext.createGain();
        this.player1Gain.connect(this.masterGain);
        this.player2Gain.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);
        this.player1Gain.gain.value = 1.0;
        this.player2Gain.gain.value = 1.0;
        this.masterGain.gain.value = 1.0;
    }
    connectPlayerToAudioContext(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        const gainNode = playerId === 1 ? this.player1Gain : this.player2Gain;
        const source = this.audioContext.createMediaElementSource(player);
        source.connect(gainNode);
        if (playerId === 1) {
            this.player1Source = source;
        }
        else {
            this.player2Source = source;
        }
    }
    setupAudioEventListeners() {
        // p1 events
        this.player1.addEventListener('play', () => {
            this.updateState({
                player1: { ...this.state.player1, isPlaying: true }
            });
        });
        this.player1.addEventListener('pause', () => {
            this.updateState({
                player1: { ...this.state.player1, isPlaying: false }
            });
        });
        this.player1.addEventListener('timeupdate', () => {
            this.updateState({
                player1: {
                    ...this.state.player1,
                    currentTime: this.player1.currentTime,
                    duration: this.player1.duration || 0
                }
            });
        });
        this.player1.addEventListener('ended', () => {
            this.updateState({
                player1: {
                    ...this.state.player1,
                    isPlaying: false,
                    hasEnded: true
                }
            });
        });
        // p2 events
        this.player2.addEventListener('play', () => {
            this.updateState({
                player2: { ...this.state.player2, isPlaying: true }
            });
        });
        this.player2.addEventListener('pause', () => {
            this.updateState({
                player2: { ...this.state.player2, isPlaying: false }
            });
        });
        this.player2.addEventListener('timeupdate', () => {
            this.updateState({
                player2: {
                    ...this.state.player2,
                    currentTime: this.player2.currentTime,
                    duration: this.player2.duration || 0
                }
            });
        });
        this.player2.addEventListener('ended', () => {
            this.updateState({
                player2: {
                    ...this.state.player2,
                    isPlaying: false,
                    hasEnded: true
                }
            });
        });
    }
    loadSource(playerId, src) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.src = src;
        player.load();
        // Update state to notify React about new source
        this.updateState({
            [`player${playerId}`]: {
                ...this.state[`player${playerId}`],
                source: src,
                isPlaying: false, // Reset play state for new source
                hasEnded: false,
                currentTime: 0
            }
        });
    }
    play(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.play();
        this.updateState({
            [`player${playerId}`]: {
                ...this.state[`player${playerId}`],
                isPlaying: true
            }
        });
    }
    pause(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.pause();
        this.updateState({
            [`player${playerId}`]: {
                ...this.state[`player${playerId}`],
                isPlaying: false
            }
        });
    }
    stop(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.pause();
        player.currentTime = 0;
    }
    loadAndPlay(playerId, src) {
        this.loadSource(playerId, src);
        this.play(playerId);
    }
    setVolume(playerId, volume) {
        const player = playerId === 1 ? this.player1 : this.player2;
        const gainNode = playerId === 1 ? this.player1Gain : this.player2Gain;
        gainNode.gain.value = volume;
        this.updateState({
            [`player${playerId}`]: {
                ...this.state[`player${playerId}`],
                volume: volume
            }
        });
    }
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
            this.updateState({
                master: { volume: volume }
            });
        }
    }
    seek(time) {
        this.player1.currentTime = time;
        this.player2.currentTime = time;
        this.updateState({
            player1: {
                ...this.state.player1,
                currentTime: time
            },
            player2: {
                ...this.state.player2,
                currentTime: time
            }
        });
    }
    setCallbacks(onStateChange) {
        this.onStateChange = onStateChange;
    }
    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.onStateChange?.(this.state);
    }
    getState() {
        return this.state;
    }
}
