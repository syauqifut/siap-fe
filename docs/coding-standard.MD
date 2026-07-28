# SIAP Frontend — Coding Standards & Component Guidelines

Dokumen ini jadi acuan supaya kode konsisten di semua modul. Update kalau ada keputusan baru.

Lihat juga [`project_structure.MD`](./project_structure.MD) untuk struktur folder lengkap.

---

## 1. TypeScript & Import

- Semua kode pakai **TypeScript** (`.ts` / `.tsx`), bukan JavaScript
- Path alias `@/` mengarah ke `src/` — pakai untuk semua import internal
- Pisahkan import **type** dengan `import type { ... }`
- Urutan import:
  1. Library eksternal (React, react-router, lucide-react, dll)
  2. Baris kosong
  3. Import internal (`@/components`, `@/hooks`, `@/lib`, `@/types`, dll)

```tsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon } from 'lucide-react'

import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { useResidentList } from '@/hooks/useResidents'
import { getApiErrorMessage } from '@/lib/utils'
import type { Resident } from '@/types/resident'
```

**Penamaan kode vs UI:**
- Identifier kode (file, variabel, field API, type) → **English** (`full_name`, `resident_type`)
- Label UI yang dilihat user → **Bahasa Indonesia** (`Nama Lengkap`, `Tipe Penghuni`)

---

## 2. Struktur File Komponen

Urutan standar dalam 1 file komponen:

```tsx
// 1. Import eksternal
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Import internal
import { useResidentList } from '@/hooks/useResidents'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/utils'

// 3. Konstanta lokal (opsional)
const TYPE_OPTIONS = [/* ... */]

// 4. Component
export default function ResidentList() {
  // 4a. Hooks dulu (useState, useQuery, useNavigate, dll)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading, error } = useResidentList({ search })

  // 4b. Handler function
  const handleDelete = () => { /* ... */ }

  // 4c. Early return untuk loading/error
  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  // 4d. Return JSX utama
  return ( /* ... */ )
}
```

**Aturan export:**
- **Halaman** (`pages/`) → `export default function` (1 komponen utama per file)
- **Komponen reusable** (`components/shared/`, `components/{modul}/`) → **named export** (`export function StatusBadge`)
- Nama file = nama komponen (PascalCase), contoh: `ResidentList.tsx`

---

## 3. Naming Convention

| Item | Aturan | Contoh |
|---|---|---|
| Komponen | PascalCase | `ResidentForm`, `StatusBadge` |
| Function biasa / handler | camelCase, prefix `handle` untuk event handler | `handleSubmit`, `formatCurrency` |
| Custom hook | camelCase, prefix `use` | `useResidents`, `useAuth` |
| Boolean variable/state | prefix `is`/`has`/`should` | `isLoading`, `hasError` |
| File service | camelCase + suffix `Service` | `residentService.ts` |
| File type | camelCase, per resource | `resident.ts` |
| Zod schema | camelCase + suffix `Schema` | `residentSchema` |
| Constant | UPPER_SNAKE_CASE | `APP_NAME`, `AUTH_TOKEN_KEY` |

---

## 4. Styling (Tailwind + shadcn)

- Pakai utility class Tailwind langsung di JSX, **jangan** bikin file CSS terpisah kecuali global style di `index.css`
- Kalau class jadi panjang & conditional, pakai helper `cn()` dari `@/lib/utils`:
  ```tsx
  <div className={cn('p-4 rounded', isActive && 'bg-blue-100')}>
  ```
- Komponen dari shadcn (`components/ui/`) **jangan diedit struktur besar-besarannya** — kalau butuh variasi, extend lewat props/className, atau bikin wrapper baru di `components/shared/` atau `components/{modul}/`
- Konsisten pakai spacing scale Tailwind (`p-4`, `gap-2`, dst), hindari nilai custom kayak `p-[13px]` kecuali kepepet
- Icon dari **lucide-react**, dengan prop `data-icon="inline-start"` saat dipakai di dalam `Button`

---

## 5. State Management — Kapan Pakai Apa

| Kebutuhan | Pakai |
|---|---|
| Data dari server (list, detail) | **React Query** (`useQuery`) |
| Kirim data ke server (create/update/delete) | **React Query** (`useMutation`) |
| State lokal UI (input search, toggle modal, tab aktif) | **`useState`** biasa |
| Auth (user login, token) | **`AuthContext`** + `useAuth()` |
| Breadcrumb & judul halaman di header layout | **`PageHeaderContext`** (via komponen `PageHeader`) |
| Form input & validasi | **React Hook Form + Zod** |

**Jangan** simpan data server (hasil fetch API) di `useState` manual — selalu lewat React Query, biar caching & invalidation jalan otomatis.

---

## 6. Pattern Fetching Data

### Service (`services/`)

Satu file per resource. Service hanya berisi pemanggilan API — tidak ada React hook di sini.

