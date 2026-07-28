# SIAP Frontend

Frontend admin untuk **SIAP** (Sistem Informasi Admin Perumahan).

## Stack

- React + TypeScript (Vite)
- Tailwind CSS v4 + shadcn/ui
- React Router
- TanStack Query + Axios
- React Hook Form + Zod
- Recharts

## Prasyarat

- [nvm](https://github.com/nvm-sh/nvm)
- Node.js & npm (versi sesuai `.nvmrc`, install lewat `nvm install`)
- Backend SIAP (Laravel API) sudah jalan — lihat repo backend untuk setup-nya

## Instalasi

```bash
git clone <repo-url>
cd siap-fe
nvm install
npm install
cp .env.example .env
```

Sesuaikan `VITE_API_URL` di `.env` kalau backend tidak di `http://127.0.0.1:8000/api`.

```bash
npm run dev
```

Buka http://localhost:5173

## Scripts

| Command | Keterangan |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run preview` | Preview build |
| `npm run lint` | Cek ESLint |

## Fitur

- **Auth** — login
- **Dashboard** — ringkasan keuangan & grafik
- **Penghuni** — CRUD data penghuni + upload KTP
- **Rumah** — CRUD rumah, check-in/out, riwayat hunian
- **Tagihan** — list, generate tagihan, detail
- **Pembayaran** — catat & lihat pembayaran
- **Pengeluaran** — catat & lihat pengeluaran operasional
- **Master Data** — jenis iuran, kategori pengeluaran
- **Laporan** — ringkasan & detail per periode

Struktur project: [`docs/project_structure.MD`](./docs/project_structure.MD)
