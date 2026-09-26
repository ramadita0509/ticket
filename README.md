# Ticket — MVP Search + Harga

Website / aplikasi pencarian tiket pesawat sederhana. End user melihat harga lewat app kita; booking final di-handoff ke partner (MVP A).

## Arsitektur

- `apps/mobile` — Expo (Web + iOS + Android), Expo Router
- `apps/api` — Hono BFF (API key Amadeus tidak pernah ke client)
- `packages/shared` — tipe `FlightOffer` + skema Zod

Tanpa kredensial Amadeus, API mengembalikan **demo offers** agar UI tetap bisa dikembangkan.

## Setup cepat

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/mobile/.env.example apps/mobile/.env

# Terminal 1 — API
npm run api

# Terminal 2 — Web / Expo
npm run web
# atau: npm run mobile
```

API default: `http://localhost:8787`  
Health check: `GET /health`

### Endpoint

| Method | Path | Keterangan |
|--------|------|------------|
| GET | `/health` | Status + flag Amadeus |
| GET | `/airports/suggest?q=` | Autocomplete bandara |
| POST | `/flights/search` | Body: `origin`, `destination`, `departureDate`, `adults` |
| GET | `/flights/offers/:id` | Detail offer dari cache |

## Amadeus sandbox

1. Daftar di [Amadeus for Developers](https://developers.amadeus.com/)
2. Buat app → dapatkan **API Key** (Client ID) & **API Secret**
3. Isi di `apps/api/.env`:

```env
AMADEUS_CLIENT_ID=your_key
AMADEUS_CLIENT_SECRET=your_secret
AMADEUS_HOSTNAME=test.api.amadeus.com
```

4. Restart `npm run api` — response search tidak lagi bertanda `demo: true`

Catatan:

- Sandbox punya rate limit dan data uji; rute/harga bisa beda dari produksi.
- Harga bersifat indikatif sampai booking di partner selesai.
- Field `bookingUrl` di offer sengaja `null` dari Amadeus; isi lewat adapter partner nanti.

## Handoff partner (nanti)

Implementasikan `FlightProvider` baru (atau perluas mapper) yang mengisi `bookingUrl`. UI layar **Handoff** sudah membuka URL lewat `expo-web-browser` bila ada.

## App Store / Play Store (checklist)

1. Buat akun [Apple Developer](https://developer.apple.com/) & [Google Play Console](https://play.google.com/console)
2. Install EAS CLI: `npm i -g eas-cli` lalu `eas login`
3. Di `apps/mobile`: `eas init` — ganti `extra.eas.projectId` di `app.json`
4. Pastikan identitas:
   - iOS `bundleIdentifier`: `com.ticket.app`
   - Android `package`: `com.ticket.app`
5. Siapkan aset: ikon 1024×1024, splash, privacy policy URL (wajib store)
6. Build:
   - `eas build --platform ios --profile production`
   - `eas build --platform android --profile production`
7. Submit:
   - `eas submit --platform ios`
   - `eas submit --platform android`
8. Di listing sebutkan: harga dari API pihak ketiga; pembayaran/booking via partner (belum in-app purchase tiket)

Profil EAS sudah ada di [`apps/mobile/eas.json`](apps/mobile/eas.json) (`development` / `preview` / `production`).

## Deploy API

Deploy `apps/api` ke Railway / Fly.io / VPS. Set env Amadeus di host. Update `EXPO_PUBLIC_API_URL` di build mobile ke URL publik API (HTTPS).

## Lisensi

Private / internal MVP.
