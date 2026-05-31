# Alfarezel Market

Marketplace jual beli akun game untuk user Indonesia. Project ini memakai Next.js App Router, Tailwind CSS, Prisma PostgreSQL, JWT cookie session, bcrypt password hashing, Zod validation, wallet ledger, escrow/order hold, top up manual, withdraw seller, chat transaksi, report/dispute, review, wishlist, dan admin panel.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion, lucide-react
- Backend: Next API routes
- Database: PostgreSQL via Prisma
- Auth: JWT session cookie httpOnly
- Security: bcrypt password hashing, role guard, AES-GCM untuk data akun order, audit log
- Realtime-ready: struktur chat transaksi dan Socket.io dependency tersedia untuk upgrade realtime

## Setup Lokal

1. Salin env:

```bash
cp .env.example .env
```

2. Jalankan PostgreSQL:

```bash
docker compose up -d
```

3. Push schema dan seed data:

```bash
npm run db:push
npm run db:seed
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

## Admin Awal

Seed membuat admin awal dari variabel `ADMIN_DEFAULT_USERNAME`, `ADMIN_DEFAULT_EMAIL`, dan `ADMIN_DEFAULT_TEMP_PASSWORD` di file `.env`. Password disimpan sebagai hash bcrypt, bukan plain text di database. Field `mustChangePassword` dibuat `true` agar admin mengganti password setelah login pertama.

## Struktur Folder

```text
prisma/
  schema.prisma          Database schema lengkap
  seed.ts                Seed admin, fee, game, seller, buyer, produk dummy
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
src/lib/                 Auth, Prisma, invoice, wallet ledger, validation, data marketplace
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
- Gunakan object storage untuk upload avatar, bukti transfer, screenshot produk, dan lampiran chat.
- Chat realtime penuh berjalan lewat custom server Socket.io di `server.mjs`; deploy ke platform yang support WebSocket seperti Railway, Render, Fly.io, atau VPS.
- Tambahkan email provider untuk forgot/reset password produksi.
- Aktifkan rate limit login, CSRF hardening, dan backup database berkala.

Panduan deploy lengkap ada di `DEPLOYMENT.md`.
