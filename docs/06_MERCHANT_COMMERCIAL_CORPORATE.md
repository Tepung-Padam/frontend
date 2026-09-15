# Merchant, Commercial, and Corporate Workspaces

## Goal

Create desktop-first self-service business experiences that are clearly different from the individual consumer experience while remaining visually consistent.

## Merchant workspace

### Overview

Show:
- settlement inflow;
- matched outflow;
- retained-ratio proxy;
- relationship/activity metrics where supported;
- recent business transactions;
- financing application status.

### Retention / leakage

The repository defines:

retained_ratio_proxy_30d =
max(0, settlement_inflow_30d - matched_outflow_30d)
/
settlement_inflow_30d

Matched outflow initially means an outgoing transfer within 24 hours after settlement.

If settlement inflow is zero, the result is unavailable rather than zero.

Display it as:
"Retained-ratio proxy"

Never call it official BNI CASA methodology.

### Leakage warning

If backend identifies possible leakage:
- explain settlement inflow;
- explain matched outflow;
- show the proxy;
- show recommendation.

Possible recommendation:
MERCHANT_RETENTION_OFFER

Do not state that money definitely moved to a competitor unless the backend data actually proves the destination. Prefer:
"Indikasi dana settlement segera keluar."

## Commercial

Commercial can share components with merchant where appropriate but should support:
- business relationship;
- financing applications;
- application timeline;
- documents;
- relevant recommendations.

Avoid duplicating merchant-specific settlement visuals if the API does not apply.

## Corporate

Corporate workspace:
- company overview;
- relationship information;
- financing applications;
- facilities/application progress;
- documents;
- timeline;
- service/branch booking if supported.

Corporate UI should look more enterprise-oriented:
- wider data tables;
- formal status presentation;
- application references;
- organizational context.

## Financing CTA

On Merchant/Commercial/Corporate:
- "Lihat Pengajuan"
- "Lengkapi Dokumen"
- "Lihat Progress"
- "Booking Cabang" when relevant.

Never show a lending approval as real unless the backend explicitly represents it as a simulated state.

## Responsive behavior

Desktop:
- sidebar;
- two-column analytics;
- table + detail panel.

Mobile:
- cards;
- horizontal KPI scroller;
- collapsible sections;
- no tiny desktop tables.

## Shared components

Reuse:
- BusinessHeader
- FinancialKpiCard
- SettlementChart
- RetainedRatioCard
- ApplicationTimeline
- DocumentChecklist
- StatusBadge
- BookingCTA

Do not fork the same component for each persona without a real difference.
