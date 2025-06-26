import { audioFiles } from './mock-audio.js';
const playerController = {
    playBtn: undefined,
    volume1Knob: undefined,
    volume2Knob: undefined,
    // Initialise DOM references and populate track lists
    init(onSelect) {
        this.playBtn = document.getElementById('play-btn');
        this.volume1Knob = document.getElementById('submission-volume');
        this.volume2Knob = document.getElementById('master-volume');
        this.initTrackLists(onSelect);
    },
    /* ---------- private helpers ---------- */
    initTrackLists(onSelect) {
        const list1 = document.getElementById('player-1-list');
        const list2 = document.getElementById('player-2-list');
        if (!list1 || !list2)
            return;
        list1.innerHTML = '';
        list2.innerHTML = '';
        audioFiles.player1Files.forEach(path => {
            const li = document.createElement('li');
            li.textContent = path;
            li.addEventListener('click', () => onSelect(path, 1));
            list1.appendChild(li);
        });
        audioFiles.player2Files.forEach(path => {
            const li = document.createElement('li');
            li.textContent = path;
            li.addEventListener('click', () => onSelect(path, 2));
            list2.appendChild(li);
        });
    }
};
export { playerController };
