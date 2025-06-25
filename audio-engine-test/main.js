import { audioFiles } from './test-audio/mock-audio.js';
document.addEventListener('DOMContentLoaded', () => {
    const player1List = document.getElementById('player-1-list');
    const player2List = document.getElementById('player-2-list');
    const audioPlayer1 = document.getElementById('audio-player-1');
    const audioPlayer2 = document.getElementById('audio-player-2');
    for (let i = 0; i < audioFiles.player1Files.length; i++) {
        const li = document.createElement('li');
        li.textContent = audioFiles.player1Files[i];
        li.addEventListener('click', () => {
            logstuff(li.textContent || '');
            playAudio(li.textContent || '', 1);
        });
        player1List?.appendChild(li);
    }
    for (let i = 0; i < audioFiles.player2Files.length; i++) {
        const li = document.createElement('li');
        li.textContent = audioFiles.player2Files[i];
        li.addEventListener('click', () => {
            logstuff(li.textContent || '');
            playAudio(li.textContent || '', 2);
        });
        player2List?.appendChild(li);
    }
});
function logstuff(x) {
    console.log(x);
}
function playAudio(fileSrc, playerId) {
}
