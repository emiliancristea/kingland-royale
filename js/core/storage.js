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

export function getDeck(fallbackDeck = []){
  const player = loadPlayer();
  return (player && Array.isArray(player.deck) && player.deck.length>0)? player.deck : fallbackDeck;
}

export function setDeck(deck){
  const player = loadPlayer() || { rp:0, shards:0, deck:[] };
  player.deck = [...deck];
  savePlayer(player);
}

export function getSettings(){
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw? JSON.parse(raw) : { arena:'default' };
  } catch { return { arena:'default' }; }
}

export function saveSettings(settings){
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}


