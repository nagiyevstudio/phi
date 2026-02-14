export interface FeatureCard {
  title: string;
  description: string;
}

export interface WorkflowStep {
  title: string;
  description: string;
}

export interface ScreenshotPlaceholder {
  title: string;
  description: string;
  image: string;
  replacementFile: string;
}

export const featureCards: FeatureCard[] = [
  {
    title: 'Операции без хаоса',
    description:
      'Расходы, доходы и категории собираются в одном потоке без дублирования таблиц и ручных сводок.',
  },
  {
    title: 'Реальный контроль бюджета',
    description:
      'Дневной лимит, остаток до конца месяца и фактическая динамика помогают вовремя реагировать на перерасход.',
  },
  {
    title: 'Аналитика для решений',
    description:
      'Структура трат и тренды видны сразу: какие категории растут, что стабильно и где есть резерв.',
  },
];

export const workflowSteps: WorkflowStep[] = [
  {
    title: '1. Фиксация операций',
    description: 'Добавляете расход или доход за несколько секунд: сумма, дата, категория и комментарий.',
  },
  {
    title: '2. Автопересчёт лимитов',
    description: 'Система моментально обновляет бюджет, дневной лимит и прогноз по оставшимся дням.',
  },
  {
    title: '3. Ежедневный разбор',
    description: 'Видите результат в карточках и аналитике, а затем корректируете план на месяц.',
  },
];

export const screenshotPlaceholders: ScreenshotPlaceholder[] = [
  {
    title: 'Дашборд месяца',
    description: 'Главный экран с бюджетом, дневным лимитом и итогами по доходам/расходам.',
    image: '/assets/landing/hero-dashboard-placeholder.svg',
    replacementFile: 'hero-dashboard.png',
  },
  {
    title: 'Аналитика расходов',
    description: 'Визуализация структуры расходов по категориям и динамики по дням.',
    image: '/assets/landing/expenses-analytics-placeholder.svg',
    replacementFile: 'expenses-analytics.png',
  },
  {
    title: 'Поток операций',
    description: 'Список операций с быстрым добавлением, редактированием и фильтрацией.',
    image: '/assets/landing/operations-flow-placeholder.svg',
    replacementFile: 'operations-flow.png',
  },
  {
    title: 'Мобильный вид',
    description: 'Пример адаптивного интерфейса для ежедневного использования с телефона.',
    image: '/assets/landing/mobile-view-placeholder.svg',
    replacementFile: 'mobile-view.png',
  },
  {
    title: 'Запрос доступа',
    description: 'Экран формы заявки для модерируемой регистрации и ручного одобрения.',
    image: '/assets/landing/access-request-placeholder.svg',
    replacementFile: 'access-request.png',
  },
];
