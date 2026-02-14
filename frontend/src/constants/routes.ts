export const routes = {
  landing: '/',
  login: '/login',
  accessRequest: '/access-request',
  legacyRegister: '/register',
  app: {
    root: '/app',
    operations: '/app/operations',
    categories: '/app/categories',
    analytics: '/app/analytics',
    settings: '/app/settings',
  },
} as const;
