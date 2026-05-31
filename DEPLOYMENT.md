# Deployment Alfarezel Market

Project ini sudah disiapkan untuk deploy tanpa Firebase memakai PostgreSQL + Next.js custom server + Socket.io realtime.

## Rekomendasi Platform

Pilih platform yang support long-running Node process dan WebSocket:

- Railway
- Render
- Fly.io
- VPS sendiri

Vercel bisa untuk halaman dan API biasa, tapi tidak cocok untuk Socket.io server sendiri. Kalau tetap mau Vercel, pakai Ably/Pusher untuk realtime.

## Environment Production

Set variabel berikut di dashboard platform deploy:

```env
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME="Alfarezel Market"
ADMIN_DEFAULT_USERNAME="alfarez@gmail.com"
ADMIN_DEFAULT_EMAIL="alfarez@gmail.com"
ADMIN_DEFAULT_TEMP_PASSWORD=
ADMIN_TOPUP_NUMBER="087760337535"
RESET_PASSWORD_TOKEN=
NODE_ENV="production"
```

Catatan:

- `DATABASE_URL` pakai PostgreSQL production, misalnya Railway Postgres, Render Postgres, Neon, Supabase Postgres, atau VPS Postgres.
- `JWT_SECRET` wajib panjang dan random.
- `ADMIN_DEFAULT_TEMP_PASSWORD` hanya dipakai saat seed admin awal. Setelah login pertama, admin wajib ganti password.
- Jangan tampilkan credential admin di halaman publik.

## Deploy Railway

1. Push project ke GitHub.
2. Buat Railway project.
3. Tambahkan PostgreSQL plugin.
4. Deploy repo ini.
5. Set environment variable di Railway.
6. Railway akan membaca `railway.json` dan `Dockerfile`.
7. Setelah deploy pertama berhasil, jalankan command sekali dari Railway shell:

```bash
npm run db:push
npm run db:seed
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
2. Buat PostgreSQL database di Render.
3. Buat Web Service dari repo ini.
4. Pilih Docker environment.
5. Set environment variable.
6. Render bisa membaca `render.yaml`.
7. Setelah deploy pertama, buka Render shell dan jalankan:

```bash
npm run db:push
npm run db:seed
```

## Realtime Chat

Realtime chat memakai Socket.io di `server.mjs`.

Client chat memakai:

```text
/socket.io
```

Event:

- `chat:join`
- `chat:send`
- `chat:message`

Pesan tetap disimpan ke PostgreSQL melalui Prisma, jadi realtime bukan cuma memory sementara.

## Upload File

Upload saat ini sudah cloud-ready di level form/API path, tapi belum memakai provider storage production. Untuk deploy serius, pilih salah satu:

- Cloudinary
- S3/R2
- Supabase Storage

Firebase tidak wajib.

## Checklist Sebelum Publik

- Jalankan `npm run build`.
- Pastikan `/api/health` mengembalikan `200`.
- Pastikan `/api/health/db` mengembalikan `200`.
- Jalankan `npm run db:push`.
- Jalankan `npm run db:seed`.
- Login admin dengan email dari `.env`.
- Ganti password admin pertama kali.
- Tes top up request.
- Tes order escrow.
- Tes chat realtime dari dua browser.
- Tes report/dispute.
