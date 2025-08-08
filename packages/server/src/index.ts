import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type {
  ClientToServerMessage,
  ServerToClientMessage,
  MatchInit,
  PlayerPublic,
  ServerState,
  StructureState,
  UnitState,
  LaneId,
} from '@kingland/shared';
import { STARTER_DECK, getManaCost, SIGIL_CENTER_Y, SIGIL_RADIUS } from '@kingland/shared';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

interface ClientCtx {
  id: string;
  name: string;
  ws: WebSocket;
  matchId?: string;
}

interface MatchCtx {
  id: string;
  players: ClientCtx[]; // 2 players
  state: ServerState;
  lastTick: number;
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[server] WebSocket listening on ws://localhost:${PORT}`);

const queue: ClientCtx[] = [];
const matches = new Map<string, MatchCtx>();

wss.on('connection', (ws) => {
  const client: ClientCtx = { id: uuidv4(), name: 'Warden', ws };
  console.log(`[server] client connected ${client.id}`);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(String(raw)) as ClientToServerMessage;
      handleMessage(client, msg);
    } catch (err) {
      console.error('bad message', err);
      send(client, { t: 'error', message: 'Invalid message' });
    }
  });

  ws.on('close', () => {
    console.log(`[server] client disconnected ${client.id}`);
    // TODO: cleanup from queue/match
  });
});

function send(ctx: ClientCtx, msg: ServerToClientMessage) {
  ctx.ws.send(JSON.stringify(msg));
}

function handleMessage(client: ClientCtx, msg: ClientToServerMessage) {
  if (msg.t === 'join_queue') {
    client.name = msg.name || 'Warden';
    queue.push(client);
    tryStartMatch();
  } else if (msg.t === 'deploy_card') {
    const match = getMatchByClient(client);
    if (!match) return;
    deployCard(match, client.id, msg.cardId, msg.lane, msg.y);
  }
}

function tryStartMatch() {
  while (queue.length >= 2) {
    const a = queue.shift()!;
    const b = queue.shift()!;
    startMatch([a, b]);
  }
}

function startMatch(players: ClientCtx[]) {
  const id = uuidv4();
  const now = Date.now();
  const state: ServerState = {
    timeMs: 0,
    mana: { [players[0].id]: 5, [players[1].id]: 5 },
    units: [],
    structures: createStructures(players[0].id, players[1].id),
    crowns: { [players[0].id]: 0, [players[1].id]: 0 },
    sigil: { charge: { [players[0].id]: 0, [players[1].id]: 0 } },
  };
  const match: MatchCtx = { id, players, state, lastTick: now };
  matches.set(id, match);
  players.forEach((p) => (p.matchId = id));
  const payloadA: MatchInit = {
    matchId: id,
    you: pub(players[0]),
    opponent: pub(players[1]),
    playerId: players[0].id,
    initialState: state,
  };
  const payloadB: MatchInit = {
    matchId: id,
    you: pub(players[1]),
    opponent: pub(players[0]),
    playerId: players[1].id,
    initialState: state,
  };
  send(players[0], { t: 'match_start', payload: payloadA });
  send(players[1], { t: 'match_start', payload: payloadB });
  console.log(`[server] match ${id} started`);
}

function pub(p: ClientCtx): PlayerPublic {
  return { playerId: p.id, name: p.name };
}

function createStructures(p0: string, p1: string): StructureState[] {
  const baseHp = 2000;
  return [
    { id: uuidv4(), ownerId: p0, type: 'outpost', lane: 'left', pos: { x: -2, y: 0.25 }, hp: 1200, maxHp: 1200 },
    { id: uuidv4(), ownerId: p0, type: 'outpost', lane: 'right', pos: { x: 2, y: 0.25 }, hp: 1200, maxHp: 1200 },
    { id: uuidv4(), ownerId: p0, type: 'keep', pos: { x: 0, y: 0.1 }, hp: baseHp, maxHp: baseHp },

    { id: uuidv4(), ownerId: p1, type: 'outpost', lane: 'left', pos: { x: -2, y: 0.75 }, hp: 1200, maxHp: 1200 },
    { id: uuidv4(), ownerId: p1, type: 'outpost', lane: 'right', pos: { x: 2, y: 0.75 }, hp: 1200, maxHp: 1200 },
    { id: uuidv4(), ownerId: p1, type: 'keep', pos: { x: 0, y: 0.9 }, hp: baseHp, maxHp: baseHp },
  ];
}

