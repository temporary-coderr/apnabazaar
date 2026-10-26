<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Jaora Bazaar - Apna Local Bazaar</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" rel="stylesheet">
<style>
:root{--bg:#FFFBF5;--card:#FFFFFF;--ink:#1A1A1A;--muted:#6B7280;--line:#F3E8D3;--orange:#FF6B2C;--orange-light:#FFF0E6;--radius:20px;--shadow:0 8px 32px rgba(0,0,0,0.06)}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--ink)}
.wrap{max-width:1200px;margin:0 auto;padding:0 20px}.top{position:sticky;top:0;z-index:50;background:rgba(255,251,245,0.92);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}
.top-inner{display:flex;justify-content:space-between;align-items:center;height:72px}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:22px}.brand-icon{width:40px;height:40px;background:var(--orange);border-radius:12px;display:grid;place-items:center;color:#fff}
.btn{padding:10px 18px;border-radius:999px;font-weight:600;font-size:14px;text-decoration:none;border:1px solid var(--line);background:var(--card);color:var(--ink)}
.btn-primary{background:var(--ink);color:#fff;border-color:var(--ink)}
.hero{padding:48px 0 32px;display:grid;grid-template-columns:1.1fr 0.9fr;gap:40px;align-items:center}
.hero h1{font-family:'Fraunces',serif;font-size:clamp(36px,5vw,58px);line-height:0.95}.hero h1 em{color:var(--orange);font-style:normal}
.hero p{font-size:18px;color:var(--muted);margin:16px 0}
.filters{position:sticky;top:72px;z-index:40;background:rgba(255,251,245,0.95);backdrop-filter:blur(16px);padding:14px 0;border-bottom:1px solid var(--line);margin-bottom:20px}
.search{flex:1;min-width:260px;position:relative}.search input{width:100%;padding:13px 18px 13px 42px;border-radius:999px;border:1px solid var(--line);background:var(--card)}
.chip{padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--card);font-weight:600;font-size:13px;cursor:pointer}
.chip.active{background:var(--ink);color:#fff;border-color:var(--ink)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
.card{background:var(--card);border-radius:20px;padding:18px;border:1px solid var(--line);box-shadow:var(--shadow);transition:0.2s}
.card:hover{transform:translateY(-3px)}
.badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:999px;text-transform:uppercase}
.badge-cat{background:var(--orange-light);color:var(--orange)}.badge-open{background:#ECFDF5;color:#0E9F6E}
.title{font-weight:700;font-size:17px;margin:8px 0 2px}.meta{font-size:13px;color:var(--muted)}
.actions{display:flex;gap:8px;margin-top:12px}
.act{flex:1;padding:9px;border-radius:11px;font-weight:600;font-size:13px;text-align:center;border:1px solid var(--line);background:var(--card);text-decoration:none;color:var(--ink);cursor:pointer}
.act-primary{background:var(--ink);color:#fff;border-color:var(--ink)}
@media(max-width:800px){.hero{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="top"><div class="wrap"><div class="top-inner">
<div class="brand"><div class="brand-icon">🛍</div>Jaora Bazaar</div>
<div style="display:flex;gap:8px"><a class="btn" href="./shop/">Shop Login</a><a class="btn btn-primary" href="#shops">Explore →</a></div>
</div></div></div>
<div class="wrap">
<div class="hero"><div>
<h1>Apna local bazaar — <em>Jaora, Raghogarh ka apna.</em></h1>
<p>Local dukaan, grocery, kapde, electronics, khana — sab kuch ek jagah.</p>
<div style="display:flex;gap:20px;margin-top:12px"><div><b id="totalShops" style="font-size:26px">0</b><div style="font-size:11px;color:#6B7280">SHOPS LIVE</div></div><div><b style="font-size:26px">Jaora</b><div style="font-size:11px;color:#6B7280">CITY ACTIVE</div></div></div>
</div>
<div style="background:var(--card);border-radius:20px;padding:16px;border:1px solid var(--line);box-shadow:var(--shadow)">
<div style="font-size:11px;color:#6B7280;margin-bottom:10px">POPULAR IN JAORA</div>
<div style="padding:8px 0;border-bottom:1px solid var(--line)">⚡ Sharma Electricals · Bima Road</div>
<div style="padding:8px 0;border-bottom:1px solid var(--line)">👕 Raghogarh Fashion · Main Market</div>
<div style="padding:8px 0">🥦 Fresh Mart · Rajgarh</div>
</div></div>
<div class="filters"><div style="display:flex;gap:10px;flex-wrap:wrap">
<div class="search"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%)">🔍</span><input id="searchBox" placeholder="Search shops, Bima Road..."/></div>
<select id="townFilter" class="chip" style="padding:11px 14px"><option value="">All Towns</option><option value="Jaora">Jaora</option><option value="Raghogarh">Raghogarh</option><option value="Rajgarh">Rajgarh</option></select>
<select id="catFilter" class="chip" style="padding:11px 14px"><option value="">All Categories</option><option>Grocery</option><option>Clothing</option><option>Electronics</option><option>Food</option><option>Beauty</option></select>
</div></div>
<div id="shops" class="grid"></div>
<div id="empty" style="display:none;text-align:center;padding:50px;color:#6B7280">No shops found — Approve shops in admin</div>
</div>
<!-- USE SAME WORKING FIREBASE LOGIC AS OLD customer.js - This worked well before! -->
<script type="module">
import { firebaseConfig } from './js/firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, increment } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let allShops = [];
async function loadShops(){
  try{
    console.log('Loading shops from Firebase...');
    // SAME QUERY THAT WORKED BEFORE - approved == true
    const q = query(collection(db, 'shops'), where('approved', '==', true));
    const snap = await getDocs(q);
    console.log('Shops fetched:', snap.size);
    allShops = snap.docs.map(d => ({id:d.id, ...d.data()}));
    document.getElementById('totalShops').textContent = allShops.length;
    renderShops(allShops);
  }catch(e){
    console.error('Load error:', e);
    // FALLBACK - Show all shops if approved filter fails - This also worked
    try{
      const q2 = query(collection(db, 'shops'));
      const snap2 = await getDocs(q2);
      console.log('Fallback - All shops:', snap2.size);
      allShops = snap2.docs.map(d => ({id:d.id, ...d.data()}));
      document.getElementById('totalShops').textContent = allShops.length;
      renderShops(allShops);
    }catch(e2){ console.error(e2); document.getElementById('empty').style.display='block'; }
  }
}
function renderShops(list){
  const grid = document.getElementById('shops');
  const empty = document.getElementById('empty');
  if(list.length===0){ grid.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  grid.innerHTML = list.map(s => `
    <div class="card">
      <div style="display:flex;justify-content:space-between"><span class="badge badge-cat">${s.category||'Shop'}</span><span class="badge badge-open">● Open</span></div>
      <div class="title">${s.name||'Shop'}</div>
      <div class="meta">📍 ${s.area||''} ${s.city||''} · ${s.open||'09:00'} - ${s.close||'09:00'}</div>
      <div class="actions">
        <a class="act act-primary" href="tel:${s.phone}" onclick="track('${s.id}','callClicks')">📞 Call</a>
        <a class="act" href="https://wa.me/91${s.phone}" target="_blank" onclick="track('${s.id}','bookClicks')">💬 WhatsApp</a>
        <a class="act" href="${s.map||'#'}" target="_blank" onclick="track('${s.id}','mapClicks')">📍 Map</a>
      </div>
    </div>
  `).join('');
}
// TRACK VIEWS/CLICKS - But DON'T SHOW to customer - Only increment in Firebase for admin
window.track = async (id, field) => {
  try{
    // Increment counter + views (for admin private analytics)
    await updateDoc(doc(db, 'shops', id), { [field]: increment(1), views: increment(1) });
  }catch(e){ console.log('track error', e.code); }
}
function filter(){
  const term = (document.getElementById('searchBox').value||'').toLowerCase();
  const town = document.getElementById('townFilter').value;
  const cat = document.getElementById('catFilter').value;
  let f = allShops.filter(s => {
    const search = !term || (s.name+s.area+s.city+s.category).toLowerCase().includes(term);
    const t = !town || s.city===town;
    const c = !cat || s.category===cat;
    return search && t && c;
  });
  renderShops(f);
}
document.getElementById('searchBox').addEventListener('input', filter);
document.getElementById('townFilter').addEventListener('change', filter);
document.getElementById('catFilter').addEventListener('change', filter);
loadShops();
</script>
</body>
</html>
