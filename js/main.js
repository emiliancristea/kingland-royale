export {};
import { GAME_WIDTH, GAME_HEIGHT } from './core/constants.js';
import { runBalanceSimulation } from './systems/balance.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { GameScene } from './scenes/GameScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { DeckScene } from './scenes/DeckScene.js';

const config = {
  // eslint-disable-next-line no-undef
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0b1020',
  // eslint-disable-next-line no-undef
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [PreloadScene, MenuScene, DeckScene, GameScene],
  physics: { default:'arcade' },
  fps: { target:60, forceSetTimeOut:true }
};

runBalanceSimulation();
// eslint-disable-next-line no-undef
const game = new Phaser.Game(config);


