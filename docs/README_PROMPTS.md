# BNI Frontend Codex Prompt Pack

This folder contains a staged prompt system for building the frontend of the Customer Retention Intelligence Platform.

## Recommended order

1. `00_FRONTEND_MASTER_PROMPT.md`
2. `01_DESIGN_SYSTEM_AND_UX.md`
3. `08_CODEX_EXECUTION_SEQUENCE.md`
4. `09_ROLE_AND_ROUTE_MATRIX.md`
5. `02_CONSUMER_WONDR_INSPIRED.md`
6. `04_BRANCH_BOOKING_FRONTEND.md`
7. `03_INTERNAL_ADMIN_WORKSPACE.md`
8. `06_MERCHANT_COMMERCIAL_CORPORATE.md`
9. `05_CREDIT_RETENTION_INTEGRATION.md`
10. `07_TESTING_AND_DEMO_QA.md`

## How to use with Codex

First ask Codex to inspect the repository and read the documents. Then execute the phases sequentially.

Important:
- inspect actual API contracts before implementation;
- do not invent endpoints;
- do not hard-code booking grace periods;
- do not expose staff-only AI diagnostics to consumers;
- keep simulated/prototype data clearly labeled;
- do not claim production BNI integration;
- do not report tests as passing unless actually executed.

## Product positioning

The consumer experience should be premium and modern, inspired by the usability principles of Wondr-like Indonesian digital banking, but it must be an original design rather than a clone.

Business/internal workspaces should be desktop-first and analytical.

## Core demo story

Detect → Understand → Decide → Intervene → Measure → Learn

Then connect the story to:
- consumer inbox;
- financing tracking;
- branch booking;
- late arrival;
- service without re-queuing when the backend says the booking remains eligible.
