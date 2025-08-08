import { CARD_LIBRARY } from '../data/cards.js';

export function runBalanceSimulation(){
  const NUM = 100;
  let leftWins=0, rightWins=0;
  for (let i=0;i<NUM;i++){
    let leftRune=10, rightRune=10;
    let leftHP=2400, rightHP=2400;
    for (let t=0;t<180;t+=2){
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
  if (leftWR>55){
    const ignis = CARD_LIBRARY.filter(c=>c.house==='Ignis' && c.cost>1);
    if (ignis.length){ ignis[0].cost -= 1; console.info('[BalanceSim] Nerfing Ignis cost by -1 for', ignis[0].id); }
  }
  console.info(`[BalanceSim] Simulated ${NUM} matches. Left WR: ${leftWR}%, Right WR: ${rightWR}%`);
}


