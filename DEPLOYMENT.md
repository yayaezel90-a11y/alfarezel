# Deployment Alfarezel Market

Project ini sudah disiapkan untuk deploy dengan Firebase Firestore + Next.js custom server + Socket.io realtime. Mode PostgreSQL masih ada sebagai alternatif, tapi untuk jalur terbaru pakai `DATA_BACKEND=firebase`.

## Rekomendasi Platform

Pilih platform yang support long-running Node process dan WebSocket:

- Railway
- Render
- Fly.io
- VPS sendiri

Vercel bisa untuk halaman dan API biasa, tapi tidak cocok untuk Socket.io server sendiri. Kalau mau full ekosistem Firebase, gunakan Firebase App Hosting atau deploy container ke Cloud Run, bukan Firebase Hosting static biasa.

## Environment Production

Set variabel berikut di dashboard platform deploy:

```env
DATA_BACKEND=firebase
NEXT_PUBLIC_DATA_BACKEND=firebase
JWT_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME="Alfarezel Market"
FIREBASE_SERVICE_ACCOUNT_BASE64=
ADMIN_DEFAULT_USERNAME="alfarez@gmail.com"
ADMIN_DEFAULT_EMAIL="alfarez@gmail.com"
ADMIN_DEFAULT_TEMP_PASSWORD=
ADMIN_TOPUP_NUMBER="087760337535"
RESET_PASSWORD_TOKEN=
NODE_ENV="production"
```

Catatan:

- `FIREBASE_SERVICE_ACCOUNT_BASE64` adalah service account JSON Firebase yang di-base64. Alternatifnya pakai `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, dan `FIREBASE_PRIVATE_KEY`.
- `JWT_SECRET` wajib panjang dan random.
- `ADMIN_DEFAULT_TEMP_PASSWORD` hanya dipakai saat seed admin awal. Setelah login pertama, admin wajib ganti password.
- Jangan tampilkan credential admin di halaman publik.

## Firebase yang Perlu Dinyalakan

Di Firebase Console:

1. Buat project Firebase.
2. Build > Firestore Database > Create database.
3. Pilih production mode.
4. Project settings > Service accounts > Generate new private key.
5. Jadikan file JSON service account ke base64, lalu isi `FIREBASE_SERVICE_ACCOUNT_BASE64`.

Firebase Authentication tidak wajib untuk versi ini karena auth memakai JWT session + bcrypt hash di Firestore. Firebase Storage opsional untuk upload bukti transfer, screenshot produk, avatar, dan lampiran chat.

## Deploy Railway

1. Push project ke GitHub.
2. Buat Railway project.
3. Set environment variable Firebase.
4. Deploy repo ini.
5. Railway akan membaca `railway.json` dan `Dockerfile`.
6. Setelah deploy pertama berhasil, jalankan command sekali dari Railway shell:

```bash
npm run firebase:seed
```

Start command:

```bash
npm run start
```

Healthcheck:

```text
/api/health
```

DB healthcheck:

```text
/api/health/db
```

## Deploy Render

1. Push project ke GitHub.
2. Buat Web Service dari repo ini.
4. Pilih Docker environment.
5. Set environment variable Firebase.
6. Render bisa membaca `render.yaml`.
7. Setelah deploy pertama, buka Render shell dan jalankan:

```bash
npm run firebase:seed
```

## Realtime Chat

Realtime chat memakai Socket.io di `server.mjs`. Saat `DATA_BACKEND=firebase`, user, order, dan pesan chat dibaca/disimpan ke Firestore.

Client chat memakai:

```text
/socket.io
```

Event:

- `chat:join`
- `chat:send`
- `chat:message`

Pesan tetap disimpan ke Firestore, jadi realtime bukan cuma memory sementara.

## Upload File

Upload saat ini sudah cloud-ready di level form/API path, tapi belum memakai provider storage production. Untuk deploy serius, pilih salah satu:

- Cloudinary
- S3/R2
- Firebase Storage

## Checklist Sebelum Publik

- Jalankan `npm run build`.
- Pastikan `/api/health` mengembalikan `200`.
- Pastikan `/api/health/db` mengembalikan `200`.
- Jalankan `npm run firebase:seed`.
- Login admin dengan email dari `.env`.
- Ganti password admin pertama kali.
- Tes top up request.
- Tes order escrow.
- Tes chat realtime dari dua browser.
- Tes report/dispute.
