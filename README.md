# Frontend foundation

Foundation React/Vite untuk Customer Retention Intelligence Platform. UI membedakan consumer mobile-first dan internal workspace desktop-first, memakai API client typed untuk endpoint backend yang sudah terverifikasi.

## Run

```powershell
npm install
npm run dev
```

Set `VITE_API_BASE_URL` bila backend tidak berjalan di `http://localhost:8000`.

## Quality

```powershell
npm run lint
npm run test
npm run build
```

## Contract boundary

Frontend memakai route backend yang saat ini terdaftar untuk auth, customer/account/transaction, credit, inbox, merchant, corporate, retention, analytics, ML metadata, campaigns, dan branch booking. Model metrics tetap menunjukkan unavailable state bila backend mengembalikan `is_available: false`. Commercial belum memiliki enum role pada backend, sehingga tidak dibuat sebagai route palsu.
