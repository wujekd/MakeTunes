import { audioFiles } from './mock-audio.js';

const playerController = {
  playBtn: undefined as HTMLButtonElement | undefined,
  volume1Knob: undefined as HTMLInputElement | undefined,
  volume2Knob: undefined as HTMLInputElement | undefined,

  // Initialise DOM references and populate track lists
  init(onSelect: (path: string, playerId: 1 | 2) => void) {
    this.playBtn     = document.getElementById('play-btn')  as HTMLButtonElement;
    this.volume1Knob = document.getElementById('submission-volume') as HTMLInputElement;
    this.volume2Knob = document.getElementById('master-volume')     as HTMLInputElement;

    this.initTrackLists(onSelect);
  },

  /* ---------- private helpers ---------- */
  initTrackLists(onSelect: (path: string, playerId: 1 | 2) => void) {
    const list1 = document.getElementById('player-1-list') as HTMLUListElement;
    const list2 = document.getElementById('player-2-list') as HTMLUListElement;

    if (!list1 || !list2) return;

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