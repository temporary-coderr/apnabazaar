# Lokmart - Apna Local Bazaar

Static Firebase storefront for local shops. Pages are served from folders so their URLs do not need `.html`:

- `/apnabazaar/` - approved shop banners, search, categories, Hindi voice search, sharing, and PWA install
- `/apnabazaar/store/?id=SHOP_ID` - public shop details, products, contact actions, and printable QR
- `/apnabazaar/shop/` - Firebase owner login, Cloudinary banner/product uploads, premium links, and private premium analytics
- `/apnabazaar/jagruk-473287-control/` - administrator login, approval/edit/delete, CSV import, analytics, and shop QR codes

## Project services

- Firebase project: `website-1cb04` (Authentication and Firestore)
- Cloudinary cloud: `tizekip0`
- Unsigned upload preset: `ml_default`
- GitHub Pages base path: `/apnabazaar/`
- Optional custom domain: `lokmart.in`

The Firebase web configuration and Cloudinary cloud name are public client identifiers, not server secrets. Restrict the Firebase API key by HTTP referrer in Google Cloud. Configure the Cloudinary unsigned preset to accept only image formats, cap file size at 5 MB, and apply appropriate usage limits. The client also verifies image MIME type, size, and the returned Cloudinary HTTPS URL.

## First-time setup and deployment

1. Enable Email/Password sign-in in Firebase Authentication.
2. Deploy [firestore.rules](./firestore.rules) in the Firebase console before using the app.
3. Create the first admin account in Firebase Authentication. Copy its Firebase **UID** into a Firestore document at `admins/{uid}` with `email` and `role: "super-admin"` (additional admins can use `role: "admin"`). Admin documents are intentionally not writable from the client. No first-user auto-promotion is allowed.
4. Confirm the Cloudinary `ml_default` preset exists in account `tizekip0` and is configured for unsigned uploads with the limits above.
5. Upload the complete folder structure to the GitHub Pages repository. For a custom domain, point the domain to GitHub Pages and configure the Pages custom domain separately.
6. Open the admin page and sign in with the UID-authorized account. Check the browser console and Firebase/Cloudinary dashboards for setup errors.

## Firestore data and migration

Shop owner credentials are linked by Firebase UID in `shops/{shopId}.ownerUid`. Owner email is stored in the administrator-only `shopPrivate/{shopId}` document. Analytics live in `shopAnalytics/{shopId}` and are readable only by admins and the shop's active premium owner. Product count is stored in `shops/{shopId}.productCount`; owner product creation updates the count and product atomically, and Firestore rules enforce the 10-product free limit.

When the admin page loads, it migrates legacy `ownerEmail`, analytics counters, and `createdBy` fields out of shop documents into the restricted collections and removes the old public fields. Existing owner accounts whose shop has no valid `ownerUid` must be linked by an administrator using the account UID from Firebase Authentication before owners can log in. Existing shops also need a correct integer `productCount` (the number of existing product documents) for owner uploads to pass the new rules.

The admin page must be able to read and write `shops`, `shopPrivate`, and `shopAnalytics`; the rules grant that only to UIDs present in `admins`. Do not loosen `admins` writes to authenticated users.

## Security notes

- The admin page checks `admins/{auth.uid}` and fails closed. The secret URL and `robots.txt` are not access controls; Firebase rules are.
- User-controlled shop/product text is rendered as text or escaped before markup insertion. Banner and product images must be HTTPS Cloudinary URLs.
- Analytics reads are private and customer UI does not display counts. Public analytics increments are constrained by rules to a single counter increment at a time, but this static client cannot prevent automated counter spam. Use Firebase App Check enforcement and, for trustworthy billing/analytics, move increments behind a rate-limited trusted backend such as a Cloud Function.
- CSV import creates Firebase Auth accounts from the administrator's browser. Use a protected admin device, avoid shared computers, and distribute temporary passwords securely. Unique checks are helpful but are not transactional across concurrent administrators; a trusted backend is required for strict uniqueness guarantees.
- `robots.txt` discourages indexing the admin path; it does not make the URL secret.

## Offline/PWA and search

The service worker caches the app shell and same-origin GET responses. Firebase data and Cloudinary media still require connectivity on a first visit. Hindi voice input requires a browser that supports the Web Speech API, typically Chrome on Android.

The QR print action uses `api.qrserver.com`; the shop URL is sent to that service to generate the image. Sitemap currently lists the homepage only; dynamic Firestore shop URLs cannot be enumerated by this static site at build time.


## Manual UPI payments (no payment gateway)

- Shop owners select a plan in the owner dashboard, pay using the UPI ID / QR configured by the administrator, then submit the UTR and a payment screenshot.
- The UTR is normalized to uppercase letters/numbers and used as the `payments/{UTR}` document ID. Firestore rules prevent another owner from creating a payment with the same UTR.
- Screenshots are evidence only. A plan stays pending until an administrator checks the UTR and exact amount in the bank / UPI app and approves it in the control panel.
- Admin approval is performed in a Firestore transaction and sets a 30-day expiry for the selected plan. Rejection never activates a plan.
- Plan prices are configurable in the admin panel. Defaults are ₹300 for listing, ₹400 for premium features, and ₹2,000 for a banner advertisement. Customer access remains free.
- Configure the UPI ID and optionally upload the QR image in Admin → UPI Payment Settings before asking shop owners to submit payments. Paid-listing enforcement is an explicit admin toggle so existing listings are not unexpectedly hidden during migration.

## Important deployment checklist

1. Publish the updated `firestore.rules` from the Firebase Console (Firestore Database → Rules). Updating this repository does **not** publish Firebase rules automatically.
2. In Firebase Authentication, keep Email/Password enabled and confirm only administrator UIDs listed in `admins/{uid}` have admin access.
3. In Cloudinary, restrict the unsigned upload preset to image formats, set a small upload-size limit, disable overwrites, and monitor usage. A public unsigned preset is not a secret.
4. Restrict the Firebase API key by HTTP referrer in Google Cloud and enable Firebase App Check for supported web providers before enforcing it.
5. Test owner login, product creation, public shop pages, payment submission, duplicate UTR rejection, admin approval/rejection, and expiry before launch.
6. Back up Firestore data before deploying rules or running any migration.

The web app cannot independently prove a UPI payment. The administrator must verify the transaction in the bank / UPI application. Do not approve based only on a screenshot or the owner's claim.


The GitHub Actions `Validate Lokmart` workflow checks JavaScript syntax, inline page scripts, JSON validity, and branch whitespace on pushes and pull requests.
