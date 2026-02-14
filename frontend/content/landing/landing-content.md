# PHI Landing Blueprint

## 1. Goal
The public home page now acts as a portfolio-style product presentation.
Core goals:
- Show product value through clear sections and visuals.
- Remove open signup from the primary flow.
- Move the working app to `/app`.
- Keep `Login` for approved users and add an access request flow.

## 2. Routing plan
- `/` - landing page.
- `/app` - app dashboard (private access).
- `/app/operations`, `/app/categories`, `/app/analytics`, `/app/settings` - internal app pages.
- `/login` - login for approved users.
- `/access-request` - access request form.
- `/register` - legacy redirect to `/access-request`.

## 3. Landing copy (ready)

### Hero
- Kicker: `Portfolio landing / Product showcase`
- H1: `Financial control center built for discipline, not reporting for the sake of reporting`
- Paragraph: `PHI helps you control budget execution day by day: limits, transactions, analytics, and forecasts in one interface.`
- CTA 1: `Submit request`
- CTA 2: `Open app`

### Value cards
1. `Operations without chaos`
2. `Real budget control`
3. `Analytics for decisions`

### Workflow
1. `Capture transactions`
2. `Auto-recalculate limits`
3. `Daily review`

### Access roadmap
- MVP now:
  - `Login only for approved users`
  - `Dedicated Request access form`
  - `Manual moderation and provisioning`
- Next iteration:
  - `Statuses: pending / approved / rejected`
  - `Subscription plans and limits`
  - `Role model and self-service onboarding`

### Final CTA
- Title: `Want to test the product or see a demo for your workflow?`
- Text: `Submit a request with your context and expected outcome. After review, access can be approved and configured manually.`
- Buttons:
  - `Submit request`
  - `Go to login`

## 4. Image placeholders and replacement map
All placeholders are already created and connected on the landing:
- `frontend/public/assets/landing/hero-dashboard-placeholder.svg`
- `frontend/public/assets/landing/expenses-analytics-placeholder.svg`
- `frontend/public/assets/landing/operations-flow-placeholder.svg`
- `frontend/public/assets/landing/mobile-view-placeholder.svg`
- `frontend/public/assets/landing/access-request-placeholder.svg`

Recommended final filenames:
- `hero-dashboard.png`
- `expenses-analytics.png`
- `operations-flow.png`
- `mobile-view.png`
- `access-request.png`

## 5. Detailed image briefs (for generation/shooting)

### Image 1 - Hero dashboard
- Purpose: key visual in the first fold.
- Format: 16:10 desktop screenshot.
- Scene: dashboard overview with three KPI cards (budget, daily limit, monthly totals), summary analytics, and recent transactions list.
- Mood: clean, premium, calm, warm-neutral.
- Palette: ivory background, sand accents, copper CTA, dark text.
- Composition: central focus on KPI cards with minimal visual noise.

### Image 2 - Expense analytics
- Purpose: show analytical depth.
- Format: 16:10.
- Scene: spending trend by day + category breakdown (bar/pie/table) + period filter.
- Key message: user quickly sees overspending trend and category share.
- Notes: keep numbers realistic.

### Image 3 - Operations flow
- Purpose: show everyday workflow.
- Format: 16:10.
- Scene: transaction feed with typed markers, categories, date, amount; visible quick-add action.
- Key message: transaction tracking is fast and structured.
- Notes: use 5-8 realistic transaction rows.

### Image 4 - Mobile view
- Purpose: show responsive usability.
- Format: 9:16 (or two-device composition in 16:10).
- Scene: mobile layout with bottom navigation, summary cards, and latest activity list.
- Key message: product is practical for daily mobile usage.
- Notes: keep spacing touch-friendly.

### Image 5 - Access request
- Purpose: emphasize moderated onboarding.
- Format: 16:10.
- Scene: request form (name, email, company, use case) + success state.
- Key message: access is controlled, not open mass signup.
- Notes: trust-focused, clean visual language.

## 6. Prompt templates for AI image generation

### Prompt A - dashboard
`Modern financial web app dashboard screenshot, clean and realistic UI, warm neutral palette (ivory, sand, copper accents), KPI cards for monthly budget, daily limit, expense/income totals, recent operations list, soft natural shadows, professional product shot, high detail, no brand logos, no watermark.`

### Prompt B - analytics
`Fintech analytics screen screenshot, realistic spending charts and category breakdown, monthly trend line and category bars, minimalist premium interface, warm beige background and copper accents, data-heavy but readable layout, product portfolio quality, no watermark.`

### Prompt C - operations
`Expense tracker operations list screenshot, transaction feed with categories and amounts, quick add action button, polished mobile-friendly web UI, neutral warm tones, clean typography, realistic numbers, portfolio-ready product image, no watermark.`

### Prompt D - mobile
`Mobile UI mockup for personal finance app, bottom navigation, daily limit card, latest operations list, clean touch-friendly spacing, warm neutral design system, realistic app screenshot style, sharp and clear, no watermark.`

### Prompt E - access
`Access request form screen for a finance web application, moderated onboarding flow, fields for name email company and use case, success state alert, trustworthy and minimal design, warm neutral color palette, high fidelity screenshot style, no watermark.`

## 7. Implementation status
- [x] Landing page on `/`.
- [x] App moved to `/app`.
- [x] Login placed in landing navigation.
- [x] Access request page added (`/access-request`).
- [x] Image placeholders connected and ready for replacement.
- [ ] Move requests to server storage.
- [ ] Add admin moderation flow.
- [ ] Implement paid subscription layer (billing + plan limits).
