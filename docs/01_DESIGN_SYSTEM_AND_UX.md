# Design System and UX Specification

## Goal

Create a premium, modern banking interface with two visual modes:

1. **Consumer banking mode** — mobile-first and emotionally simple.
2. **Business/internal mode** — desktop-first and analytical.

The two modes must feel like one product family, not two unrelated applications.

## Brand direction

Use an original BNI-inspired palette and visual language:
- primary orange as an accent/action color;
- deep neutral/navy text;
- warm white/light neutral backgrounds;
- restrained semantic green/yellow/red for status;
- avoid turning every element orange.

Do not use official BNI/Wondr assets unless they already exist in the repository and their use is explicitly permitted.

## Typography

Prioritize:
- excellent numerical readability;
- strong heading hierarchy;
- compact labels;
- comfortable body text;
- tabular numbers for balances and KPIs where supported.

Suggested hierarchy:
- display;
- page title;
- section title;
- card title;
- body;
- metadata;
- micro-label.

Do not make metadata too small.

## Components

Build reusable primitives:
- Button
- IconButton
- Input
- Select
- DateRangePicker
- Search
- Tabs
- Badge
- StatusBadge
- Card
- StatCard
- ProgressBar
- RiskBadge
- EmptyState
- ErrorState
- Skeleton
- Modal
- Drawer
- Toast
- Tooltip
- Dropdown
- Table
- Pagination
- Timeline
- Stepper
- ChartContainer
- BottomNavigation
- Sidebar
- TopBar
- Avatar
- ConfirmationDialog

## Risk visualization

Risk must be understandable without relying only on color.

Examples:
- HIGH + explicit text + icon;
- MEDIUM + explicit text;
- LOW + explicit text.

Do not use red/green alone to communicate meaning.

## Charts

Use Recharts.

Consumer charts:
- simple line trend;
- spending/activity trend;
- balance trend if available.

Internal charts:
- risk distribution;
- transaction trend;
- balance trend;
- retention trend;
- merchant settlement/outflow;
- campaign outcome;
- Relationship Score components.

Every chart needs:
- title;
- unit;
- time range;
- tooltip;
- empty state;
- source/context if meaningful.

Avoid decorative charts.

## Responsive rules

### Consumer
Design from ~360px upward.

At mobile:
- bottom navigation;
- single-column cards;
- horizontally scrollable secondary sections where necessary;
- no desktop tables;
- touch targets >= 44px;
- sticky important CTA only when helpful.

At tablet/desktop:
- progressively increase content width;
- optional side navigation;
- preserve mobile hierarchy.

### Business/internal
Desktop-first at >= 1024px.

At narrower widths:
- sidebar collapses;
- tables become cards or horizontally scrollable;
- filters become a drawer;
- charts stack vertically.

## Motion

Use subtle motion:
- page transition;
- skeleton fade;
- card hover;
- button feedback;
- modal/drawer transitions;
- success state.

Do not animate financial values continuously or create distracting effects.

## Accessibility

Target WCAG-minded behavior:
- semantic HTML;
- keyboard navigation;
- visible focus;
- aria-labels;
- dialog semantics;
- form error association;
- sufficient contrast;
- non-color status communication;
- reduced-motion consideration.

## Error states

Never leave blank screens.

API error examples:
- unavailable backend;
- unauthorized;
- forbidden;
- validation error;
- conflict;
- not found;
- rate limit/server failure.

Give a useful message and a retry/back action.

## Empty states

Every list should have an intentional empty state:
- what is empty;
- why;
- what can be done next.

Example:
"Belum ada booking aktif" + "Cari cabang dan pilih jadwal".

## Banking trust

Use clear confirmation before:
- booking;
- accepting an offer;
- submitting financing;
- staff status changes.

After action:
- show confirmation;
- show reference/status if API returns it;
- provide next action.

Never imply a financial decision has been approved unless backend explicitly returns that state.

## Visual QA

After implementation:
- inspect desktop;
- inspect 360px/390px mobile;
- inspect tablet;
- inspect long customer names;
- inspect empty data;
- inspect loading;
- inspect API error;
- inspect large numbers;
- inspect long timelines.
