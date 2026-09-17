export function formatCurrency(amount: string | number, currency = "IDR"): string {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(value)) return "Data belum tersedia";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Data belum tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data belum tersedia";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(date);
}

/** Corporate advisor endpoints require a completed UTC day as as_of_date. */
export function yesterdayUtcDate(): string {
  const now = new Date();
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  return yesterday.toISOString().slice(0, 10);
}

export function localDateInputValue(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "Belum tersedia";
  return new Intl.NumberFormat("id-ID", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

export function roleLabel(role: string): string {
  return { ADMIN: "Demo Admin", ANALYST: "Retention Analyst", RM: "Relationship Manager", CONSUMER: "Consumer", MERCHANT: "Merchant", CORPORATE: "Corporate" }[role] ?? role;
}

const readableCodes: Record<string, string> = {
  HIGH: "Tinggi",
  MEDIUM: "Menengah",
  LOW: "Rendah",
  UNAVAILABLE: "Belum tersedia",
  ACTIVE: "Aktif",
  INACTIVE: "Tidak aktif",
  AT_RISK: "Perlu perhatian",
  SILENT_CHURN: "Aktivitas menurun",
  REACTIVATED: "Aktif kembali",
  RETAINED: "Dipertahankan",
  CONSUMER: "Nasabah individu",
  MERCHANT: "Pelaku usaha",
  CORPORATE: "Perusahaan",
  QRIS_MISSION: "Misi transaksi QRIS",
  BILL_PAYMENT_MISSION: "Misi pembayaran tagihan",
  PERSONALIZED_REWARD: "Penawaran pilihan",
  DAILY_BANKING_ENGAGEMENT: "Aktivasi transaksi harian",
  MERCHANT_RETENTION_OFFER: "Penawaran retensi usaha",
  RM_OUTREACH: "Kontak Relationship Manager",
  PRODUCT_EDUCATION: "Informasi produk",
  NO_ACTION: "Belum perlu tindakan",
  SUBMITTED: "Pengajuan diterima",
  DOCUMENTS_RECEIVED: "Dokumen diterima",
  FINANCIAL_ANALYSIS: "Analisis keuangan",
  FIELD_SURVEY: "Survei lapangan",
  COMMITTEE_REVIEW: "Tinjauan komite",
  APPROVED_SIMULATION: "Simulasi disetujui",
  REJECTED_SIMULATION: "Simulasi ditolak",
  STAGE_CHANGED: "Tahap diperbarui",
  DOCUMENT_UPDATED: "Dokumen diperbarui",
  RECEIVED: "Diterima",
  REVIEWED: "Sudah ditinjau",
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  ACCEPTED: "Diterima",
  DECLINED: "Ditolak",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  DRAFT: "Draf",
  PAUSED: "Dijeda",
  SAVINGS: "Tabungan",
  CURRENT_ACCOUNT: "Rekening giro",
  DEPOSIT: "Deposito",
  CREDIT_CARD: "Kartu kredit",
  PERSONAL_LOAN: "Pinjaman pribadi",
  WORKING_CAPITAL: "Modal kerja",
  INVESTMENT_CREDIT: "Kredit investasi",
  HOME_LOAN: "Kredit pemilikan rumah",
  MOBILE_BANKING: "Mobile banking",
  INTERNET_BANKING: "Internet banking",
  ATM: "ATM",
  BRANCH: "Kantor cabang",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
  BILL_PAYMENT: "Pembayaran tagihan",
  PUBLIC_DATASET: "Dataset publik terolah",
  SYNTHETIC: "Data sintetis",
  DEMO_SIMULATION: "Simulasi demo",
  STABLE: "Stabil",
  HEALTHY: "Sehat",
  WATCHLIST: "Perlu dipantau",
};

const modelFeatures: Record<string, string> = {
  txn_count_7d: "Jumlah transaksi 7 hari",
  txn_count_30d: "Jumlah transaksi 30 hari",
  txn_count_90d: "Jumlah transaksi 90 hari",
  txn_amount_30d: "Nilai transaksi 30 hari",
  txn_amount_90d: "Nilai transaksi 90 hari",
  days_since_last_transaction: "Hari sejak transaksi terakhir",
  incoming_amount_30d: "Dana masuk 30 hari",
  outgoing_amount_30d: "Dana keluar 30 hari",
  net_cashflow_30d: "Arus kas bersih 30 hari",
  avg_balance_30d: "Saldo rata-rata 30 hari",
  bill_payment_count_30d: "Pembayaran tagihan 30 hari",
  qris_txn_count_30d: "Transaksi QRIS 30 hari",
  app_sessions_30d: "Aktivitas aplikasi 30 hari",
  txn_count_change_30_vs_baseline: "Perubahan frekuensi transaksi",
  txn_amount_change_30_vs_baseline: "Perubahan nilai transaksi",
  balance_trend: "Tren saldo",
  dominant_category: "Kategori transaksi utama",
};

export function codeLabel(value: string | null | undefined): string {
  if (!value) return "Belum tersedia";
  const normalized = value.trim();
  const mapped = readableCodes[normalized.toUpperCase()];
  if (mapped) return mapped;
  return normalized
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

export function modelFeatureLabel(value: string | null | undefined): string {
  if (!value) return "Faktor belum tersedia";
  if (modelFeatures[value]) return modelFeatures[value];
  if (value.startsWith("missing_")) {
    return `Kelengkapan ${modelFeatureLabel(value.slice(8)).toLowerCase()}`;
  }
  return codeLabel(value);
}
