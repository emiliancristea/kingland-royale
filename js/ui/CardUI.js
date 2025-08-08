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
  const width = options.width ?? 110;
  const height = options.height ?? Math.round(width * 1.35);
  const corner = Math.max(10, Math.round(width * 0.12));
  const border = Math.max(2, Math.round(width * 0.06));
  const houseColor = HOUSE_COLORS[card.house] ?? HOUSE_COLORS.Neutral;

  const container = scene.add.container(x, y);

  // Shadow
  const gShadow = scene.add.graphics();
  gShadow.fillStyle(0x000000, 0.3);
  gShadow.fillRoundedRect(4, 6, width, height, corner);
  container.add(gShadow);

  // Background
  const gBg = scene.add.graphics();
  gBg.fillStyle(0x0b1020, 0.95);
  gBg.fillRoundedRect(0, 0, width, height, corner);
  // House strip at top
  gBg.fillStyle(houseColor, 0.9);
  gBg.fillRoundedRect(0, 0, width, Math.max(16, Math.round(height*0.12)), { tl: corner, tr: corner, bl: 0, br: 0 });
  // Border
  gBg.lineStyle(border, 0x334155, 1);
  gBg.strokeRoundedRect(0, 0, width, height, corner);
  container.add(gBg);

  // Icon (simple symbol by type)
  const iconG = scene.add.graphics();
  const iconY = Math.round(height*0.38);
  if (card.type === 'spell'){
    iconG.fillStyle(0xffa94d, 1).fillCircle(width*0.5, iconY, width*0.18);
  } else {
    iconG.fillStyle(0x22d3ee, 1).fillCircle(width*0.5, iconY, width*0.18);
  }
  container.add(iconG);

  // Cost badge (top-left)
  const badge = scene.add.graphics();
  const r = Math.max(14, Math.round(width*0.18));
  badge.fillStyle(0x111827, 1).fillCircle(r+8, r+8, r);
  badge.lineStyle(2, houseColor, 1).strokeCircle(r+8, r+8, r);
  container.add(badge);
  const costText = scene.add.text(r+8, r+8, String(card.cost ?? 0), { fontFamily:'system-ui', fontSize: `${Math.max(14, Math.round(width*0.22))}px`, color:'#e2e8f0' }).setOrigin(0.5);
  container.add(costText);

  // Name label (bottom)
  const nameText = scene.add.text(width*0.5, height - 10, card.name, { fontFamily:'system-ui', fontSize: `${Math.max(12, Math.round(width*0.16))}px`, color:'#e2e8f0', align:'center', wordWrap:{ width: width-12 } }).setOrigin(0.5, 1);
  container.add(nameText);

  // Make container bounds for input
  container.setSize(width, height);
  container.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);

  // Helpers
  container.setAffordable = (affordable)=>{
    container.setAlpha(affordable? 1.0 : 0.45);
  };
  container.setSelected = (selected)=>{
    gBg.lineStyle(selected? border+1 : border, selected? houseColor : 0x334155, 1);
    gBg.strokeRoundedRect(0, 0, width, height, corner);
  };
  container.cardId = card.id;
  container.cardData = card;
  return container;
}


