export function formatCurrency(amount: string | number, currency = "IDR"): string {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(value)) return "Data belum tersedia";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function roleLabel(role: string): string {
  return { ADMIN: "Demo Admin", ANALYST: "Retention Analyst", RM: "Relationship Manager", CONSUMER: "Consumer", MERCHANT: "Merchant", CORPORATE: "Corporate" }[role] ?? role;
}
