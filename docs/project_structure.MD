# SIAP Frontend — Project Structure

Dokumentasi struktur folder & konvensi project `siap-fe`. Update file ini setiap ada penambahan folder/konvensi baru.

---

## Struktur Folder

```
siap-fe/
├── public/                      # Static assets (favicon, icons)
│   ├── favicon.svg
│   └── icons.svg
│
├── docs/                        # Dokumentasi project
│   ├── api.md                   # Referensi endpoint API backend
│   ├── coding-standard.MD       # Standar penulisan kode & komponen
│   └── project_structure.MD     # File ini
│
├── src/
│   ├── assets/                  # Gambar, logo, dll yang di-import di kode
│   │
│   ├── components/
│   │   ├── ui/                  # Komponen dari shadcn (auto-generated, jangan edit struktur besar-besaran)
│   │   ├── shared/              # Komponen custom reusable lintas modul
│   │   │                        # (PageHeader, ConfirmDialog, StatusBadge, Breadcrumbs, EmptyState, dll)
│   │   ├── bills/               # Komponen khusus modul tagihan
│   │   ├── expenses/            # Komponen khusus modul pengeluaran
│   │   ├── occupancy/           # Komponen check-in/out & riwayat hunian (dipakai di HouseDetail)
│   │   ├── payments/            # Komponen khusus modul pembayaran
│   │   └── residents/           # Komponen khusus modul penghuni
│   │
│   ├── pages/                   # 1 folder per modul/fitur
│   │   ├── auth/
│   │   │   └── Login.tsx
│   │   ├── dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── residents/
│   │   │   ├── ResidentList.tsx
│   │   │   ├── ResidentForm.tsx    # tambah & edit (mode lewat params)
│   │   │   └── ResidentDetail.tsx
│   │   ├── houses/
│   │   │   ├── HouseList.tsx
│   │   │   ├── HouseForm.tsx
│   │   │   └── HouseDetail.tsx     # termasuk manajemen hunian (occupancy)
│   │   ├── bills/
│   │   │   ├── BillList.tsx
│   │   │   ├── BillForm.tsx
│   │   │   └── BillDetail.tsx
│   │   ├── payments/
│   │   │   ├── PaymentList.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── PaymentDetail.tsx
│   │   ├── expenses/
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── ExpenseForm.tsx
│   │   │   └── ExpenseDetail.tsx
│   │   ├── fee-types/              # route: /master-data/fee-types
│   │   │   ├── FeeTypeList.tsx
│   │   │   └── FeeTypeForm.tsx
│   │   ├── expense-categories/     # route: /master-data/expense-categories
│   │   │   ├── ExpenseCategoryList.tsx
│   │   │   └── ExpenseCategoryForm.tsx
│   │   └── reports/
│   │       ├── ReportSummary.tsx   # route: /reports/summary
│   │       └── ReportDetail.tsx    # route: /reports/detail
│   │
│   ├── layouts/
│   │   └── MainLayout.tsx       # Sidebar + header, dipakai untuk semua halaman setelah login
│   │
│   ├── routes/
│   │   ├── AppRouter.tsx        # Definisi semua route
│   │   ├── ProtectedRoute.tsx   # Wrapper cek auth token
│   │   └── ScrollToTop.tsx      # Scroll ke atas saat navigasi antar halaman
│   │
│   ├── services/                # Layer komunikasi ke API (1 file per resource)
│   │   ├── axios.ts             # Instance axios + interceptor (base URL, auth header)
│   │   ├── authService.ts
│   │   ├── residentService.ts
│   │   ├── houseService.ts
│   │   ├── occupancyService.ts
│   │   ├── billService.ts
│   │   ├── paymentService.ts
│   │   ├── expenseService.ts
│   │   ├── expenseCategoryService.ts
│   │   ├── feeTypeService.ts
│   │   └── reportService.ts
│   │
│   ├── hooks/                   # Custom hooks, termasuk wrapper React Query per resource
│   │   ├── useResidents.ts
│   │   ├── useResidentPhoto.ts
│   │   ├── useHouses.ts
│   │   ├── useOccupancy.ts
│   │   ├── useBills.ts
│   │   ├── usePayments.ts
│   │   ├── useExpenses.ts
│   │   ├── useExpenseCategories.ts
│   │   ├── useFeeTypes.ts
│   │   ├── useReports.ts
│   │   └── useDocumentTitle.ts
│   │
│   ├── types/                   # TypeScript types & interfaces per resource
│   │   ├── api.ts               # Tipe umum API (pagination, error response, dll)
│   │   ├── auth.ts
│   │   ├── resident.ts
│   │   ├── house.ts
│   │   ├── occupancy.ts
│   │   ├── bill.ts
│   │   ├── payment.ts
│   │   ├── expense.ts
│   │   ├── expenseCategory.ts
│   │   ├── feeType.ts
│   │   ├── dashboard.ts
│   │   └── report.ts
│   │
│   ├── lib/
│   │   ├── utils.ts             # Helper umum (format tanggal, format currency, dll)
│   │   ├── constants.ts         # Konstanta aplikasi (status, label, dll)
│   │   ├── queryClient.ts       # Konfigurasi React Query client
│   │   ├── occupancyUtils.ts    # Helper khusus modul hunian
│   │   └── validators/          # Zod schema per form
│   │       ├── loginSchema.ts
│   │       ├── residentSchema.ts
│   │       ├── houseSchema.ts
│   │       ├── occupancySchema.ts
│   │       ├── billSchema.ts
│   │       ├── paymentSchema.ts
│   │       ├── expenseSchema.ts
│   │       ├── expenseCategorySchema.ts
│   │       └── feeTypeSchema.ts
│   │
│   ├── context/                 # React Context
│   │   ├── AuthContext.tsx      # State auth & login/logout
│   │   └── PageHeaderContext.tsx # Judul & aksi header halaman (via MainLayout)
│   │
│   ├── App.tsx                  # Root component, render AppRouter + providers (QueryClientProvider, dll)
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Tailwind import + custom global style
│   └── vite-env.d.ts            # Type declaration Vite env
│
├── .env                         # VITE_API_URL, dll (JANGAN commit ke git kalau ada secret)
├── .env.example                 # Template .env tanpa value asli
├── components.json              # Konfigurasi shadcn/ui
├── index.html                   # HTML entry Vite
├── tsconfig.app.json            # Path alias config (@/ → src/)
├── vite.config.ts
├── package.json
└── README.md                    # Instruksi instalasi & run project
```

