# Codex Execution Sequence

## Rule

Do not attempt a giant rewrite.

Work in bounded phases and validate after each phase.

## Phase 0 — Repository discovery

Read:
- AGENTS.md;
- README.md;
- all docs listed in master prompt;
- actual frontend;
- actual backend API.

Output internally:
- existing routes;
- API endpoints;
- auth model;
- personas;
- booking contract;
- credit contract;
- retention contract;
- known gaps.

Do not code until this map is understood.

## Phase 1 — Foundation

Build:
- app shell;
- routing;
- API client;
- auth/session abstraction based on actual backend;
- role guard;
- design tokens;
- typography;
- reusable components;
- query configuration;
- error handling;
- responsive layout.

Acceptance:
- app boots;
- routes load;
- unauthorized routes are blocked;
- no fake API contract.

## Phase 2 — Consumer

Build:
- Home;
- Activity;
- Inbox;
- Financing;
- Profile;
- Branch finder.

Acceptance:
- excellent mobile layout;
- actual API integration;
- proper loading/error/empty states.

## Phase 3 — Booking

Build:
- branch detail;
- operating hours;
- availability;
- booking wizard;
- confirmation;
- booking detail;
- late-arrival state;
- check-in if supported.

Acceptance:
- real backend contract;
- no requeue message for late-but-eligible state;
- no duplicate booking;
- no hard-coded grace period.

## Phase 4 — Internal retention

Build:
- analyst dashboard;
- at-risk table;
- customer detail;
- churn;
- drivers;
- Relationship Score;
- recommendation;
- intervention simulation;
- campaign history.

Acceptance:
- staff-only information remains staff-only;
- semantic disclosures are visible.

## Phase 5 — RM

Build:
- assigned customer dashboard;
- customer detail;
- follow-up;
- credit progress;
- booking context where authorized.

Acceptance:
- backend ownership remains authoritative.

## Phase 6 — Merchant/Commercial/Corporate

Build:
- merchant retention;
- commercial financing;
- corporate financing;
- timelines;
- documents;
- relevant business insights.

Acceptance:
- merchant retained-ratio is clearly a proxy;
- Relationship Score is not a credit score.

## Phase 7 — Admin and transparency

Build:
- demo admin;
- model/data transparency;
- demo environment indicators.

Acceptance:
- no production claims;
- no real customer data.

## Phase 8 — Polish

Improve:
- visual hierarchy;
- spacing;
- charts;
- empty states;
- animations;
- mobile;
- accessibility;
- error handling.

Do not add decorative complexity that does not improve UX.

## Phase 9 — Testing

Run:
- npm lint;
- npm test;
- npm build;
- Playwright critical flows.

Record exact results.

## Phase 10 — Handoff

Update:
- HANDOFF.md;
- relevant frontend documentation;
- known gaps;
- commands to run;
- environment assumptions.

## Stop conditions

Stop and document rather than inventing behavior when:
- backend endpoint is absent;
- API response conflicts with docs;
- auth contract is unclear;
- booking state is unclear;
- grace-period rule is absent;
- a requested field is unavailable.

Do not silently change backend contracts.
