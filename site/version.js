'use strict';
// Update pop-up: shown once per version to returning players, and reopenable from the footer.
// To announce a new update, change `version`, `title`, `items` and `note` below.
const UPDATE={
  version:'4.1',
  date:'2026-10-27',
  title:'故事冒險、夥伴小貓與雲端同步',
  items:[
    '新增「冒險」：走一段雨夜的故事，領養一隻屬於你的小貓，還能幫牠取名字。',
    '5 隻夥伴小貓住在首頁，每日任務會用牠的名字，對戰時還會幫你的隊伍加成。',
    '新增 24 張 VOL.04 卡片，卡池一共 118 張。',
    '新增選用的 Google 登入同步，換裝置也能繼承進度。',
    '新增「隊伍代碼」，可以把自己的隊伍傳給朋友對戰。'],
  note:'謝謝你打開喵宇宙！\n這個小遊戲是用我們家貓咪的日常照片做的，一開始只有 40 張卡，現在已經長到 118 張了。\n這次最想讓你看看的是故事冒險：每一個選擇，都會帶你遇見不同的小貓。\n願你每天都有一點小小的、毛茸茸的開心。'};
const SEEN_KEY='meowverse-seen-version';
const UPDATE_LOG='https://github.com/YuzeTsai/catcard/blob/main/README.md#版本更新紀錄';

function showUpdate(){
  $('#update-ver').textContent=`VERSION ${UPDATE.version} · ${UPDATE.date}`;
  $('#update-heading').textContent=UPDATE.title;
  $('#update-list').replaceChildren(...UPDATE.items.map(t=>Object.assign(document.createElement('li'),{textContent:t})));
  $('#update-note').textContent=UPDATE.note;
  $('#update-log').href=UPDATE_LOG;
  if(!$('#update-dialog').open)$('#update-dialog').showModal();
}
function markSeen(){try{localStorage.setItem(SEEN_KEY,UPDATE.version);}catch{}}
$('#show-update').textContent=`v${UPDATE.version} 更新說明`;
$('#show-update').addEventListener('click',showUpdate);
$('#update-ok').addEventListener('click',()=>$('#update-dialog').close());
$('#close-update').addEventListener('click',()=>$('#update-dialog').close());
$('#update-dialog').addEventListener('close',markSeen);
(function(){
  let seen=null,hasSave=false;
  try{seen=localStorage.getItem(SEEN_KEY);hasSave=!!localStorage.getItem(KEY);}catch{return;}
  if(seen===UPDATE.version)return;
  if(!seen&&!hasSave){markSeen();return;}// brand-new player: nothing "updated" for them yet
  if(new URLSearchParams(location.search).has('team'))return;// opened from a friend's battle invite
  setTimeout(showUpdate,700);
})();
