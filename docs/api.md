# Dokumentasi API — SIAP Backend

Base URL: `http://127.0.0.1:8000/api` (jalankan `php artisan serve`).

**Header wajib:** `Accept: application/json` — tanpa ini Laravel bisa membalas HTML saat error.

**Autentikasi:** Semua endpoint (kecuali login) memerlukan header `Authorization: Bearer <token>`. Token didapat dari `POST /api/login`.

### Daftar isi

1. [Konvensi Response](#konvensi-response)
2. [Auth](#auth)
3. [Pola Umum](#pola-umum)
4. [Resident](#resident-penghuni)
5. [House](#house-rumah)
6. [OccupancyHistory](#occupancyhistory-kepenghunian)
7. [FeeType](#feetype-jenis-iuran)
8. [ExpenseCategory](#expensecategory-kategori-pengeluaran)
9. [Expense](#expense-pengeluaran)
10. [Bill](#bill-tagihan)
11. [Payment](#payment-pembayaran)
12. [Report](#report-laporan-kas)
13. [Skenario Tes Cepat](#skenario-tes-cepat)

---

## Konvensi Response

Semua response — sukses maupun gagal — punya envelope yang sama. FE cukup cek `success`, lalu `errors` untuk validasi form.

**Sukses**

```json
{ "success": true, "message": "...", "data": { } }
```

**Sukses + pagination**

```json
{
  "success": true,
  "message": "Daftar penghuni berhasil diambil.",
  "data": [ ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "path": "http://127.0.0.1:8000/api/residents",
    "per_page": 15,
    "to": 1,
    "total": 1,
    "links": [ ]
  }
}
```

**Gagal**

```json
{ "success": false, "message": "Data tidak ditemukan." }
```

**Validasi gagal (422)** — satu-satunya response dengan key `errors`:

```json
{
  "success": false,
  "message": "The full name field is required. (and 2 more errors)",
  "errors": {
    "full_name": ["The full name field is required."],
    "gender": ["The selected gender is invalid."]
  }
}
```

| Kode | Kapan |
| --- | --- |
| 200 | GET, PATCH, DELETE sukses |
| 201 | POST sukses |
| 401 | Belum login / token invalid |
| 403 | Tidak punya hak akses |
| 404 | ID tidak ada / route salah |
| 405 | Method HTTP salah |
| 409 | Konflik aturan bisnis |
| 422 | Validasi input gagal |
| 500 | Server error (cek `storage/logs/laravel.log`) |

---

## Auth

Autentikasi memakai Laravel Sanctum (Bearer token). User default dari seeder: `admin@siap.local` / `password`.

### Login

`POST /api/login`

| Field | Wajib | Aturan |
| --- | --- | --- |
| `email` | ya | email valid |
| `password` | ya | string |

| Sukses | Gagal |
| --- | --- |
| 200 — *Login berhasil.* | 422 (email/password salah atau validasi gagal) |

Response `data`:

```json
{
  "user": {
    "id": 1,
    "name": "Administrator",
    "email": "admin@siap.local",
    "created_at": "...",
    "updated_at": "..."
  },
  "token": "1|..."
}
```

Simpan `token` dan kirim di semua request berikutnya:

```
Authorization: Bearer 1|...
```

### Profil pengguna

`GET /api/user`

| Sukses | Gagal |
| --- | --- |
| 200 — *Profil pengguna berhasil diambil.* | 401 |

### Logout

`POST /api/logout`

Menghapus token yang sedang dipakai.

| Sukses | Gagal |
| --- | --- |
| 200 — *Logout berhasil.* | 401 |

---

## Pola Umum

### Pagination

Hampir semua endpoint list mendukung `per_page` (default 15, max 100) dan `page`.

### CRUD standar

Modul `residents`, `houses`, `fee-types`, `expense-categories`:

| Aksi | Method | Status sukses | Gagal umum |
| --- | --- | --- | --- |
| List | GET | 200 | — |
| Create | POST | 201 | 422 |
| Show | GET `/{id}` | 200 | 404 |
| Update | PATCH/PUT `/{id}` | 200 | 404, 422, 409* |
| Delete | DELETE `/{id}` | 200 | 404, 409 |

\*409 hanya modul dengan aturan bisnis khusus (lihat tiap modul).

Update bersifat **partial** — cukup kirim field yang diubah.

### Append-only

`expenses`, `bills`, `payments`, `occupancy_histories` tidak punya update/delete lewat API. Koreksi = catat baris baru.

### Upload file (Resident)

| Kasus | Cara |
| --- | --- |
| Create dengan foto | `multipart/form-data` |
| Create tanpa foto | JSON |
| Update foto | `POST` + `_method=PATCH` (PHP tidak baca upload di PUT/PATCH) |
| Hapus foto | `POST` + `_method=PATCH`, kirim `id_card_photo=` kosong |

Foto lama otomatis dihapus saat diganti atau di-clear.

### Contoh curl dasar

```bash
BASE="http://127.0.0.1:8000/api"
H="Accept: application/json"
```

---

## Resident (Penghuni)

`resident_type` (`contract` / `permanent`) adalah identitas penghuni, bukan status hunian. `current_house` di-compute dari `occupancy_histories`.

### Field

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `full_name` | string | ya | max 255 |
| `gender` | string | ya | `male` / `female` |
| `resident_type` | string | ya | `contract` / `permanent` |
| `phone_number` | string | ya | max 20, regex `^[0-9+\-\s()]+$` |
| `is_married` | boolean | ya | `1`/`0`/`true`/`false` |
| `id_card_photo` | file | tidak | jpeg/jpg/png/webp, max 2 MB |

### Objek response

```json
{
  "id": 1,
  "full_name": "Syauqi",
  "gender": "male",
  "id_card_photo": "id-cards/xxx.png",
  "id_card_photo_url": "http://localhost/storage/id-cards/xxx.png",
  "resident_type": "permanent",
  "phone_number": "081234567890",
  "is_married": true,
  "current_house": { "id": 1, "house_number": "A1" },
  "created_at": "2026-07-25T03:53:54+00:00",
  "updated_at": "2026-07-25T03:53:54+00:00"
}
```

`id_card_photo` = path mentah; `id_card_photo_url` = URL siap pakai di `<img>`. Keduanya `null` jika belum ada foto. `current_house` = rumah aktif atau `null`.

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/residents` | Query: `search`, `resident_type`, `is_married`, `per_page`, `page` | 200 — *Daftar penghuni berhasil diambil.* | — |
| POST | `/residents` | Body: semua field di atas | 201 — *Penghuni berhasil ditambahkan.* | 422 |
| GET | `/residents/{id}` | — | 200 — *Detail penghuni berhasil diambil.* | 404 |
| PATCH/PUT | `/residents/{id}` | Body: field partial | 200 — *Penghuni berhasil diperbarui.* | 404, 422, 409† |
| DELETE | `/residents/{id}` | — | 200 — *Penghuni berhasil dihapus.* | 404, 409‡ |

Urutan list: ID terbesar dulu.

†409 jika ubah `resident_type` bentrok dengan co-resident di rumah yang sama.

‡409 jika sudah punya riwayat hunian atau pembayaran.

### Contoh request

```json
// POST / PATCH (tanpa foto)
{
  "full_name": "Syauqi",
  "gender": "male",
  "resident_type": "permanent",
  "phone_number": "081234567890",
  "is_married": true
}
```

---

## House (Rumah)

Tabel hanya `house_number`. `is_occupied` dan `current_residents` di-compute. Satu rumah bisa punya **beberapa penghuni aktif** — `current_residents` selalu array.

Check-in/out/replace ada di modul [OccupancyHistory](#occupancyhistory-kepenghunian), bukan di sini.

### Field

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `house_number` | string | ya | max 50, unik |

### Objek response

```json
{
  "id": 1,
  "house_number": "A-01",
  "is_occupied": true,
  "current_residents": [
    {
      "resident": { "id": 1, "full_name": "Syauqi", "gender": "male" },
      "occupied_since": "2026-01-01"
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

Kosong: `is_occupied: false`, `current_residents: []`.

### Logika status dihuni

Untuk tiap penghuni, ambil event **terakhir milik penghuni itu** (lintas rumah, urut `event_date` lalu `id`):

- Terakhir = `check_in` di rumah ini → aktif di rumah ini
- Terakhir = `check_out`, atau `check_in` di rumah lain → tidak dihitung

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/houses` | Query: `search`, `status` (`occupied`/`vacant`), `per_page`, `page` | 200 — *Daftar rumah berhasil diambil.* | — |
| POST | `/houses` | Body: `house_number` | 201 — *Rumah berhasil ditambahkan.* | 422 |
| GET | `/houses/{id}` | — | 200 — *Detail rumah berhasil diambil.* | 404 |
| PATCH/PUT | `/houses/{id}` | Body: `house_number` | 200 — *Rumah berhasil diperbarui.* | 404, 422 |
| DELETE | `/houses/{id}` | — | 200 — *Rumah berhasil dihapus.* | 404, 409* |

Urutan list: natural sort nomor rumah (`A-2` sebelum `A-10`).

\*409 jika sudah punya riwayat hunian atau tagihan.

### Contoh request

```json
{ "house_number": "A-01" }
```

---

## OccupancyHistory (Kepenghunian)

Tabel `occupancy_histories` append-only. Setiap check-in/out = baris baru.

### Body request

| Field | Wajib | Aturan |
| --- | --- | --- |
| `resident_id` | check-in/out | exists di `residents` |
| `old_resident_id` | replace | exists, ≠ `new_resident_id` |
| `new_resident_id` | replace | exists |
| `event_date` | semua | date, tidak boleh masa depan |

### Aturan bisnis

**Check-in:** (1) penghuni tidak aktif di rumah manapun; (2) jika rumah sudah berpenghuni, `resident_type` harus sama.

**Check-out:** (1) penghuni aktif di rumah URL; (2) `event_date` ≥ tanggal check-in terakhir.

**Replace-resident:** checkout + checkin dalam satu transaksi DB (atomic).

### Endpoint

| Method | Path | Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| POST | `/houses/{house}/check-in` | `resident_id`, `event_date` | 201 — *Penghuni berhasil dimasukkan ke rumah ini.* | 404, 422, 409 |
| POST | `/houses/{house}/check-out` | `resident_id`, `event_date` | 200 — *Penghuni berhasil dikeluarkan dari rumah ini.* | 404, 422, 409 |
| POST | `/houses/{house}/replace-resident` | `old_resident_id`, `new_resident_id`, `event_date` | 200 — *Penghuni berhasil diganti.* | 404, 422, 409 |
| GET | `/occupancy-histories` | Query: `house_id`, `resident_id`, `event_type`, `per_page`, `page` | 200 — *Riwayat kepenghunian berhasil diambil.* | — |

Response check-in/out/replace: `data` = objek **House** terbaru.

### Objek riwayat

```json
{
  "id": 6,
  "house": { "id": 1, "house_number": "A-01" },
  "resident": { "id": 4, "full_name": "Tono" },
  "event_type": "check_out",
  "event_date": "2026-02-10",
  "created_at": "..."
}
```

Urutan riwayat: `event_date` desc, `id` desc.

### Contoh request

```json
// check-in / check-out
{ "resident_id": 1, "event_date": "2026-01-01" }

// replace-resident
{ "old_resident_id": 1, "new_resident_id": 3, "event_date": "2026-06-01" }
```

---

## FeeType (Jenis Iuran)

Nominal default/terkini. Saat tagihan digenerate, di-snapshot ke `bills.amount`.

### Field

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `name` | string | ya | max 255, unik |
| `amount` | number | ya | min 0 |
| `is_recurring` | boolean | tidak | default `true` |
| `due_day` | integer | kondisional | 1–31. Wajib jika recurring, dilarang jika non-recurring |

Non-recurring: `due_day: null`. Jatuh tempo iuran sekali jalan ditentukan saat generate tagihan.

### Objek response

```json
{
  "id": 1,
  "name": "Satpam",
  "amount": "100000.00",
  "is_recurring": true,
  "due_day": 10,
  "created_at": "...",
  "updated_at": "..."
}
```

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/fee-types` | Query: `search`, `is_recurring`, `per_page`, `page` | 200 — *Daftar jenis iuran berhasil diambil.* | — |
| POST | `/fee-types` | Body: field di atas | 201 — *Jenis iuran berhasil ditambahkan.* | 422 |
| GET | `/fee-types/{id}` | — | 200 — *Detail jenis iuran berhasil diambil.* | 404 |
| PATCH/PUT | `/fee-types/{id}` | Body: partial | 200 — *Jenis iuran berhasil diperbarui.* | 404, 422 |
| DELETE | `/fee-types/{id}` | — | 200 — *Jenis iuran berhasil dihapus.* | 404, 409* |

Urutan list: `name` asc.

\*409 jika sudah punya tagihan. Ubah nominal master tidak mengubah tagihan lama.

**Catatan update:** ubah ke non-recurring → `due_day` otomatis null. Partial update field lain tidak mewajibkan kirim ulang `due_day`.

### Contoh request

```json
// recurring
{ "name": "Keamanan", "amount": 50000, "is_recurring": true, "due_day": 10 }

// sekali jalan
{ "name": "17 Agustusan", "amount": 75000, "is_recurring": false }
```

---

## ExpenseCategory (Kategori Pengeluaran)

Master data kategori pengeluaran operasional.

### Field

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `name` | string | ya | max 255, unik |

### Objek response

```json
{
  "id": 1,
  "name": "Gaji Satpam",
  "created_at": "...",
  "updated_at": "..."
}
```

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/expense-categories` | Query: `search`, `per_page`, `page` | 200 — *Daftar kategori pengeluaran berhasil diambil.* | — |
| POST | `/expense-categories` | Body: `name` | 201 — *Kategori pengeluaran berhasil ditambahkan.* | 422 |
| GET | `/expense-categories/{id}` | — | 200 — *Detail kategori pengeluaran berhasil diambil.* | 404 |
| PATCH/PUT | `/expense-categories/{id}` | Body: partial | 200 — *Kategori pengeluaran berhasil diperbarui.* | 404, 422 |
| DELETE | `/expense-categories/{id}` | — | 200 — *Kategori pengeluaran berhasil dihapus.* | 404, 409* |

Urutan list: `name` asc.

\*409 jika sudah punya pengeluaran.

---

## Expense (Pengeluaran)

Append-only — list, create, show saja.

### Field (POST)

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `expense_category_id` | integer | ya | exists |
| `description` | string | ya | max 255 |
| `amount` | number | ya | min 0.01 |
| `expense_date` | date | ya | tidak boleh masa depan |

### Objek response

```json
{
  "id": 1,
  "expense_category": { "id": 2, "name": "Token Listrik", "created_at": "...", "updated_at": "..." },
  "description": "Token listrik pos satpam Januari",
  "amount": "350000.00",
  "expense_date": "2026-01-15",
  "created_at": "...",
  "updated_at": "..."
}
```

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/expenses` | Query: `expense_category_id`, `expense_month`, `expense_year`, `search`, `per_page`, `page` | 200 — *Daftar pengeluaran berhasil diambil.* | — |
| POST | `/expenses` | Body: field di atas | 201 — *Pengeluaran berhasil dicatat.* | 422 |
| GET | `/expenses/{id}` | — | 200 — *Detail pengeluaran berhasil diambil.* | 404 |

Urutan list: `expense_date` desc, `id` desc.

### Contoh request

```json
{
  "expense_category_id": 2,
  "description": "Token listrik pos satpam Januari",
  "amount": 350000,
  "expense_date": "2026-01-15"
}
```

---

## Bill (Tagihan)

Tagihan melekat ke **rumah**, bukan penghuni. Append-only. `paid_amount` / `is_paid` dihitung dari `SUM(payment_details.paid_amount)`.

### Cara generate

| Mode | Cara | Response `data` |
| --- | --- | --- |
| Otomatis | `php artisan bills:generate-monthly` (cron tiap tgl 1, 00:05 WIB) | — |
| Manual 1 rumah | POST dengan `house_id` | objek tagihan |
| Manual semua rumah dihuni | POST tanpa `house_id` | `{ "created": N, "skipped": M }` |

Idempotent per `house_id + fee_type_id + bulan/tahun due_date`.

```bash
php artisan bills:generate-monthly
php artisan bills:generate-monthly --month=2 --year=2026
```

### Field (POST)

| Field | Wajib | Aturan |
| --- | --- | --- |
| `house_id` | tidak | Kosong = semua rumah dihuni; ada = satu rumah |
| `fee_type_id` | kondisional | Wajib tanpa `fee_type`. Dilarang bersamaan dengan `fee_type` |
| `fee_type` | kondisional | Buat fee type baru (aturan sama POST `/fee-types`) |
| `due_date` | ya | Periode = bulan/tahun tanggal ini |
| `amount` | tidak | Override nominal |

### Objek response

```json
{
  "id": 1,
  "house": { "id": 1, "house_number": "A-01" },
  "fee_type": { "id": 1, "name": "Satpam", "amount": "100000.00", "is_recurring": true, "due_day": 10, "created_at": "...", "updated_at": "..." },
  "due_date": "2026-01-10",
  "amount": "100000.00",
  "paid_amount": "0.00",
  "is_paid": false,
  "created_at": "...",
  "updated_at": "..."
}
```

Lunas jika `paid_amount >= amount`.

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/bills` | Query: `house_id`, `fee_type_id`, `due_month`, `due_year`, `is_paid`, `per_page`, `page` | 200 — *Daftar tagihan berhasil diambil.* | — |
| POST | `/bills` | Body: field di atas | 201 — lihat tabel mode generate | 422, 409* |
| GET | `/bills/{id}` | — | 200 — *Detail tagihan berhasil diambil.* | 404 |

Urutan list: `due_date` desc, `id` desc.

\*409 duplikat — **hanya mode satu rumah**.

Pesan sukses POST:
- Satu rumah: *Tagihan berhasil digenerate.*
- Semua rumah: *Tagihan berhasil digenerate untuk semua rumah dihuni.*

### Contoh request

```json
// satu rumah, fee type existing
{ "house_id": 1, "fee_type_id": 1, "due_date": "2026-02-10" }

// semua rumah dihuni + buat fee type sekali jalan
{
  "fee_type": { "name": "17 Agustusan 2026", "amount": 75000, "is_recurring": false },
  "due_date": "2026-08-17"
}

// override nominal
{ "house_id": 1, "fee_type_id": 1, "due_date": "2026-03-10", "amount": 150000 }
```

---

## Payment (Pembayaran)

1 transaksi = 1 header `payments` + N baris `payment_details` (satu transaksi DB). Append-only.

`total_amount` = `SUM(payment_details.paid_amount)`. Saat ini selalu bayar **penuh** per tagihan.

### Field (POST)

| Field | Tipe | Wajib | Aturan |
| --- | --- | --- | --- |
| `resident_id` | integer | ya | exists, aktif di rumah tagihan |
| `payment_date` | date | ya | tidak boleh masa depan |
| `notes` | string | tidak | max 500 |
| `bill_ids` | array | ya | min 1, unik, semua exists |

**Aturan bisnis:** semua tagihan dari rumah yang sama, belum lunas, penghuni aktif di rumah tersebut.

### Objek response

```json
{
  "id": 1,
  "resident": { "id": 1, "full_name": "Syauqi" },
  "house": { "id": 1, "house_number": "A-01" },
  "payment_date": "2026-01-15",
  "notes": "Bayar iuran Januari",
  "total_amount": "200000.00",
  "details": [
    {
      "id": 1,
      "bill_id": 1,
      "paid_amount": "100000.00",
      "bill": { }
    }
  ],
  "created_at": "...",
  "updated_at": "..."
}
```

`house` di header dari tagihan pertama. Tidak ada endpoint terpisah untuk `payment_details`.

### Endpoint

| Method | Path | Query / Body | Sukses | Gagal |
| --- | --- | --- | --- | --- |
| GET | `/payments` | Query: `resident_id`, `house_id`, `payment_month`, `payment_year`, `search`, `per_page`, `page` | 200 — *Daftar pembayaran berhasil diambil.* | — |
| POST | `/payments` | Body: field di atas | 201 — *Pembayaran berhasil dicatat.* | 422, 409 |
| GET | `/payments/{id}` | — | 200 — *Detail pembayaran berhasil diambil.* | 404 |

Urutan list: `payment_date` desc, `id` desc.

409: tagihan dari rumah berbeda / sudah lunas / penghuni tidak aktif di rumah tagihan.

### Contoh request

```json
// satu tagihan
{
  "resident_id": 1,
  "payment_date": "2026-01-15",
  "notes": "Bayar iuran Januari",
  "bill_ids": [1]
}

// banyak tagihan sekaligus (misal bayar 12 bulan — tagihan harus sudah di-generate)
{
  "resident_id": 1,
  "payment_date": "2026-01-15",
  "bill_ids": [1, 2, 3]
}
```

---

## Report (Laporan Kas)

Read-only. Agregasi pemasukan (`payments` + `payment_details`) dan pengeluaran (`expenses`).

| Metrik | Sumber | Periode berdasarkan |
| --- | --- | --- |
| Pemasukan | `SUM(payment_details.paid_amount)` | `payments.payment_date` |
| Pengeluaran | `SUM(expenses.amount)` | `expenses.expense_date` |
| Saldo | pemasukan − pengeluaran | on-the-fly |

> Pemasukan = kapan uang diterima, **bukan** bulan iuran tagihan. Tagihan Januari dibayar 5 Februari → masuk laporan **Februari**.

Nominal string desimal 2 digit (`"1500000.00"`).

### GET `/reports/dashboard`

Ringkasan dashboard: hunian, keuangan, tagihan, pembayaran terakhir, dan grafik arus kas 6 bulan terakhir.

| Param | Default | Aturan |
| --- | --- | --- |
| `month` | bulan berjalan | integer 1–12 |
| `year` | tahun berjalan | integer 2000–2100 |

| Sukses | Gagal |
| --- | --- |
| 200 — *Data dashboard berhasil diambil.* | 422 |

```json
{
  "period": {
    "month": 7,
    "year": 2026,
    "month_label": "Juli 2026"
  },
  "occupancy": {
    "total_houses": 28,
    "occupied_houses": 15,
    "vacant_houses": 13,
    "occupancy_rate": 53.6
  },
  "finance_current_month": {
    "total_income": "1500000.00",
    "total_expense": "750000.00",
    "balance": "750000.00"
  },
  "finance_current_year": {
    "total_income": "8500000.00",
    "total_expense": "3300000.00",
    "balance": "5200000.00"
  },
  "bills": {
    "unpaid_count": 12,
    "unpaid_total_amount": "1200000.00",
    "paid_this_due_month_count": 20,
    "due_this_month_count": 28
  },
  "recent_payments": [],
  "cash_flow_chart": [
    {
      "month": 2,
      "year": 2026,
      "month_label": "Februari 2026",
      "income": "500000.00",
      "expense": "200000.00",
      "balance": "300000.00"
    }
  ]
}
```

| Field | Arti |
| --- | --- |
| `occupancy.occupancy_rate` | Persentase rumah dihuni (1 desimal) |
| `finance_current_month` | Pemasukan/pengeluaran/saldo bulan `period` |
| `finance_current_year` | Pemasukan/pengeluaran/saldo tahun `period.year` |
| `bills.unpaid_count` | Semua tagihan belum lunas (global) |
| `bills.unpaid_total_amount` | Total sisa tagihan belum lunas |
| `bills.paid_this_due_month_count` | Tagihan jatuh tempo bulan `period` yang sudah lunas |
| `bills.due_this_month_count` | Total tagihan jatuh tempo bulan `period` |
| `recent_payments` | 5 pembayaran terakhir (struktur sama modul Payment) |
| `cash_flow_chart` | 6 bulan terakhir hingga `period` (income/expense/balance per bulan) |

Tanpa query param → periode = bulan & tahun berjalan.

### GET `/reports/summary`

Ringkasan Jan–Des untuk satu tahun (12 titik grafik).

| Param | Default | Aturan |
| --- | --- | --- |
| `year` | tahun berjalan | integer 2000–2100 |

| Sukses | Gagal |
| --- | --- |
| 200 — *Ringkasan laporan kas berhasil diambil.* | 422 |

```json
{
  "period": { "year": 2026, "months": 12 },
  "summary": {
    "total_income": "1500000.00",
    "total_expense": "750000.00",
    "balance": "750000.00"
  },
  "chart": [
    {
      "month": 1,
      "year": 2026,
      "month_label": "Januari 2026",
      "income": "500000.00",
      "expense": "200000.00",
      "balance": "300000.00",
      "cumulative_balance": "300000.00"
    }
  ]
}
```

| Field chart | Arti |
| --- | --- |
| `balance` | Saldo neto bulan itu |
| `cumulative_balance` | Saldo kumulatif Jan–bulan tersebut |

Bulan tanpa transaksi tetap muncul dengan `"0.00"`.

### GET `/reports/detail`

Detail transaksi satu bulan + breakdown kategori pengeluaran.

| Param | Wajib | Default | Aturan |
| --- | --- | --- | --- |
| `month` | ya | — | 1–12 |
| `year` | tidak | tahun berjalan | 2000–2100 |

| Sukses | Gagal |
| --- | --- |
| 200 — *Detail laporan kas berhasil diambil.* | 422 |

Response `data` berisi:

- `period` — `{ month, year, month_label }`
- `summary` — `{ total_income, total_expense, balance }`
- `income` — array objek payment (sama struktur modul Payment)
- `expenses` — array objek expense
- `expenses_by_category` — agregasi per kategori:

```json
{
  "expense_category": { "id": 1, "name": "Gaji Satpam" },
  "total_amount": "1500000.00",
  "transaction_count": 1
}
```

Bulan kosong: `income`/`expenses`/`expenses_by_category` = `[]`, summary = `"0.00"`.

Urutan: `income`/`expenses` by tanggal desc; `expenses_by_category` by `total_amount` desc.

---

## Skenario Tes Cepat

Urutan minimal untuk smoke test semua modul. Sesuaikan ID dengan data di database.

```bash
BASE="http://127.0.0.1:8000/api"
H="Accept: application/json"

# Login (dapatkan token)
TOKEN=$(curl -s -X POST "$BASE/login" -H "$H" -H "Content-Type: application/json" \
  -d '{"email":"admin@siap.local","password":"password"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
AUTH="Authorization: Bearer $TOKEN"

# Resident
curl -s -X POST "$BASE/residents" -H "$H" -H "$AUTH" \
  -F "full_name=Syauqi" -F "gender=male" -F "resident_type=permanent" \
  -F "phone_number=081234567890" -F "is_married=1"                    # 201
curl -s -X POST "$BASE/residents" -H "$H" -H "$AUTH" -F "gender=alien"             # 422
curl -s -H "$H" -H "$AUTH" "$BASE/residents/999"                                   # 404

# House
curl -s -X POST "$BASE/houses" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"house_number":"A-01"}'                                          # 201
curl -s -X POST "$BASE/houses" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"house_number":"A-01"}'                                          # 422
curl -s -H "$H" -H "$AUTH" "$BASE/houses?status=vacant"

# Occupancy
curl -s -X POST "$BASE/houses/1/check-in" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"resident_id":1,"event_date":"2026-01-01"}'                      # 201
curl -s -X POST "$BASE/houses/1/check-out" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"resident_id":1,"event_date":"2026-06-01"}'                      # 200
curl -s -H "$H" -H "$AUTH" "$BASE/occupancy-histories?house_id=1"

# FeeType
curl -s -X POST "$BASE/fee-types" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Keamanan","amount":50000,"is_recurring":true,"due_day":10}'

# ExpenseCategory & Expense
curl -s -X POST "$BASE/expense-categories" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Pembelian Alat Kebersihan"}'
curl -s -X POST "$BASE/expenses" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"expense_category_id":2,"description":"Token listrik","amount":350000,"expense_date":"2026-01-15"}'

# Bill (butuh rumah dihuni + fee type)
curl -s -X POST "$BASE/bills" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"house_id":1,"fee_type_id":1,"due_date":"2026-01-10"}'           # 201
curl -s -X POST "$BASE/bills" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"house_id":1,"fee_type_id":1,"due_date":"2026-01-15"}'           # 409

# Payment (butuh tagihan belum lunas + penghuni aktif)
curl -s -X POST "$BASE/payments" -H "$H" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"resident_id":1,"payment_date":"2026-01-15","bill_ids":[1]}'     # 201

# Report
curl -s -H "$H" -H "$AUTH" "$BASE/reports/dashboard"                              # 200
curl -s -H "$H" -H "$AUTH" "$BASE/reports/dashboard?month=7&year=2026"           # 200
curl -s -H "$H" -H "$AUTH" "$BASE/reports/summary?year=2026"                       # 200
curl -s -H "$H" -H "$AUTH" "$BASE/reports/detail?month=1&year=2026"                # 200
curl -s -H "$H" -H "$AUTH" "$BASE/reports/detail?year=2026"                        # 422
```

Tips: `-w "\nstatus:%{http_code}\n"` untuk status code; `| python3 -m json.tool` untuk format JSON.
