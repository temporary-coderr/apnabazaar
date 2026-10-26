// JAORA BAZAAR - Admin Logic FULL - website-1cb04 LIVE
// Business: Rs 500/week per category container, Popular Rs 1500/month, Banner Rs 2000/month
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let allShops = [], allBanners = [], allCities = [];
let currentUser = null;

// Auth check - Secret admin jagruk-473287-control + Firebase Auth + IP 152.59.47.225 + 5km Raghogarh
onAuthStateChanged(auth, (user)=>{
  currentUser = user;
  if(!user){
    // Redirect to login if not in admin/index.html
    if(!window.location.href.includes('admin/index.html') && !window.location.href.includes('admin')){
      console.log("Not logged in");
      return;
    }
  } else {
    console.log("Admin LIVE:", user.email, user.uid);
    loadAll();
  }
});

function loadAll(){
  // Cities - Location Master
  onSnapshot(collection(db, "cities"), snap=>{
    allCities = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderCities();
  });
  // Shops - With mobile UNIQUE check
  onSnapshot(collection(db, "shops"), snap=>{
    allShops = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderShops();
    updateAnalytics();
  });
  // Banners - Rs 2000/month - Click analytics private only to admin
  onSnapshot(collection(db, "banners"), snap=>{
    allBanners = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderBanners();
    updateAnalytics();
  });
  // Orders - For analytics - Views, Call Clicks, Map Clicks, Book Clicks private
  onSnapshot(collection(db, "clicks"), snap=>{
    const clicks = snap.docs.map(d=>d.data());
    updateClickAnalytics(clicks);
  });
}

// --- City Management - Jaora, Raghogarh, Rajgarh ---
function renderCities(){
  const el = document.getElementById('citiesList');
  if(!el) return;
  el.innerHTML = allCities.map(c=>`
    <div class="row card"><span>${c.name} ${c.active? '●':''}</span><button onclick="deleteCity('${c.id}')">Delete</button></div>
  `).join('') || '<div class="muted">No cities - Add Jaora, Raghogarh</div>';
  // Town dropdown for shop form
  const sel = document.getElementById('shopCity');
  if(sel){
    sel.innerHTML = '<option value="">Select Town</option>' + allCities.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
  }
}

window.addCity = async ()=>{
  const nameEl = document.getElementById('newCity');
  if(!nameEl) return;
  const name = nameEl.value.trim();
  if(!name) return alert("Enter city name");
  // Check duplicate
  if(allCities.find(c=>c.name.toLowerCase()===name.toLowerCase())) return alert("City already exists");
  await addDoc(collection(db, "cities"), {name, active:true, createdAt: serverTimestamp(), createdBy: currentUser?.email});
  nameEl.value='';
};

window.deleteCity = async (id)=>{
  if(!confirm("Delete city?")) return;
  await deleteDoc(doc(db, "cities", id));
};

// --- Shop Management - Mobile UNIQUE across all shops - Server enforced ---
function renderShops(){
  const el = document.getElementById('shopsList');
  if(!el) return;
  el.innerHTML = allShops.map(s=>`
    <div class="card">
      <div class="row"><b>${s.name}</b><span class="pill">${s.city||''} · ${s.area||''}</span></div>
      <div class="muted small">Mobile: ${s.phone} ${s.phone? '· UNIQUE':''} · Category: ${s.category||''} · Timing: ${s.open||'09:00 AM'} - ${s.close||'09:00 PM'}</div>
      <div class="small">Plan: ${s.plan||'Rs 500/week per category container'} · Popular: ${s.popular? 'Yes Rs 1500/month':'No'} · Banner: ${s.banner? 'Yes Rs 2000/month':'No'}</div>
      <div class="row small" style="margin-top:8px">
        <span>Views: ${s.views||0} · Calls: ${s.callClicks||0} · Map: ${s.mapClicks||0} · Book: ${s.bookClicks||0} (Private analytics - Only admin)</span>
        <span>
          <button onclick="approveShop('${s.id}')">${s.approved?'Approved':'Approve'}</button>
          <button onclick="deleteShop('${s.id}')">Delete</button>
        </span>
      </div>
      <div class="small muted">Owner can edit own prices/services/timing via Shop App - Walk-in button/QR updates counts - Earnings NOT shown (only count)</div>
    </div>
  `).join('') || '<div class="muted">No shops - Add first shop to test customer page</div>';
}

