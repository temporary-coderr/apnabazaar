
// Customer.js - Free banner + 10 images allowed, premium for rest
async function renderShopCard(shop){
  const isPremium = shop.isPremium && shop.subscriptionStatus==='active';
  const banner = shop.bannerImage ? `<img src="${shop.bannerImage}" style="width:100%;height:140px;object-fit:cover;border-radius:12px 12px 0 0;"/>` : `<div style="height:100px;background:#FFF0E6;display:flex;align-items:center;justify-content:center;font-size:32px;">🏪</div>`;
  const social = isPremium ? `
    ${shop.mapLink?`<button onclick="track('${shop.id}','mapClicks'); window.open('${shop.mapLink}')">📍 Map</button>`:''}
    ${shop.instaLink?`<button onclick="track('${shop.id}','instaClicks'); window.open('${shop.instaLink}')">📸 Insta</button>`:''}
    ${shop.fbLink?`<button onclick="track('${shop.id}','fbClicks'); window.open('${shop.fbLink}')">📘 FB</button>`:''}
    ${shop.youtubeLink?`<button onclick="window.open('${shop.youtubeLink}')">▶️ YouTube</button>`:''}
    <button onclick="track('${shop.id}','bookClicks'); window.open('https://wa.me/91${shop.phone}')">💬 Book</button>
  ` : `<p style="font-size:11px;color:#999;">🔒 Map, Instagram, Book for Premium shops</p>`;
  
  return `<div class="shop-card ${isPremium?'premium':''}">
    ${shop.isBannerAd?'<div>⭐ Sponsored</div>':''}
    ${shop.isPopular?'<div>🔥 Popular</div>':''}
    ${isPremium?'<div>✅ Verified</div>':''}
    ${banner}
    <h3>${shop.name}</h3>
    <p>${(shop.description||'').slice(0, isPremium?300:50)}</p>
    <button onclick="track('${shop.id}','callClicks'); location.href='tel:${shop.phone}'">📞 Call</button>
    ${social}
  </div>`;
}
