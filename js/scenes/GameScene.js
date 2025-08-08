import { DEFAULT_DECK, getCard } from '../data/cards.js';
import { loadPlayer, savePlayer, getDeck } from '../core/storage.js';
import { createCardUI } from '../ui/CardUI.js';
import { SimpleAI } from '../systems/ai.js';

export class GameScene extends Phaser.Scene{
  constructor(){ super('game'); }
  init(){
    this.matchTimeMs = 3 * 60 * 1000;
    this.elapsedMs = 0;
    this.runeMax = 10;
    this.runeRegenPerSec = 1.0;
    this.unitIdCounter = 0;
    this.units = [];
    this.projectiles = [];
    this.handSprites = [];
    const saved = loadPlayer() || { rp:0, shards:0, deck:[...DEFAULT_DECK] };
    this.state = {
      left:  { rune: 5, hand: [...getDeck(DEFAULT_DECK)], towers:[{hp:1200},{hp:1200}], score:0 },
      right: { rune: 5, hand: [...DEFAULT_DECK], towers:[{hp:1200},{hp:1200}], score:0 },
    };
    this.centralSigil = { owner:null, progressLeft:0, progressRight:0 };
    this.aiLeft = new SimpleAI(this,'left');
    this.aiRight = new SimpleAI(this,'right');
    this.playerSide = 'left';
  }
  create(){
    const w = this.scale.width; const h = this.scale.height;
    this.arenaRect = new Phaser.Geom.Rectangle(w*0.05, h*0.15, w*0.90, h*0.70);
    this.add.rectangle(w*0.5,h*0.5,this.arenaRect.width,this.arenaRect.height,0x1f2937,0.6).setStrokeStyle(4,0x0ea5e9,0.4);
    const laneGap = this.arenaRect.height/3;
    for (let i=1;i<3;i++) this.add.line(0,0, this.arenaRect.x, this.arenaRect.y+i*laneGap, this.arenaRect.right, this.arenaRect.y+i*laneGap, 0x475569, 0.6).setLineWidth(2,2);
    this.leftTowers = [
      this.add.image(this.arenaRect.x+40, this.arenaRect.y+laneGap*0.5, 'tower_left').setScale(0.8),
      this.add.image(this.arenaRect.x+40, this.arenaRect.y+laneGap*1.5, 'tower_left').setScale(0.8),
    ];
    this.rightTowers = [
      this.add.image(this.arenaRect.right-40, this.arenaRect.y+laneGap*0.5, 'tower_right').setScale(0.8),
      this.add.image(this.arenaRect.right-40, this.arenaRect.y+laneGap*1.5, 'tower_right').setScale(0.8),
    ];
    this.leftTowerHP = [1200,1200];
    this.rightTowerHP = [1200,1200];
    this.sigil = this.add.image(w*0.5, this.arenaRect.y+this.arenaRect.height*0.5, 'sigil').setScale(0.7).setAlpha(0.9);

    const hudStyle = { fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', fontSize: '24px', color: '#e2e8f0' };
    this.hudTimer = this.add.text(w*0.5, this.arenaRect.y - 30, '03:00', hudStyle).setOrigin(0.5,1).setDepth(10);
    this.hudRuneLeft = this.add.text(this.arenaRect.x, this.arenaRect.y - 30, 'Rune L: 5', hudStyle).setOrigin(0,1).setDepth(10);
    this.hudRuneRight = this.add.text(this.arenaRect.right, this.arenaRect.y - 30, 'Rune R: 5', hudStyle).setOrigin(1,1).setDepth(10);

    this.buildHandSprites();

    this.input.on('pointerdown', (p)=>{
      if (!p.isDown) return;
      const side = this.playerSide;
      const hand = this.state[side].hand;
      const rune = this.state[side].rune;
      const affordable = hand.map(getCard).filter(Boolean).filter(c=> (c.cost||0) <= rune);
      if (affordable.length===0) return;
      const card = affordable.sort((a,b)=>a.cost-b.cost)[0];
      const x = Phaser.Math.Clamp(p.x, this.arenaRect.x+20, this.arenaRect.right-20);
      const y = Phaser.Math.Clamp(p.y, this.arenaRect.y+20, this.arenaRect.bottom-20);
      this.deployCard(side, card.id, x, y);
    });
  }

  buildHandSprites(){
    for (const s of this.handSprites){ s.destroy(); }
    this.handSprites.length = 0;
    const w = this.scale.width; const h = this.scale.height;
    const margin = 16; const slots = 4; const slotSize = Math.min(96, (w - margin*(slots+1))/slots);
    const y = this.arenaRect.bottom + 10 + slotSize/2;
    const cards = this.state[this.playerSide].hand.slice(0, slots).map(getCard);
    for (let i=0;i<cards.length;i++){
      const c = cards[i];
      const cx = margin + (i*(slotSize+margin));
      const cardUI = createCardUI(this, c, cx, y - (slotSize*0.7), { width: slotSize });
      cardUI.setDepth(20);
      cardUI.setInteractive({ draggable:true, useHandCursor:true });
      cardUI.on('drag', (pointer, dragX, dragY)=>{ cardUI.x = dragX; cardUI.y = dragY; });
      cardUI.on('dragend', ()=>{
        const affordable = (getCard(cardUI.cardId).cost||0) <= this.state[this.playerSide].rune;
        if (affordable && Phaser.Geom.Rectangle.Contains(this.arenaRect, cardUI.x, cardUI.y)){
          const clampedX = Phaser.Math.Clamp(cardUI.x, this.arenaRect.x+20, this.arenaRect.right-20);
          const clampedY = Phaser.Math.Clamp(cardUI.y, this.arenaRect.y+20, this.arenaRect.bottom-20);
          this.deployCard(this.playerSide, cardUI.cardId, clampedX, clampedY);
        }
        this.tweens.add({ targets:cardUI, x: cx, y: y - (slotSize*0.7), duration:150, ease:'Sine.easeOut' });
      });
      this.handSprites.push(cardUI);
    }
    this.updateHandAffordability();
  }

  updateHandAffordability(){
    const rune = this.state[this.playerSide].rune;
      for (const s of this.handSprites){
        const cost = (getCard(s.cardId).cost)||0;
        if (typeof s.setAffordable === 'function') s.setAffordable(cost<=rune); else s.setAlpha(cost<=rune?1:0.45);
      }
  }

  laneY(lane){
    const laneGap = this.arenaRect.height/3;
    return this.arenaRect.y + laneGap*(lane+0.5);
  }
  laneX(lane, t){
    return this.arenaRect.x + this.arenaRect.width * t;
  }

  deployCard(side, cardId, x, y){
    const card = getCard(cardId); if (!card) return;
    const state = this.state[side];
    if ((card.cost||0) > state.rune) return;
    state.rune -= card.cost||0;
    if (card.type==='spell') this.castSpell(side, card, x, y);
    else this.spawnUnit(side, card, x, y);
  }

  spawnUnit(side, card, x, y){
    const id = ++this.unitIdCounter;
    const isLeft = side==='left';
    const colorKey = isLeft? 'unit_green':'unit_teal';
    const sprite = this.add.image(x,y, colorKey).setScale(0.8);
    const unit = { id, side, sprite, card, hp: card.hp||200, dps: card.dps||40, range: card.range||60, speed: card.speed||50, target: null };
    this.units.push(unit);
  }

  castSpell(side, card, x, y){
    const dmg = card.damage||120;
    const radius = card.radius||90;
    const isLeft = side==='left';
    const pulse = this.add.image(x,y, isLeft? 'spell_orange':'spell_cyan').setScale(radius/64).setAlpha(0.85);
    this.tweens.add({ targets:pulse, alpha:0, duration:400, onComplete:()=>pulse.destroy() });
    this.units.filter(u=>u.side!==side && Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,x,y)<=radius)
      .forEach(u=>{ u.hp -= dmg; });
    const targets = side==='left'? this.rightTowers : this.leftTowers;
    const hpArr = side==='left'? this.rightTowerHP : this.leftTowerHP;
    targets.forEach((t,i)=>{
      if (Phaser.Math.Distance.Between(t.x,t.y,x,y)<=radius) hpArr[i] = Math.max(0, hpArr[i]-Math.floor(dmg*0.4));
    });
  }