---

## Konvensi Penamaan

| Tipe | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `ResidentForm.tsx` |
| Hook | camelCase, prefix `use` | `useResidents.ts` |
| Service file | camelCase, suffix `Service` | `residentService.ts` |
| Type file | camelCase, per resource | `resident.ts` |
| Folder modul | lowercase, English | `residents/`, `houses/` |
| Route path | lowercase, kebab-case | `/payments`, `/master-data/fee-types` |

---

## Alur Data (Pattern Standar per Modul)

```
Page Component (pages/)
    ↓ pakai
Custom Hook (hooks/useResidents.ts)
    ↓ pakai
React Query (useQuery/useMutation)
    ↓ panggil
Service (services/residentService.ts)
    ↓ pakai
Axios instance (services/axios.ts)
    ↓ request ke
Laravel API
```

Contoh alur nambah penghuni baru:
1. User isi form di `ResidentForm.tsx`, validasi pakai `residentSchema.ts` (Zod)
2. Submit → panggil `useCreateResident()` (dari `useResidents.ts`, isinya `useMutation`)
3. Mutation panggil `residentService.create(data)`
4. Service panggil `axios.post('/residents', data)`
5. Setelah sukses → `invalidateQueries(['residents'])` biar list ter-refresh otomatis

---

## Route Map

| Path | Halaman |
|---|---|
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/residents`, `/residents/new`, `/residents/:id`, `/residents/:id/edit` | Modul penghuni |
| `/houses`, `/houses/new`, `/houses/:id`, `/houses/:id/edit` | Modul rumah + hunian |
| `/bills`, `/bills/new`, `/bills/:id` | Modul tagihan |
| `/payments`, `/payments/new`, `/payments/:id` | Modul pembayaran |
| `/expenses`, `/expenses/new`, `/expenses/:id` | Modul pengeluaran |
| `/master-data/fee-types`, `/master-data/fee-types/new`, `/master-data/fee-types/:id/edit` | Master jenis iuran |
| `/master-data/expense-categories`, `/master-data/expense-categories/new`, `/master-data/expense-categories/:id/edit` | Master kategori pengeluaran |
| `/reports/summary`, `/reports/detail` | Laporan keuangan |

---

## Status Implementasi

- [x] Scaffold Vite + React
- [x] Setup Tailwind v4 (vite.config.ts + index.css)
- [x] Setup path alias `@/` (tsconfig.app.json + vite.config.ts)
- [x] Init shadcn/ui (components.json + komponen di `src/components/ui/`)
- [x] Install React Router, React Query, Axios, React Hook Form, Zod, Recharts
- [x] Setup struktur folder di atas
- [x] Setup axios instance (`services/axios.ts` + `.env.example`)
- [x] Setup React Query provider
- [x] Setup routing dasar + auth (login, protected route)
- [x] Modul Residents (list + search/filter/pagination, tambah, edit, detail, upload KTP, hapus)
- [x] Modul Houses (list + search/filter/pagination, tambah, edit, detail, hapus)
- [x] Modul Occupancy (check-in, check-out, ganti penghuni, riwayat hunian — di HouseDetail)
- [x] Modul Fee Types (master data — list, tambah, edit, hapus)
- [x] Modul Expense Categories (master data — list, tambah, edit, hapus)
- [x] Modul Bills (list + filter/pagination, generate manual per rumah/semua rumah, detail)
- [x] Modul Payments (list + filter/pagination, tambah, detail)
- [x] Modul Expenses (list + filter/pagination, tambah, detail)
- [x] Dashboard (ringkasan keuangan + grafik)
- [x] Reports (laporan ringkas & detail per periode)

> Update checklist ini setiap tahap selesai.
