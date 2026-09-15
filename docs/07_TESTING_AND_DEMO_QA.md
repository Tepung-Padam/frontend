# Frontend Testing and Demo QA

## Goal

The frontend must be demonstrable, not merely compile.

Use:
- Vitest for unit/component tests;
- Playwright for end-to-end flows.

Never report passing tests without running them.

## Unit tests

Test:
- risk badge mapping;
- probability formatting;
- Relationship Score formatting;
- retained-ratio formatting;
- application status mapping;
- booking status mapping;
- late-arrival eligibility presentation;
- role/route guards;
- API error normalization;
- empty-state rendering.

## Consumer E2E

### Scenario 1 — Home
- login/demo persona;
- load home;
- see primary context;
- navigate to inbox.

### Scenario 2 — Inbox
- open offer;
- mark viewed;
- accept or decline;
- verify UI updates.

### Scenario 3 — Financing
- open application;
- inspect timeline;
- inspect document checklist.

### Scenario 4 — Branch booking
- find branch;
- inspect operating hours;
- select date;
- select slot;
- review;
- confirm;
- verify booking detail.

### Scenario 5 — Late arrival
Critical:
- load existing booking;
- simulate/use backend-supported late state;
- verify "late but eligible";
- verify user is told no re-queue is needed;
- verify no second booking is created.

### Scenario 6 — Outside grace period
- verify backend-defined ineligible/expired behavior;
- verify frontend does not pretend the booking remains valid.

## Internal E2E

### Analyst
- portfolio;
- filter high-risk;
- open customer;
- inspect churn probability;
- inspect drivers;
- inspect Relationship Score;
- inspect recommendation;
- simulate intervention.

### RM
- verify assigned customer scope;
- open customer;
- verify relevant action;
- verify unauthorized customer cannot be accessed.

### Admin
- verify demo-only operations are separated.

## Merchant

- open merchant dashboard;
- inspect settlement;
- inspect retained-ratio proxy;
- inspect leakage warning;
- inspect recommendation;
- inspect financing.

## Corporate

- open corporate dashboard;
- inspect financing;
- inspect documents;
- inspect timeline.

## Responsive QA

Manually inspect:
- 360px;
- 390px;
- 768px;
- 1024px;
- 1440px.

Check:
- no overflow;
- readable numbers;
- no broken tables;
- no clipped buttons;
- no modal overflow.

## Accessibility QA

Check:
- keyboard navigation;
- focus states;
- form labels;
- dialog focus;
- status not communicated by color alone;
- button labels;
- screen-reader-friendly landmarks.

## API resilience

Test:
- 401;
- 403;
- 404;
- 409;
- 422;
- 500/network error;
- empty results.

## Demo data

Use only repository-provided synthetic/demo data.

The README describes four important deterministic scenarios:
1. healthy consumer;
2. high-risk declining consumer;
3. merchant with high settlement and low retained balance;
4. reactivated consumer.

Use these for the primary demo story where available.

## Demo acceptance

A presenter should be able to demonstrate:

Portfolio → high-risk customer → explanation → Relationship Score → recommendation → intervention → customer inbox → response → merchant retention → credit timeline → branch booking → late arrival without re-queue.

The UI should support this story without requiring manual database editing during the presentation.
