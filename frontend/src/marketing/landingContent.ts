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

type Translate = (key: string, params?: Record<string, string | number>) => string;

export const getFeatureCards = (t: Translate): FeatureCard[] => [
  {
    title: t('landing.feature.operations.title'),
    description: t('landing.feature.operations.description'),
  },
  {
    title: t('landing.feature.budget.title'),
    description: t('landing.feature.budget.description'),
  },
  {
    title: t('landing.feature.analytics.title'),
    description: t('landing.feature.analytics.description'),
  },
];

export const getWorkflowSteps = (t: Translate): WorkflowStep[] => [
  {
    title: t('landing.workflow.step1.title'),
    description: t('landing.workflow.step1.description'),
  },
  {
    title: t('landing.workflow.step2.title'),
    description: t('landing.workflow.step2.description'),
  },
  {
    title: t('landing.workflow.step3.title'),
    description: t('landing.workflow.step3.description'),
  },
];

export const getScreenshotPlaceholders = (t: Translate): ScreenshotPlaceholder[] => [
  {
    title: t('landing.shot.dashboard.title'),
    description: t('landing.shot.dashboard.description'),
    image: '/assets/landing/hero-dashboard-placeholder.svg',
    replacementFile: 'hero-dashboard.png',
  },
  {
    title: t('landing.shot.analytics.title'),
    description: t('landing.shot.analytics.description'),
    image: '/assets/landing/expenses-analytics-placeholder.svg',
    replacementFile: 'expenses-analytics.png',
  },
  {
    title: t('landing.shot.operations.title'),
    description: t('landing.shot.operations.description'),
    image: '/assets/landing/operations-flow-placeholder.svg',
    replacementFile: 'operations-flow.png',
  },
  {
    title: t('landing.shot.mobile.title'),
    description: t('landing.shot.mobile.description'),
    image: '/assets/landing/mobile-view-placeholder.svg',
    replacementFile: 'mobile-view.png',
  },
  {
    title: t('landing.shot.access.title'),
    description: t('landing.shot.access.description'),
    image: '/assets/landing/access-request-placeholder.svg',
    replacementFile: 'access-request.png',
  },
];
