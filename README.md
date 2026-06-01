# Alfarezel Market

Marketplace jual beli akun game untuk user Indonesia. Project ini memakai Next.js App Router, Tailwind CSS, Firebase Firestore mode, JWT cookie session, bcrypt password hashing, Zod validation, wallet ledger, escrow/order hold, top up manual, withdraw seller, chat transaksi, report/dispute, review, wishlist, dan admin panel. Mode PostgreSQL/Prisma lama tetap tersedia sebagai alternatif.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion, lucide-react
- Backend: Next API routes
- Database: Firebase Firestore (`DATA_BACKEND=firebase`) atau PostgreSQL via Prisma
- Auth: JWT session cookie httpOnly
- Security: bcrypt password hashing, role guard, AES-GCM untuk data akun order, audit log
- Realtime: Socket.io custom server dengan pesan disimpan ke Firestore saat mode Firebase aktif

## Setup Lokal

1. Salin env:

```bash
cp .env.example .env
```

2. Isi credential Firebase di `.env`.

Minimal aktifkan `DATA_BACKEND=firebase`, lalu isi salah satu:

```env
FIREBASE_SERVICE_ACCOUNT_BASE64="base64-dari-service-account-json"
```

atau:

```env
FIREBASE_PROJECT_ID="project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

3. Seed admin, game, produk dummy, fee, seller, dan wallet ke Firestore:

```bash
npm run firebase:seed
```

4. Jalankan website:

```bash
npm run dev
```

Website lokal: `http://localhost:3000`

Untuk realtime Socket.io lokal:

```bash
npm run dev:realtime
```

Kalau `DATA_BACKEND=firebase`, kamu tidak perlu menjalankan Docker/PostgreSQL untuk login lokal.

## Admin Awal

Seed Firebase membuat admin awal dari variabel `ADMIN_DEFAULT_USERNAME`, `ADMIN_DEFAULT_EMAIL`, dan `ADMIN_DEFAULT_TEMP_PASSWORD` di file `.env`. Password disimpan sebagai hash bcrypt di Firestore, bukan plain text. Field `mustChangePassword` dibuat `true` agar admin mengganti password setelah login pertama.

## Struktur Folder

```text
prisma/
  schema.prisma          Database schema lengkap
  seed.ts                Seed admin, fee, game, seller, buyer, produk dummy
scripts/
  seed-firebase.ts       Seed admin dan dummy data ke Firebase Firestore
src/app/
  api/                   Backend API auth, produk, topup, order, chat, report, withdraw, admin
  marketplace/           Marketplace product listing
  game/[slug]/           Halaman khusus tiap game
  produk/[slug]/         Detail produk
  dashboard/             Dashboard buyer, seller, admin
  top-up/                Top up saldo manual
  withdraw/              Withdraw seller
  chat/[orderId]/        Chat transaksi
  report/                Report/dispute
  invoice/[id]/          Invoice detail
  bantuan/ rules/        Bantuan dan rules marketplace
src/components/          UI reusable marketplace dan dashboard
src/lib/                 Auth, Firebase, Prisma, invoice, wallet ledger, validation, data marketplace
```

## API Utama

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET|POST /api/products`
- `GET|PATCH|DELETE /api/products/[id]`
- `POST /api/products/[id]/review`
- `GET|POST /api/topups`
- `POST /api/topups/[id]/approve`
- `POST /api/topups/[id]/reject`
- `GET|POST /api/orders`
- `POST /api/orders/[id]/submit-account`
- `POST /api/orders/[id]/confirm`
- `POST /api/orders/[id]/refund`
- `POST /api/orders/[id]/hold`
- `GET|POST /api/chat/[orderId]/messages`
- `GET|POST /api/reports`
- `POST /api/reports/[id]/resolve`
- `GET|POST /api/withdraws`
- `POST /api/withdraws/[id]/approve`
- `POST /api/withdraws/[id]/reject`
- `POST /api/reviews`
- `GET|POST|DELETE /api/wishlist`
- `POST /api/seller/apply`
- `POST /api/admin/sellers/[id]/decision`
- `POST /api/admin/users/[id]/wallet-adjust`
- `GET /api/admin/overview`

## Catatan Produksi

- Ganti `JWT_SECRET` sebelum deploy.
- Untuk upload produksi, aktifkan Firebase Storage atau Cloudinary/S3/R2.
- Chat realtime penuh berjalan lewat custom server Socket.io di `server.mjs`; deploy ke platform yang support WebSocket seperti Railway, Render, Fly.io, atau VPS.
- Tambahkan email provider untuk forgot/reset password produksi.
- Aktifkan rate limit login, CSRF hardening, dan backup database berkala.

Panduan deploy lengkap ada di `DEPLOYMENT.md`.
