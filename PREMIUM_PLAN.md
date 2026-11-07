# Lokmart plans and manual UPI policy

Lokmart is a local discovery and shop-listing marketplace. It does not process customer orders, collect customer checkout payments, or provide delivery. Customers browse listings and contact shops directly. The customer experience is free.

## Shop plans

| Plan | Default price | Duration | What it does |
|---|---:|---:|---|
| Shop listing | ₹300 | 30 days | Keeps the approved shop visible in the public directory |
| Premium features | ₹400 | 30 days | Enables premium shop actions, social links, map / WhatsApp actions, and private shop analytics. A verified badge is granted only after a separate admin review. |
| Banner advertisement | ₹2,000 | 30 days | Enables paid banner placement / priority promotion |

The administrator can change all three prices in the authenticated admin panel. The shop owner dashboard reads the current prices from Firestore; it does not accept a price typed by the owner.

## Manual UPI verification

1. The administrator configures the UPI ID and optional QR image in Admin → UPI Payment Settings.
2. A shop owner selects a plan, pays externally through their UPI app, and submits the UTR plus a screenshot.
3. The payment request is stored as `payments/{UTR}`. UTRs are normalized to uppercase letters and digits, and the document ID makes a duplicate UTR impossible to submit as a second payment.
4. The payment remains `pending`. A screenshot is not proof of settlement.
5. The administrator independently checks the UTR and exact amount in the bank / UPI app, then approves or rejects the request.
6. Approval extends that plan's expiry by 30 days (carrying forward any remaining active days). Only an approved payment changes the shop's paid-plan fields.

No Razorpay, payment gateway, automated UPI collection, or automatic activation is used.

## Important implementation notes

- Firestore rules authorize payment creation only for the authenticated owner of the linked shop, enforce the configured plan amount, and allow only admins to review or update payment records.
- `premiumUntil`, `listingPaidUntil`, and `bannerUntil` store plan expiry timestamps.
- Existing shops with no `listingPaidUntil` will not appear in the public directory until a listing payment is approved.
- Publishing `firestore.rules` to Firebase is a separate manual deployment step; committing the file to GitHub does not deploy it.