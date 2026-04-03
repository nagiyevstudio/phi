# План: glass-стиль UI (градиент, текстура, blur, формы)

## Как работаем

- План живёт в этом файле; реализация идёт **фаза за фазой**, без скачка «всё сразу».
- После каждой фазы — **краткий отчёт** в чате (что сделано, что проверить, на что смотреть).
- Ты поднимаешь фронт (`npm run dev` в `frontend`), смотришь вживую и **пишешь правки**, когда что-то режет глаз или ломается контраст/читаемость.
- Код меняется только в рамках текущей фазы, если не договоримся об отступлении.

## Цель и границы

**Цель:** стекло поверх «живого» фона — градиент + лёгкая текстура, на панелях полупрозрачность, `backdrop-filter`, тонкий border, крупные радиусы. Не копировать Apple целиком.

**Вне scope:** сложные анимации, spring, scroll-эффекты; пиксель-перфект под macOS; смена UI-фреймворка. **Маркетинговый лендинг** (`.pf-landing`) — не меняем в рамках glass; только приложение под `.pf-app-bg`.

**Анимации:** обычные CSS `transition` (opacity, transform, shadow, цвета), 150–250 ms.

## Критерии «фаза закрыта»

- Фон даёт заметное размытие на типовых карточках/панелях.
- 2–3 именованных уровня поверхности, переиспользуемых из одного места (токены + классы).
- Light/dark проверены на пилотных экранах; фокус-кольца не теряются.
- Нет лишнего fullscreen-blur без нужды.

---

## Фаза 0 — Ограничения (до кода) — **закрыта**

- [x] Сколько вариантов blur (например 1 основной + усиленный для модалок).
- [x] Текстура: CSS-only vs маленький повторяющийся asset.
- [x] Список 2–3 пилотных экранов для первой вёрстки.

### Решения фазы 0

**Blur (2 варианта, без третьего «на всякий случай»):**

| Токен / имя (черновик) | Назначение |
| ---------------------- | ---------- |
| **Основной** (`glass` / `panel`) | Карточки, основной контент, сайдбарные панели — дефолт для большинства поверхностей. |
| **Усиленный** (`glass-modal` / `elevated`) | Модалки, дропдауны, то, что должно визуально «лежать» выше и чуть сильнее отделяться от фона. |

Вложенные блоки внутри карточки — **тот же основной blur** или вообще без blur (плотная подложка), а не отдельная третья сила — чтобы не плодить зоопарк.

**Текстура:**

- **Старт:** маленький **повторяющийся asset** (предпочтительно лёгкий SVG или оптимизированный PNG) в `public/`, низкая непрозрачность слоя (ориентир **3–8%** — подстроим на фазе 1 на глаз).
- **Запасной план:** если паттерн не зайдёт (швы, мыло на Retina), перейти на **CSS-only** шум или комбинацию asset + мягкий CSS grain — без переделки остального плана.

**Пилотные экраны (фаза 4):**

| Порядок | Страница | Маршрут | Зачем |
| ------- | -------- | ------- | ----- |
| 1 | `Dashboard` | `/app` | Оболочка приложения, типовые блоки/карточки. |
| 2 | `Operations` | `/app/operations` | Списки/плотный контент — проверка читаемости на стекле. |
| 3 | `Settings` | `/app/settings` | Формы, секции, контролы — контраст и фокус. |

Лендинг, логин и маркетинговые страницы **вне первого пилота** (можно отдельным заходом после фаз 4–5, если захочешь единый фон).

## Фаза 1 — Фон: градиент + текстура — **закрыта**

- [x] Доработать `.pf-app-bg` (и тёмный вариант), добавить субтильную текстуру.
- [x] Цельный фон за скроллом (без рваных краёв).

### Сделано (фаза 1)

- Файл [`public/textures/grain.svg`](public/textures/grain.svg) — тайл 128×128, `feTurbulence` + `stitchTiles` для бесшовности.
- Зерно в **`::before`** у `.pf-app-bg` только (`mix-blend-mode: multiply` / dark: `soft-light`); лендинг `.pf-landing` не трогаем.
- `#root` и `body`: `min-height` `100dvh` / `100vh` для стабильной высоты; `html` — `min-height: 100%`.
- Inline-скрипт в [`index.html`](index.html): цвета приведены к [`theme.ts`](src/utils/theme.ts) (`#f9f6f2` / `#141414`, текст как в теме), чтобы не было полосы при первом кадре и overscroll.

## Фаза 2 — Токены — **закрыта**

- [x] CSS variables / theme: подложка, blur, border, shadow, радиусы — отдельно light и dark.

### Сделано (фаза 2)

Токены в [`src/index.css`](src/index.css) на `:root` и `:root.dark` (класс `dark` на `html`):

| Префикс | Назначение |
| --------| ----------- |
| `--pf-glass-bg`, `--pf-glass-bg-fallback` | Подложка панели + запас без `backdrop-filter` |
| `--pf-glass-blur`, `--pf-glass-backdrop` | Сила размытия и готовое значение для `backdrop-filter` |
| `--pf-glass-border`, `--pf-glass-shadow`, `--pf-glass-radius*` | Обводка, тень, радиусы |
| `--pf-glass-elevated-*` | Усиленный вариант для модалок / верхних слоёв |
| `--pf-glass-transition` | Общий темп для простых `transition` |

Зернистость усилена: `::before` opacity и плотность в [`public/textures/grain.svg`](public/textures/grain.svg).

## Фаза 3 — Классы поверхности — **закрыта**

- [x] 2–3 класса (например `.pf-glass-*`): фон + blur + border + shadow + radius.
- [x] Инпуты: при необходимости отдельный плотный вариант без агрессивного blur.

### Сделано (фаза 3)

