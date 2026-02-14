# Perfinance Landing Blueprint

## 1. Goal
Публичная главная страница теперь работает как презентация проекта для портфолио.
Главные задачи:
- Показать ценность продукта через понятные блоки и визуалы.
- Убрать открытую регистрацию с первого экрана.
- Перенести рабочее приложение под путь `/app`.
- Оставить вход через `Login` и добавить страницу заявки на доступ.

## 2. Routing plan
- `/` - лендинг.
- `/app` - дашборд приложения (приватный доступ).
- `/app/operations`, `/app/categories`, `/app/analytics`, `/app/settings` - внутренние страницы.
- `/login` - вход для одобренных пользователей.
- `/access-request` - форма заявки на доступ.
- `/register` - legacy-редирект на `/access-request`.

## 3. Landing copy (ready)

### Hero
- Kicker: `Portfolio landing / Product showcase`
- H1: `Финансовый центр управления для дисциплины, а не для отчётности ради отчётности`
- Paragraph: `Perfinance помогает контролировать бюджет в ежедневном режиме: лимиты, операции, аналитика и прогнозы в одном интерфейсе.`
- CTA 1: `Оставить заявку`
- CTA 2: `Открыть приложение`

### Value cards
1. `Операции без хаоса`
2. `Реальный контроль бюджета`
3. `Аналитика для решений`

### Workflow
1. `Фиксация операций`
2. `Автопересчёт лимитов`
3. `Ежедневный разбор`

### Access roadmap
- MVP сейчас:
  - `Только Login для уже одобренных пользователей`
  - `Отдельная форма Запросить доступ`
  - `Ручная модерация заявок`
- Следующая итерация:
  - `Статусы pending/approved/rejected`
  - `Подписка и тарифы`
  - `Ролевая модель и self-service onboarding`

### Final CTA
- Title: `Хочешь протестировать проект или посмотреть демо под твою задачу?`
- Text: `Оставь заявку, опиши контекст использования и ожидаемый результат. После модерации открою доступ и помогу с настройкой.`
- Buttons:
  - `Отправить заявку`
  - `Перейти к логину`

## 4. Image placeholders and replacement map
Все плейсхолдеры уже созданы и подключены на лендинге:
- `frontend/public/assets/landing/hero-dashboard-placeholder.svg`
- `frontend/public/assets/landing/expenses-analytics-placeholder.svg`
- `frontend/public/assets/landing/operations-flow-placeholder.svg`
- `frontend/public/assets/landing/mobile-view-placeholder.svg`
- `frontend/public/assets/landing/access-request-placeholder.svg`

Рекомендованные финальные имена файлов:
- `hero-dashboard.png`
- `expenses-analytics.png`
- `operations-flow.png`
- `mobile-view.png`
- `access-request.png`

## 5. Detailed image briefs (for generation/shooting)

### Image 1 - Hero dashboard
- Purpose: главный визуал в первом экране.
- Format: 16:10, desktop web app screenshot.
- Scene: overview dashboard с тремя KPI-карточками (budget, daily limit, monthly totals), блок с краткой аналитикой, список последних операций.
- Mood: clean, premium, calm, warm-neutral.
- Palette: ivory background, sand accents, copper CTA, dark text.
- Composition: центральный фокус на KPI-карточках; интерфейс без лишних декоративных элементов.

### Image 2 - Expenses analytics
- Purpose: показать аналитическую глубину.
- Format: 16:10.
- Scene: график трат по дням + breakdown по категориям (bar/pie/table) + фильтр периода.
- Key message: пользователь быстро видит тренд перерасхода и долю категорий.
- Notes: цифры реалистичные, не fake huge numbers.

### Image 3 - Operations flow
- Purpose: показать ежедневный workflow.
- Format: 16:10.
- Scene: список операций с цветными маркерами типов, категориями, датой, суммой; рядом кнопка добавления операции.
- Key message: фиксировать транзакции быстро и без хаоса.
- Notes: сделать 5-8 строк операций, разные категории, аккуратная типографика.

### Image 4 - Mobile view
- Purpose: показать адаптивность.
- Format: 9:16 (или two-device composition в 16:10).
- Scene: mobile layout с bottom navigation, карточками и списком последних действий.
- Key message: продукт удобно использовать каждый день с телефона.
- Notes: читабельные отступы, крупные touch-targets.

### Image 5 - Access request
- Purpose: подчеркнуть модель модерируемого доступа.
- Format: 16:10.
- Scene: форма заявки (name, email, company, use case) + статусный алерт «request submitted».
- Key message: вход контролируемый, не массовая свободная регистрация.
- Notes: показать доверие и аккуратную подачу, без sales overload.

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
- [x] Лендинг добавлен на `/`.
- [x] Приложение перенесено на `/app`.
- [x] Login вынесен в меню лендинга.
- [x] Добавлена форма заявки на доступ (`/access-request`).
- [x] Подключены и отображаются плейсхолдеры изображений.
- [ ] Подключить серверный storage заявок.
- [ ] Добавить админ-модерацию заявок.
- [ ] Подготовить платную подписку (billing + plan limits).
