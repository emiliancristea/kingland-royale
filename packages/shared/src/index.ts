export type House = 'Ignis' | 'Frost' | 'Aqua' | 'Verdant' | 'Neutral';

export type CardType = 'Troop' | 'Spell' | 'Champion';

export interface CardDefinition {
  id: string;
  name: string;
  house: House;
  type: CardType;
  manaCost: number;
  data: TroopData | SpellData | ChampionData;
}

export interface TroopData {
  role: 'melee' | 'ranged' | 'tank' | 'siege' | 'support' | 'swarm';
  maxHp: number;
  damagePerSecond: number;
  attackRange: number; // tiles
  moveSpeed: number; // tiles per second
  count?: number; // for squads
  description?: string;
}

export interface SpellData {
  effect: 'nuke' | 'pull' | 'root' | 'heal' | 'buff';
  power: number;
  radius?: number;
  description?: string;
}

export interface ChampionData extends TroopData {
  activeAbility?: {
    name: string;
    cooldownSeconds: number;
    description: string;
  };
}

export type LaneId = 'left' | 'right';

export interface MatchInit {
  matchId: string;
  you: PlayerPublic;
  opponent: PlayerPublic;
  playerId: string;
  initialState: ServerState;
}

export interface PlayerPublic {
  playerId: string;
  name: string;
}

export interface Vector2 { x: number; y: number; }

export interface UnitState {
  id: string;
  ownerId: string;
  cardId: string;
  lane: LaneId;
  pos: Vector2; // y is along lane [0..1], x offset from center
  hp: number;
}

export interface StructureState {
  id: string;
  ownerId: string;
  type: 'outpost' | 'keep';
  lane?: LaneId; // outposts have lane
  pos: Vector2;
  hp: number;
  maxHp: number;
}

export interface SigilState {
  // Charge by playerId, 0..100
  charge: Record<string, number>;
}

export interface ServerState {
  timeMs: number;
  mana: Record<string, number>; // by playerId
  units: UnitState[];
  structures: StructureState[];
  crowns: Record<string, number>;
  sigil: SigilState;
}

export type ClientToServerMessage =
  | { t: 'join_queue'; name: string }
  | { t: 'deploy_card'; cardId: string; lane: LaneId; y: number } // y in [0..0.5)
  | { t: 'activate_champion' };

export type ServerToClientMessage =
  | { t: 'match_start'; payload: MatchInit }
  | { t: 'state_delta'; payload: ServerState }
  | { t: 'error'; message: string };

export const CARDS: CardDefinition[] = [
  {
    id: 'ignis_skirmishers',
    name: 'Blazeguard Skirmishers',
    house: 'Ignis',
    type: 'Troop',
    manaCost: 2,
    data: {
      role: 'melee',
      maxHp: 180,
      damagePerSecond: 90,
      attackRange: 0.5,
      moveSpeed: 0.22,
      count: 2,
      description: 'Melee duo with ember procs'
    }
  },
  {
    id: 'frost_wardens',
    name: 'Winter Wardens',
    house: 'Frost',
    type: 'Troop',
    manaCost: 3,
    data: {
      role: 'tank',
      maxHp: 400,
      damagePerSecond: 40,
      attackRange: 0.5,
      moveSpeed: 0.18,
      count: 2,
      description: 'Tank pair with slow aura'
    }
  },
  {
    id: 'aqua_runners',
    name: 'Tide Runners',
    house: 'Aqua',
    type: 'Troop',
    manaCost: 3,
    data: {
      role: 'swarm',
      maxHp: 120,
      damagePerSecond: 60,
      attackRange: 0.5,
      moveSpeed: 0.26,
      count: 3,
      description: 'Fast trio; quicker near river'
    }
  },
  {
    id: 'verdant_sentinel',
    name: 'Grove Sentinel',
    house: 'Verdant',
    type: 'Troop',
    manaCost: 4,
    data: {
      role: 'tank',
      maxHp: 500,
      damagePerSecond: 55,
      attackRange: 0.6,
      moveSpeed: 0.17,
      description: 'Roots on first hit'
    }
  },
  {
    id: 'neutral_stoneslinger',
    name: 'Stone Slinger',
    house: 'Neutral',
    type: 'Troop',
    manaCost: 3,
    data: {
      role: 'ranged',
      maxHp: 150,
      damagePerSecond: 70,
      attackRange: 3.0,
      moveSpeed: 0.2,
      description: 'Ranged siege specialist'
    }
  },
  {
    id: 'ignis_spell_cinderburst',
    name: 'Cinderburst',
    house: 'Ignis',
    type: 'Spell',
    manaCost: 3,
    data: {
      effect: 'nuke',
      power: 140,
      radius: 1.2,
      description: 'Small AoE nuke with burn'
    }
  },
  {
    id: 'champ_pyrelord',
    name: 'Pyrelord Barik',
    house: 'Ignis',
    type: 'Champion',
    manaCost: 6,
    data: {
      role: 'melee',
      maxHp: 900,
      damagePerSecond: 160,
      attackRange: 0.6,
      moveSpeed: 0.2,
      activeAbility: {
        name: 'Flame Nova',
        cooldownSeconds: 18,
        description: 'Cone burst disarm briefly'
      },
      description: 'Overheats for attack speed'
    }
  }
];

export function getCardById(id: string): CardDefinition | undefined {
  return CARDS.find(c => c.id === id);
}

export function getManaCost(cardId: string): number {
  const def = getCardById(cardId);
  return def?.manaCost ?? 3;
}

export const SIGIL_CENTER_Y = 0.5;
export const SIGIL_RADIUS = 0.05; // normalized lane distance

export interface Deck {
  cards: string[]; // length 8, IDs
}

export const STARTER_DECK: Deck = {
  cards: [
    'ignis_skirmishers',
    'frost_wardens',
    'aqua_runners',
    'verdant_sentinel',
    'neutral_stoneslinger',
    'ignis_spell_cinderburst',
    'champ_pyrelord',
    'ignis_skirmishers'
  ]
};