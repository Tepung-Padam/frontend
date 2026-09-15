# Role and Route Matrix

## Purpose

Use this as the frontend authorization/navigation planning reference.

The backend remains the final authority for access.

## Consumer

### Primary routes
- `/app`
- `/app/activity`
- `/app/inbox`
- `/app/inbox/:id`
- `/app/financing`
- `/app/financing/:id`
- `/app/branches`
- `/app/branches/:id`
- `/app/bookings`
- `/app/bookings/:id`
- `/app/profile`

### Must not see
- portfolio analytics;
- other customers;
- SHAP/internal drivers;
- internal campaign management;
- RM assignments;
- staff-only model diagnostics.

## Merchant

### Primary routes
- `/business`
- `/business/retention`
- `/business/transactions`
- `/business/financing`
- `/business/financing/:id`
- `/business/bookings` where supported
- `/business/profile`

## Commercial

### Primary routes
- `/commercial`
- `/commercial/financing`
- `/commercial/financing/:id`
- `/commercial/bookings` where supported
- `/commercial/profile`

## Corporate

### Primary routes
- `/corporate`
- `/corporate/financing`
- `/corporate/financing/:id`
- `/corporate/bookings` where supported
- `/corporate/profile`

## Retention Analyst

### Primary routes
- `/staff`
- `/staff/portfolio`
- `/staff/at-risk`
- `/staff/customers/:id`
- `/staff/campaigns`
- `/staff/campaigns/:id`
- `/staff/analytics`
- `/staff/models`

## Relationship Manager

### Primary routes
- `/rm`
- `/rm/customers`
- `/rm/customers/:id`
- `/rm/applications`
- `/rm/bookings` where supported

## Demo Admin

### Primary routes
- `/admin`
- `/admin/demo-data`
- `/admin/operations`

Only expose actual supported admin capabilities.

## Route guard behavior

Unauthenticated:
→ login/demo entry.

Authenticated but wrong role:
→ 403-style page or redirect to the user's allowed home.

Backend 401:
→ clear session/redirect to login as appropriate.

Backend 403:
→ show forbidden state.

Never assume:
"if route is hidden, security is solved."

## Persona switcher

If the repository supports demo login:
- allow selecting authorized demo identity;
- clearly show current persona;
- do not imply a real banking login;
- keep demo environment indicator visible.

## Navigation rules

Consumer:
- bottom navigation on mobile.

Business/internal:
- sidebar.

Do not show every possible route to every persona.

## Cross-persona links

Examples:
- staff customer detail → intervention;
- intervention → customer inbox concept;
- financing → branch booking;
- booking → booking detail.

Avoid passing sensitive customer data in query strings.

## Role-sensitive components

Examples:
- `<RoleGate>`
- `<PermissionGate>`
- `<StaffOnly>`
- `<ConsumerOnly>`
- `<BusinessOnly>`

Use these for UX, not as a replacement for backend authorization.
