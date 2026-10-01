# Primeverse by KyutaXdefstr — Production Project

GitHub → Vercel storefront with Firebase Authentication/Firestore and Pakasir API v2.

## Included
- `index.html` — customer storefront
- `/admin/` — separate administrator panel
- Product CRUD and restock
- Promo management
- Store appearance editor
- Customer Service links
- Firebase email/password authentication
- Admin custom claim (`admin=true`)
- Server-side price/promo calculation
- Pakasir QRIS/payment-link transaction creation
- Transaction status recheck
- Webhook trigger + server verification
- Idempotent stock fulfillment
- Firestore rules blocking direct writes to sensitive collections

## Vercel Environment Variables
- `FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `FIREBASE_WEB_CONFIG_JSON`
- `PAKASIR_API_KEY`
- `PAKASIR_SLUG`

The Firebase Web config is public client configuration; the Admin service account and Pakasir API key are secrets and must never be committed.

## Create the first admin
Create an account in Firebase Authentication, then locally run:

`FIREBASE_SERVICE_ACCOUNT_JSON='...' node scripts/set-admin.mjs admin@example.com`

Sign out/in again after setting the claim.

## Pakasir
The backend uses Pakasir API v2 create-transaction. Pakasir currently documents:
`POST https://app.pakasir.com/api/v2/create-transaction/{slug}/{order_id}`
with `X-Api-Key` and methods including `qris` and `payment_link`.

Configure webhook:
`https://YOUR-DOMAIN/api/api_pakasir/webhook`

The webhook body is treated only as a trigger. The server rechecks the transaction detail before marking payment verified/fulfilling stock.

## Before live
1. Enable Firebase Email/Password Auth and Firestore.
2. Add your domain to Firebase Auth authorized domains.
3. Deploy to Vercel with all environment variables.
4. Open `/admin/`, create products and stock.
5. Configure Pakasir webhook.
6. Run sandbox payment tests including duplicate webhook/status calls and simultaneous fulfillment.
7. Only then switch to production payment credentials.

Never commit `.env`, service-account JSON, or Pakasir API keys.
