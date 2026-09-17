import { describe, expect, it } from "vitest";
import { codeLabel, formatCurrency, modelFeatureLabel, roleLabel } from "@/lib/format";

describe("foundation formatters", () => {
  it("formats decimal-string IDR values", () => expect(formatCurrency("1250000.00")).toContain("1.250.000"));
  it("labels roles without exposing internal codes", () => expect(roleLabel("ANALYST")).toBe("Retention Analyst"));
  it("turns backend codes into readable labels", () => {
    expect(codeLabel("DAILY_BANKING_ENGAGEMENT")).toBe("Aktivasi transaksi harian");
    expect(codeLabel("COMMITTEE_REVIEW")).toBe("Tinjauan komite");
  });
  it("turns model features into business labels", () => {
    expect(modelFeatureLabel("txn_count_change_30_vs_baseline")).toBe("Perubahan frekuensi transaksi");
    expect(modelFeatureLabel("missing_avg_balance_30d")).toBe("Kelengkapan saldo rata-rata 30 hari");
  });
});
