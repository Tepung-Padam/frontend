# Retention, Inbox, Campaign, and Credit Integration

## Goal

Connect separate backend capabilities into one coherent frontend story.

The product should not feel like:
"dashboard + random inbox + random credit page + random booking page."

It should feel like a relationship journey.

## Staff journey

1. Open portfolio.
2. Filter high-risk customers.
3. Open customer.
4. Compare behavioral trend.
5. Review churn probability.
6. Review top drivers.
7. Review Relationship Score.
8. Generate/review Next Best Action.
9. Simulate intervention.
10. Customer receives inbox message.
11. Customer views/responds.
12. Staff sees response event.
13. Customer can proceed to financing or branch service when relevant.

## Consumer journey

1. Sign in.
2. See relevant home context.
3. Open inbox.
4. Review message.
5. Accept/decline if supported.
6. Perform mission/action if supported.
7. Track financing if applicable.
8. Book branch if service is needed.
9. See booking status.

## Inbox

Build:
- list;
- detail;
- read/viewed state;
- accept/decline;
- event feedback;
- receipt if API returns one.

After mutation:
- invalidate the correct TanStack Query caches;
- avoid duplicate optimistic events unless safe.

## Campaign

Staff page:
- campaign list;
- campaign detail;
- audience;
- intervention;
- simulated event counts;
- conversion rate if API provides.

Label:
"Simulated Campaign"

Do not call simulated conversion a real-world uplift.

## Credit applications

Use a reusable application timeline.

Timeline:
SUBMITTED
→ DOCUMENTS_RECEIVED
→ FINANCIAL_ANALYSIS
→ FIELD_SURVEY
→ COMMITTEE_REVIEW
→ APPROVED_SIMULATION / REJECTED_SIMULATION

Document checklist:
- Financial statements;
- NIB;
- NPWP;
- Legal documents;
only if those are actual API/document types.

Each document:
- PENDING;
- RECEIVED;
- REVIEWED;
or actual backend state.

## Staff-to-customer synchronization

If staff updates an application:
- owning customer view should reflect updated state after refresh/query invalidation;
- show last updated time if API provides;
- preserve audit timeline.

## Booking connection

Where business context calls for in-person service:
- add "Book a Branch" CTA;
- link to branch finder;
- preserve application/customer context where routing allows;
- do not pass sensitive data through URLs unnecessarily.

## Error handling

If a backend module is not implemented:
- show a polished "Belum tersedia di prototype" state;
- do not display fake success.

## Data provenance

For model-driven pages, include:
- model version;
- data as-of date;
- observation window;
- outcome window;
- synthetic/prototype disclosure where appropriate.

## Important semantic rules

Never conflate:
- churn probability with Relationship Score;
- Relationship Score with credit score;
- recommendation with autonomous decision;
- simulated credit approval with real approval;
- simulated intervention outcome with causal evidence;
- merchant retained-ratio proxy with official BNI CASA methodology.
