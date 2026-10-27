// Optional Google sign-in + cloud save (Firebase Auth + Firestore). The game works without it.
// This config is public by design; access is limited by the Firestore rules (each user can only read/write saves/<their uid>).
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const app=initializeApp({
  apiKey:'AIzaSyAt3elTwsTNYwA7wc_2Ak4CAWfzGaUNbzo',
  authDomain:'catcard-1c168.firebaseapp.com',
  projectId:'catcard-1c168',
  storageBucket:'catcard-1c168.firebasestorage.app',
  messagingSenderId:'390900873877',
  appId:'1:390900873877:web:f5a07bc38022e847dbf99c'});
const auth=getAuth(app),db=getFirestore(app);
const SYNC_KEY='meowverse-sync-';
let user=null,timer=null,busy=false;

// Merge two saves without ever inflating progress: every number takes the larger side, sets are unioned.
function mergeSaves(a,b){
  const m=(x,y)=>Math.max(x||0,y||0),owned={};
  for(const s of [a,b])for(const [k,v] of Object.entries(s.owned))owned[k]=m(owned[k],v);
  const pets={...b.pets,...a.pets},pet=a.pet&&pets[a.pet]?a.pet:b.pet&&pets[b.pet]?b.pet:'';
  const streak=a.streak.last>b.streak.last||(a.streak.last===b.streak.last&&a.streak.n>=b.streak.n)?a.streak:b.streak;
  const daily=a.daily.date!==b.daily.date?(a.daily.date>b.daily.date?a.daily:b.daily)
    :{date:a.daily.date,tasks:[...new Set([...(a.daily.tasks||[]),...(b.daily.tasks||[])])],games:m(a.daily.games,b.daily.games),bonus:!!(a.daily.bonus||b.daily.bonus)};
  return{owned,packs:m(a.packs,b.packs),tickets:m(a.tickets,b.tickets),best:m(a.best,b.best),wins:m(a.wins,b.wins),team:a.team,pets,pet,badges:[...new Set([...a.badges,...b.badges])],streak,daily};
}
window.mergeSaves=mergeSaves;

const ref=()=>doc(db,'saves',user.uid);
function status(text){const el=document.getElementById('cloud-status');if(el)el.textContent=text;}
async function push(){
  const t=Date.now();
  await setDoc(ref(),{data:encodeSave(state),updatedAt:t});
  localStorage.setItem(SYNC_KEY+user.uid,String(t));
  status(`☁ 已同步・${user.displayName||user.email}`);
}
// Called by save() in app.js after every change; waits a moment so bursts become one write.
window.cloudSave=()=>{
  if(!user)return;
  clearTimeout(timer);status('☁ 同步中…');
  timer=setTimeout(()=>push().catch(()=>status('☁ 同步失敗，稍後會再試')),1500);
};
async function pull(){
  busy=true;
  try{
    status('☁ 同步中…');
    const snap=await getDoc(ref());
    const lastSync=Number(localStorage.getItem(SYNC_KEY+user.uid)||0);
    if(snap.exists()&&snap.data().updatedAt>lastSync){// changed on another device, or first time on this one
      const cloud=clean(JSON.parse(decodeSave(snap.data().data)));
      if(cloud){state=clean(mergeSaves(state,cloud));save();renderStats();renderCollection();toast('已把雲端進度合併進來 ☁');}
    }
    await push();
  }catch(e){status('☁ 同步失敗，請確認網路後重新整理');console.error(e);}
  busy=false;
}

const btn=document.getElementById('cloud-btn'),note=document.getElementById('cloud-note');
btn.hidden=false;note.hidden=false;
btn.addEventListener('click',async()=>{
  if(user){await signOut(auth);return;}
  try{await signInWithPopup(auth,new GoogleAuthProvider());}
  catch(e){if(e.code!=='auth/popup-closed-by-user'&&e.code!=='auth/cancelled-popup-request')toast('登入失敗，請允許彈出視窗後再試一次');}
});
onAuthStateChanged(auth,u=>{
  user=u;
  if(u){btn.textContent='登出';pull();}
  else{btn.textContent='用 Google 登入同步';status('');}
});
