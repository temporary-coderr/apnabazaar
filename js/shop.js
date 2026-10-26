// FIXED Shop.js - Now loads by ownerEmail field (not createdBy) - So owner can login with his own email
import { db, auth } from "./firebase-config.js";
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentShop = null;
let myProducts = [];

onAuthStateChanged(auth, (user)=>{
  if(user){
    console.log("Shop owner logged in:", user.email);
    loadMyShop(user);
  }
});

function loadMyShop(user){
  // FIXED: Find shop by ownerEmail field (new) OR createdBy (old fallback) - So owner with his own email can login
  // First try ownerEmail
  const qOwner = query(collection(db, "shops"), where("ownerEmail", "==", user.email));
  onSnapshot(qOwner, snap=>{
    if(!snap.empty){
      currentShop = {id:snap.docs[0].id, ...snap.docs[0].data()};
      showShop();
      loadMyProducts(currentShop.id);
    } else {
      // Fallback: Try createdBy (for shops created before ownerEmail field)
      const qCreator = query(collection(db, "shops"), where("createdBy", "==", user.email));
      onSnapshot(qCreator, snap2=>{
        if(!snap2.empty){
          currentShop = {id:snap2.docs[0].id, ...snap2.docs[0].data()};
          showShop();
          loadMyProducts(currentShop.id);
        } else {
          document.getElementById('shopInfo').innerHTML = `No shop found for ${user.email}<br><br>Contact admin (connectingtorahul@gmail.com) to create shop with your email as Owner Email.<br><br>Admin must add shop in jagruk-473287-control/ with Owner Email = ${user.email}`;
        }
      });
    }
  });
}

function showShop(){
  document.getElementById('shopInfo').innerHTML = `
    <b>${currentShop.name}</b> - ${currentShop.city||''} ${currentShop.area? '· '+currentShop.area:''}<br>
    <small class="muted">Mobile UNIQUE: ${currentShop.phone} · Owner Email: ${currentShop.ownerEmail||currentShop.createdBy||''} · Category: ${currentShop.category||''}<br>
    Timing: ${currentShop.open||'09:00 AM'} - ${currentShop.close||'09:00 PM'} · ${(currentShop.timingDays||['Mon','Tue','Wed','Thu','Fri','Sat','Sun']).join(',')}<br>
    Plan: ${currentShop.plan||'Rs 500/week'} · Approved: ${currentShop.approved? '✅ Yes - Showing in main':'❌ No - Pending admin approval'}</small>
  `;
  document.getElementById('openTime').value = currentShop.open||'09:00 AM';
  document.getElementById('closeTime').value = currentShop.close||'09:00 PM';
}

function loadMyProducts(shopId){
  const q = query(collection(db, "products"), where("shopId", "==", shopId));
  onSnapshot(q, snap=>{
    myProducts = snap.docs.map(d=>({id:d.id, ...d.data()}));
    renderMyProducts();
  });
}

function renderMyProducts(){
  const el = document.getElementById('myProducts');
  if(!el) return;
  el.innerHTML = myProducts.map(p=>`
    <div class="card row"><span><b>${p.name}</b> - Rs ${p.price} ${p.category? '('+p.category+')':''}</span>
    <span><button onclick="editProduct('${p.id}')">Edit Price</button> <button class="danger" onclick="deleteProduct('${p.id}')">Delete</button></span></div>
  `).join('') || '<div class="muted">No products - Add first product above - Products will show in main only if shop is approved</div>';
  document.getElementById('earningsCount').textContent = `${myProducts.length} services - Clicks private only to admin in secret admin`;
}

window.addProduct = async ()=>{
  const name = document.getElementById('pName')?.value.trim();
  const price = document.getElementById('pPrice')?.value.trim();
  const cat = document.getElementById('pCat')?.value;
  if(!name || !price) return alert("Name and price required");
  if(!currentShop) return alert("No shop assigned - Contact admin to create shop with your email");
  await addDoc(collection(db, "products"), {
    shopId: currentShop.id,
    shopPhone: currentShop.phone,
    name, price: parseInt(price), category: cat,
    createdAt: serverTimestamp()
  });
  document.getElementById('pName').value=''; document.getElementById('pPrice').value='';
};

window.editProduct = async (id)=>{
  const newPrice = prompt("New price (Rs):");
  if(!newPrice) return;
  await updateDoc(doc(db, "products", id), {price: parseInt(newPrice), updatedAt: serverTimestamp()});
};

window.deleteProduct = async (id)=>{
  if(!confirm("Delete product?")) return;
  await deleteDoc(doc(db, "products", id));
};

window.addWalkIn = async ()=>{
  if(!currentShop) return alert("No shop");
  await updateDoc(doc(db, "shops", currentShop.id), {
    walkIns: (currentShop.walkIns||0)+1,
    lastWalkIn: serverTimestamp()
  });
  await addDoc(collection(db, "clicks"), {shopId: currentShop.id, type: "walkin", at: serverTimestamp()});
  alert("Walk-in counted - Private analytics updated (only admin sees in jagruk-473287-control/)");
};

window.updateTiming = async ()=>{
  if(!currentShop) return;
  const o=document.getElementById('openTime').value, c=document.getElementById('closeTime').value;
  await updateDoc(doc(db, "shops", currentShop.id), {open:o, close:c, updatedAt: serverTimestamp()});
  alert("Timing updated: "+o+" - "+c);
};

console.log("✅ Shop.js FIXED - Loads by ownerEmail, not createdBy - Owner can login with his own email");
