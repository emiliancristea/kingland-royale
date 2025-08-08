export class PreloadScene extends Phaser.Scene{
  constructor(){ super('preload'); }
  preload(){
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


