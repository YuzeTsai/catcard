'use strict';
// Story mode: 8 scenes, 3 choices each. Every choice carries a trait; the trait you chose most decides
// which of the 5 kittens you meet (ties go to your latest choice). Adopting a kitten lets you name it,
// puts it on the home page, and gives your battle team a small bonus.
// aura: atk/def/hp = flat team bonus, hb = extra healing, adv = type-advantage multiplier (default 1.5).
const KITTENS=[
{id:'orange',trait:'勇',coat:'橘貓',name:'小橘',photo:'assets/cat-50.jpg',title:'勇敢的小太陽',hint:'喜歡不怕雨的人',aura:{atk:1},auraText:'全隊萌力 +1',
 end:'牠一進門，就把整間屋子巡了一遍，最後跳上你的膝蓋，睡得像一顆暖暖的小太陽。你忽然發現，那個獨自走過雨夜的自己，已經不需要再逞強了，因為從今以後，有牠替你勇敢。'},
{id:'tabby',trait:'沉',coat:'虎斑貓',name:'小虎',photo:'assets/cat-115.jpg',title:'沉穩的小守衛',hint:'喜歡有耐心的人',aura:{def:1},auraText:'全隊護盾 +1',
 end:'牠不吵也不鬧，每天晚上都蹲在玄關的墊子上等你開門，像一位等你下班的老朋友。你終於明白，有些陪伴不需要說話，只要有一個地方，永遠有誰為你留著一盞燈。'},
{id:'tuxedo',trait:'奇',coat:'黑白貓',name:'小墨',photo:'assets/cat-112.jpg',title:'好奇的小影子',hint:'喜歡愛探險的人',aura:{hp:3},auraText:'全隊心情值 +3',
 end:'牠總在你一轉身時，出現在不可能的地方：書架頂、窗簾後、洗衣籃裡。平凡的日子因為牠，多了一個又一個小小的謎，而你從此多了一個一起發現世界的夥伴。'},
{id:'white',trait:'溫',coat:'白貓',name:'小雲',photo:'assets/cat-61.jpg',title:'溫柔的小雲朵',hint:'喜歡溫柔的人',aura:{hb:2},auraText:'回復技能多回復 2 點',
 end:'你難過的夜裡，牠會輕輕踩上你的胸口，呼嚕呼嚕地說：沒關係，我在。你原以為是自己救了牠，後來才知道，在那個雨夜被救起來的，其實是你們兩個。'},
{id:'calico',trait:'皮',coat:'三花貓',name:'小花',photo:'assets/cat-114.jpg',title:'調皮的小搗蛋',hint:'喜歡愛玩的人',aura:{adv:1.65},auraText:'屬性相剋傷害 ×1.65（原本 ×1.5）',
 end:'牠把你桌上的東西清得乾乾淨淨，把你的襪子藏進沙發底下。可是每次你笑出聲，牠就偷偷看你一眼，彷彿在說：看吧，我就說這樣比較有趣。'}];
