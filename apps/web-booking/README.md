# El Wafa Travel — Booking

Next.js app: Travelport search → price → PNR → Midtrans → e-ticket + configurable Umroh home promo.

## Run

```bash
# from monorepo root
cp apps/web-booking/.env.example apps/web-booking/.env
npm install
cd apps/web-booking && npx prisma db push && npm run db:seed && cd ../..
npm run booking
```

→ [http://localhost:3000](http://localhost:3000)  
→ Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (password dari `ADMIN_PASSWORD`)

## Flow

1. Search (`TRAVELPORT_MODE=mock` | `live`)
2. **Pilih** → `/checkout` — air price + passenger → PNR
3. `/booking/[id]` — Midtrans Snap (or mock pay) → webhook
4. BullMQ / in-process ticketing → PDF + email

## Home promo (admin)

- Flyer-style **Promo Umroh** boards (terpisah) + **Destinasi populer** di home
- Kelola di `/admin`:
  - row **Destinasi populer** → `/admin/destinations` (eyebrow, judul, deals JSON)
  - row **Promo Umroh** → campaigns (packages/terms/contact)
- Upload tersimpan di `public/uploads/`

## Env highlights

| Key | Notes |
|-----|--------|
| `TRAVELPORT_MODE` | `mock` default |
| `DATABASE_URL` | SQLite `file:./dev.db` |
| `ADMIN_PASSWORD` | Login `/admin` |
| Midtrans keys | Empty = demo settle button |
| `REDIS_URL` | Optional; without it ticketing is in-process |
| SMTP_* | Optional; without it email is logged only |

## Layout

- `src/lib/travelport/` — auth, search, price/book/ticket mocks
- `src/lib/home-campaigns.ts` — promo content
- `src/components/PromoBoard.tsx` / `DestinationDeals.tsx`
- `src/app/admin/*` — dashboard
- `src/app/api/admin/*` — login, campaigns CRUD, upload
