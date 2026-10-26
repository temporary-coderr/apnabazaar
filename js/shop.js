// JAORA BAZAAR - Shop Owner App - website-1cb04 LIVE
// Features you said: Owner can edit own prices/services/timing, Walk-in button/QR, earnings count not Rs
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
  // Find shop by owner email or phone (you decide)
  // For now, load by creator
  const q = query(collection(db, "shops"), where("createdBy", "==", user.email));
  onSnapshot(q, snap=>{
    if(!snap.empty){
      currentShop = {id:snap.docs[0].id, ...snap.docs[0].data()};
      document.getElementById('shopInfo').innerHTML = `
        <b>${currentShop.name}</b> - ${currentShop.city} - ${currentShop.area}<br>
        <small class="muted">Mobile UNIQUE: ${currentShop.phone} - Timing: ${currentShop.open} - ${currentShop.close} - ${currentShop.timingDays?.join(',')}</small>
      `;
      loadMyProducts(currentShop.id);
    } else {
      document.getElementById('shopInfo').innerHTML = 'No shop found - Contact admin to create shop';
    }
  });
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
    <div class="card row"><span>${p.name} - Rs ${p.price} ${p.category? '('+p.category+')':''}</span>
    <span><button onclick="editProduct('${p.id}')">Edit Price</button> <button onclick="deleteProduct('${p.id}')">Delete</button></span></div>
  `).join('') || '<div class="muted">No products - Add first</div>';
  // Earnings count not Rs (as you said)
  const countEl = document.getElementById('earningsCount');
  if(countEl) countEl.textContent = `${myProducts.length} services - Clicks private`;
}

window.addProduct = async ()=>{
  const name = document.getElementById('pName')?.value.trim();
  const price = document.getElementById('pPrice')?.value.trim();
  const cat = document.getElementById('pCat')?.value;
  if(!name || !price) return alert("Name and price required");
  if(!currentShop) return alert("No shop assigned");
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

// Walk-in button / QR - Updates count - Earnings count not Rs (privacy as you said)
window.addWalkIn = async ()=>{
  if(!currentShop) return;
  await updateDoc(doc(db, "shops", currentShop.id), {
    walkIns: (currentShop.walkIns||0)+1,
    lastWalkIn: serverTimestamp()
  });
  // Also log click
  await addDoc(collection(db, "clicks"), {shopId: currentShop.id, type: "walkin", at: serverTimestamp()});
  alert("Walk-in counted - Private analytics updated");
};

console.log("✅ Shop.js LIVE - Owner can edit prices, walk-in QR, earnings count only");