const STORY={title:'雨夜裡的一聲喵',intro:'下班的雨夜，你一個人走在回家的路上。巷子裡有一個很小很小的聲音，正在等一個願意停下腳步的人。'};
const SCENES=[
{n:'雨夜歸途',t:'加班後的雨夜，你撐著傘走回家。巷口的路燈閃了兩下，雨聲裡藏著一個很細很細的聲音，像有人小聲地說：「喵。」',o:[
 {t:'不假思索，衝進巷子裡',k:'勇',e:'你顧不得弄濕褲腳，腳步在水窪裡啪啪作響。'},
 {t:'蹲下來，輕輕學一聲貓叫',k:'溫',e:'你壓低聲音回了一句，巷子深處的聲音停了一下，像是在側耳聽你。'},
 {t:'屏住呼吸，先聽清楚聲音的方向',k:'沉',e:'你站了很久，終於分辨出聲音是從巷底的圍牆後面傳來的。'}]},
{n:'空紙箱',t:'巷子盡頭有一個被雨泡軟的紙箱，裡面是空的，只剩一小撮濕濕的毛，和一串小小的腳印，一路延伸到轉角。',o:[
 {t:'蹲下來，研究腳印通往哪裡',k:'奇',e:'腳印很淺，間距很大，是一隻很急著趕路的小傢伙。'},
 {t:'把紙箱頂在頭上當雨傘，跟著腳印走',k:'皮',e:'你頂著紙箱，像個奇怪的探險家，心情卻莫名輕快起來。'},
 {t:'脫下外套鋪進紙箱，再繼續追',k:'溫',e:'外套留在紙箱裡，你想著：萬一牠回來，至少有個乾的地方。'}]},
{n:'打烊的市場',t:'腳印消失在老市場裡。鐵捲門一排排拉下來，只剩一盞燈亮著。魚攤的冰桶後面，有個小小的黑影縮著，傳出一聲餓扁了的「喵」。',o:[
 {t:'在旁邊坐下來，等牠自己走出來',k:'沉',e:'你坐在濕漉漉的長凳上，看著雨從屋簷滴下，一點也不覺得急。'},
 {t:'直接伸手探進去',k:'勇',e:'你伸出手，指尖碰到一團又小又燙的毛。'},
 {t:'用手機的光慢慢照，看看牠是誰',k:'奇',e:'光圈裡，兩顆圓圓的眼睛亮了起來，像兩個小小的月亮。'}]},
{n:'暴漲的河堤',t:'小貓突然竄了出去，沿著河堤往前跑。天邊悶悶地響了一聲雷，河水漲得比平常高，堤防的石階又濕又滑。',o:[
 {t:'跟著牠跳上矮護欄，沿著邊緣追',k:'皮',e:'你張開手保持平衡，像在走一條只有你們知道的秘密小路。'},
 {t:'停下腳步，蹲低身體，等牠自己回頭',k:'沉',e:'你深呼吸，不再追了。跑出幾步的小貓，真的慢了下來，回頭看了你一眼。'},
 {t:'衝上去，一把想把牠撈起來',k:'勇',e:'你差點滑倒，卻用盡全力往前撲，只想快一點追上。'}]},
{n:'廢棄的隧道',t:'小貓鑽進一條沒人敢走的舊鐵道隧道。裡面又黑又靜，只聽得見遠處的滴水聲，你的心跳大得像擂鼓。',o:[
 {t:'打開手電筒，看牆上的舊塗鴉',k:'奇',e:'牆上有許多孩子留下的塗鴉，原來這裡也曾經很熱鬧。'},
 {t:'扶著牆，一步一步慢慢走',k:'沉',e:'你把腳步放到最輕，連呼吸都放慢了，彷彿這樣就不會嚇到黑暗。'},
 {t:'對著黑暗大喊一聲「喂——」',k:'皮',e:'回音一層一層傳回來，你忍不住笑了，忽然覺得這裡沒那麼可怕。'}]},
{n:'鐵皮棚裡的小傢伙',t:'隧道的盡頭，有一個小小的鐵皮棚。破毯子上縮著一隻比你想像更瘦的小貓，正在發抖。牠看著你，沒有逃，只是小小聲地又喊了一次。',o:[
 {t:'關掉手電筒，輕聲跟牠說話',k:'溫',e:'黑暗裡，你的聲音變得很小很小，牠的耳朵慢慢轉向你。'},
 {t:'掏出鑰匙，晃一晃逗牠',k:'皮',e:'鑰匙叮叮噹噹地響，小貓的眼睛跟著它轉，尾巴輕輕晃了一下。'},
 {t:'用外套把牠整個包起來',k:'勇',e:'你把牠抱進懷裡，感覺到一顆小小的心臟，跳得又快又用力。'}]},
{n:'天亮之前',t:'雨停了。你抱著牠走出隧道，東邊的雲裂開一道金色的縫。牠第一次抬起頭，認真地看著你，已經不再發抖。',o:[
 {t:'帶牠爬上堤防最高的地方，看日出',k:'勇',e:'你們站在最高的地方，風把牠的毛吹得亂亂的。'},
 {t:'把牠放下來，讓牠自己決定要去哪',k:'奇',e:'牠猶豫了一下，邁出一小步，又回頭看了看你。'},
 {t:'就坐在原地，陪牠把日出看完',k:'沉',e:'你們誰也沒有說話，天一點一點亮起來。'}]},
{n:'回家的路',t:'你的手機只剩 3% 的電，家就在三條街以外。小貓用小小的額頭蹭了蹭你的下巴，好像在等你說些什麼。',o:[
 {t:'「以後下雨，你不用再自己躲了。」',k:'溫',e:''},
 {t:'「先說好，沙發分你一半，但被你抓破我不負責。」',k:'皮',e:''},
 {t:'「走吧，我們一起去看這個世界還有多少沒去過的地方。」',k:'奇',e:''}]}];

