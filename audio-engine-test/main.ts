import { audioFiles } from './mock-audio.js';
import { AudioEngine } from './audio-engine.js';

document.addEventListener('DOMContentLoaded', () => {

    const player1List = document.getElementById('player-1-list');
    const player2List = document.getElementById('player-2-list');

    const audioPlayer1 = document.getElementById('audio-player-1') as HTMLAudioElement | null;
    const audioPlayer2 = document.getElementById('audio-player-2') as HTMLAudioElement | null;

    if (!audioPlayer1 || !audioPlayer2) {
        console.error('Audio elements not found in the DOM');
        return;
    }

    // Instantiate the audio engine with the two players
    const engine = new AudioEngine(audioPlayer1, audioPlayer2);

    // Populate lists
    audioFiles.player1Files.forEach(path => {
        const li = document.createElement('li');
        li.textContent = path;
        li.addEventListener('click', () => {
            console.log('Selected from player1:', path);
            engine.loadAndPlay(1, path);
        });
        player1List?.appendChild(li);
    });

    audioFiles.player2Files.forEach(path => {
        const li = document.createElement('li');
        li.textContent = path;
        li.addEventListener('click', () => {
            console.log('Selected from player2:', path);
            engine.loadAndPlay(2, path);
        });
        player2List?.appendChild(li);
    });
});

function logstuff(x: string): void {
    console.log(x);
}

function playAudio(fileSrc: string, playerId: number): void {
} 