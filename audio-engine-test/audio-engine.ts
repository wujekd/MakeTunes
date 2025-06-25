export class AudioEngine {
  private player1: HTMLAudioElement;
  private player2: HTMLAudioElement;

  constructor(player1: HTMLAudioElement, player2: HTMLAudioElement) {
    this.player1 = player1;
    this.player2 = player2;
  }


  loadSource(playerId: 1 | 2, src: string): void {
    const player = playerId === 1 ? this.player1 : this.player2;
    player.src = src;
    player.load();
  }

  play(playerId: 1 | 2): void {
    const player = playerId === 1 ? this.player1 : this.player2;
    player.play();
  }

  pause(playerId: 1 | 2): void {
    const player = playerId === 1 ? this.player1 : this.player2;
    player.pause();
  }
  stop(playerId: 1 | 2): void {
    const player = playerId === 1 ? this.player1 : this.player2;
    player.pause();
    player.currentTime = 0;
  }

  loadAndPlay(playerId: 1 | 2, src: string): void {
    this.loadSource(playerId, src);
    this.play(playerId);
  }

  setVolume(playerId: 1 | 2, volume: number): void {
    const player = playerId === 1 ? this.player1 : this.player2;
    player.volume = volume;
  }
} 