```ts
// services/residentService.ts
import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { Resident, ResidentListParams, ResidentPayload } from '@/types/resident'

export const residentService = {
  async getAll(params: ResidentListParams = {}): Promise<PaginatedApiResponse<Resident>> {
    const { data } = await api.get<PaginatedApiResponse<Resident>>('/residents', { params })
    return data
  },

  async getById(id: number | string): Promise<Resident> {
    const { data } = await api.get<ApiResponse<Resident>>(`/residents/${id}`)
    return data.data as Resident
  },

  async create(payload: ResidentPayload, photo?: File): Promise<Resident> { /* ... */ },
  async update(id: number | string, payload: ResidentPayload, photo?: File | null): Promise<Resident> { /* ... */ },
  async remove(id: number | string): Promise<void> { /* ... */ },
}
```

### Custom Hook (`hooks/`)

Setiap resource punya file hook sendiri, isinya wrapper React Query:

```ts
// hooks/useResidents.ts
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { residentService } from '@/services/residentService'
import type { ResidentListParams, ResidentPayload } from '@/types/resident'

export function useResidentList(params: ResidentListParams = {}) {
  return useQuery({
    queryKey: ['residents', 'list', params],
    queryFn: () => residentService.getAll(params),
    placeholderData: keepPreviousData,  // halus saat ganti halaman/filter
  })
}

export function useResident(id?: string) {
  return useQuery({
    queryKey: ['residents', 'detail', id],
    queryFn: () => residentService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateResident() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, photo }: { payload: ResidentPayload; photo?: File }) =>
      residentService.create(payload, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
    },
  })
}
```

**Konvensi `queryKey`:** `['resource', 'list'|'detail', ...params]` — contoh: `['residents', 'list', { page: 1 }]`

**Aturan:**
- **Jangan** panggil `axios`/`service` langsung di komponen — selalu lewat custom hook
- Setelah mutation sukses, `invalidateQueries` dengan key induk resource (`['residents']`)
- List dengan pagination/filter pakai `keepPreviousData` supaya UI tidak flicker

### Types (`types/`)

Type & interface per resource di `types/`. Tipe umum API (response wrapper, pagination) di `types/api.ts`:

```ts
// types/resident.ts
export type ResidentType = 'contract' | 'permanent'

export interface Resident {
  id: number
  full_name: string
  resident_type: ResidentType
  // ...
}

export interface ResidentListParams {
  search?: string
  resident_type?: ResidentType
  page?: number
}

export interface ResidentPayload {
  full_name: string
  // ... field yang dikirim ke API
}
```

---

## 7. Pattern Form (React Hook Form + Zod)

1. **Schema** validasi di `lib/validators/`:
   ```ts
   // lib/validators/residentSchema.ts
   import { z } from 'zod'

   export const residentSchema = z.object({
     full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
     gender: z.enum(['male', 'female'], 'Jenis kelamin wajib dipilih'),
     resident_type: z.enum(['contract', 'permanent'], 'Tipe penghuni wajib dipilih'),
     phone_number: z.string().min(1, 'No. telepon wajib diisi'),
     is_married: z.boolean(),
   })

   export type ResidentFormValues = z.infer<typeof residentSchema>
   ```

2. **Halaman form** (`pages/`) — handle submit, mutation, navigasi
3. **Field form** diekstrak ke `components/{modul}/` kalau dipakai ulang (misal `ResidentFormFields.tsx` dipakai di form tambah/edit dan dialog check-in)
4. Dipakai di form dengan `zodResolver(residentSchema)` dan `useForm<ResidentFormValues>()`
5. Mode edit: isi form pakai prop `values` dari React Hook Form (bukan `useEffect` + `reset` manual)
6. Field upload file (foto KTP) di-handle terpisah — pakai `FormData` di service saat submit

---

## 8. Loading & Error State

Setiap halaman list/detail wajib handle kondisi ini:

```tsx
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage message={getApiErrorMessage(error)} />
if (!data) return <EmptyState text="Data tidak ditemukan" />

// untuk list: cek data?.data ?? []
```

- Pakai **`getApiErrorMessage(error)`** dari `@/lib/utils` — otomatis ambil pesan dari response API Laravel
- `LoadingSpinner`, `ErrorMessage`, `EmptyState` sudah tersedia di `components/shared/`

### Halaman List

- Filter/search lokal pakai `useState` + **debounce** (`useEffect` + `setTimeout` 300ms) sebelum kirim ke hook
- Reset `page` ke 1 saat filter berubah
- Data paginated: `const items = data?.data ?? []`, meta dari `data?.meta`
- **Seluruh baris tabel bisa diklik** untuk buka detail (`cursor-pointer` + `onClick` navigate di `TableRow`)
- Tombol aksi di dalam baris (edit/hapus) wajib `stopPropagation()` supaya tidak ikut navigasi
- Hapus data pakai `ConfirmDialog`, bukan `window.confirm()`

---

