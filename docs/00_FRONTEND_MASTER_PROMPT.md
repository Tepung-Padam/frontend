# BNI Customer Retention Intelligence Platform — Frontend Master Prompt

## Mission

You are Codex working inside an existing hackathon repository for a **BNI business-case prototype** called **Customer Retention Intelligence Platform**.

Your task is to build a polished, production-quality-feeling frontend that connects to the existing FastAPI backend and turns the existing capabilities into a coherent multi-persona product.

The frontend must feel like a real modern banking product:
- consumer experience: mobile-first, premium, simple, trustworthy, visually engaging, inspired by the quality and information hierarchy of modern Indonesian digital banking apps;
- internal/business experience: desktop-first, information-dense but clean, analytical, professional, and suitable for a bank operations/demo environment.

**Important:** this is a hackathon prototype, not an official BNI system. Do not claim or imply a production connection to BNI infrastructure and never use real customer data. The repository README explicitly describes it as a BNI business-case prototype and says it must not contain real BNI customer data.

## Non-negotiable first step

Before writing frontend code:

1. Read `AGENTS.md`.
2. Read the root `README.md`.
3. Read:
   - `docs/BRD.md`
   - `docs/PRD.md`
   - `docs/ARCHITECTURE.md`
   - `docs/DATABASE.md`
   - `docs/DATASET_AND_ML.md`
   - `docs/API.md`
   - `docs/DECISIONS.md`
   - `docs/DELIVERY_PLAN.md`
   - `docs/HANDOFF.md`
   - `docs/AGENT_PROMPTS.md`
4. Inspect the actual backend routes, Pydantic schemas, services, models, seed/demo data, and repository status.
5. Inspect any existing frontend files before changing them.
6. Treat the actual API contract and code as authoritative over assumptions in this prompt.
7. Do not invent endpoint names, request bodies, response fields, authentication mechanisms, booking states, or database behavior when the repository already defines them.
8. If a requested UI capability does not yet have a backend contract, build the UI boundary in a clearly isolated adapter/mock layer only when appropriate, and document the gap. Do not silently modify backend contracts just to make the frontend work.

## Product story

The product should communicate this business loop:

**DETECT → UNDERSTAND → DECIDE → INTERVENE → MEASURE → LEARN**

The experience should make it obvious that:
- the bank detects behavioral risk;
- the system explains why;
- the system recommends a relevant next action;
- staff can simulate an intervention;
- the customer receives/responds to an offer;
- staff can inspect the resulting event/outcome.

The repository describes core P0 capabilities including:
- portfolio retention dashboard;
- at-risk customer list;
- behavioral trend analysis;
- churn probability/risk;
- individual prediction explanation;
- deterministic Relationship Score;
- rule-ranked Next Best Action;
- intervention simulation/outcome history;
- merchant settlement and retained-ratio analysis;
- data provenance/model transparency;
- healthy-customer protection;
- role/ownership-aware demo access;
- consumer, merchant/commercial and corporate self-service;
- customer inbox/responses;
- simulated credit applications and progress tracking.

## Personas

Support the repository's personas and enforce route/UI boundaries:

### Consumer
Mobile-first self-service banking experience:
- overview/home;
- balance/account summary;
- transaction activity;
- personal relationship/engagement insight where permitted;
- inbox;
- simulated offers/missions;
- financing application status;
- branch discovery;
- branch booking;
- booking detail/status;
- profile/settings.

### Merchant / Commercial
Desktop business workspace:
- business overview;
- settlement inflow/outflow;
- retained-ratio proxy;
- leakage warning;
- business relationship score where contract permits;
- financing applications;
- application documents;
- application timeline;
- relevant recommendations.

### Corporate
Desktop corporate workspace:
- company relationship overview;
- financing applications;
- facility/application progress;
- document checklist;
- timeline;
- branch/service booking where supported by actual API;
- profile/company context.

### Retention Analyst
Desktop analytical workspace:
- portfolio summary;
- risk distribution;
- at-risk customers;
- customer detail;
- behavior trends;
- churn probability;
- SHAP/top drivers;
- Relationship Score;
- Next Best Action;
- intervention/campaign simulation;
- campaign outcomes;
- model/data transparency.

### Relationship Manager
Desktop field/staff workspace:
- assigned customer list only;
- customer context;
- risk and recommended actions;
- follow-up notes/results where API supports;
- credit application progress/update where authorized;
- customer/booking context where supported.

### Demo Admin
Operational/demo workspace:
- authorized demo operations;
- persona/demo data management only where backend supports it;
- clear warning that demo operations are synthetic.

## Visual direction

Do not build a generic admin template.

