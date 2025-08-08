export const HOUSES = ['Ignis','Frost','Aqua','Verdant'];

export const CARD_LIBRARY = [
  { id:'ignis_spearman', house:'Ignis', name:'Ember Spearman', type:'troop', cost:2, hp:180, dps:45, range:80, speed:60, role:'anti-air poke', ability:'bonus vs air', synergy:['ignite'], visual:'small red-orange circle' },
  { id:'ignis_brute', house:'Ignis', name:'Magma Brute', type:'troop', cost:4, hp:520, dps:70, range:40, speed:40, role:'frontline', ability:'on-death burn', synergy:['ignite'], visual:'large lava-red circle' },
  { id:'ignis_harpy', house:'Ignis', name:'Ash Harpy', type:'troop', cost:3, hp:220, dps:55, range:90, speed:90, role:'aerial dps', ability:'airborne', synergy:['air'], visual:'red triangle' },
  { id:'ignis_flameburst', house:'Ignis', name:'Flameburst', type:'spell', cost:3, damage:180, radius:90, effect:'aoe burn', synergy:['ignite'], visual:'orange pulse' },
  { id:'ignis_champion', house:'Ignis', name:'Pyrelord Kael', type:'champion', cost:5, hp:800, dps:95, range:60, speed:55, role:'pressure', ability:'ignite aura', synergy:['ignite'], visual:'glowing red crown' },

  { id:'frost_archer', house:'Frost', name:'Glacier Archer', type:'troop', cost:2, hp:160, dps:40, range:120, speed:55, role:'ranged poke', ability:'slow on hit', synergy:['freeze'], visual:'pale blue circle' },
  { id:'frost_guard', house:'Frost', name:'Iceguard', type:'troop', cost:4, hp:560, dps:60, range:40, speed:35, role:'tank', ability:'damage reduction aura', synergy:['freeze'], visual:'blue square' },
  { id:'frost_owl', house:'Frost', name:'Snow Owl', type:'troop', cost:3, hp:200, dps:50, range:100, speed:85, role:'air support', ability:'reveal invisible (not used)', synergy:['vision'], visual:'light blue triangle' },
  { id:'frost_nova', house:'Frost', name:'Frost Nova', type:'spell', cost:3, damage:100, radius:110, effect:'aoe slow + chip', synergy:['freeze'], visual:'icy pulse' },
  { id:'frost_champion', house:'Frost', name:'Lady Skadi', type:'champion', cost:5, hp:820, dps:85, range:70, speed:50, role:'control', ability:'cone slow', synergy:['freeze'], visual:'glowing blue crown' },

  { id:'aqua_myrmidon', house:'Aqua', name:'Myrmidon', type:'troop', cost:3, hp:360, dps:60, range:50, speed:60, role:'melee fighter', ability:'splash vs clustered', synergy:['tide'], visual:'teal circle' },
  { id:'aqua_siren', house:'Aqua', name:'Siren', type:'troop', cost:2, hp:140, dps:42, range:110, speed:65, role:'ranged glass', ability:'brief charm (not used)', synergy:['tide'], visual:'cyan circle' },
  { id:'aqua_leviathan', house:'Aqua', name:'Leviathan Whelp', type:'troop', cost:4, hp:480, dps:75, range:60, speed:45, role:'bruiser', ability:'tide surge', synergy:['tide'], visual:'blue-green square' },
  { id:'aqua_tsunami', house:'Aqua', name:'Tsunami', type:'spell', cost:4, damage:150, radius:130, effect:'pushback + damage', synergy:['tide'], visual:'blue wave' },
  { id:'aqua_champion', house:'Aqua', name:'Queen Nerida', type:'champion', cost:5, hp:780, dps:100, range:55, speed:55, role:'pressure', ability:'water shield', synergy:['tide'], visual:'glowing cyan crown' },

  { id:'verdant_ranger', house:'Verdant', name:'Grove Ranger', type:'troop', cost:2, hp:170, dps:44, range:115, speed:60, role:'ranged', ability:'bleed on crit (not used)', synergy:['growth'], visual:'green circle' },
  { id:'verdant_treant', house:'Verdant', name:'Treant', type:'troop', cost:4, hp:600, dps:65, range:40, speed:30, role:'tank wall', ability:'root nearby (slow)', synergy:['growth'], visual:'dark green square' },
  { id:'verdant_sprite', house:'Verdant', name:'Sprite', type:'troop', cost:3, hp:240, dps:58, range:90, speed:85, role:'flanker', ability:'heal pulse on deploy', synergy:['growth'], visual:'lime triangle' },
  { id:'verdant_thorns', house:'Verdant', name:'Thornfield', type:'spell', cost:3, damage:130, radius:100, effect:'aoe slow + damage over time', synergy:['growth'], visual:'green spikes' },
  { id:'verdant_champion', house:'Verdant', name:'Warden Faela', type:'champion', cost:5, hp:840, dps:88, range:60, speed:50, role:'sustain', ability:'regenerate aura', synergy:['growth'], visual:'glowing green crown' },

  { id:'neutral_miners', house:'Neutral', name:'Sky Miners', type:'troop', cost:2, hp:260, dps:40, range:40, speed:55, role:'cycle unit', ability:'bonus to buildings', synergy:['economy'], visual:'gray circle' },
  { id:'neutral_bomb', house:'Neutral', name:'Rune Bomb', type:'spell', cost:2, damage:140, radius:80, effect:'burst', synergy:['economy'], visual:'yellow pulse' },
];

export const DEFAULT_DECK = [
  'ignis_spearman','ignis_flameburst','frost_archer','aqua_myrmidon','verdant_ranger','neutral_miners','frost_nova','verdant_thorns'
];

export function getCard(id){ return CARD_LIBRARY.find(c=>c.id===id); }


