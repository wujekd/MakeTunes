export class AudioEngine {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
    }
    loadSource(playerId, src) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.src = src;
        player.load();
    }
    play(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.play();
    }
    pause(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.pause();
    }
    stop(playerId) {
        const player = playerId === 1 ? this.player1 : this.player2;
        player.pause();
        player.currentTime = 0;
    }
}
