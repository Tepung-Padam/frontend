# Consumer Experience — Wondr-Inspired, Original

## Goal

Build the individual customer experience as a premium mobile banking app.

The goal is not to reproduce Wondr screen-for-screen. Create an original experience with similar principles:
- simple;
- visual;
- personal;
- fast;
- contextual;
- action-oriented.

## Navigation

Recommended mobile navigation:
1. Home
2. Activity
3. Inbox
4. Financing
5. More/Profile

Branch Booking can be surfaced from Home, More, Financing, and contextual service CTAs.

## Home

Hero:
- greeting;
- customer name;
- primary account/balance if API supports;
- quick actions.

Quick actions:
- Transfer
- Pay/transactions where supported
- Inbox
- Financing
- Find Branch
- Book Branch

Do not invent transaction capabilities that the backend does not support.

## Personal insight

If API exposes retention/relationship information to the consumer, present it safely.

Preferred language:
- "Relationship insight"
- "Aktivitas Anda"
- "Kebiasaan transaksi"
- "Aktivitas digital"

Do not expose staff-only:
- SHAP technical values;
- internal risk diagnostics;
- portfolio rank;
- internal intervention reasoning.

If the consumer-facing API exposes a customer-safe recommendation, render it as a helpful suggestion.

## Activity

Show:
- transaction list;
- date;
- description;
- amount;
- category if API supports;
- filters if supported.

States:
- loading;
- empty;
- error.

## Inbox

The inbox is central to the retention loop.

Each offer/message card:
- title;
- concise explanation;
- reward/mission value if API provides;
- expiry if API provides;
- CTA;
- status.

Supported response states should map to the backend:
- VIEWED
- ACCEPTED
- DECLINED

Do not fake event IDs or receipts.

After response:
- update UI;
- show confirmation;
- invalidate relevant queries.

## Offers / Missions

Possible actions include:
- QRIS_MISSION;
- BILL_PAYMENT_MISSION;
- PERSONALIZED_REWARD;
- DAILY_BANKING_ENGAGEMENT;
- PRODUCT_EDUCATION.

Only render actions actually returned by the API.

Healthy customer protection must never be framed as a punishment. If a healthy customer receives education instead of a retention reward, present it as a relevant feature suggestion.

## Financing

Show:
- application list;
- status;
- progress;
- document checklist;
- timeline;
- next required action.

Statuses must be generated from actual API values.

Potential lifecycle described by the project:
SUBMITTED
→ DOCUMENTS_RECEIVED
→ FINANCIAL_ANALYSIS
→ FIELD_SURVEY
→ COMMITTEE_REVIEW
→ APPROVED_SIMULATION / REJECTED_SIMULATION

Do not display "approved" as a real lending decision. Use "simulated approval" if that is the backend state.

## Branch discovery

Create a polished branch finder:
- search;
- nearby branches;
- list/map-style visual if map integration actually exists;
- branch detail;
- operating hours;
- closed/holiday indicator if available;
- booking CTA.

If exact user geolocation is not available, do not pretend it is. Allow manual location/search.

## Booking

Consumer booking flow:

1. Choose branch.
2. Review operating hours.
3. Choose service if API supports service selection.
4. Choose date.
5. Choose available slot.
6. Review booking.
7. Confirm.
8. Show booking confirmation.
9. Show booking detail/status.

The confirmation screen should clearly show:
- branch;
- date;
- scheduled time;
- booking/reference ID if returned;
- status;
- arrival instructions;
- late-arrival rule if backend exposes it.

## Late arrival UX

This is a critical differentiator.

When the customer is late:
- show "Anda terlambat dari jadwal";
- calculate/display lateness only from trustworthy backend/current time;
- if within allowed grace period, show:
  **"Anda masih dapat dilayani. Tidak perlu mengambil antrean ulang."**
- show check-in/continue CTA if supported.

Do not:
- force a rebooking if backend says the booking remains valid;
- create a new queue number automatically;
- imply that being late always means no-show.

If outside the grace period, show the actual backend outcome and available next step.

## Booking status component

Possible visual states should be mapped from actual backend:
- UPCOMING
- CHECKED_IN
- LATE_BUT_ELIGIBLE
- SERVED
- CANCELLED
- EXPIRED
- NO_SHOW

Only use values that exist in the actual contract.

## Profile

Include:
- personal information summary;
- account/customer ID if safe;
- role;
- notification/preferences if supported;
- logout.

Do not expose internal staff diagnostics.

## Mobile quality bar

The home screen should feel useful within 3 seconds:
- primary financial context;
- useful actions;
- relevant messages;
- next scheduled booking/financing action if any.

Avoid overwhelming the customer with analytics.