- [`src/index.css`](src/index.css): **`.pf-glass`**, **`.pf-glass-elevated`** (`@supports` → полупрозрачный фон, иначе fallback); **`.pf-glass-bar`**, **`.pf-glass-bar-nav`**, **`.pf-glass-bar-dock`** для шапки и нижнего дока.
- Токен **`--pf-glass-field-bg`**; **`.pf-input` / `.pf-select` / `.pf-textarea` / `.pf-color`** на плотной подложке и `var(--pf-glass-border)` без blur.
- Подключено: [`Layout.tsx`](src/components/common/Layout.tsx) (nav + mobile dock), [`OperationForm.tsx`](src/components/Dashboard/OperationForm.tsx) и [`HelpModal.tsx`](src/components/common/HelpModal.tsx) — карточка модалки `pf-glass-elevated`.

## Фаза 4 — Пилот — **закрыта**

- [x] 2–3 экрана переведены на новые поверхности; модалки/sticky не ломают stacking.

### Сделано (фаза 4)

- **Dashboard** (`/app`): `BudgetCard`, `DailyLimitCard`, `MonthlyExpenseCard`, `AnalyticsTotals`, `OperationsPanel` → список через `OperationsList`.
- **Operations** (`/app/operations`): `MonthSelector`, `AnalyticsTotals`, `OperationsPanel` (блок фильтров + `OperationsList`).
- **Settings** (`/app/settings`): все карточки сетки — **`pf-glass`** + **`!rounded-lg`** (как прежний `rounded-lg`).

Компонент **`AnalyticsTotals`** менялся как общий для дашборда и операций; на странице **Analytics** он тоже станет стеклянным — допустимый побочный эффект пилота.

## Фаза 5 — Остальной UI — **закрыта**

- [x] Остальные страницы пакетами; разовые длинные цепочки Tailwind свести к токенам/классам.

### Сделано (фаза 5)

- **Analytics** (`/app/analytics`): все блоки с `bg-white … rounded-lg shadow` → **`pf-glass`**; вкладки месяц/год/всего — неактивное состояние **`pf-toggle-muted`** (у **`tabBase`** убран лишний `border`).
- **Categories** (`/app/categories`): основная карточка **`pf-glass`**; блок добавления категории — **`pf-surface-nested`**.
- **Login / Register** (`pf-app-bg`): контент в **`pf-glass !rounded-2xl`**; языковые кнопки — **`pf-toggle-muted`**.
- Общие утилиты в [`index.css`](src/index.css): **`.pf-toggle-muted`**, **`.pf-surface-nested`**, **`.pf-icon-btn`** (стрелки месяца в **`MonthSelector`**).
- **OperationsPanel**, **Settings**: неактивные чипы/кнопки переведены на **`pf-toggle-muted`**; у общих `*Base` убран дублирующий **`border`**.
- **Лендинг** и **AccessRequest** не трогались (по правилам проекта).

## Фаза 6 — Полировка — **закрыта**

- [x] Fallback без/с слабым `backdrop-filter` (`@supports` или плотнее заливка).
- [x] Transitions только по согласованному списку свойств.
- [x] Быстрый прогон браузеров + клавиатура по формам.

### Сделано (фаза 6)

- **`@supports` + плотные `--pf-glass-*-fallback`** — без изменений по логике; добавлен **`prefers-contrast: more`**: blur отключается, фон принудительно fallback (читаемость).
- **`prefers-reduced-motion: reduce`**: **`--pf-glass-transition`** → **70ms**; у **`html`** — **`scroll-behavior: auto`** (в конце файла, перебивает `smooth`).
- Зафиксирован список transition для стекла: **`background-color`**, **`box-shadow`**, **`border-color`** (комментарий у `.pf-glass`); у **`.pf-input` / `.pf-select` / `.pf-textarea`** — те же + **`background-color`**.
- **`--pf-focus-ring`**, **`.pf-icon-btn:focus-visible`** — кольцо с клавиатуры на стрелках месяца.
- Прогон: **`npm run build`**, **`npm run lint`**.

---

## Риски (кратко)

| Риск              | Митигация                                      |
| ----------------- | ---------------------------------------------- |
| Низкий контраст   | Плотнее подложка под текст; не жать opacity    |
| Лаги от blur      | Не размывать огромные области; мало слоёв     |
| Хаос вариантов    | Строго 2–3 уровня поверхности                  |
| Dark «грязный»    | Свои border/shadow для dark, не копия light    |

---

## Журнал (краткие отметки по мере прохода)

| Дата       | Фаза | Статус / заметки |
| ---------- | ---- | ---------------- |
| 2026-04-04 | 0    | Закрыта: 2 варианта blur; текстура — повторяющийся asset с запасным CSS; пилот — Dashboard, Operations, Settings. |
| 2026-04-04 | 1    | Grain SVG + слои в `.pf-app-bg`; fallback `background-color`; min-height цепочка; синхронизация `index.html` с `theme.ts`. |
| 2026-04-04 | 2    | Токены `--pf-glass-*` / `--pf-glass-elevated-*`; контрастнее grain (`::before` + SVG). |
| 2026-04-04 | 3    | `.pf-glass` / elevated / bar; поля на `--pf-glass-field-bg`; Layout, OperationForm, HelpModal. |
| 2026-04-04 | 4    | Пилот: карточки и панели Dashboard / Operations / Settings → `pf-glass`. |
| 2026-04-04 | 5    | Analytics, Categories, Login/Register; `pf-toggle-muted`, `pf-surface-nested`, `pf-icon-btn`. |
| 2026-04-04 | 6    | `prefers-contrast` / `reduced-motion`; transitions; focus `pf-icon-btn`; build + lint. |
|            |      |                  |