  update(time, delta){
    const addRune = (delta/1000)*this.runeRegenPerSec;
    this.state.left.rune = Math.min(this.runeMax, this.state.left.rune + addRune);
    this.state.right.rune = Math.min(this.runeMax, this.state.right.rune + addRune);

    const mm = Math.floor(Math.max(0, this.matchTimeMs - this.elapsedMs)/60000);
    const ss = Math.floor((Math.max(0, this.matchTimeMs - this.elapsedMs)%60000)/1000).toString().padStart(2,'0');
    this.hudTimer.setText(`${mm}:${ss}`);
    this.hudRuneLeft.setText(`Rune L: ${Math.floor(this.state.left.rune)}`);
    this.hudRuneRight.setText(`Rune R: ${Math.floor(this.state.right.rune)}`);
    this.updateHandAffordability();

    this.aiLeft.update(time);
    this.aiRight.update(time);

    for (const u of this.units){
      if (u.hp<=0){ u.sprite.destroy(); u.dead=true; continue; }
      let target = null; let minD = Infinity;
      for (const v of this.units){
        if (v.dead || v.side===u.side) continue;
        const d = Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,v.sprite.x,v.sprite.y);
        if (d<minD){ minD=d; target=v; }
      }
      if (!target){
        const towers = u.side==='left'? this.rightTowers : this.leftTowers;
        const hpArr = u.side==='left'? this.rightTowerHP : this.leftTowerHP;
        for (let i=0;i<towers.length;i++){
          if (hpArr[i]<=0) continue;
          const t = towers[i];
          const d = Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,t.x,t.y);
          if (d<minD){ minD=d; target={ sprite:t, hpRef:hpArr, idx:i, isTower:true }; }
        }
      }
      u.target = target;
      if (target){
        const tx = target.sprite.x; const ty = target.sprite.y;
        const d = Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,tx,ty);
        if (d > (u.range||60)){
          const vx = ((tx - u.sprite.x)/d) * (u.speed||50) * (delta/1000);
          const vy = ((ty - u.sprite.y)/d) * (u.speed||50) * (delta/1000);
          u.sprite.x += vx; u.sprite.y += vy;
        } else {
          const dmg = (u.dps||40) * (delta/1000);
          if (target.isTower){ const hpArr = target.hpRef; const i = target.idx; hpArr[i] = Math.max(0, hpArr[i]-dmg); }
          else { target.hp -= dmg; }
        }
      }
    }
    this.units = this.units.filter(u=>!u.dead);

    let leftProx=0, rightProx=0; const sx=this.sigil.x, sy=this.sigil.y;
    this.units.forEach(u=>{
      if (Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,sx,sy) < 140){
        if (u.side==='left') leftProx+=1; else rightProx+=1;
      }
    });
    const deltaProg = (leftProx-rightProx) * (delta/1000) * 5;
    if (deltaProg>0){ this.centralSigil.progressLeft = Phaser.Math.Clamp(this.centralSigil.progressLeft+deltaProg,0,100); this.centralSigil.progressRight = Math.max(0, this.centralSigil.progressRight-deltaProg); }
    else if (deltaProg<0){ const v=-deltaProg; this.centralSigil.progressRight = Phaser.Math.Clamp(this.centralSigil.progressRight+v,0,100); this.centralSigil.progressLeft = Math.max(0, this.centralSigil.progressLeft-v); }
    if (this.centralSigil.progressLeft>=100) this.centralSigil.owner='left';
    if (this.centralSigil.progressRight>=100) this.centralSigil.owner='right';

    this.elapsedMs += delta;
    const remaining = Math.max(0, this.matchTimeMs - this.elapsedMs);
    const leftTowersAlive = this.leftTowerHP.filter(h=>h>0).length;
    const rightTowersAlive = this.rightTowerHP.filter(h=>h>0).length;
    if (remaining<=0 || leftTowersAlive===0 || rightTowersAlive===0 || this.centralSigil.owner){
      const winner = this.computeWinner();
      this.endMatch(winner);
    }
  }

  computeWinner(){
    if (this.centralSigil.owner) return this.centralSigil.owner;
    const l = this.leftTowerHP.filter(h=>h>0).length;
    const r = this.rightTowerHP.filter(h=>h>0).length;
    if (l>r) return 'left'; if (r>l) return 'right';
    const sum = arr => arr.reduce((a,b)=>a+b,0);
    const lh = sum(this.leftTowerHP); const rh = sum(this.rightTowerHP);
    if (lh>rh) return 'left'; if (rh>lh) return 'right';
    return Math.random()<0.5? 'left':'right';
  }

  endMatch(winner){
    const player = loadPlayer() || { rp:0, shards:0, deck:[...DEFAULT_DECK] };
    if (winner==='left') { player.rp += 10; player.shards += 5; }
    else { player.rp += 5; player.shards += 2; }
    savePlayer(player);
    this.scene.restart();
  }
}


