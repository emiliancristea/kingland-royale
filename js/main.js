/*
 Kingland: Royale (Front-end only Prototype)
 - Phaser 3 (CDN) real-time, touch-first, 3-lane battler with simulated PvP (AI vs AI or Player vs AI)
 - Static hosting ready (GitHub Pages)
 - Saves player progression in localStorage

 MVP Scope in this single file:
  - PreloadScene: sets up basic assets (geometric)
  - UIScene: HUD (timer, rune flow, hand), drag-and-drop deploy
  - GameScene: 3-lane arena, simple pathing/targeting, towers, units, spells
  - BalanceSim: run headless AI vs AI to tune costs/stats (console summary)

 Stretch TODOs (references only):
  - Netplay, server authority, spectating, replays, clan/social systems
  - Advanced VFX/audio, camera shake, arena variants, card collection UX
*/

(function(){
  const GAME_WIDTH = 720; // logical width; Phaser will scale responsively
  const GAME_HEIGHT = 1280;

  // ----- Utility & Data Persistence -----
  const STORAGE_KEYS = {
    PLAYER: 'klr_player',
    SETTINGS: 'klr_settings',
    TELEMETRY: 'klr_telemetry',
  };

  function loadPlayer() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PLAYER);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }
  function savePlayer(player) {
    localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(player));
  }

  // ----- Card Data (JSON-friendly) -----
  // Minimal set per house: 3 troop, 1 spell, 1 champion + 2 neutral
  const HOUSES = ['Ignis','Frost','Aqua','Verdant'];

  const CARD_LIBRARY = [
    // Ignis
    { id:'ignis_spearman', house:'Ignis', name:'Ember Spearman', type:'troop', cost:2, hp:180, dps:45, range:80, speed:60, role:'anti-air poke', ability:'bonus vs air', synergy:['ignite'], visual:'small red-orange circle' },
    { id:'ignis_brute', house:'Ignis', name:'Magma Brute', type:'troop', cost:4, hp:520, dps:70, range:40, speed:40, role:'frontline', ability:'on-death burn', synergy:['ignite'], visual:'large lava-red circle' },
    { id:'ignis_harpy', house:'Ignis', name:'Ash Harpy', type:'troop', cost:3, hp:220, dps:55, range:90, speed:90, role:'aerial dps', ability:'airborne', synergy:['air'], visual:'red triangle' },
    { id:'ignis_flameburst', house:'Ignis', name:'Flameburst', type:'spell', cost:3, damage:180, radius:90, effect:'aoe burn', synergy:['ignite'], visual:'orange pulse' },
    { id:'ignis_champion', house:'Ignis', name:'Pyrelord Kael', type:'champion', cost:5, hp:800, dps:95, range:60, speed:55, role:'pressure', ability:'ignite aura', synergy:['ignite'], visual:'glowing red crown' },

    // Frost
    { id:'frost_archer', house:'Frost', name:'Glacier Archer', type:'troop', cost:2, hp:160, dps:40, range:120, speed:55, role:'ranged poke', ability:'slow on hit', synergy:['freeze'], visual:'pale blue circle' },
    { id:'frost_guard', house:'Frost', name:'Iceguard', type:'troop', cost:4, hp:560, dps:60, range:40, speed:35, role:'tank', ability:'damage reduction aura', synergy:['freeze'], visual:'blue square' },
    { id:'frost_owl', house:'Frost', name:'Snow Owl', type:'troop', cost:3, hp:200, dps:50, range:100, speed:85, role:'air support', ability:'reveal invisible (not used)', synergy:['vision'], visual:'light blue triangle' },
    { id:'frost_nova', house:'Frost', name:'Frost Nova', type:'spell', cost:3, damage:100, radius:110, effect:'aoe slow + chip', synergy:['freeze'], visual:'icy pulse' },
    { id:'frost_champion', house:'Frost', name:'Lady Skadi', type:'champion', cost:5, hp:820, dps:85, range:70, speed:50, role:'control', ability:'cone slow', synergy:['freeze'], visual:'glowing blue crown' },

    // Aqua
    { id:'aqua_myrmidon', house:'Aqua', name:'Myrmidon', type:'troop', cost:3, hp:360, dps:60, range:50, speed:60, role:'melee fighter', ability:'splash vs clustered', synergy:['tide'], visual:'teal circle' },
    { id:'aqua_siren', house:'Aqua', name:'Siren', type:'troop', cost:2, hp:140, dps:42, range:110, speed:65, role:'ranged glass', ability:'brief charm (not used)', synergy:['tide'], visual:'cyan circle' },
    { id:'aqua_leviathan', house:'Aqua', name:'Leviathan Whelp', type:'troop', cost:4, hp:480, dps:75, range:60, speed:45, role:'bruiser', ability:'tide surge', synergy:['tide'], visual:'blue-green square' },
    { id:'aqua_tsunami', house:'Aqua', name:'Tsunami', type:'spell', cost:4, damage:150, radius:130, effect:'pushback + damage', synergy:['tide'], visual:'blue wave' },
    { id:'aqua_champion', house:'Aqua', name:'Queen Nerida', type:'champion', cost:5, hp:780, dps:100, range:55, speed:55, role:'pressure', ability:'water shield', synergy:['tide'], visual:'glowing cyan crown' },

    // Verdant
    { id:'verdant_ranger', house:'Verdant', name:'Grove Ranger', type:'troop', cost:2, hp:170, dps:44, range:115, speed:60, role:'ranged', ability:'bleed on crit (not used)', synergy:['growth'], visual:'green circle' },
    { id:'verdant_treant', house:'Verdant', name:'Treant', type:'troop', cost:4, hp:600, dps:65, range:40, speed:30, role:'tank wall', ability:'root nearby (slow)', synergy:['growth'], visual:'dark green square' },
    { id:'verdant_sprite', house:'Verdant', name:'Sprite', type:'troop', cost:3, hp:240, dps:58, range:90, speed:85, role:'flanker', ability:'heal pulse on deploy', synergy:['growth'], visual:'lime triangle' },
    { id:'verdant_thorns', house:'Verdant', name:'Thornfield', type:'spell', cost:3, damage:130, radius:100, effect:'aoe slow + damage over time', synergy:['growth'], visual:'green spikes' },
    { id:'verdant_champion', house:'Verdant', name:'Warden Faela', type:'champion', cost:5, hp:840, dps:88, range:60, speed:50, role:'sustain', ability:'regenerate aura', synergy:['growth'], visual:'glowing green crown' },

    // Neutral
    { id:'neutral_miners', house:'Neutral', name:'Sky Miners', type:'troop', cost:2, hp:260, dps:40, range:40, speed:55, role:'cycle unit', ability:'bonus to buildings', synergy:['economy'], visual:'gray circle' },
    { id:'neutral_bomb', house:'Neutral', name:'Rune Bomb', type:'spell', cost:2, damage:140, radius:80, effect:'burst', synergy:['economy'], visual:'yellow pulse' },
  ];

  // Default deck (mix of houses for demo)
  const DEFAULT_DECK = [
    'ignis_spearman','ignis_flameburst','frost_archer','aqua_myrmidon','verdant_ranger','neutral_miners','frost_nova','verdant_thorns'
  ];

  function getCard(id){ return CARD_LIBRARY.find(c=>c.id===id); }

  // ----- Simple AI -----
  class SimpleAI {
    constructor(scene, side){
      this.scene = scene;
      this.side = side; // 'left' or 'right'
      this.nextActionAt = 0;
    }
    update(time){
      if (time < this.nextActionAt) return;
      const rune = this.scene.state[this.side].rune;
      const hand = this.scene.state[this.side].hand;
      // try to play the highest affordable cost card randomly in any lane
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

  // ----- Scenes -----
  class PreloadScene extends Phaser.Scene{
    constructor(){ super('preload'); }
    preload(){
      // Create simple geometric textures for units/spells
      this.createCircle('unit_red', 0xff4d4d);
      this.createCircle('unit_blue', 0x4db5ff);
      this.createCircle('unit_green', 0x5cf68b);
      this.createCircle('unit_teal', 0x22d3ee);
      this.createCircle('spell_orange', 0xffa94d);
      this.createCircle('spell_cyan', 0x66e6ff);
      this.createRect('tower_left', 0x8b5cf6);
      this.createRect('tower_right', 0x22d3ee);
      this.createRect('sigil', 0xfacc15);
    }
    createCircle(key, color){
      const g = this.make.graphics({x:0,y:0,add:false});
      g.fillStyle(color, 1);
      g.fillCircle(32,32,28);
      g.generateTexture(key, 64,64);
      g.destroy();
    }
    createRect(key, color){
      const g = this.make.graphics({x:0,y:0,add:false});
      g.fillStyle(color, 1);
      g.fillRoundedRect(0,0,80,80,10);
      g.generateTexture(key, 80,80);
      g.destroy();
    }
    create(){ this.scene.start('game'); }
  }

  class GameScene extends Phaser.Scene{
    constructor(){ super('game'); }
    init(){
      this.matchTimeMs = 3 * 60 * 1000; // 3 minutes
      this.elapsedMs = 0;
      this.runeMax = 10;
      this.runeRegenPerSec = 1.0;
      this.lanes = [0,1,2];
      this.unitIdCounter = 0;
      this.units = [];
      this.projectiles = [];
      const saved = loadPlayer() || { rp:0, shards:0, deck:[...DEFAULT_DECK] };
      this.state = {
        left:  { rune: 5, hand: [...(saved.deck||DEFAULT_DECK)], towers:[{hp:1200},{hp:1200}], score:0 },
        right: { rune: 5, hand: [...DEFAULT_DECK], towers:[{hp:1200},{hp:1200}], score:0 },
      };
      this.centralSigil = { owner:null, progressLeft:0, progressRight:0 };
      this.aiLeft = new SimpleAI(this,'left');
      this.aiRight = new SimpleAI(this,'right');
      this.playerSide = 'left'; // could be AI vs AI by setting both AIs
    }
    create(){
      // Arena layout
      const w = this.scale.width;
      const h = this.scale.height;
      this.arenaRect = new Phaser.Geom.Rectangle(w*0.05, h*0.15, w*0.90, h*0.70);
      this.add.rectangle(w*0.5,h*0.5,this.arenaRect.width,this.arenaRect.height,0x1f2937,0.6).setStrokeStyle(4,0x0ea5e9,0.4);
      // Lanes separators
      const laneGap = this.arenaRect.height/3;
      for (let i=1;i<3;i++) this.add.line(0,0, this.arenaRect.x, this.arenaRect.y+i*laneGap, this.arenaRect.right, this.arenaRect.y+i*laneGap, 0x475569, 0.6).setLineWidth(2,2);
      // Towers
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
      // Central Sigil
      this.sigil = this.add.image(w*0.5, this.arenaRect.y+this.arenaRect.height*0.5, 'sigil').setScale(0.7).setAlpha(0.9);

      // HUD Texts
      const hudStyle = { fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', fontSize: '24px', color: '#e2e8f0' };
      this.hudTimer = this.add.text(w*0.5, this.arenaRect.y - 30, '03:00', hudStyle).setOrigin(0.5,1).setDepth(10);
      this.hudRuneLeft = this.add.text(this.arenaRect.x, this.arenaRect.y - 30, 'Rune L: 5', hudStyle).setOrigin(0,1).setDepth(10);
      this.hudRuneRight = this.add.text(this.arenaRect.right, this.arenaRect.y - 30, 'Rune R: 5', hudStyle).setOrigin(1,1).setDepth(10);

      // Input handlers for drag deploy
      this.input.on('pointerdown', (p)=>{
        if (!p.isDown) return;
        // Deploy cheapest card if player has rune (simple touch demo)
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

    laneY(lane){
      const laneGap = this.arenaRect.height/3;
      return this.arenaRect.y + laneGap*(lane+0.5);
    }
    laneX(lane, t){ // t in [0..1] from left to right
      return this.arenaRect.x + this.arenaRect.width * t;
    }

    deployCard(side, cardId, x, y){
      const card = getCard(cardId); if (!card) return;
      const state = this.state[side];
      if ((card.cost||0) > state.rune) return;
      state.rune -= card.cost||0;
      // replace card draw (simple: no deck, just stays available)
      // spawn entity or apply spell
      if (card.type==='spell'){
        this.castSpell(side, card, x, y);
      } else {
        this.spawnUnit(side, card, x, y);
      }
    }

    spawnUnit(side, card, x, y){
      const id = ++this.unitIdCounter;
      const isLeft = side==='left';
      const colorKey = isLeft? 'unit_green':'unit_teal';
      const sprite = this.add.image(x,y, colorKey).setScale(0.8);
      const unit = {
        id, side, sprite, card,
        hp: card.hp||200,
        dps: card.dps||40,
        range: card.range||60,
        speed: card.speed||50,
        target: null,
      };
      this.units.push(unit);
    }

    castSpell(side, card, x, y){
      const dmg = card.damage||120;
      const radius = card.radius||90;
      const isLeft = side==='left';
      const pulse = this.add.image(x,y, isLeft? 'spell_orange':'spell_cyan').setScale(radius/64).setAlpha(0.85);
      this.tweens.add({ targets:pulse, alpha:0, duration:400, onComplete:()=>pulse.destroy() });
      // apply damage to enemy units in radius
      this.units.filter(u=>u.side!==side && Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,x,y)<=radius)
        .forEach(u=>{ u.hp -= dmg; });
      // small chip vs towers near
      const nearLeft = [
        {hpArr:this.rightTowerHP, pos:this.rightTowers},
        {hpArr:this.leftTowerHP, pos:this.leftTowers}
      ];
      const targets = side==='left'? this.rightTowers : this.leftTowers;
      const hpArr = side==='left'? this.rightTowerHP : this.leftTowerHP;
      targets.forEach((t,i)=>{
        if (Phaser.Math.Distance.Between(t.x,t.y,x,y)<=radius) hpArr[i] = Math.max(0, hpArr[i]-Math.floor(dmg*0.4));
      });
    }

    update(time, delta){
      // Rune flow
      const addRune = (delta/1000)*this.runeRegenPerSec;
      this.state.left.rune = Math.min(this.runeMax, this.state.left.rune + addRune);
      this.state.right.rune = Math.min(this.runeMax, this.state.right.rune + addRune);

      // HUD updates
      const mm = Math.floor(Math.max(0, this.matchTimeMs - this.elapsedMs)/60000);
      const ss = Math.floor((Math.max(0, this.matchTimeMs - this.elapsedMs)%60000)/1000).toString().padStart(2,'0');
      this.hudTimer.setText(`${mm}:${ss}`);
      this.hudRuneLeft.setText(`Rune L: ${Math.floor(this.state.left.rune)}`);
      this.hudRuneRight.setText(`Rune R: ${Math.floor(this.state.right.rune)}`);

      // AI turns
      this.aiLeft.update(time);
      this.aiRight.update(time);

      // Units: acquire target (enemy unit closest in range else nearest tower in lane axis)
      for (const u of this.units){
        if (u.hp<=0){ u.sprite.destroy(); u.dead=true; continue; }
        // acquire target
        let target = null;
        let minD = Infinity;
        for (const v of this.units){
          if (v.dead || v.side===u.side) continue;
          const d = Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,v.sprite.x,v.sprite.y);
          if (d<minD){ minD=d; target=v; }
        }
        // if no unit target, aim nearest tower horizontally
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

        // move toward target if out of range
        if (target){
          const tx = target.sprite.x; const ty = target.sprite.y;
          const d = Phaser.Math.Distance.Between(u.sprite.x,u.sprite.y,tx,ty);
          if (d > (u.range||60)){
            const vx = ((tx - u.sprite.x)/d) * (u.speed||50) * (delta/1000);
            const vy = ((ty - u.sprite.y)/d) * (u.speed||50) * (delta/1000);
            u.sprite.x += vx; u.sprite.y += vy;
          } else {
            // deal damage per second scaled by delta
            const dmg = (u.dps||40) * (delta/1000);
            if (target.isTower){
              const hpArr = target.hpRef; const i = target.idx;
              hpArr[i] = Math.max(0, hpArr[i]-dmg);
            } else {
              target.hp -= dmg;
            }
          }
        }
      }
      // cleanup dead
      this.units = this.units.filter(u=>!u.dead);

      // Sigil control (simple proximity tug-of-war)
      let leftProx=0, rightProx=0;
      const sx=this.sigil.x, sy=this.sigil.y;
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

      // Match timer
      this.elapsedMs += delta;
      const remaining = Math.max(0, this.matchTimeMs - this.elapsedMs);
      // Win conditions: tower destruction majority, or sigil capture, or HP sum tiebreaker
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
      // reward local progression
      const player = loadPlayer() || { rp:0, shards:0, deck:[...DEFAULT_DECK] };
      if (winner==='left') { player.rp += 10; player.shards += 5; }
      else { player.rp += 5; player.shards += 2; }
      savePlayer(player);
      this.scene.restart();
    }
  }

  // ----- Balance Simulation (Phase 5) -----
  function runBalanceSimulation(){
    const NUM = 100;
    let leftWins=0, rightWins=0;
    for (let i=0;i<NUM;i++){
      // extremely lightweight stat-only sim: random plays under rune budget
      let leftRune=10, rightRune=10;
      let leftHP=2400, rightHP=2400;
      for (let t=0;t<180;t+=2){ // steps
        leftRune=Math.min(10,leftRune+0.2); rightRune=Math.min(10,rightRune+0.2);
        const leftPlay = CARD_LIBRARY.filter(c=>c.type!=='champion' && (c.cost||0)<=leftRune);
        const rightPlay = CARD_LIBRARY.filter(c=>c.type!=='champion' && (c.cost||0)<=rightRune);
        if (leftPlay.length>0){ const c=leftPlay[Math.floor(Math.random()*leftPlay.length)]; leftRune-=c.cost||0; rightHP -= (c.dps||50)*0.3; }
        if (rightPlay.length>0){ const c=rightPlay[Math.floor(Math.random()*rightPlay.length)]; rightRune-=c.cost||0; leftHP -= (c.dps||50)*0.3; }
        if (leftHP<=0 || rightHP<=0) break;
      }
      if (leftHP>rightHP) leftWins++; else if (rightHP>leftHP) rightWins++; else (Math.random()<0.5? leftWins++:rightWins++);
    }
    const leftWR = Math.round((leftWins/NUM)*100);
    const rightWR = 100-leftWR;
    // Auto-tune: if left excessively strong, slightly scale down a random Ignis card cost
    if (leftWR>55){
      const ignis = CARD_LIBRARY.filter(c=>c.house==='Ignis' && c.cost>1);
      if (ignis.length){ ignis[0].cost -= 1; console.info('[BalanceSim] Nerfing Ignis cost by -1 for', ignis[0].id); }
    }
    console.info(`[BalanceSim] Simulated ${NUM} matches. Left WR: ${leftWR}%, Right WR: ${rightWR}%`);
  }

  // ----- Boot Game -----
  const config = {
    type: Phaser.AUTO,
    parent: 'game-root',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#0b1020',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [PreloadScene, GameScene],
    physics: { default:'arcade' },
    fps: { target:60, forceSetTimeOut:true }
  };

  runBalanceSimulation();
  const game = new Phaser.Game(config);
})();