Consumer:
- mobile banking hierarchy;
- large balance/primary status area;
- card-based sections;
- soft surfaces;
- restrained banking palette;
- strong typography;
- simple charts;
- bottom navigation on mobile;
- generous spacing;
- purposeful micro-interactions.

Business/internal:
- persistent desktop sidebar;
- top utility/header area;
- KPI cards;
- analytical charts;
- dense tables with excellent hierarchy;
- filters;
- detail drawers/pages;
- timelines;
- risk badges;
- clear empty/loading/error states.

Use a **BNI-inspired visual language**, not a pixel-perfect Wondr clone. Do not copy proprietary assets, exact layouts, logos, illustrations, or screens from Wondr. The design should be original but evoke a premium Indonesian digital-banking experience.

## Technical requirements

Use the repository's intended stack unless the existing project dictates otherwise:
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Recharts
- Vitest
- Playwright

Prefer:
- reusable typed API client;
- feature-based folders;
- route-level lazy loading where useful;
- centralized query keys;
- typed DTOs matching backend schemas;
- reusable design-system primitives;
- role-aware route guards;
- clear API error normalization;
- skeleton states;
- responsive behavior;
- accessible controls;
- no duplicated business logic across pages.

## Data and ML semantics

Do not misrepresent model outputs.

The repository defines:
- churn as a hackathon behavioral definition;
- LOW: probability < 0.40;
- MEDIUM: 0.40 to < 0.70;
- HIGH: >= 0.70;
- Relationship Score: 0–100 and separate from churn probability;
- Relationship Score is not a credit score and must not be presented as a lending score;
- merchant retained-ratio is a simulation proxy;
- RULE_RANKER_V1 is rule-ranked, not reinforcement learning, contextual bandit, or LLM;
- intervention outcomes are simulated;
- model inference is separate from offline training.

Every relevant screen should use honest labels such as:
- "Simulated"
- "Prototype"
- "Proxy"
- "Model version"
- "Data source"
- "Not a credit score"

Do not create misleading certainty such as "customer will churn". Prefer:
- "Estimated churn probability"
- "Risk level"
- "Top behavioral drivers"

## Booking feature

The project team has already implemented branch booking capabilities in the backend. The frontend must expose and integrate them if the actual API contract confirms them.

The booking UX must support, when backed by the API:
- find nearby BNI branches;
- show branch address/location;
- show operating hours;
- account for closed days/holidays if API exposes them;
- show available booking slots;
- show slot capacity/availability;
- create booking;
- confirmation;
- booking status;
- early arrival/check-in;
- late arrival;
- **late users remain eligible for service within the defined grace period**;
- **late users do not need to take a new queue number / rebook merely because they are late within the allowed grace period**;
- expired/no-show behavior according to backend;
- staff-side booking/check-in visibility where authorized.

Do not hard-code a grace-period duration unless the backend contract defines it.

## Security

Never rely only on frontend role hiding.

Frontend:
- hides unauthorized navigation;
- protects routes;
- handles unauthorized API responses;
- never exposes sensitive staff-only risk diagnostics in consumer routes.

Backend remains authoritative.

Do not place secrets in frontend code.

## UX quality bar

Every important page needs:
- loading state;
- empty state;
- error state;
- retry path;
- responsive state;
- clear success feedback;
- accessible labels;
- keyboard-friendly interactions.

Avoid:
- excessive gradients;
- excessive glassmorphism;
- giant hero sections;
- tiny unreadable text;
- decorative charts without meaning;
- fake metrics not supplied by API;
- fake functionality presented as real;
- huge tables on mobile without a responsive strategy.

## Execution

Work in coherent phases:
1. foundation/design system;
2. consumer;
3. booking;
4. internal analytics;
5. merchant/commercial/corporate;
6. credit + retention integration;
7. role/access;
8. tests;
9. visual polish;
10. documentation/handoff.

After each coherent unit:
- run relevant lint/tests/build;
- inspect changed files;
- avoid unrelated rewrites;
- update `docs/HANDOFF.md` if required by repository rules.

Never claim tests pass unless they were actually run.

## Definition of done

The frontend is done only when:
- all supported personas have coherent workspaces;
- consumer UX is excellent on mobile;
- business/internal UX is excellent on desktop;
- branch booking is integrated with actual API behavior;
- late-arrival behavior is clearly communicated;
- role boundaries are enforced at the UI layer;
- retention/AI results are presented honestly;
- merchant and corporate workflows are usable;
- financing progress is understandable;
- inbox/intervention loop is understandable;
- tests cover critical flows;
- build succeeds;
- no undocumented API contract changes were introduced.
