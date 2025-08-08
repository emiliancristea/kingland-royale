import { CARD_LIBRARY, DEFAULT_DECK } from '../data/cards.js';
import { getDeck, setDeck } from '../core/storage.js';

export class DeckScene extends Phaser.Scene{
  constructor(){ super('deck'); }
  create(){
    const w=this.scale.width, h=this.scale.height;
    this.add.text(w*0.5, 60, 'Deck Builder', { fontSize:'32px', color:'#e2e8f0', fontFamily:'system-ui' }).setOrigin(0.5);

    const list = CARD_LIBRARY;
    const gridCols = 4; const cell = 120; const margin = 16; const startY = 110;
    const deck = new Set(getDeck(DEFAULT_DECK));

    list.forEach((c, idx)=>{
      const gx = idx % gridCols, gy = Math.floor(idx / gridCols);
      const x = margin + gx*(cell+margin) + cell*0.5;
      const y = startY + gy*(cell+margin) + cell*0.5;
      const key = c.type==='spell'? 'spell_orange' : 'unit_green';
      const card = this.add.image(x, y, key).setScale(1.0).setInteractive({useHandCursor:true});
      const label = this.add.text(x, y+40, `${c.name}\n${c.cost}`, { fontSize:'12px', color:'#e2e8f0', align:'center' }).setOrigin(0.5);
      const selected = deck.has(c.id);
      card.setAlpha(selected? 1.0 : 0.6);
      card.on('pointerup', ()=>{
        if (deck.has(c.id)) deck.delete(c.id); else if (deck.size<8) deck.add(c.id);
        card.setAlpha(deck.has(c.id)?1.0:0.6);
      });
    });

    const btnBack = this.add.text(w*0.5, h-80, 'Save & Back', { fontSize:'24px', color:'#0b1020', backgroundColor:'#22d3ee', padding:{x:16,y:10}, fontFamily:'system-ui' }).setOrigin(0.5).setInteractive({useHandCursor:true});
    btnBack.on('pointerup', ()=>{
      setDeck(Array.from(deck).slice(0,8));
      this.scene.start('menu');
    });
  }
}


