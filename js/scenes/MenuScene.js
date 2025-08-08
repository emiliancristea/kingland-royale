import { DEFAULT_DECK } from '../data/cards.js';
import { getDeck } from '../core/storage.js';

export class MenuScene extends Phaser.Scene{
  constructor(){ super('menu'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    this.add.text(w*0.5, h*0.18, 'Kingland: Royale', { fontSize:'42px', color:'#e2e8f0', fontFamily:'system-ui' }).setOrigin(0.5);
    this.add.text(w*0.5, h*0.25, 'Sky-Realm Battles', { fontSize:'20px', color:'#94a3b8', fontFamily:'system-ui' }).setOrigin(0.5);

    const btnStyle = { fontSize:'28px', color:'#0b1020', backgroundColor:'#22d3ee', padding:{x:18,y:10}, fontFamily:'system-ui' };
    const btnPlay = this.add.text(w*0.5, h*0.50, 'Play', btnStyle).setOrigin(0.5).setInteractive({useHandCursor:true});
    const btnDeck = this.add.text(w*0.5, h*0.62, 'Deck Builder', { ...btnStyle, backgroundColor:'#8b5cf6'}).setOrigin(0.5).setInteractive({useHandCursor:true});

    btnPlay.on('pointerup', ()=>{ this.scene.start('game'); });
    btnDeck.on('pointerup', ()=>{ this.scene.start('deck'); });

    // Show small deck summary
    const deck = getDeck(DEFAULT_DECK);
    this.add.text(w*0.5, h*0.75, `Deck: ${deck.slice(0,8).join(', ')}`, { fontSize:'14px', color:'#94a3b8' }).setOrigin(0.5).setWordWrapWidth(w*0.9);
  }
}


