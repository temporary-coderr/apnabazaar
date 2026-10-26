// JAORA BAZAAR - Customer App LIVE - Reads from Firebase website-1cb04
import { db } from "./firebase-config.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let allShops = [];
let allProducts = [];
let allBanners = [];
let allCities = [];

const shopsEl = document.getElementById('shops');
const productsEl = document.getElementById('products');
const bannerArea = document.getElementById('bannerArea');
const searchEl = document.getElementById('search');
const townEl = document.getElementById('town');
const catEl = document.getElementById('category');
const statusEl = document.getElementById('status');
const refreshBtn = document.getElementById('refresh');

function render() {
  const q = (searchEl.value || '').toLowerCase();
  const town = townEl.value;
  const cat = catEl.value;

  // Filter shops
  let shops = allShops.filter(s => {
    const matchesSearch = !q || (s.name||'').toLowerCase().includes(q) || (s.area||'').toLowerCase().includes(q) || (s.city||'').toLowerCase().includes(q);
    const matchesTown = !town || s.city === town || s.town === town;
    const matchesCat = !cat || (s.category||'').toLowerCase() === cat.toLowerCase();
    return matchesSearch && matchesTown && matchesCat;
  });

  // Filter products
  let products = allProducts.filter(p => {
    const matchesSearch = !q || (p.name||'').toLowerCase().includes(q);
    const matchesCat = !cat || (p.category||'').toLowerCase() === cat.toLowerCase();
    // Also filter by town if product has city
    const shop = allShops.find(s => s.id === p.shopId || s.phone === p.shopPhone);
    const matchesTown = !town || (shop && (shop.city===town || shop.town===town));
    return matchesSearch && matchesCat && matchesTown;
  });

  // Render towns dropdown
  if(allCities.length){
    const existingTowns = new Set([...allCities.map(c=>c.name), ...allShops.map(s=>s.city).filter(Boolean)]);
    townEl.innerHTML = '<option value="">All towns</option>' + [...existingTowns].map(t=>`<option value="${t}">${t}</option>`).join('');
    // Keep selection
    townEl.value = town;
  }

  // Render shops
  if(!shops.length){
    shopsEl.innerHTML = `<div class="card muted">No shops found. Admin needs to add shops in Firestore 'shops' collection.<br>Check: website-1cb04 > Firestore > shops</div>`;
  } else {
    shopsEl.innerHTML = shops.map(s => {
      const isOpen = true; // You can add timing logic later
      const timingText = s.open && s.close ? `${s.open} - ${s.close}` : '09:00 AM - 09:00 PM';
      return `
        <div class="card">
          <div class="row">
            <div>
              <div class="title">${s.name || 'Shop'}</div>
              <div class="muted small">${s.city || ''} ${s.area? '· '+s.area:''} · ${s.category||'General'}</div>
              <div class="small"><span class="badge ${isOpen?'open':'closed'}">${isOpen?'● Open':'● Closed'}</span> ${timingText}</div>
            </div>
            <div class="stack">
              ${s.phone ? `<a class="btn" href="tel:${s.phone}">📞 Call</a>` : ''}
              ${s.phone ? `<a class="btn secondary" href="https://wa.me/91${s.phone.replace(/\D/g,'')}" target="_blank">💬 WhatsApp</a>` : ''}
            </div>
          </div>
          <div class="row small muted">
            ${s.insta ? `<a href="${s.insta}" target="_blank">📸 Instagram</a>` : ''}
            ${s.fb ? `<a href="${s.fb}" target="_blank" style="margin-left:8px">📘 Facebook</a>` : ''}
            ${s.map ? `<a href="${s.map}" target="_blank" style="margin-left:8px">📍 Map</a>` : ''}
            ${s.phone ? `<span style="margin-left:auto">Mobile: ${s.phone.slice(0,3)}•••${s.phone.slice(-2)}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render banners
  if(allBanners.length && bannerArea){
    bannerArea.innerHTML = allBanners.map(b => `
      <a href="${b.url||'#'}" target="_blank" class="banner">
        <div class="banner-inner">
          <span class="pill small">AD · Rs ${b.price||2000}</span>
          <div class="title">${b.title||'Sponsored'}</div>
          <div class="muted small">${b.city||''} · Click to open</div>
        </div>
      </a>
    `).join('');
  }

  // Render products (with shop name)
  if(!products.length){
    productsEl.innerHTML = `<div class="card muted">No products yet. Add in Firestore 'products' collection or via shop-app</div>`;
  } else {
    productsEl.innerHTML = products.map((p,i) => {
      const shop = allShops.find(s=>s.id===p.shopId || s.phone===p.shopPhone) || {};
      // Inject banner every 8 products
      let bannerHtml = '';
      if(i>0 && i%8===0 && allBanners[0]){
        const b = allBanners[0];
        bannerHtml = `<a href="${b.url||'#'}" target="_blank" class="card banner"><div class="pill small">BANNER AD - ${b.title}</div><div class="small muted">${b.url}</div></a>`;
      }
      return `${bannerHtml}
        <div class="card">
          <div class="title">${p.name||'Product'}</div>
          <div class="muted small">${shop.name||''} ${shop.city? '· '+shop.city:''}</div>
          <div class="row"><span class="price">Rs ${p.price||'--'}</span><span class="muted small">${p.category||''}</span></div>
        </div>
      `;
    }).join('');
  }

  statusEl.textContent = `${shops.length} shops · ${products.length} products · ${allBanners.length} banners · Live from Firebase website-1cb04`;
}

// Live listeners - Firebase
try {
  // Shops
  onSnapshot(collection(db, "shops"), (snap)=>{
    allShops = snap.docs.map(d=>({id:d.id, ...d.data()}));
    console.log("Shops live:", allShops.length);
    render();
  }, err=>{ console.error(err); shopsEl.innerHTML=`<div class="card err">Error loading shops: ${err.message}<br>Check Firestore Rules: allow read if true</div>`; });

  // Products
  onSnapshot(collection(db, "products"), (snap)=>{
    allProducts = snap.docs.map(d=>({id:d.id, ...d.data()}));
    console.log("Products live:", allProducts.length);
    render();
  });

  // Banners
  onSnapshot(collection(db, "banners"), (snap)=>{
    allBanners = snap.docs.map(d=>d.data());
    render();
  });

  // Cities / Towns
  onSnapshot(collection(db, "cities"), (snap)=>{
    allCities = snap.docs.map(d=>d.data());
    render();
  });

} catch(e){
  console.error("Firebase init error", e);
  statusEl.textContent = "Firebase error: " + e.message + " - Check js/firebase-config.js";
}

// Events
searchEl?.addEventListener('input', render);
townEl?.addEventListener('change', render);
catEl?.addEventListener('change', render);
refreshBtn?.addEventListener('click', render);

// Expose for console debug
window.JaoraBazaar = { allShops, allProducts, render };
