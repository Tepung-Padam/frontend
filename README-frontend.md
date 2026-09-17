# Altavest Customer Retention Intelligence Platform

Frontend React dan TypeScript untuk workspace retention, customer, credit, branch, dan merchant. Frontend mengambil data dari REST API backend. Nilai enum dan nama feature model diterjemahkan melalui `src/lib/format.ts` sebelum ditampilkan.

## Menjalankan aplikasi

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Atur alamat backend pada `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Backend harus berjalan lebih dahulu. Frontend menyimpan token sesi pada cookie yang dikelola API client dan menghapus sesi saat API mengembalikan status 401.

## Struktur utama

| Folder | Peran |
| --- | --- |
| `src/lib/api-client.ts` | Request REST, sesi, pagination, dan mutation |
| `src/lib/format.ts` | Rupiah, tanggal Jakarta, label enum, dan label feature model |
| `src/types/domain.ts` | Kontrak data TypeScript |
| `src/components/charts` | Komponen visualisasi yang dapat dipakai ulang |
| `src/components/layout` | Layout workspace dan navigasi responsive |
| `src/features/retention` | Daftar at-risk, kurva risiko, score, driver, dan detail nasabah |
| `src/features/analytics` | Ringkasan portfolio, model, dan kampanye |
| `src/features/credit` | Pengajuan kredit dan timeline dokumen |
| `src/features/branches` | Daftar cabang, booking, dan antrean operator |
| `src/features/consumer` | Ringkasan rekening dan aktivitas consumer |

## Route utama

| Workspace | Route |
| --- | --- |
| Admin | `/admin`, `/admin/portfolio`, `/admin/branches`, `/admin/credit` |
| Analyst atau RM | `/staff/portfolio`, `/rm/portfolio`, `/staff/credit` |
| Consumer | `/app`, `/app/activity`, `/app/financing`, `/app/branches` |
| Merchant | `/business` |
| Corporate | `/corporate` |

## Endpoint yang dipakai

| Kebutuhan | Method dan path |
| --- | --- |
| Login dan sesi | `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout` |
| Ringkasan retention | `GET /api/v1/analytics/retention-summary` |
| Model aktif | `GET /api/v1/ml/models/active` |
| Faktor model | `GET /api/v1/analytics/top-drivers` |
| Daftar at-risk | `GET /api/v1/retention/at-risk?page={page}&page_size={size}` |
| Detail churn | `GET /api/v1/customers/{id}/churn` |
| Perilaku nasabah | `GET /api/v1/customers/{id}/behavior` |
| Rekomendasi | `GET /api/v1/customers/{id}/recommendations` |
| Kampanye | `GET /api/v1/campaigns`, `POST /api/v1/campaigns` |
| Transaksi consumer | `GET /api/v1/me/transactions` |
| Ringkasan consumer | `GET /api/v1/me/summary` |
| Pengajuan kredit consumer | `GET /api/v1/me/credit-applications`, `POST /api/v1/me/credit-applications` |
| Pengajuan kredit staff | `GET /api/v1/credit-applications` |
| Event kredit staff | `GET /api/v1/credit-applications/{id}/events`, `POST /api/v1/credit-applications/{id}/events` |
| Cabang | `GET /api/v1/branches` |
| Slot booking | `GET /api/v1/branches/{id}/availability?date={date}`, `POST /api/v1/bookings` |
| Booking consumer | `GET /api/v1/bookings/me`, `POST /api/v1/bookings/{code}/check-in` |

Semua query memakai state loading, error, empty, dan retry. Pagination mengikuti envelope `items` serta `pagination` dari backend. Frontend tidak mengubah model, dataset, tabel database, atau aturan scoring.