const kitten=id=>KITTENS.find(k=>k.id===id);
const activeKitten=()=>state.pet&&state.pets[state.pet]?kitten(state.pet):null;
const petName=()=>activeKitten()?state.pets[state.pet].n:'';
const activeAura=()=>activeKitten()?.aura||{};
const cleanName=(s,fallback)=>Array.from(String(s).replace(/[\u0000-\u001f<>]/g,'').trim()).slice(0,8).join('')||fallback;

let S={mode:'intro',step:0,scores:{},last:{},echo:'',result:null};
function startStory(){S={mode:'scene',step:0,scores:{勇:0,沉:0,奇:0,溫:0,皮:0},last:{},echo:'',result:null};renderStory();window.scrollTo({top:0,behavior:'smooth'});}
function choose(i){
  const o=SCENES[S.step].o[i];if(!o)return;
  S.scores[o.k]++;S.last[o.k]=S.step;S.echo=o.e;S.step++;
  if(S.step>=SCENES.length){
    const top=Object.entries(S.scores).sort((a,b)=>b[1]-a[1]||(S.last[b[0]]??-1)-(S.last[a[0]]??-1))[0][0];
    S.result=KITTENS.find(k=>k.trait===top);S.mode='end';
  }
  renderStory();window.scrollTo({top:0,behavior:'smooth'});
}
function adopt(){
  const k=S.result,input=$('#story-name');
  if(!state.pets[k.id])state.pets[k.id]={n:cleanName(input?input.value:'',k.name)};
  state.pet=k.id;save();renderStats();
  toast(`「${state.pets[k.id].n}」成為你的夥伴了 ✦`);
  S.mode='intro';showTab('draw');requestAnimationFrame(()=>$('#pet-section').scrollIntoView({behavior:'smooth',block:'center'}));
}
function renderStory(){
  const el=$('#story-body');if(!el)return;
  if(S.mode==='intro'){
    el.innerHTML=`<p class="eyebrow">STORY MODE</p><h1>${STORY.title}</h1><p class="story-lead">${STORY.intro}</p><p class="story-lead">一共 ${SCENES.length} 個選擇。你怎麼走，決定誰會留在你身邊。</p><button class="primary" data-story="start">${Object.keys(state.pets).length?'再走一次這段路':'開始冒險'} ↗</button>
    <h2 class="story-sub">會遇見的 ${KITTENS.length} 隻小貓</h2><div class="kitten-grid">${KITTENS.map(k=>{const mine=state.pets[k.id];return mine?`<div class="kitten own"><img src="${k.photo}" alt=""><b>${esc(mine.n)}</b><span>${k.coat}・${k.title}</span><small>🐾 ${k.auraText}</small></div>`:`<div class="kitten"><div class="kitten-q">？</div><b>還沒遇見</b><span>${k.hint}</span></div>`;}).join('')}</div>`;
  }else if(S.mode==='scene'){
    const sc=SCENES[S.step];
    el.innerHTML=`<p class="eyebrow">第 ${S.step+1} 幕 / ${SCENES.length}・${sc.n}</p><div class="story-bar"><i style="width:${S.step/SCENES.length*100}%"></i></div>${S.echo?`<p class="story-echo">${S.echo}</p>`:''}<p class="story-text">${sc.t}</p><div class="story-choices">${sc.o.map((o,i)=>`<button class="story-choice" data-choice="${i}">${o.t}</button>`).join('')}</div>`;
  }else{
    const k=S.result,mine=state.pets[k.id];
    el.innerHTML=`<p class="eyebrow">故事結束</p><div class="ending"><img src="${k.photo}" alt="${k.coat}"><div><h2>${mine?`你又遇見了 ${esc(mine.n)}`:`你遇見了一隻${k.coat}`}</h2><p class="story-lead">${k.title}</p></div></div><p class="story-text">${k.end}</p><p class="pet-aura">🐾 對戰加成：${k.auraText}</p>${mine?`<button class="primary" data-story="home">回首頁看 ${esc(mine.n)} ↗</button><p class="story-lead">牠已經在你家了。換個選擇，說不定能遇見別的小貓。</p>`:`<label class="story-label" for="story-name">幫牠取個名字</label><input id="story-name" type="text" maxlength="8" value="${k.name}" autocomplete="off"><button class="primary" data-story="adopt">帶牠回家 ↗</button>`}`;
  }
}
function renderPet(){
  const el=$('#pet-panel');if(!el)return;
  const k=activeKitten();
  if(!k){el.innerHTML=`<div class="pet-empty"><div><p class="eyebrow">STORY MODE</p><h2>雨夜裡，有一聲喵在等你。</h2><p>走一段小小的冒險，領養一隻屬於你的小貓。牠會住在這裡，陪你完成每日任務，還會在對戰時幫你加成。</p></div><button class="primary" data-story="open">開啟故事冒險 ↗</button></div>`;return;}
  const mine=state.pets[k.id],done=state.daily.tasks.length,others=KITTENS.filter(x=>state.pets[x.id]&&x.id!==k.id);
  el.innerHTML=`<img class="pet-photo" src="${k.photo}" alt="${esc(mine.n)}"><div class="pet-main"><p class="eyebrow">MY COMPANION</p><h2 class="pet-name">${esc(mine.n)}</h2><p class="pet-line">${k.coat}・${k.title}</p><p class="pet-aura">🐾 對戰加成：${k.auraText}</p><p class="pet-line">今天已經照顧 ${esc(mine.n)} ${done} / ${DAILY_TASKS.length} 項</p></div><div class="pet-side">${others.map(x=>`<button class="pet-switch" data-pet="${x.id}" title="換成 ${esc(state.pets[x.id].n)}"><img src="${x.photo}" alt="${esc(state.pets[x.id].n)}"></button>`).join('')}<button class="secondary" data-story="open">${Object.keys(state.pets).length<KITTENS.length?'再去冒險 ↗':'重溫故事 ↗'}</button></div>`;
}
function openStory(){S.mode='intro';showTab('story');}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-story],[data-choice],[data-pet]');if(!b)return;
  if(b.dataset.pet){if(state.pets[b.dataset.pet]){state.pet=b.dataset.pet;save();renderStats();}return;}
  if(b.dataset.choice!==undefined)return choose(Number(b.dataset.choice));
  const a=b.dataset.story;
  if(a==='open')openStory();else if(a==='start')startStory();else if(a==='adopt')adopt();else if(a==='home'){S.mode='intro';showTab('draw');}
});
if(typeof cards!=='undefined'&&cards.length)renderStats();
renderPet();
