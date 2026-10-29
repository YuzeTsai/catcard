'use strict';
// Gift cards (`"gift": true` in cards.json) are handed to every player automatically, with a loud pop-up.
// Pop-up rules: at most once per browser session, and at most GIFT_MAX_SHOWS times in total.
const GIFT_MAX_SHOWS=5;
window.giftShowing=false;

function giftShown(id){try{return Number(localStorage.getItem(`meowverse-gift-${id}`))||0;}catch{return GIFT_MAX_SHOWS;}}
function showGift(c){
  const n=giftShown(c.id)+1;
  try{localStorage.setItem(`meowverse-gift-${c.id}`,String(n));sessionStorage.setItem(`meowverse-gift-${c.id}`,'1');}catch{}
  $('#gift-card').innerHTML=cardMarkup(c);
  $('#gift-name').textContent=c.name;
  $('#gift-skill').textContent=`專屬技能 ★ ${c.ex.n}・數值與 R 卡相同`;
  $('#gift-note').textContent=c.giftNote||'';
  $('#gift-dev').hidden=!c.giftNote;
  $('#gift-left').textContent=n<GIFT_MAX_SHOWS?`這則提醒還會再出現 ${GIFT_MAX_SHOWS-n} 次`:'這是最後一次提醒，卡片已收藏在你的圖鑑裡';
  window.giftShowing=true;
  $('#gift-dialog').showModal();
}
function runGifts(){
  const gifts=cards.filter(c=>c.gift);
  if(gifts.some(c=>!state.owned[c.id])){gifts.forEach(c=>{if(!state.owned[c.id])state.owned[c.id]=1;});save();renderStats();renderCollection();}
  const next=gifts.find(c=>{try{return giftShown(c.id)<GIFT_MAX_SHOWS&&!sessionStorage.getItem(`meowverse-gift-${c.id}`);}catch{return false;}});
  if(next)showGift(next);
}
function closeGift(){$('#gift-dialog').close();}
$('#gift-ok').addEventListener('click',closeGift);
$('#gift-view').addEventListener('click',()=>{closeGift();showTab('collection');});
$('#gift-dialog').addEventListener('close',()=>{window.giftShowing=false;document.dispatchEvent(new Event('giftclosed'));});
if(cards.length)runGifts();else document.addEventListener('cards-ready',runGifts,{once:true});
