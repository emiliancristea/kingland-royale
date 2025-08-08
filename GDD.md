## Kingland: Royale — Game Design Document (GDD)

### 1. High Concept
- Kingland: Royale is a real-time, mobile-first 1v1 card battler inspired by Clash Royale. Battles last 3–4 minutes across three lanes on floating sky-islands. Players deploy units and spells using a regenerating resource (“Rune Flow”) to destroy towers or capture a central Sigil.

### 2. Lore & Worldbuilding (Phase 1)
- Setting: The sky-realm of Kingland—shards of islands suspended above a roiling storm. Centuries ago, the Crown Citadel shattered in a cataclysm that scattered Royal Sigils across the realm.
- Factions (Houses):
  - Ignis (Fire) — aggressive, attrition through burn. Leader: High Regent Kael; Champion: Pyrelord Kael.
  - Frost (Ice) — control and slows. Leader: Lady Skadi; Champion: Lady Skadi.
  - Aqua (Water) — fluid tempo and push/pull control. Leader: Queen Nerida; Champion: Queen Nerida.
  - Verdant (Nature) — sustain and growth. Leader: Warden Faela; Champion: Warden Faela.
- Core Narrative: The Houses vie to reclaim Royal Sigils from the ruins, but the spreading Void Corruption threatens to swallow the sky-isles. Alliances form and break; the Crown’s legacy is at stake.
- Champions (per House):
  - Ignis: Pyrelord Kael — ignite aura.
  - Frost: Lady Skadi — cone slow.
  - Aqua: Queen Nerida — water shield.
  - Verdant: Warden Faela — regeneration aura.

### 3. Core Gameplay Loop (Phase 2)
- Match: 1v1, 3–4 minutes, three horizontal lanes. Each side has two outer towers; optional central Sigil capture grants alternate win condition.
- Resource: Rune Flow regenerates to a cap of 10. Cards cost runes to deploy.
- Win: Destroy opposing towers (tower advantage on timeout), or capture the Sigil by presence.
- Progression: Earn Sigil Shards (card upgrades) and Royal Points (profile progression, cosmetics). For the prototype, progression persists via localStorage.

### 4. Cards & Combat (Phase 3)
- Card Types: troop, spell, champion.
- Minimum Card Set:
  - Each House: 3 troops, 1 spell, 1 champion (defined in code JSON-like objects).
  - Neutral: 2 cards (one troop, one spell).
- Data Fields: id, house, name, type, cost, stats (hp/dps/range/speed), abilities, synergies, visual.
- Behaviors: Units advance toward nearest enemy, attack when in range. Spells apply instant radial effects (damage/slow). Simple proximity control of the central Sigil.
- Targeting: Units choose the nearest enemy unit; else target the nearest enemy tower.

### 5. UI/UX & Controls (Phase 4)
- Layout: Fullscreen canvas auto-scaled to device. Top HUD (timer planned), bottom card hand (implicit in prototype as cheapest-card tap deploy). Touch-first; tap anywhere to deploy an affordable unit/spell at tap position.
- Gestures: Drag-and-drop hand for full version; prototype uses tap deploy for clarity on mobile.
- Screens: Main menu and meta screens are out-of-scope for the static MVP; match starts immediately. Future: matchmaking, deck management, upgrades, post-match results.

### 6. Automated Testing & Simulation (Phase 5)
- Headless Simulation: 100 AI vs. AI matches are approximated by a stat-only loop to infer win-rate tendencies and apply micro-tuning to outlier house costs (example: nerf Ignis if left-side bias is detected). Results output to console.
- Balancing Strategy: Keep costs within 1–5, adjust in small increments, avoid cascading swings.

### 7. Technical Design (Phase 6)
- Stack: Phaser 3 via CDN, no build system required. Static files only: `index.html`, `css/styles.css`, `js/*` (ES modules).
- Scenes: `PreloadScene` (generate procedural textures) and `GameScene` (arena, units, towers, spells, simple AIs, rune flow, win logic). Now modularized under `js/scenes/*`.
- Modules: `js/core/*` (constants, storage), `js/data/*` (cards), `js/systems/*` (ai, balance), `js/scenes/*`.
- Data: Card library defined in JSON-friendly objects within `main.js`.
- Persistence: Player profile with Royal Points and Sigil Shards saved in `localStorage`.
- Performance: 60fps target with minimal draw calls; simple shapes as textures.

### 7.1 Frontend Architecture
- ES Module entry: `js/main.js` wires Phaser config and scenes.
- Global Phaser via CDN; modules reference `Phaser` from window context.
- Separation of concerns: rendering/scene vs. systems (AI, balance), data (cards), core utilities (storage, constants).

### 7.2 Art Direction
- See `ART_STYLE.md` for palettes, silhouettes, and VFX guidance.

### 8. Content Summary (Cards)
- Ignis: Ember Spearman (troop, anti-air), Magma Brute (frontline), Ash Harpy (air), Flameburst (spell, AoE burn), Pyrelord Kael (champion, ignite aura).
- Frost: Glacier Archer (slow on hit), Iceguard (tank), Snow Owl (air support), Frost Nova (spell slow), Lady Skadi (champion).
- Aqua: Myrmidon (splash), Siren (glass cannon), Leviathan Whelp (bruiser), Tsunami (push), Queen Nerida (champion).
- Verdant: Grove Ranger (ranged), Treant (tank wall), Sprite (flanker heal), Thornfield (DoT slow), Warden Faela (champion).
- Neutral: Sky Miners (anti-building), Rune Bomb (burst spell).

### 9. Roadmap
- MVP: Playable local match, Rune Flow, three lanes, towers, simple AI, tap-to-deploy, Sigil capture, local progression save, balance sim.
- Stretch: Full card hand UI with drag-and-drop, deck builder, matchmaking UI, animations/VFX, audio, replays, tournaments, clans, cosmetics.

### 10. Risks & Mitigations
- Touch precision on small screens — larger hit areas, clamp deploy positions.
- Balance swing — automated sim + conservative tuning deltas.
- Performance on low-end devices — use generated textures, reduce update complexity.


