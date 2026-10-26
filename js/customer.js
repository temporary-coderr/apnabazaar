// JAORA BAZAAR - Customer App LIVE - FIXED with Views and Clicks tracking
import { db } from "./firebase-config.js";
import { collection, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allShops = [], allProducts = [], allBanners = [], allCities = [];
let viewedShops = new Set(); // Track which shops viewed in this session to avoid duplicate views

const shopsEl = document.getElementById('shops');
const productsEl = document.getElementById('products');
const bannerArea = document.getElementById('bannerArea');
const searchEl = document.getElementById('search');
const townEl = document.getElementById('town');
const catEl = document.getElementById('category');
const statusEl = document.getElementById('status');

// Increment views - Only once per session per shop
window.trackView = async (shopId)=>{
  if(viewedShops.has(shopId)) return; // Already viewed this session
  viewedShops.add(shopId);
  try{
    await updateDoc(doc(db, "shops", shopId), {
      views: increment(1),
      lastViewed: serverTimestamp()
    });
    // Also log in clicks collection for analytics
    await addDoc(collection(db, "clicks"), {
      shopId: shopId,
      type: "view",
      at: serverTimestamp(),
      city: allShops.find(s=>s.id===shopId)?.city||''
    });
    console.log("View tracked:", shopId);
  }catch(e){ console.log("View track error (may need auth):", e.message); }
};

// Track call clicks
window.trackCall = async (shopId, phone)=>{
  try{
    await updateDoc(doc(db, "shops", shopId), {
      callClicks: increment(1),
      lastCallClick: serverTimestamp()
    });
    await addDoc(collection(db, "clicks"), {
      shopId: shopId,
      type: "call",
      phone: phone,
      at: serverTimestamp()
    });
    console.log("Call click tracked:", shopId);
  }catch(e){ console.log("Call track error:", e.message); }
};

// Track map clicks
window.trackMap = async (shopId)=>{
  try{
    await updateDoc(doc(db, "shops", shopId), {
      mapClicks: increment(1),
      lastMapClick: serverTimestamp()
    });
    await addDoc(collection(db, "clicks"), {
      shopId: shopId,
      type: "map",
      at: serverTimestamp()
    });
    console.log("Map click tracked:", shopId);
  }catch(e){ console.log("Map track error:", e.message); }
};

// Track book clicks (for future booking feature)
window.trackBook = async (shopId)=>{
  try{
    await updateDoc(doc(db, "shops", shopId), {
      bookClicks: increment(1),
      lastBookClick: serverTimestamp()
    });
    await addDoc(collection(db, "clicks"), {
      shopId: shopId,
      type: "book",
      at: serverTimestamp()
    });
  }catch(e){ console.log("Book track error:", e.message); }
};

// Track banner clicks
window.trackBanner = async (bannerId)=>{
  try{
    await updateDoc(doc(db, "banners", bannerId), {
      clicks: increment(1),
      lastClick: serverTimestamp()
    });
  }catch(e){ console.log("Banner track error:", e.message); }
};

function render() {
  const q = (searchEl?.value || '').toLowerCase();
  const town = townEl?.value || '';
  const cat = catEl?.value || '';

  let shops = allShops.filter(s => {
    if (s.approved !== true) return false;
    const matchesSearch = !q || (s.name||'').toLowerCase().includes(q) || (s.area||'').toLowerCase().includes(q) || (s.city||'').toLowerCase().includes(q);
    const matchesTown = !town || s.city === town || s.town === town;
    const matchesCat = !cat || (s.category||'').toLowerCase() === cat.toLowerCase();
    return matchesSearch && matchesTown && matchesCat;
  });

  let products = allProducts.filter(p => {
    const shop = allShops.find(s => s.id === p.shopId || s.phone === p.shopPhone);
    if (!shop || shop.approved !== true) return false;
    const matchesSearch = !q || (p.name||'').toLowerCase().includes(q);
    const matchesCat = !cat || (p.category||'').toLowerCase() === cat.toLowerCase();
    const matchesTown = !town || (shop.city===town || shop.town===town);
    return matchesSearch && matchesCat && matchesTown;
  });

  if(allCities.length && townEl){
    const existingTowns = new Set([...allCities.map(c=>c.name), ...allShops.filter(s=>s.approved).map(s=>s.city).filter(Boolean)]);
    const currentTown = townEl.value;
    townEl.innerHTML = '<option value="">All towns</option>' + [...existingTowns].map(t=>`<option value="${t}">${t}</option>`).join('');
    townEl.value = currentTown;
  }

  if(shopsEl){
    if(!shops.length){
      const pending = allShops.filter(s=>s.approved!==true).length;
      if(pending>0){
        shopsEl.innerHTML = `<div class="card muted">No approved shops yet.<br>${pending} shops pending approval in admin.<br>Go to jagruk-473287-control/ -> Approve</div>`;
      } else {
        shopsEl.innerHTML = `<div class="card muted">No shops found. Admin needs to add shops</div>`;
      }
    } else {
      shopsEl.innerHTML = shops.map(s => {
        const timingText = s.open && s.close ? `${s.open} - ${s.close}` : '09:00 AM - 09:00 PM';
        // Track view when rendering (once per session)
        setTimeout(()=>{ trackView(s.id); }, 500);
        return `
          <div class="card">
            <div class="row">
              <div>
                <div class="title">${s.name || 'Shop'}</div>
                <div class="muted small">${s.city || ''} ${s.area? '· '+s.area:''} · ${s.category||'General'}</div>
                <div class="small"><span class="badge open">● Open</span> ${timingText} · ${(s.timingDays||['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).join(',')}</div>
                <div class="muted small" style="margin-top:4px">👁 ${s.views||0} views · 📞 ${s.callClicks||0} calls · 📍 ${s.mapClicks||0} maps · <span style="color:#888">(Private analytics - only admin sees full)</span></div>
              </div>
              <div class="stack">
                ${s.phone ? `<a class="btn" href="tel:${s.phone}" onclick="trackCall('${s.id}','${s.phone}')">📞 Call</a>` : ''}
                ${s.phone ? `<a class="btn secondary" href="https://wa.me/91${s.phone.replace(/\D/g,'')}" target="_blank" onclick="trackCall('${s.id}','${s.phone}')">💬 WhatsApp</a>` : ''}
              </div>
            </div>
            <div class="row small muted">
              ${s.insta ? `<a href="${s.insta}" target="_blank" onclick="trackBook('${s.id}')">📸 Instagram</a>` : ''}
              ${s.fb ? `<a href="${s.fb}" target="_blank" style="margin-left:8px" onclick="trackBook('${s.id}')">📘 Facebook</a>` : ''}
              ${s.map ? `<a href="${s.map}" target="_blank" style="margin-left:8px" onclick="trackMap('${s.id}')">📍 Map</a>` : ''}
              ${s.phone ? `<span style="margin-left:auto">📱 ${s.phone.slice(0,3)}•••${s.phone.slice(-2)}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if(allBanners.length && bannerArea){
    bannerArea.innerHTML = allBanners.map(b => `
      <a href="${b.url||'#'}" target="_blank" class="banner" onclick="trackBanner('${b.id}')">
        <div class="banner-inner">
          <span class="pill small">AD · Rs ${b.price||2000} · 👁 ${b.clicks||0} clicks</span>
          <div class="title">${b.title||'Sponsored'}</div>
          <div class="muted small">${b.city||''} · Click to open</div>
        </div>
      </a>
    `).join('');
  }

  if(productsEl){
    if(!products.length){
      productsEl.innerHTML = `<div class="card muted">No products from approved shops</div>`;
    } else {
      productsEl.innerHTML = products.map((p,i) => {
        const shop = allShops.find(s=>s.id===p.shopId || s.phone===p.shopPhone) || {};
        let bannerHtml = '';
        if(i>0 && i%8===0 && allBanners[0]){
          const b = allBanners[0];
          bannerHtml = `<a href="${b.url||'#'}" target="_blank" class="card banner" onclick="trackBanner('${b.id}')"><div class="pill small">BANNER AD - ${b.title} - Rs ${b.price||2000} - ${b.clicks||0} clicks</div></a>`;
        }
        return `${bannerHtml}
          <div class="card">
            <div class="title">${p.name||'Product'}</div>
            <div class="muted small">${shop.name||''} ${shop.city? '· '+shop.city:''}</div>
            <div class="row"><span class="price">Rs ${p.price||'--'}</span><span class="muted small">${p.category||''} · 👁 ${shop.views||0} views</span></div>
          </div>
        `;
      }).join('');
    }
  }

  if(statusEl){
    const approvedCount = allShops.filter(s=>s.approved===true).length;
    const pendingCount = allShops.filter(s=>s.approved!==true).length;
    const totalViews = allShops.reduce((a,s)=>a+(s.views||0),0);
    const totalCalls = allShops.reduce((a,s)=>a+(s.callClicks||0),0);
    const totalMaps = allShops.reduce((a,s)=>a+(s.mapClicks||0),0);
    statusEl.textContent = `${approvedCount} approved · ${pendingCount} pending · ${products.length} products · 👁 ${totalViews} total views · 📞 ${totalCalls} calls · 📍 ${totalMaps} maps · Live Firebase website-1cb04`;
  }
}

try {
  onSnapshot(collection(db, "shops"), (snap)=>{
    allShops = snap.docs.map(d=>({id:d.id, ...d.data()}));
    console.log("Shops live:", allShops.length, "Approved:", allShops.filter(s=>s.approved).length, "Total views:", allShops.reduce((a,s)=>a+(s.views||0),0));
    render();
  }, err=>{ 
    console.error(err); 
    if(shopsEl) shopsEl.innerHTML=`<div class="card err">Error loading shops: ${err.message}<br>Check Firestore Rules: allow read if true<br>For views/clicks tracking, need allow write if true OR allow update with increment - For now, tracking needs auth or open write rule</div>`; 
  });

  onSnapshot(collection(db, "products"), (snap)=>{
    allProducts = snap.docs.map(d=>({id:d.id, ...d.data()}));
    render();
  });

  onSnapshot(collection(db, "banners"), (snap)=>{
    allBanners = snap.docs.map(d=>({id:d.id, ...d.data()}));
    render();
  });

  onSnapshot(collection(db, "cities"), (snap)=>{
    allCities = snap.docs.map(d=>d.data());
    render();
  });

} catch(e){
  console.error("Firebase init error", e);
  if(statusEl) statusEl.textContent = "Firebase error: " + e.message;
}

searchEl?.addEventListener('input', render);
townEl?.addEventListener('change', render);
catEl?.addEventListener('change', render);
document.getElementById('refresh')?.addEventListener('click', render);

window.JaoraBazaar = { allShops, render, trackView, trackCall, trackMap };
console.log("✅ Customer.js FIXED - Views and Clicks tracking ACTIVE - Private analytics for admin");
