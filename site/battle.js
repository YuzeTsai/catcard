'use strict';
// Card battle: 3v3, turn based. Types counter each other (皮 > 懶 > 萌 > 皮).
// Every card gets "喵喵拳" + a few skills from its type's shared pool (more for higher rarity);
// SSR / SEC cards also carry an exclusive skill defined as `ex` in cards.json.
// Skill fields: hit (power), heal, guard (blunts next hit), weak (foe deals 30% less for 2 turns),
// charge (next hit x1.6), drain (heal share of damage), pierce (ignores type and shield).
const TYPE_ICON={萌:'💗',懶:'💤',皮:'⚡'};
const BEATS={皮:'懶',懶:'萌',萌:'皮'};
const BASE={N:[20,10,4],R:[22,11,4],SR:[24,11,5],SSR:[27,12,5],SEC:[28,12,6]};// mood (hp), cuteness (atk), fluff shield (def)
const SKILL_COUNT={N:1,R:2,SR:3,SSR:3,SEC:3};
const RARITIES=['N','R','SR','SSR','SEC'];
const BASIC={n:'喵喵拳',hit:8};
const POOL={
萌:[{n:'撒嬌攻勢',hit:13},{n:'水汪汪大眼',weak:1},{n:'呼嚕按摩',heal:6},{n:'蹭蹭小腿',hit:10,drain:.5},{n:'賣萌護體',guard:1},{n:'歪頭殺',hit:15},{n:'軟萌蓄力',charge:1},{n:'奶音喵喵',weak:1,heal:3},{n:'愛心光波',hit:14},{n:'肉球連拍',hit:12}],
懶:[{n:'裝睡',guard:1},{n:'攤成貓餅',heal:7},{n:'泰山壓頂',hit:14},{n:'打哈欠',weak:1},{n:'沙發深陷',guard:1,heal:3},{n:'曬太陽充電',heal:5,charge:1},{n:'懶洋洋拳',hit:12},{n:'睡意蔓延',weak:1,hit:6},{n:'伸懶腰',charge:1},{n:'窩著吸精氣',hit:9,drain:.7}],
皮:[{n:'打翻杯子',hit:15},{n:'衝刺跑酷',hit:13},{n:'咬咬手',hit:9,drain:.6},{n:'飛撲',hit:17},{n:'夜間狂奔',charge:1},{n:'抓沙發',hit:12},{n:'躲進紙箱',guard:1},{n:'突然發瘋',hit:16},{n:'瞪眼',weak:1},{n:'偷吃零食',heal:6}]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function pickSkills(card){// deterministic per card, so a card always has the same moves
  const pool=POOL[card.type]||POOL.萌;
  const picked=pool.map((s,i)=>[Math.imul(card.id*9301+i*49297+233280,2654435761)>>>0,s]).sort((a,b)=>a[0]-b[0]).slice(0,SKILL_COUNT[card.rarity]).map(x=>x[1]);
  return [BASIC,...picked,...(card.ex?[{...card.ex,ex:1}]:[])];
}
function fighter(card,aura={}){// aura: your companion's team bonus (see story.js)
  const [hp,atk,def]=BASE[card.rarity],a=(card.id*7)%3-1,b=(card.id*5)%3-1,max=hp+a*2+(aura.hp||0);
  return{card,type:card.type||'萌',max,hp:max,atk:atk+a+(aura.atk||0),def:def+b+(aura.def||0),hb:aura.hb||0,adv:aura.adv||1.5,skills:pickSkills(card),cd:new Map(),guard:false,weak:0,charge:false};
}
function skillText(s){
  return [s.hit&&`傷害 ${s.hit}`,s.heal&&`回復 ${s.heal}`,s.drain&&'吸取心情',s.guard&&'擋下下一擊',s.weak&&'對手氣勢下降',s.charge&&'下次更強',s.pierce&&'無視相剋與護盾'].filter(Boolean).join('・');
}
function battleInfo(card){
  const f=fighter(card);
  return `${TYPE_ICON[f.type]}${f.type}屬性・心情 ${f.max}・萌力 ${f.atk}・護盾 ${f.def}\n技能：${f.skills.map(s=>(s.ex?'★':'')+s.n).join('、')}`;
}
function ready(f,s){return !(f.cd.get(s)>0);}
function tick(f){for(const [s,v] of f.cd)if(v>0)f.cd.set(s,v-1);}

function useSkill(a,d,s){
  const o={dmg:0,heal:0,mult:1,notes:[]};
  if(s.hit){
    if(!s.pierce){if(BEATS[a.type]===d.type)o.mult=a.adv;else if(BEATS[d.type]===a.type)o.mult=.7;}
    let x=s.hit*a.atk/10*o.mult;
    if(a.charge){x*=1.6;a.charge=false;o.notes.push('蓄力爆發！');}
    if(a.weak>0)x*=.7;
    if(!s.pierce)x-=d.def*.6;
    x=Math.max(2,Math.min(Math.round(x),Math.round(d.max*.7)));// never more than 70% of max in one hit
    if(d.guard&&!s.pierce){x=Math.max(1,Math.round(x*.4));d.guard=false;o.notes.push('被擋下大半！');}
    d.hp=Math.max(0,d.hp-x);o.dmg=x;
    if(s.drain){const h=Math.round(x*s.drain);a.hp=Math.min(a.max,a.hp+h);o.heal+=h;}
  }
  if(s.heal){const h=Math.min(s.heal+a.hb,a.max-a.hp);a.hp+=h;o.heal+=h;}
  if(s.guard){a.guard=true;o.notes.push('擺出防禦姿勢');}
  if(s.weak){d.weak=2;o.notes.push('對手氣勢下降');}
  if(s.charge){a.charge=true;o.notes.push('正在蓄力');}
  if(a.weak>0)a.weak--;
  if(s!==BASIC)a.cd.set(s,s.ex||!s.hit?3:2);// exclusive and non-attack moves rest longer
  return o;
}
function cpuPick(f){
  const ok=f.skills.filter(s=>ready(f,s));
  if(f.hp<f.max*.4){const h=ok.filter(s=>s.heal);if(h.length&&randomUnit()<.7)return h[Math.floor(randomUnit()*h.length)];}
  const hits=ok.filter(s=>s.hit).sort((a,b)=>b.hit-a.hit);
  return hits.length&&randomUnit()<.75?hits[0]:ok[Math.floor(randomUnit()*ok.length)];
}
function cpuTeam(mine){// opponent cards match your rarity, sometimes one tier off
  const used=new Set();
  return mine.map(f=>{
    const i=RARITIES.indexOf(f.card.rarity),u=randomUnit();
    const r=RARITIES[f.card.rarity==='SEC'?i:u<.6?i:u<.8?Math.max(0,i-1):Math.min(3,i+1)];
    const pool=cards.filter(c=>c.rarity===r&&!used.has(c.id));
    const c=pool[Math.floor(randomUnit()*pool.length)];
    used.add(c.id);return fighter(c);
  });
}

// Team code: MEOW-<id>-<id>-<id>-<check>. Friends fight your team, played by the computer (no reward).
const checksum=ids=>(ids[0]*31+ids[1]*17+ids[2]*7)%97;
const teamCode=ids=>`MEOW-${ids.join('-')}-${checksum(ids)}`;
function parseCode(text){
  const m=String(text).toUpperCase().match(/MEOW-(\d+)-(\d+)-(\d+)-(\d+)/);
  if(!m)return null;
  const ids=m.slice(1,4).map(Number);
  if(checksum(ids)!==Number(m[4])||new Set(ids).size<3||!ids.every(id=>cards.some(c=>c.id===id)))return null;
  return ids;
}
const inviteLink=ids=>`${location.origin}${location.pathname}?team=${teamCode(ids)}`;
async function copyText(text,done){try{await navigator.clipboard.writeText(text);toast(done);}catch{prompt('複製這段文字：',text);}}

// ---- UI ----
let B=null;
const ownedCards=()=>cards.filter(c=>state.owned[c.id]).sort((a,b)=>RARITIES.indexOf(b.rarity)-RARITIES.indexOf(a.rarity)||a.id-b.id);
function tile(c,sel){return `<button class="bt-tile ${sel?'sel':''}" type="button" data-pick="${c.id}" data-type="${c.type}"><img src="${c.image}" alt="" loading="lazy"><span class="bt-tile-name">${c.name}</span><span class="bt-tile-meta">${TYPE_ICON[c.type]}${c.type}・${c.rarity}</span></button>`;}
function renderBattleView(){
  if(!cards.length||!$('#bt-pool'))return;
  const mine=ownedCards(),ids=new Set(mine.map(c=>c.id));
  state.team=(state.team||[]).filter(id=>ids.has(id)).slice(0,3);
  $('#bt-team').innerHTML=[0,1,2].map(i=>{const c=cards.find(x=>x.id===state.team[i]);return c?tile(c,true):'<div class="bt-slot">空位</div>';}).join('');
  $('#bt-pool').innerHTML=mine.map(c=>tile(c,state.team.includes(c.id))).join('');
  const need=Math.max(0,3-mine.length);
  $('#bt-pet').textContent=typeof activeKitten==='function'&&activeKitten()?`🐾 夥伴 ${petName()} 的加成：${activeKitten().auraText}`:'🐾 到「冒險」領養一隻小貓，牠會在對戰時為你的隊伍加成。';
  $('#bt-start').disabled=state.team.length<3;
  ['#bt-copy-code','#bt-copy-link','#bt-friend-go'].forEach(s=>$(s).disabled=state.team.length<3);
  $('#bt-note').textContent=need?`還需要再收集 ${need} 張卡，才能組成隊伍。`:state.team.length<3?`再選 ${3-state.team.length} 張卡出戰。`:'隊伍準備好了！';
}
function pickCard(id){
  id=Number(id);if(!state.owned[id])return;
  state.team=state.team.includes(id)?state.team.filter(x=>x!==id):state.team.length<3?[...state.team,id]:state.team;
  save();renderBattleView();
}
function side(team,idx,mine){
  const f=team[idx];
  return `<div class="bt-fighter" data-type="${f.type}"><img src="${f.card.image}" alt="${f.card.name}"><div class="bt-info"><div class="bt-name">${f.card.name}</div><div class="bt-meta">${TYPE_ICON[f.type]}${f.type}・${f.card.rarity}・萌力 ${f.atk}・護盾 ${f.def}</div><div class="bt-hp"><i style="width:${f.hp/f.max*100}%"></i></div><div class="bt-num">${mine?'我方':B.friend?'朋友':'對手'}心情 ${f.hp}/${f.max}${f.guard?' 🛡':''}${f.weak>0?' ↓':''}${f.charge?' ✦':''}</div><div class="bench">${team.map((t,i)=>`<span class="dot ${t.hp?'':'ko'} ${i===idx?'cur':''}"></span>`).join('')}</div></div></div>`;
}
function renderBattle(){
  $('#bt-cpu').innerHTML=side(B.cpu,B.ci,false);
  $('#bt-me').innerHTML=side(B.me,B.mi,true);
  const f=B.me[B.mi];
  $('#bt-skills').innerHTML=B.over?'':f.skills.map((s,i)=>{const cd=f.cd.get(s)||0,off=cd>0||B.busy;return `<button class="bt-skill ${s.ex?'ex':''}" data-skill="${i}" ${off?'disabled':''}><b>${s.ex?'★ ':''}${s.n}</b><small>${cd>0?`休息 ${cd} 回合`:skillText(s)}</small></button>`;}).join('');
}
function pop(sel,text,cls){const el=$(`${sel} .bt-fighter`);if(!el)return;const p=document.createElement('span');p.className=`bt-pop ${cls}`;p.textContent=text;el.append(p);setTimeout(()=>p.remove(),900);}
function say(lines){$('#bt-log').innerHTML=lines.join('<br>');}
function hasAlive(t){return t.some(f=>f.hp>0);}
function nextAlive(t,i){return t[i].hp>0?i:t.findIndex(f=>f.hp>0);}

async function act(a,d,s,atkSel,defSel){
  const run=B.run,o=useSkill(a,d,s);
  const lines=[`${a.card.name} 使出「${s.n}」！`];
  const eff=[];
  if(o.dmg)eff.push(`造成 ${o.dmg} 點打擊${o.mult>1?'，效果拔群！':o.mult<1?'，效果不太好…':''}`);
  if(o.heal)eff.push(`回復 ${o.heal} 點心情`);
  eff.push(...o.notes);
  if(eff.length)lines.push(eff.join('・'));
  if(!d.hp)lines.push(`${d.card.name} 不想玩了…`);
  say(lines);renderBattle();
  if(o.dmg)pop(defSel,`-${o.dmg}`,'dmg');
  if(o.heal)pop(atkSel,`+${o.heal}`,'heal');
  await sleep(1000);
  return run===B?.run;
}
async function myAct(i){
  if(!B||B.over||B.busy)return;
  const me=B.me[B.mi],cpu=B.cpu[B.ci],s=me.skills[i];
  if(!s||!ready(me,s))return;
  B.busy=true;renderBattle();
  if(!await act(me,cpu,s,'#bt-me','#bt-cpu'))return;
  if(!cpu.hp){
    if(!hasAlive(B.cpu))return finish(true);
    B.ci=nextAlive(B.cpu,B.ci);
  }
  if(++B.turns>80)return finish(null);
  await cpuTurn();
}
async function cpuTurn(){
  const run=B.run,cpu=B.cpu[B.ci],me=B.me[B.mi];
  tick(cpu);
  const s=cpuPick(cpu);
  if(!await act(cpu,me,s,'#bt-cpu','#bt-me'))return;
  if(!me.hp){
    if(!hasAlive(B.me))return finish(false);
    B.mi=nextAlive(B.me,B.mi);
  }
  if(++B.turns>80)return finish(null);
  if(run!==B.run)return;
  tick(B.me[B.mi]);B.busy=false;renderBattle();
  say([`輪到你了！選一個技能。`]);
}
function finish(win){
  B.over=true;B.busy=false;renderBattle();
  let msg;
  if(B.friend)msg=win===true?'你贏了朋友的隊伍！🎉 友誼賽不計獎勵與勝場。':win===false?'朋友的隊伍比較強…再試一次，或換個隊伍！':'打了太久，大家都累了，這場平手。';
  else if(win===true){
    state.wins++;
    const r=grantGameReward(B.date);
    msg=r==='ok'?'你贏了！🎉 抽卡券 +1，已經放進口袋。':r==='quota'?'你贏了！🎉 今天的 3 次獎勵已經領完，這場是練習賽。':'你贏了！🎉 新的一天開始了，重新挑戰即可領取今天的獎勵。';
    save();renderStats();
  }else msg=win===false?'這次輸了…不過每張貓咪都是冠軍，再試一次！':'打了太久，大家都累了，這場平手。';
  say([msg]);$('#bt-again').hidden=false;
}
function startBattle(friend){// friend = card ids of a friend's team (played by the computer), none = random opponent
  if(state.team.length<3)return;
  ensureDaily();
  const aura=typeof activeAura==='function'?activeAura():{},me=state.team.map(id=>fighter(cards.find(c=>c.id===id),aura));
  B={me,cpu:friend?friend.map(id=>fighter(cards.find(c=>c.id===id))):cpuTeam(me),friend:friend||null,mi:0,ci:0,turns:0,over:false,busy:false,date:taipeiDate(),run:(B?.run||0)+1};
  $('#bt-again').hidden=true;
  tick(B.me[0]);renderBattle();
  say([typeof petName==='function'&&petName()?`🐾 ${petName()} 為隊伍加油：${activeKitten().auraText}`:'',friend?'友誼賽開始！（不計獎勵）選一個技能。':state.daily.games>=3?'今天的獎勵已領完，這場是練習賽。':'對戰開始！選一個技能。'].filter(Boolean));
  if(!$('#battle-dialog').open)$('#battle-dialog').showModal();
}

$('#bt-pool').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b)pickCard(b.dataset.pick);});
$('#bt-team').addEventListener('click',e=>{const b=e.target.closest('[data-pick]');if(b)pickCard(b.dataset.pick);});
$('#bt-start').addEventListener('click',()=>startBattle());
$('#bt-again').addEventListener('click',()=>startBattle(B&&B.friend));
$('#bt-skills').addEventListener('click',e=>{const b=e.target.closest('[data-skill]');if(b)myAct(Number(b.dataset.skill));});
$('#close-battle').addEventListener('click',()=>$('#battle-dialog').close());
$('#battle-dialog').addEventListener('close',()=>{if(B)B.run++;});
$('#bt-copy-code').addEventListener('click',()=>copyText(teamCode(state.team),'隊伍代碼已複製，傳給朋友吧 ✦'));
$('#bt-copy-link').addEventListener('click',()=>copyText(inviteLink(state.team),'邀請連結已複製，傳給朋友吧 ✦'));
$('#bt-friend-go').addEventListener('click',()=>{const ids=parseCode($('#bt-code').value);if(!ids){toast('代碼無法辨識，請確認有貼完整（例如 MEOW-13-50-2-6）');return;}startBattle(ids);});
const invite=new URLSearchParams(location.search).get('team');// opened from a friend's invite link
if(invite){$('#bt-code').value=invite;showTab('battle');toast('收到朋友的挑戰！選好你的隊伍，再按「挑戰朋友」');}
if(cards.length)renderBattleView();
