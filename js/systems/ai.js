import { getCard } from '../data/cards.js';

export class SimpleAI {
  constructor(scene, side){
    this.scene = scene;
    this.side = side; // 'left' or 'right'
    this.nextActionAt = 0;
  }
  update(time){
    if (time < this.nextActionAt) return;
    const rune = this.scene.state[this.side].rune;
    const hand = this.scene.state[this.side].hand;
    const playable = hand.map(getCard).filter(Boolean).filter(c=> (c.cost||0) <= rune);
    if (playable.length>0){
      const card = playable[Math.floor(Math.random()*playable.length)];
      const lane = Math.floor(Math.random()*3);
      const x = this.side==='left'? this.scene.laneX(lane, 0.18) : this.scene.laneX(lane, 0.82);
      const y = this.scene.laneY(lane);
      this.scene.deployCard(this.side, card.id, x, y);
    }
    this.nextActionAt = time + 1200 + Math.random()*1000;
  }
}


