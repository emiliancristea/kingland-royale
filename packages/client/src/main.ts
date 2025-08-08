import Phaser from 'phaser';
import { STARTER_DECK, type MatchInit, type ServerState, type LaneId } from '@kingland/shared';

const WS_URL = (import.meta as any).env?.VITE_WS_URL ?? ((location.protocol === 'https:' ? 'wss://' : 'ws://') + (location.hostname || 'localhost') + ':8080');

class GameScene extends Phaser.Scene {
  private ws?: WebSocket;
  private playerId?: string;
  private state?: ServerState;
  private laneLeftX = 160;
  private laneRightX = 480;
  private boardHeight = 640;
  private unitSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private manaText?: Phaser.GameObjects.Text;
  private sigilText?: Phaser.GameObjects.Text;

  preload() {}

  create() {
    const g = this.add.graphics();
    g.lineStyle(2, 0x334455, 1);
    g.strokeRect(80, 40, 480, this.boardHeight);
    g.lineBetween(80, 40 + this.boardHeight / 2, 560, 40 + this.boardHeight / 2);
    // lane guides
    g.lineBetween(this.laneLeftX, 40, this.laneLeftX, 40 + this.boardHeight);
    g.lineBetween(this.laneRightX, 40, this.laneRightX, 40 + this.boardHeight);

    this.manaText = this.add.text(320, 32, 'Mana: 0', { color: '#7fd1ff' }).setOrigin(0.5, 0);
    this.sigilText = this.add.text(320, 16, 'Sigil: 0% / 0%', { color: '#fff' }).setOrigin(0.5, 0);

    const queueBtn = document.getElementById('queue') as HTMLButtonElement;
    const status = document.getElementById('status') as HTMLSpanElement;

    queueBtn.onclick = () => {
      this.connect();
      status.textContent = 'Queueing...';
    };

    // HUD cards
    const hud = document.createElement('div');
    hud.className = 'hud';
    document.body.appendChild(hud);

    STARTER_DECK.cards.slice(0, 4).forEach((cardId) => {
      const el = document.createElement('div');
      el.className = 'card';
      el.textContent = cardId.replace(/_.*/, '');
      el.onclick = () => this.enableDeploy(cardId);
      hud.appendChild(el);
    });

    // click to deploy
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.ws || !this.playerId) return;
      const x = pointer.x;
      const yPx = pointer.y;
      const lane: LaneId = Math.abs(x - this.laneLeftX) < Math.abs(x - this.laneRightX) ? 'left' : 'right';
      const yNorm = Phaser.Math.Clamp((yPx - 40) / this.boardHeight, 0, 1);
      const msg = { t: 'deploy_card', cardId: this.selectedCardId ?? 'ignis_skirmishers', lane, y: yNorm } as const;
      this.ws.send(JSON.stringify(msg));
    });
  }

  private selectedCardId?: string;
  private enableDeploy(cardId: string) {
    this.selectedCardId = cardId;
  }

  private connect() {
    this.ws = new WebSocket(WS_URL);
    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({ t: 'join_queue', name: 'Player' }));
      const status = document.getElementById('status') as HTMLSpanElement;
      status.textContent = 'Connected';
    };
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.t === 'match_start') {
        const payload = msg.payload as MatchInit;
        this.playerId = payload.playerId;
        this.state = payload.initialState;
      } else if (msg.t === 'state_delta') {
        this.state = msg.payload as ServerState;
      }
    };
  }

  update() {
    if (!this.state) return;
    const myMana = Object.entries(this.state.mana).find(([id]) => id === this.playerId)?.[1] ?? 0;
    this.manaText?.setText(`Mana: ${myMana.toFixed(1)} / 10`);

    const ids = Object.keys(this.state.sigil.charge);
    const a = this.state.sigil.charge[ids[0]]?.toFixed(0) ?? '0';
    const b = this.state.sigil.charge[ids[1]]?.toFixed(0) ?? '0';
    this.sigilText?.setText(`Sigil: ${a}% / ${b}%`);

    // render or update units
    const seen = new Set<string>();
    for (const u of this.state.units) {
      seen.add(u.id);
      let sprite = this.unitSprites.get(u.id);
      if (!sprite) {
        sprite = this.add.rectangle(0, 0, 16, 16, 0xff6633).setOrigin(0.5);
        this.unitSprites.set(u.id, sprite);
      }
      const x = u.lane === 'left' ? this.laneLeftX : this.laneRightX;
      const y = 40 + u.pos.y * this.boardHeight;
      sprite.setPosition(x, y);
    }
    // remove stale
    for (const [id, s] of this.unitSprites.entries()) {
      if (!seen.has(id)) {
        s.destroy();
        this.unitSprites.delete(id);
      }
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 640,
  height: 800,
  parent: 'app',
  backgroundColor: '#0d0f14',
  scene: [GameScene]
};

new Phaser.Game(config);