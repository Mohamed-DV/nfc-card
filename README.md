# NFC Business Cards (Next.js + Vercel, free)

20 digital business cards. Each NFC card opens `https://YOUR-SITE.vercel.app/c/1` … `/c/20`.
You write the link on the chip **once** — after that you change the info from `/admin`, the card stays the same.

Fields per card: Nom & Prénom · Fonction / Poste actuel · Entité · Direction · Téléphone professionnel · Adresse e-mail professionnelle.
Each card page has "Enregistrer le contact" (downloads a .vcf), Call and E-mail buttons.

## Run locally
```bash
npm install
ADMIN_PASSWORD=test123 npm run dev
```
Open http://localhost:3000/c/1 and http://localhost:3000/admin (locally, edits are saved to `data/cards.json`).

## Deploy on Vercel (free)
1. Push this folder to a GitHub repo.
2. On vercel.com → **Add New → Project** → import the repo → Deploy.
3. In the project → **Storage** (or Marketplace) → add **Upstash for Redis** (free plan) → connect it to the project.
   This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.
4. **Settings → Environment Variables** → add `ADMIN_PASSWORD` = a strong password.
5. **Deployments → Redeploy** so the variables are picked up.

> Without the database, the site still shows card 1 with default data, but saving in /admin will fail (Vercel's filesystem is read-only).

## Program the NFC cards
Use the free **NFC Tools** app (Android/iOS): Write → Add a record → **URL** → `https://YOUR-SITE.vercel.app/c/1` → Write, tap card 1.
Repeat for cards 2…20 with `/c/2` … `/c/20`. Optionally **lock** the chip afterwards (permanent) so nobody can overwrite it.

## Change the number of cards
Set env var `TOTAL_CARDS` (default 20).

## Change the default data of card 1
Edit `DEFAULT_CARDS` in `lib/store.js` (only used until the card is saved once from /admin).
