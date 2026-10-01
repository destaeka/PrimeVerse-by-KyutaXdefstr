# Deployment
1. Firebase: enable Email/Password Auth + Firestore.
2. Add your domain to Firebase Auth authorized domains.
3. Put Firebase Web config and Admin service account into Vercel env.
4. Put Pakasir API key/slug into Vercel env.
5. Import GitHub repo into Vercel.
6. Open `/admin/`, log in, configure products/stock/theme/CS.
7. Set Pakasir webhook to `/api/api_pakasir/webhook`.
8. Run a sandbox payment and verify order -> status -> webhook -> fulfillment.
9. Add custom domain in Vercel and repeat a production smoke test.
