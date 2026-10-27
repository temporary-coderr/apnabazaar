
# Desi Bazaar - Updated Free vs Premium

## NEW PLAN (As you asked)

FREE (₹0):
- ✅ Shop banner photo upload (1 banner)
- ✅ 10 product images (10 products x 1 image each)
- ❌ Social links (Instagram, FB, YouTube, Website) - Hidden
- ❌ Google Map clickable pin - Hidden (text only)
- ❌ WhatsApp Book button - Hidden
- ❌ Verified badge - No
- ❌ Popular Tag - No
- ❌ Banner Ad - No
- ❌ Priority top - Shows bottom
- ✅ Description 50 chars

PAID (Customizable Price - You set per shop):
- ✅ Everything in FREE +
- ✅ Social links (Insta, FB, YouTube, Website) + tracking
- ✅ Google Map clickable + mapClicks tracking
- ✅ WhatsApp Book button + bookClicks
- ✅ Verified ✅ badge
- ✅ Popular 🔥 Tag (if you mark, extra charge)
- ✅ Banner Ad ⭐ (if you mark, extra charge)
- ✅ Top priority in search + listing
- ✅ Analytics: views, calls, map clicks (real counts)
- ✅ Description 300 chars
- ✅ Unlimited product images (or 50)
- ✅ Custom price you set: Rs 300 / 500 / 800 / 1000 per shop

Firestore Fields:
- isPremium: boolean
- subscriptionStatus: active/expired/free
- premiumUntil: timestamp
- premiumPrice: number - CUSTOMIZABLE - You set per shop (300, 500, etc)
- actualPricePaid: number - What they paid this time
- freeImageLimit: 10 (constant)
- bannerImage: string (allowed for free too now!)
- productImages: array (max 10 free, unlimited paid)
- isPopular: boolean
- isBannerAd: boolean
