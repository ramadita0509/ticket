# El Wafa Travel — Flight Booking (Travelport)

Next.js booking app terintegrasi **Travelport TripServices Flights** (REST/JSON): search → price → book → bayar Midtrans → ticket.

## Stack

- `apps/web-booking` — Next.js App Router, TypeScript, Tailwind, Prisma (SQLite)
- GDS: Travelport TripServices (`TRAVELPORT_MODE=mock` | `live`)
- Payment: Midtrans Snap (mock settle bila key kosong)
- Queue: BullMQ (+ Redis) atau in-process; e-ticket PDF + email

## Setup

```bash
npm install
cp apps/web-booking/.env.example apps/web-booking/.env
cd apps/web-booking && npx prisma db push && npm run db:seed && cd ../..
npm run booking
```

Buka [http://localhost:3000](http://localhost:3000).

Detail: [`apps/web-booking/README.md`](apps/web-booking/README.md).

Admin home promo: [http://localhost:3000/admin](http://localhost:3000/admin) (`ADMIN_PASSWORD` di `.env`).

## Travelport

| Mode | Env |
|------|-----|
| Mock (default) | `TRAVELPORT_MODE=mock` — fixture multi-airline, tanpa kredensial |
| Live | `TRAVELPORT_MODE=live` + OAuth / Access Group / PCC |

Docs: [TripServices Flights](https://developer.travelport.com/apis/flights)

## Roadmap

1. Search (mock/live) — **done**
2. Air price / fare rules — **done**
3. Workbench booking + PNR — **done**
4. Midtrans + webhook — **done**
5. BullMQ ticketing — **done**
6. E-ticket PDF + email — **done**
