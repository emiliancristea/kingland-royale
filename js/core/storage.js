import { STORAGE_KEYS } from './constants.js';

export function loadPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function savePlayer(player) {
  localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
}