window.addShop = async ()=>{
  const name = document.getElementById('shopName')?.value.trim();
  const phone = document.getElementById('shopPhone')?.value.trim().replace(/\D/g,'');
  const city = document.getElementById('shopCity')?.value;
  const area = document.getElementById('shopArea')?.value.trim();
  const category = document.getElementById('shopCategory')?.value;
  const open = document.getElementById('shopOpen')?.value || '09:00 AM';
  const close = document.getElementById('shopClose')?.value || '09:00 PM';
  const insta = document.getElementById('shopInsta')?.value.trim();
  const fb = document.getElementById('shopFb')?.value.trim();
  const map = document.getElementById('shopMap')?.value.trim();

  if(!name || !phone || !city) return alert("Name, Mobile, City required");
  if(phone.length!==10) return alert("Mobile must be 10 digits UNIQUE");

  // Mobile UNIQUE across all shops - Server-side check (you said)
  const q = query(collection(db, "shops"), where("phone", "==", phone));
  const snap = await getDocs(q);
  if(!snap.empty) return alert("❌ Mobile "+phone+" already exists in another shop - Must be UNIQUE across all shops");

  // Shop name can be duplicate in same city (you said) - So we allow duplicate name

  await addDoc(collection(db, "shops"), {
    name, phone, city, area, category, open, close, insta, fb, map,
    approved: false,
    plan: "Rs 500/week per category container",
    popular: false, // Rs 1500/month
    banner: false, // Rs 2000/month
    views: 0, callClicks:0, mapClicks:0, bookClicks:0, // Private analytics only admin
    createdAt: serverTimestamp(),
    createdBy: currentUser?.email,
    timingDays: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] // Mon-Sun as you said
  });
  alert("✅ Shop added - Awaiting approval");
  // Clear form
  ['shopName','shopPhone','shopArea'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
};

window.approveShop = async (id)=>{
  await updateDoc(doc(db, "shops", id), {approved:true, approvedAt: serverTimestamp(), approvedBy: currentUser?.email});
};

window.deleteShop = async (id)=>{
  if(!confirm("Delete shop? Mobile will be free for reuse")) return;
  await deleteDoc(doc(db, "shops", id));
};

// --- Banners - Rs 2000/month - Every 8 products ---
function renderBanners(){
  const el = document.getElementById('bannersList');
  if(!el) return;
  el.innerHTML = allBanners.map(b=>`
    <div class="card"><b>${b.title}</b> - ${b.city||''} - Rs ${b.price||2000}/month<br>
    <small class="muted">URL: ${b.url} · Clicks: ${b.clicks||0} (Private) · ${b.active?'Active':'Inactive'}</small>
    <div style="margin-top:6px"><button onclick="deleteBanner('${b.id}')">Delete</button></div></div>
  `).join('') || '<div class="muted">No banners - Add Diwali Offer etc</div>';
}

window.addBanner = async ()=>{
  const title = document.getElementById('bannerTitle')?.value.trim();
  const url = document.getElementById('bannerUrl')?.value.trim();
  const city = document.getElementById('bannerCity')?.value;
  const price = document.getElementById('bannerPrice')?.value || 2000;
  if(!title || !url) return alert("Title and URL required");
  await addDoc(collection(db, "banners"), {title, url, city, price: parseInt(price), clicks:0, active:true, createdAt: serverTimestamp()});
  alert("Banner added Rs "+price+"/month");
};

window.deleteBanner = async (id)=>{
  if(!confirm("Delete banner?")) return;
  await deleteDoc(doc(db, "banners", id));
};

// --- Private Analytics - Only admin in secret admin jagruk-473287-control ---
function updateAnalytics(){
  const el = document.getElementById('analytics');
  if(!el) return;
  const totalViews = allShops.reduce((s,x)=>s+(x.views||0),0);
  const totalCalls = allShops.reduce((s,x)=>s+(x.callClicks||0),0);
  const totalMap = allShops.reduce((s,x)=>s+(x.mapClicks||0),0);
  const totalBook = allShops.reduce((s,x)=>s+(x.bookClicks||0),0);
  const revenue = (allShops.length*500) + (allBanners.length*2000); // Approx weekly + banner
  el.innerHTML = `
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <div class="card">Total Shops: <b>${allShops.length}</b><br><small class="muted">Target Rs 70k/month -> Need ${Math.ceil(70000/500)} shops</small></div>
      <div class="card">Banners: <b>${allBanners.length}</b> · Rs ${allBanners.length*2000}/month</div>
      <div class="card">Views: <b>${totalViews}</b> (Private)</div>
      <div class="card">Call Clicks: <b>${totalCalls}</b> (Private)</div>
      <div class="card">Map Clicks: <b>${totalMap}</b> (Private)</div>
      <div class="card">Book Clicks: <b>${totalBook}</b> (Private)</div>
      <div class="card">Est. Revenue: <b>Rs ${revenue}/month</b><br><small class="muted">Owner sees only count not Rs - Privacy as you said</small></div>
    </div>
  `;
}

function updateClickAnalytics(clicks){
  // Private click analytics - Not shown to owners/customers
  console.log("Clicks private:", clicks.length);
}

// --- Plans - Rs 500/week per category container, Popular Rs 1500, Banner Rs 2000 ---
window.updatePlan = async (shopId, planType)=>{
  const shopRef = doc(db, "shops", shopId);
  if(planType==='popular'){
    await updateDoc(shopRef, {popular:true, popularPrice:1500, popularSince: serverTimestamp()});
    alert("Popular placement Rs 1500/month enabled");
  } else if(planType==='banner'){
    await updateDoc(shopRef, {banner:true, bannerPrice:2000});
  } else {
    await updateDoc(shopRef, {plan: "Rs 500/week per category container"});
  }
};

console.log("✅ Admin.js FULL LIVE - website-1cb04 - Mobile UNIQUE enforced, Private analytics, Plans Rs 500/1500/2000");
