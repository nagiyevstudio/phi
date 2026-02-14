import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import MaterialIcon from './MaterialIcon';
import logoUrl from '../../assets/logo.png';
import { useI18n } from '../../i18n';
import { routes } from '../../constants/routes';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef<number | null>(null);
  const refreshThreshold = 70;

  const navItems = [
    { path: routes.app.root, label: t('nav.home'), icon: 'home' },
    { path: routes.app.operations, label: t('nav.operations'), icon: 'list' },
    { path: routes.app.analytics, label: t('nav.analytics'), icon: 'chart' },
    { path: routes.app.settings, label: t('nav.settings'), icon: 'settings' },
  ] as const;
  const pageTitles = [
    ...navItems,
    { path: routes.app.categories, label: t('nav.categories') },
  ] as const;

  const handleLogoClick = () => {
    navigate(routes.app.root);
  };

  const sectionTitle =
    pageTitles.find((item) => item.path === location.pathname)?.label ?? t('common.appName');
  const displayName = user?.name?.trim();

  useEffect(() => {
    document.title = `${sectionTitle} · ${t('common.appName')}`;
  }, [sectionTitle, t]);

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isRefreshing) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > 0) return;
    pullStartY.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (pullStartY.current === null || isRefreshing) return;
    const currentY = event.touches[0]?.clientY ?? pullStartY.current;
    const delta = currentY - pullStartY.current;
    if (delta <= 0) {
      setPullDistance(0);
      return;
    }
    const distance = Math.min(delta / 2, 120);
    setPullDistance(distance);
  };

  const handleTouchEnd = () => {
    if (pullStartY.current === null) return;
    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      pullStartY.current = null;
      window.location.reload();
      return;
    }
    setPullDistance(0);
    pullStartY.current = null;
  };

  return (
    <div className="min-h-screen pf-app-bg">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#1a1a1a]/95 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={handleLogoClick}
                  className="flex items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] rounded-md"
                >
                  <img src={logoUrl} alt={t('common.appName')} className="h-8 w-auto" />
                  <span className="text-base sm:text-lg font-semibold tracking-wide text-gray-900 dark:text-[#e5e7eb]">
                    {sectionTitle}
                  </span>
                </button>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'border-[#d27b30] text-gray-900 dark:text-[#e5e7eb]'
                        : 'border-transparent text-gray-500 dark:text-[#d4d4d8] hover:border-gray-300 hover:text-gray-700 dark:hover:text-[#d4d4d8]'
                    } inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <MaterialIcon
                      name={item.icon}
                      className="h-4 w-4"
                      variant={location.pathname === item.path ? 'filled' : 'outlined'}
                    />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              {displayName ? (
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-[#d4d4d8] mr-4">
                  {displayName}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      <main
        className="max-w-7xl mx-auto pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:pb-6 sm:px-6 lg:px-8"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="flex items-end justify-center text-xs text-gray-500 dark:text-[#a3a3a3] transition-[height] duration-150"
          style={{ height: pullDistance }}
        >
          <span className={pullDistance > 0 ? 'pb-2' : 'sr-only'}>
            {isRefreshing
              ? t('layout.refreshing')
              : pullDistance >= refreshThreshold
              ? t('layout.releaseToRefresh')
              : t('layout.pullToRefresh')}
          </span>
        </div>
        {children}
      </main>

      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-[#2a2a2a] bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur">
        <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-2 py-1 text-[11px] font-medium ${
                  isActive
                    ? 'text-[#d27b30] dark:text-[#f0b27a]'
                    : 'text-gray-500 dark:text-[#a3a3a3]'
                }`}
              >
                <MaterialIcon
                  name={item.icon}
                  className="h-6 w-6"
                  variant={isActive ? 'filled' : 'outlined'}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

