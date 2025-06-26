import { audioFiles } from './mock-audio.js';
const ui = {
    playBtn: undefined,
    volume1Knob: undefined,
    volume2Knob: undefined,
    init() {
        this.playBtn = document.getElementById('play-btn');
        this.volume1Knob = document.getElementById('submission-volume');
        this.volume2Knob = document.getElementById('master-volume');
        this.initTrackLists();
    },
    /* ---------------- private ---------------- */
    initTrackLists() {
        const player1List = document.getElementById('player-1-list');
        const player2List = document.getElementById('player-2-list');
        if (!player1List || !player2List)
            return;
        player1List.innerHTML = '';
        player2List.innerHTML = '';
        audioFiles.player1Files.forEach(path => {
            const li = document.createElement('li');
            li.textContent = path;
            player1List.appendChild(li);
        });
        audioFiles.player2Files.forEach(path => {
            const li = document.createElement('li');
            li.textContent = path;
            player2List.appendChild(li);
        });
    }
};
export { ui };
