# Branch Finder and Booking Frontend

## Critical feature

The backend/project team has already implemented branch-booking capabilities. Build the frontend around the actual backend contract.

First inspect:
- actual booking endpoints;
- branch endpoints;
- schema/state names;
- operating-hour representation;
- slot representation;
- capacity;
- grace-period logic;
- check-in behavior;
- late-arrival behavior;
- cancellation/expiry/no-show rules.

The backend is authoritative.

## User goals

A customer must be able to:
1. find a BNI branch;
2. understand when it is open;
3. select a suitable date/time;
4. book;
5. receive confirmation;
6. arrive early or late;
7. remain serviceable when late within the backend-defined rule;
8. **not re-enter the queue merely because they are late within the allowed grace period**.

## Branch finder

UI:
- search field;
- current/manual location option;
- nearby branch cards;
- distance if backend/location supports it;
- address;
- operating hours;
- open/closed status;
- next available booking information if API supports.

Branch card CTA:
"Booking"

## Branch detail

Show:
- branch name;
- address;
- contact details if API supports;
- operating hours by day;
- holiday/closure information if API supports;
- booking availability;
- services if API supports.

Do not hard-code branch opening hours if API provides them.

## Booking wizard

Step 1 — Branch
Step 2 — Service, if supported
Step 3 — Date
Step 4 — Time slot
Step 5 — Review
Step 6 — Confirmation

Progress indicator should be visible.

### Slot design

Each slot should show:
- time;
- availability;
- capacity state if returned.

Examples:
- Available
- Almost full
- Full
- Unavailable

Never invent a slot that the API did not return.

## Review

Before confirmation:
- branch;
- service;
- date;
- time;
- customer details;
- booking policy;
- late-arrival policy when available.

CTA:
"Konfirmasi Booking"

After success:
- success state;
- booking ID/reference;
- scheduled time;
- branch;
- status;
- arrival instructions.

## Booking detail

Provide:
- booking status;
- countdown/date context if appropriate;
- branch;
- schedule;
- service;
- reference;
- actions available from backend.

## Late arrival

This must be treated as a first-class state.

If backend returns that a booking is late but still eligible:
- prominent status: "Terlambat — Tetap Dapat Dilayani";
- explain:
  "Anda terlambat dari waktu booking, tetapi masih berada dalam ketentuan layanan. Anda tidak perlu antre ulang.";
- CTA to check in if supported.

The frontend must NOT:
- create another booking;
- generate a new queue number;
- tell the user to rebook;
- mark no-show based only on browser time.

Use server state.

## Early arrival

If supported:
- show "Datang lebih awal";
- explain whether the customer can check in early;
- use backend eligibility.

## Outside grace period

If backend says booking is no longer eligible:
- show exact returned status;
- explain next valid action;
- allow rebooking only if backend permits it.

Do not invent the duration of the grace period.

## Staff booking view

If supported:
- upcoming bookings;
- customer;
- branch;
- time;
- status;
- check-in;
- late flag;
- served status.

Use clear operational statuses.

## Time zones

Treat backend timestamps carefully.
- Determine API timestamp convention.
- Convert to the intended local display timezone.
- Do not compare naive browser time against server UTC incorrectly.

## Booking states

Do not hard-code this list unless API confirms it. Create a centralized mapping so backend changes require one update.

Possible states include:
- UPCOMING
- CHECKED_IN
- LATE_BUT_ELIGIBLE
- SERVED
- CANCELLED
- EXPIRED
- NO_SHOW

## UX edge cases

Test:
- branch closed;
- holiday;
- no slots;
- slot fills between loading and confirmation;
- duplicate submission;
- network timeout;
- booking conflict;
- late but eligible;
- late and ineligible;
- already checked in;
- already served;
- cancelled;
- expired;
- no-show.

Use idempotent mutation behavior where backend supports it.

## Demo storytelling

Booking should be demonstrable as:

**Find nearest branch → see opening hours → select slot → book → show confirmation → simulate/encounter late arrival → booking remains valid → customer is served without taking a new queue number.**

That behavior is a key UX selling point.
