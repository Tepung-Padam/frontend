import { describe, expect, it } from "vitest";
import { formatCurrency, roleLabel } from "@/lib/format";

describe("foundation formatters", () => {
  it("formats decimal-string IDR values", () => expect(formatCurrency("1250000.00")).toContain("1.250.000"));
  it("labels roles without exposing internal codes", () => expect(roleLabel("ANALYST")).toBe("Retention Analyst"));
});
