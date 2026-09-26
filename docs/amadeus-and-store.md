# Amadeus sandbox & App Store checklist

## Amadeus Self-Service (sandbox)

1. Buka https://developers.amadeus.com/ dan buat akun.
2. Create a new app → salin **API Key** / **API Secret**.
3. Salin template env:

```bash
cp apps/api/.env.example apps/api/.env
```

4. Isi:

```env
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
AMADEUS_HOSTNAME=test.api.amadeus.com
```

5. Jalankan `npm run api` lalu `GET /health` — `amadeusConfigured` harus `true`.
6. `POST /flights/search` tanpa field `demo` berarti data live dari sandbox.

Tanpa kredensial, BFF tetap mengembalikan offer demo agar UI bisa jalan offline.

### Produksi Amadeus

- Ganti hostname ke `api.amadeus.com` setelah akun production disetujui.
- Jangan pernah expose Client Secret ke Expo / browser.

## Partner handoff (setelah kontrak)

1. Tambah class provider baru yang implement `FlightProvider` di `apps/api/src/providers/`.
2. Map response partner ke `FlightOffer` (lihat `packages/shared`).
3. Isi `bookingUrl` dengan deep link / checkout URL partner.
4. Layar `handoff` di mobile otomatis membuka URL tersebut.

## EAS / App Store / Play Store

Prasyarat: Apple Developer Program, Google Play Console, privacy policy URL publik.

```bash
npm i -g eas-cli
cd apps/mobile
eas login
eas init   # update projectId di app.json
```

Build & submit:

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android
```

Checklist listing:

- [ ] Nama & deskripsi: search harga tiket; booking via partner
- [ ] Screenshot iPhone / Android
- [ ] Privacy policy (tidak menyimpan kartu kredit di MVP)
- [ ] Support URL / email
- [ ] Age rating sesuai konten travel
- [ ] `EXPO_PUBLIC_API_URL` mengarah ke API HTTPS produksi saat build release

Identitas bundle (sudah di `app.json`):

- iOS: `com.ticket.app`
- Android: `com.ticket.app`