## 9. PageHeader & Navigasi

`PageHeader` (`components/shared/PageHeader.tsx`) wajib dipakai di setiap halaman dalam `MainLayout`.

**Cara kerja:**
- Breadcrumb + judul halaman dirender di **header layout** (`MainLayout`) via `PageHeaderContext`
- `PageHeader` di halaman hanya render: tombol Kembali, aksi, dan deskripsi (di area konten)
- `PageHeader` otomatis set document title via `useDocumentTitle` → `"Judul | SIAP"`

**Layout vertikal di area konten (urutan dari atas ke bawah):**

1. **Tombol Kembali & aksi** — satu baris: `backTo` di kiri, `action` di kanan
2. **Deskripsi** — opsional, di bawah

**Breadcrumb (di header layout):**

- **Jangan** sertakan `Dashboard` — mulai dari modul/induk langsung, contoh: `Rumah > Rumah A-01`, `Master Data > Jenis Iuran > Edit`
- `items` berisi **ancestor** saja. Item dengan `to` = link; item tanpa `to` = halaman aktif
- Prop `title` di `PageHeader` otomatis digabung ke breadcrumb sebagai segmen terakhir (judul halaman)
- Satu baris (`flex-nowrap`); teks panjang dipotong dengan ellipsis (`truncate`)

**Contoh halaman detail:**
```tsx
<PageHeader
  title={`Rumah ${house.house_number}`}
  description="Detail rumah, penghuni aktif, dan riwayat kepenghunian."
  breadcrumbs={[{ label: 'Rumah', to: '/houses' }]}
  backTo="/houses"
/>
// → header: Rumah > Rumah A-01
```

**Contoh halaman list:**
```tsx
<PageHeader
  title="Penghuni"
  description="Kelola data penghuni perumahan."
  breadcrumbs={[{ label: 'Penghuni' }]}
  action={
    <Button render={<Link to="/residents/new" />}>
      <PlusIcon data-icon="inline-start" />
      Tambah Penghuni
    </Button>
  }
/>
// → header: Penghuni
```

**Contoh halaman form:**
```tsx
<PageHeader
  title="Edit Penghuni"
  breadcrumbs={[
    { label: 'Penghuni', to: '/residents' },
    { label: resident.full_name, to: `/residents/${resident.id}` },
    { label: 'Edit' },
  ]}
  backTo={`/residents/${id}`}
/>
// → header: Penghuni > Syauqi > Edit
```

**Tombol navigasi & aksi:**
- `backTo` — tombol "Kembali" (ghost, kiri). Wajib di halaman detail/form
- `action` — aksi utama halaman (misal "Tambah"). Posisi kanan jika ada `backTo`
- Link di dalam `Button` pakai prop `render={<Link to="..." />}` (pattern Base UI shadcn)
- Setelah submit sukses (tambah/edit), redirect ke halaman list atau detail modul tersebut

---

## 10. Komponen Reusable

### `components/shared/` — lintas modul

| Komponen | Fungsi |
|---|---|
| `PageHeader` | Judul, breadcrumb (via context), tombol kembali/aksi, deskripsi |
| `Breadcrumbs` | Trail navigasi (dipakai internal oleh `MainLayout`, jangan render manual di halaman) |
| `StatusBadge` | Badge warna beda tergantung status (`positive` / `negative` / `neutral`) |
| `ConfirmDialog` | Konfirmasi sebelum delete/aksi penting |
| `LoadingSpinner` | Indikator loading halaman |
| `ErrorMessage` | Tampilan error dengan pesan |
| `EmptyState` | State kosong (belum ada data) |
| `PagePlaceholder` | Placeholder halaman belum diimplementasi |

### `components/{modul}/` — khusus modul

Komponen yang hanya relevan untuk 1 modul, misal:
- `components/residents/ResidentFormFields.tsx`, `CreateResidentDialog.tsx`
- `components/occupancy/CheckInDialog.tsx`, `ActiveResidentsSection.tsx`
- `components/payments/UnpaidBillMultiSelect.tsx`, `GenerateBillDialog.tsx`

Kalau komponen mulai dipakai di modul lain, pindahkan ke `components/shared/`.

---

## 11. Checklist Sebelum "Selesai" 1 Modul

- [ ] List, tambah, edit (dan delete kalau perlu) sudah bisa CRUD ke API asli (bukan mock)
- [ ] Loading, error, dan empty state sudah ditangani dengan `getApiErrorMessage`
- [ ] `PageHeader` sudah dipakai dengan breadcrumb & aksi yang benar
- [ ] Validasi form sudah sesuai requirement (field wajib, format, dll) via Zod schema
- [ ] Types sudah didefinisikan di `types/` (entity, params, payload)
- [ ] Sudah dites manual: submit sukses, submit gagal (misal field kosong), refresh halaman (cek cache/reload benar)
- [ ] Tidak ada `console.log` sisa debugging tertinggal di kode