function getMatchByClient(client: ClientCtx): MatchCtx | undefined {
  if (!client.matchId) return undefined;
  return matches.get(client.matchId);
}

function deployCard(match: MatchCtx, playerId: string, cardId: string, lane: LaneId, y: number) {
  const mana = match.state.mana[playerId] ?? 0;
  const cost = getManaCost(cardId);
  if (mana < cost) return;
  // restrict y to own half
  const isTop = isTopPlayer(match, playerId);
  if (isTop && y < 0.5) return;
  if (!isTop && y > 0.5) return;

  match.state.mana[playerId] = mana - cost;
  // spawn a simple unit representing the card
  const id = uuidv4();
  const startY = y;
  const pos = { x: lane === 'left' ? -1 : 1, y: startY };
  const hp = cardId.includes('tank') ? 600 : cardId.includes('champ') ? 900 : 200;
  const unit: UnitState = { id, ownerId: playerId, cardId, lane, pos, hp };
  match.state.units.push(unit);
}

function isTopPlayer(match: MatchCtx, playerId: string): boolean {
  // players[1] is top side (y decreasing), players[0] is bottom side (y increasing)
  return match.players[1].id === playerId;
}

// Game loop
const TICK_MS = 50; // 20 Hz
setInterval(() => {
  const now = Date.now();
  for (const match of matches.values()) {
    const dt = now - match.lastTick;
    if (dt <= 0) continue;
    stepMatch(match, dt);
    match.lastTick = now;
    for (const p of match.players) {
      send(p, { t: 'state_delta', payload: match.state });
    }
  }
}, TICK_MS);

function stepMatch(match: MatchCtx, dtMs: number) {
  const dt = dtMs / 1000;
  match.state.timeMs += dtMs;

  // mana regen ramp (1.0 -> 1.5 -> 2.0 per sec at 0s/60s/120s)
  const tSec = match.state.timeMs / 1000;
  const regen = tSec < 60 ? 1.0 : tSec < 120 ? 1.5 : 2.0;
  for (const p of match.players) {
    match.state.mana[p.id] = Math.min(10, (match.state.mana[p.id] ?? 0) + dt * regen);
  }

  // move units along lane
  for (const u of match.state.units) {
    const top = isTopPlayer(match, u.ownerId);
    const dir = top ? -1 : 1;
    u.pos.y += dir * 0.12 * dt; // base speed
  }

  // simple combat: units near enemy structures deal dps; remove dead structures
  for (const s of match.state.structures) {
    for (const u of match.state.units) {
      if (u.ownerId === s.ownerId) continue;
      if (s.lane && s.lane !== u.lane) continue;
      const dy = Math.abs(u.pos.y - s.pos.y);
      if (dy < 0.02) {
        s.hp -= 40 * dt; // simple dps
      }
    }
  }
  match.state.structures = match.state.structures.filter((s) => s.hp > 0);

  // Sigil capture: units near center increase owner charge, decrease opponent
  const owners = match.players.map((p) => p.id);
  const presence: Record<string, number> = { [owners[0]]: 0, [owners[1]]: 0 };
  for (const u of match.state.units) {
    if (Math.abs(u.pos.y - SIGIL_CENTER_Y) <= SIGIL_RADIUS) {
      presence[u.ownerId] += 1;
    }
  }
  const diff = presence[owners[0]] - presence[owners[1]];
  const ratePerSec = 12; // percent per second at 1 unit advantage
  if (diff !== 0) {
    const advId = diff > 0 ? owners[0] : owners[1];
    const defId = diff > 0 ? owners[1] : owners[0];
    const delta = Math.min(100, Math.abs(diff)) * ratePerSec * dt;
    match.state.sigil.charge[advId] = Math.min(100, (match.state.sigil.charge[advId] ?? 0) + delta);
    match.state.sigil.charge[defId] = Math.max(0, (match.state.sigil.charge[defId] ?? 0) - delta * 0.5);
  }
}