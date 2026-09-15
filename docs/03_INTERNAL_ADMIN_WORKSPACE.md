# Internal and Admin Workspaces

## Goal

Create a premium desktop banking operations workspace for:
- Retention Analyst;
- Relationship Manager;
- Demo Admin.

The interface should feel like a serious internal tool, not a generic SaaS dashboard.

## Global layout

Desktop:
- left sidebar;
- top header;
- breadcrumb/page title;
- optional date/filter bar;
- main content;
- contextual detail panel where useful.

Sidebar groups:
### Overview
- Portfolio
- At-Risk Customers
- Campaigns
- Analytics

### Customer
- Customer Search
- Assigned Customers for RM

### Business
- Merchant Retention
- Commercial
- Corporate

### Operations
- Credit Applications
- Branch Bookings where staff API supports it

### System
- Model & Data Transparency
- Demo Operations for admin only

## Retention Analyst dashboard

KPI cards:
- active customers;
- at-risk;
- silent churn;
- reactivated;
- high/medium/low risk distribution.

Use only API-provided metrics.

Main visuals:
- risk distribution;
- activity trend;
- balance trend;
- at-risk trend;
- campaign/intervention outcome.

## At-risk customer table

Columns:
- customer;
- persona/type;
- risk;
- churn probability;
- Relationship Score;
- recent activity trend;
- top driver;
- recommended action;
- last activity;
- owner/RM if permitted.

Filters:
- risk;
- customer type;
- RM;
- date;
- score range;
- driver/action if API supports.

Row click:
- open customer detail.

## Customer detail

Sections:
1. identity/context;
2. risk summary;
3. behavior trend;
4. churn probability;
5. top drivers;
6. Relationship Score;
7. Next Best Action;
8. intervention history;
9. financing/application context;
10. branch booking context if staff endpoint supports it.

### Churn panel

Show:
- probability;
- risk level;
- model version if available;
- scoring date/as-of date.

Label:
"Estimated churn probability — prototype model"

Never say:
"Customer will churn."

### Drivers

Show human-readable driver descriptions.

If actual SHAP values exist, show ranked drivers.
If backend returns precomputed explanations, do not recompute them in the frontend.

## Relationship Score

Show:
- total 0–100;
- component breakdown;
- trend if API supports.

Consumer initial weights from README:
- Transaction activity 40%;
- Balance/cash-flow stability 25%;
- Product usage 20%;
- Digital engagement 15%.

Merchant initial weights:
- Transaction activity 25%;
- Balance retention 45%;
- Product usage 15%;
- Digital engagement 15%.

Add a permanent disclosure:
"Relationship Score bukan credit score dan tidak digunakan sebagai keputusan lending."

## Next Best Action

Possible RULE_RANKER_V1 actions:
- QRIS_MISSION
- BILL_PAYMENT_MISSION
- PERSONALIZED_REWARD
- DAILY_BANKING_ENGAGEMENT
- MERCHANT_RETENTION_OFFER
- RM_OUTREACH
- PRODUCT_EDUCATION
- NO_ACTION

Present:
- recommended action;
- rationale;
- priority/rank if returned;
- guardrail reason if returned;
- action CTA.

Do not describe it as reinforcement learning, an LLM decision, or autonomous financial decision-making.

## Intervention simulation

Provide a guided flow:
1. choose target;
2. review recommended action;
3. select/confirm intervention;
4. simulate/send according to API semantics;
5. show event result;
6. show outcome history.

Make simulation visually obvious:
"SIMULATED".

## Relationship Manager workspace

RM sees only assigned customers if enforced by backend.

Dashboard:
- assigned customers;
- high-risk assigned;
- pending follow-ups;
- financing applications needing attention;
- upcoming branch bookings if authorized.

Customer detail:
- customer context;
- risk;
- recommendation;
- follow-up;
- application status;
- notes/action result if supported.

Never allow frontend to bypass ownership.

## Demo Admin

Keep admin UI separated from normal staff workflows.

Admin can see:
- demo environment indicator;
- synthetic dataset status;
- authorized demo operations;
- seeded personas if API supports it.

Never expose production-like claims.

## Model transparency page

Show:
- model name/version;
- model status;
- scoring date;
- data window;
- outcome window;
- feature/model disclosure;
- whether model artifact is available.

README states:
- offline training;
- API performs inference only;
- XGBoost main model;
- Logistic Regression baseline;
- SHAP explainability;
- joblib artifacts.

Only display details actually returned by backend or documentation; do not fabricate metrics.
