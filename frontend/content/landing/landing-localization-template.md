# PHI Landing Localization Template

Use this file as the single source for landing translations.
Fill `ru` and `az` columns (you can also adjust `en`), then send the file back.

## Format

| key | en | ru | az |
|---|---|---|---|
| example.key | Example text |  |  |

---

## 1) Landing page (`/`)

| key | en | ru | az |
|---|---|---|---|
| landing.meta.title | PHI · Financial control cockpit for personal and team budgeting |  |  |
| landing.brand | PHI |  |  |
| landing.nav.features | Features |  |  |
| landing.nav.screenshots | Screenshots |  |  |
| landing.nav.roadmap | Access & roadmap |  |  |
| landing.nav.login | Login |  |  |
| landing.nav.requestAccess | Request access |  |  |
| landing.hero.kicker | Portfolio landing / Product showcase |  |  |
| landing.hero.title | Financial control center built for discipline, not reporting for the sake of reporting |  |  |
| landing.hero.description | PHI helps you control budget execution day by day: limits, transactions, analytics, and forecasts in one interface. |  |  |
| landing.hero.cta.request | Submit request |  |  |
| landing.hero.cta.openApp | Open app |  |  |
| landing.hero.stats.format.label | Format |  |  |
| landing.hero.stats.format.value | Web App + Mobile UX |  |  |
| landing.hero.stats.access.label | Access |  |  |
| landing.hero.stats.access.value | Moderated onboarding |  |  |
| landing.hero.stats.next.label | Next step |  |  |
| landing.hero.stats.next.value | Subscription & roles |  |  |
| landing.hero.placeholder.ready | Dashboard preview |  |  |
| landing.hero.placeholder.replacement | Overview with budget status, daily limit, and monthly trajectory at a glance. |  |  |
| landing.features.kicker | Core value |  |  |
| landing.features.title | Core capabilities |  |  |
| landing.workflow.kicker | How it works |  |  |
| landing.workflow.title | How it works |  |  |
| landing.screenshots.kicker | Visuals |  |  |
| landing.screenshots.title | Product screenshots |  |  |
| landing.screenshots.description | Placeholders are pre-wired below. Replace them with your final visuals without changing code, keeping the same filenames. |  |  |
| landing.screenshots.placeholderPrefix | Placeholder: |  |  |
| landing.screenshots.replaceWith | Replace with: |  |  |
| landing.roadmap.kicker | Access model |  |  |
| landing.roadmap.title | Access and evolution |  |  |
| landing.roadmap.mvp.title | MVP now |  |  |
| landing.roadmap.mvp.item1 | Only `Login` for users already approved. |  |  |
| landing.roadmap.mvp.item2 | Dedicated `Request access` flow on the landing. |  |  |
| landing.roadmap.mvp.item3 | Manual moderation and user provisioning. |  |  |
| landing.roadmap.next.title | Next iteration |  |  |
| landing.roadmap.next.item1 | Request statuses: `pending`, `approved`, `rejected`. |  |  |
| landing.roadmap.next.item2 | Subscription plans with usage limits. |  |  |
| landing.roadmap.next.item3 | Role-based access and self-service onboarding. |  |  |
| landing.cta.kicker | Call to action |  |  |
| landing.cta.title | Want to test the product or see a demo for your workflow? |  |  |
| landing.cta.description | Submit a request with your context and expected outcome. After review, access can be approved and configured manually. |  |  |
| landing.cta.submitRequest | Submit request |  |  |
| landing.cta.goToLogin | Go to login |  |  |

### Feature cards (`landingContent.ts`)

| key | en | ru | az |
|---|---|---|---|
| landing.feature.operations.title | Operations without chaos |  |  |
| landing.feature.operations.description | Expenses, income, and categories stay in one flow without duplicated tables or manual rollups. |  |  |
| landing.feature.budget.title | Real budget control |  |  |
| landing.feature.budget.description | Daily limits, remaining balance, and month dynamics help you react to overspending on time. |  |  |
| landing.feature.analytics.title | Analytics for decisions |  |  |
| landing.feature.analytics.description | Spending structure and trends are visible instantly: what grows, what is stable, and where reserves exist. |  |  |

### Workflow cards (`landingContent.ts`)

| key | en | ru | az |
|---|---|---|---|
| landing.workflow.step1.title | 1. Capture transactions |  |  |
| landing.workflow.step1.description | Log an expense or income in seconds: amount, date, category, and note. |  |  |
| landing.workflow.step2.title | 2. Auto-recalculate limits |  |  |
| landing.workflow.step2.description | The system instantly updates budget status, daily limit, and expected month outcome. |  |  |
| landing.workflow.step3.title | 3. Daily review |  |  |
| landing.workflow.step3.description | Review the result in dashboard cards and analytics, then adjust your monthly plan. |  |  |

### Screenshot cards (`landingContent.ts`)

| key | en | ru | az |
|---|---|---|---|
| landing.shot.dashboard.title | Budget control cockpit |  |  |
| landing.shot.dashboard.description | High-level dashboard with monthly budget status, daily spend allowance, and key totals. |  |  |
| landing.shot.dashboard.subtitle | Start each day from a single control view. |  |  |
| landing.shot.analytics.title | Spending trends and categories |  |  |
| landing.shot.analytics.description | See where money goes with daily trends, category split, and period comparison. |  |  |
| landing.shot.analytics.subtitle | Spot overspending early and adjust faster. |  |  |
| landing.shot.operations.title | Transaction operations flow |  |  |
| landing.shot.operations.description | Structured feed of expenses and income with quick add, edit, and filtering tools. |  |  |
| landing.shot.operations.subtitle | Daily bookkeeping without spreadsheet friction. |  |  |
| landing.shot.mobile.title | Mobile daily check-in |  |  |
| landing.shot.mobile.description | Compact mobile layout with key cards and latest activity for on-the-go control. |  |  |
| landing.shot.mobile.subtitle | Review limits and activity in under a minute. |  |  |
| landing.shot.access.title | Access request workflow |  |  |
| landing.shot.access.description | Moderated onboarding form that captures context and supports manual approval. |  |  |
| landing.shot.access.subtitle | Controlled access instead of open signup. |  |  |

---

## 2) Access request page (`/access-request`)

| key | en | ru | az |
|---|---|---|---|
| access.meta.title | Access Request · PHI |  |  |
| access.brand | PHI |  |  |
| access.kicker | Moderated onboarding |  |  |
| access.title | Request access to the app |  |  |
| access.description | Open registration is disabled. Submit a request and access can be approved manually after review. |  |  |
| access.success | Request submitted at {datetime}. You will receive an update after review. |  |  |
| access.error.required | Please provide your email and a short usage goal. |  |  |
| access.form.name.label | Name |  |  |
| access.form.name.placeholder | e.g. Alex Morgan |  |  |
| access.form.email.label | Email * |  |  |
| access.form.email.placeholder | name@company.com |  |  |
| access.form.company.label | Company / project |  |  |
| access.form.company.placeholder | e.g. Personal budgeting |  |  |
| access.form.useCase.label | Why do you need access? * |  |  |
| access.form.useCase.placeholder | Briefly describe your use case and expected outcome... |  |  |
| access.form.submit | Submit request |  |  |
| access.form.hasAccess | I already have access |  |  |
| access.footer.note | MVP mode: requests are currently saved in browser storage. Next step: move to server-side queue with `pending / approved / rejected` statuses. |  |  |
