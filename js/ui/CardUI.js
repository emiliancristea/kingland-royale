// Reusable Phaser card component
// Creates a container with a styled card frame, cost badge, icon, and name

const HOUSE_COLORS = {
  Ignis: 0xff6b6b,
  Frost: 0x60a5fa,
  Aqua: 0x22d3ee,
  Verdant: 0x34d399,
  Neutral: 0xcbd5e1,
};

export function createCardUI(scene, card, x, y, options = {}){
  const width = options.width ?? 120;
  const height = options.height ?? Math.round(width * 1.5);
  const corner = Math.max(10, Math.round(width * 0.12));
  const border = Math.max(2, Math.round(width * 0.06));
  const houseColor = HOUSE_COLORS[card.house] ?? HOUSE_COLORS.Neutral;
  const variant = options.variant ?? 'detailed';
  const hoverLift = options.hoverLift ?? true;

  const container = scene.add.container(x, y);

  // Shadow
  const gShadow = scene.add.graphics();
  gShadow.fillStyle(0x000000, 0.35);
  gShadow.fillRoundedRect(4, 6, width, height, corner);
  container.add(gShadow);

  // Background + header strip
  const gBg = scene.add.graphics();
  gBg.fillStyle(0x0b1020, 0.98);
  gBg.fillRoundedRect(0, 0, width, height, corner);
  gBg.fillStyle(houseColor, 0.92);
  const headerH = Math.max(18, Math.round(height*0.14));
  gBg.fillRoundedRect(0, 0, width, headerH, { tl: corner, tr: corner, bl: 0, br: 0 });
  // Border
  gBg.lineStyle(border, 0x334155, 1).strokeRoundedRect(0, 0, width, height, corner);
  container.add(gBg);

  // Cost gem (top-left)
  const r = Math.max(14, Math.round(width*0.18));
  const badge = scene.add.graphics();
  badge.fillStyle(0x111827, 1).fillCircle(r+8, r+8, r);
  badge.lineStyle(2, houseColor, 1).strokeCircle(r+8, r+8, r);
  container.add(badge);
  const costText = scene.add.text(r+8, r+8, String(card.cost ?? 0), { fontFamily:'system-ui', fontSize: `${Math.max(14, Math.round(width*0.22))}px`, color:'#e2e8f0' }).setOrigin(0.5);
  container.add(costText);

  // House badge (top-right)
  const hbR = Math.max(10, Math.round(width*0.13));
  const badgeH = scene.add.graphics();
  badgeH.fillStyle(0x111827, 1).fillCircle(width - hbR - 8, hbR + 8, hbR);
  badgeH.lineStyle(2, houseColor, 1).strokeCircle(width - hbR - 8, hbR + 8, hbR);
  container.add(badgeH);
  const houseInitial = (card.house||'N')[0];
  const houseText = scene.add.text(width - hbR - 8, hbR + 8, houseInitial, { fontFamily:'system-ui', fontSize:`${Math.max(12, Math.round(width*0.18))}px`, color:'#e2e8f0' }).setOrigin(0.5);
  container.add(houseText);

  // Portrait frame area
  const pfY = headerH + Math.round(height*0.05);
  const pfH = Math.round(height*0.44);
  const gPF = scene.add.graphics();
  gPF.fillStyle(0x0f172a, 1).fillRoundedRect(Math.round(width*0.08), pfY, Math.round(width*0.84), pfH, Math.round(corner*0.5));
  gPF.lineStyle(2, 0x1e293b, 1).strokeRoundedRect(Math.round(width*0.08), pfY, Math.round(width*0.84), pfH, Math.round(corner*0.5));
  container.add(gPF);
  // Simple icon inside portrait
  const iconG = scene.add.graphics();
  const icX = width*0.5, icY = pfY + pfH*0.5;
  const icR = Math.round(width*0.18);
  const icColor = card.type==='spell'? 0xffa94d : 0x22d3ee;
  iconG.fillStyle(icColor, 1).fillCircle(icX, icY, icR);
  container.add(iconG);

  // Type pill under portrait
  const pillW = Math.round(width*0.46), pillH = Math.max(14, Math.round(width*0.16));
  const pillG = scene.add.graphics();
  const pillX = (width - pillW)/2, pillY = pfY + pfH + 6;
  pillG.fillStyle(0x0f172a, 1).fillRoundedRect(pillX, pillY, pillW, pillH, Math.round(pillH*0.5));
  pillG.lineStyle(1.5, houseColor, 1).strokeRoundedRect(pillX, pillY, pillW, pillH, Math.round(pillH*0.5));
  container.add(pillG);
  const typeText = scene.add.text(width*0.5, pillY + pillH/2, String(card.type||'card').toUpperCase(), { fontFamily:'system-ui', fontSize:`${Math.max(10, Math.round(width*0.12))}px`, color:'#e2e8f0' }).setOrigin(0.5);
  container.add(typeText);

  // Name label (bottom area)
  const nameText = scene.add.text(width*0.5, height - Math.round(width*0.34), card.name, { fontFamily:'system-ui', fontSize: `${Math.max(12, Math.round(width*0.16))}px`, color:'#e2e8f0', align:'center', wordWrap:{ width: width-12 } }).setOrigin(0.5, 0);
  container.add(nameText);

  // Stats bar (hp/dps)
  const statsY = height - Math.round(width*0.20);
  const statG = scene.add.graphics();
  statG.fillStyle(0x0f172a, 1).fillRoundedRect(Math.round(width*0.06), statsY, Math.round(width*0.88), Math.round(width*0.18), Math.round(width*0.06));
  statG.lineStyle(1.5, 0x1e293b, 1).strokeRoundedRect(Math.round(width*0.06), statsY, Math.round(width*0.88), Math.round(width*0.18), Math.round(width*0.06));
  container.add(statG);
  // Heart (HP)
  const heart = scene.add.graphics();
  const hx = Math.round(width*0.18), hy = statsY + Math.round(width*0.09);
  heart.fillStyle(0xf87171, 1);
  drawHeart(heart, hx, hy, Math.round(width*0.05));
  container.add(heart);
  const hpText = scene.add.text(hx + Math.round(width*0.06), hy, String(card.hp ?? 0), { fontFamily:'system-ui', fontSize:`${Math.max(10, Math.round(width*0.12))}px`, color:'#e2e8f0' }).setOrigin(0,0.5);
  container.add(hpText);
  // Sword (DPS)
  const sword = scene.add.graphics();
  const sx = Math.round(width*0.58), sy = statsY + Math.round(width*0.09);
  sword.fillStyle(0x93c5fd, 1);
  drawSword(sword, sx, sy, Math.round(width*0.06));
  container.add(sword);
  const dpsText = scene.add.text(sx + Math.round(width*0.06), sy, String(card.dps ?? 0), { fontFamily:'system-ui', fontSize:`${Math.max(10, Math.round(width*0.12))}px`, color:'#e2e8f0' }).setOrigin(0,0.5);
  container.add(dpsText);

  // Footer rarity stars (simple: cost-based)
  const stars = Math.max(1, Math.min(5, Math.round((card.cost||1)/1.5)));
  const starsText = scene.add.text(width*0.5, height - Math.round(width*0.06), '★'.repeat(stars), { fontFamily:'system-ui', fontSize:`${Math.max(10, Math.round(width*0.14))}px`, color:'#fbbf24' }).setOrigin(0.5,1);
  container.add(starsText);

  // Interaction affordances
  container.setSize(width, height);
  container.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
  if (hoverLift){
    container.on('pointerover', ()=>{ scene.tweens.add({ targets:container, scale:1.04, duration:120, ease:'Sine.easeOut' }); });
    container.on('pointerout',  ()=>{ scene.tweens.add({ targets:container, scale:1.00, duration:120, ease:'Sine.easeOut' }); });
  }

  // Helpers
  container.setAffordable = (affordable)=>{ container.setAlpha(affordable? 1.0 : 0.45); };
  container.setSelected = (selected)=>{
    gBg.lineStyle(selected? border+1.5 : border, selected? houseColor : 0x334155, 1).strokeRoundedRect(0, 0, width, height, corner);
  };
  container.cardId = card.id;
  container.cardData = card;
  return container;
}

function drawHeart(g, x, y, r){
  // Approximate heart: two circles + triangle
  g.beginPath();
  g.fillCircle(x - r*0.6, y - r*0.2, r*0.6);
  g.fillCircle(x + r*0.6, y - r*0.2, r*0.6);
  g.fillPoints([
    new Phaser.Geom.Point(x - r*1.2, y - r*0.1),
    new Phaser.Geom.Point(x + r*1.2, y - r*0.1),
    new Phaser.Geom.Point(x, y + r*1.2),
  ], true, true);
}

function drawSword(g, x, y, s){
  // Simple sword: blade + guard + hilt
  g.fillRect(x, y - s*0.9, s*0.22, s*1.4);
  g.fillRect(x - s*0.25, y - s*0.2, s*0.72, s*0.12);
  g.fillRect(x + s*0.02, y + s*0.5, s*0.18, s*0.3);
}


