import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/common/Layout';
import MaterialIcon from '../components/common/MaterialIcon';
import HelpModal from '../components/common/HelpModal';
import { useAuth } from '../store/auth';
import { authApi, exportApi } from '../services/api';
import { getCurrentMonth } from '../utils/format';
import { applyTheme, getStoredTheme, setStoredTheme, type ThemePreference } from '../utils/theme';
import { useI18n } from '../i18n';
import logoUrl from '../assets/logo.png';
import { routes } from '../constants/routes';

const isIOSSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  return iOS && webkit;
};

export default function Settings() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [exportMonth, setExportMonth] = useState(getCurrentMonth());
  const [isExporting, setIsExporting] = useState(false);
  const [exportAll, setExportAll] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredTheme());
  const [showExportHelp, setShowExportHelp] = useState(false);
  const appVersion = __APP_VERSION__ || '-';
  const appReleaseDate = __APP_RELEASE_DATE__ || '-';

  useEffect(() => {
    setStoredTheme(themePreference);
    applyTheme(themePreference);
  }, [themePreference]);

  const themeButtonBase =
    'inline-flex items-center justify-center h-10 px-4 rounded-full border text-sm font-medium shadow-sm transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-[#d27b30] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-[#1a1a1a]';
  const themeButtonInactive =
    'border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/70 dark:hover:bg-[#212121]';
  const themeButtonActive =
    'bg-[#d27b30] text-white border-[#d27b30] shadow-sm';
  const cardTitle = 'text-lg font-medium text-gray-900 dark:text-[#e5e7eb]';
  const cardIcon =
    'flex h-8 w-8 items-center justify-center rounded-full bg-[#d27b30]/10 text-[#d27b30]';
  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
    { value: 'auto', label: t('settings.themeAuto') },
  ];

  const languageOptions: { value: 'ru' | 'az' | 'en'; label: string }[] = [
    { value: 'ru', label: t('settings.languageRu') },
    { value: 'az', label: t('settings.languageAz') },
    { value: 'en', label: t('settings.languageEn') },
  ];
  const isIOSNativePickerFallback = useMemo(() => isIOSSafari(), []);
  const locale = useMemo(() => {
    if (language === 'ru') return 'ru-RU';
    if (language === 'az') return 'az-AZ';
    return 'en-US';
  }, [language]);
  const currentYear = new Date().getFullYear();
  const exportMonthValue = /^\d{4}-\d{2}$/.test(exportMonth) ? exportMonth : getCurrentMonth();
  const [selectedExportYear, selectedExportMonth] = exportMonthValue.split('-');
  const exportYearOptions = useMemo(() => {
    const selectedYear = Number(selectedExportYear) || currentYear;
    const startYear = Math.min(2020, selectedYear);
    const endYear = Math.max(currentYear + 1, selectedYear);
    return Array.from({ length: endYear - startYear + 1 }, (_, index) =>
      String(startYear + index)
    );
  }, [currentYear, selectedExportYear]);
  const exportMonthOptions = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, index) => {
      const value = String(index + 1).padStart(2, '0');
      return {
        value,
        label: `${value} · ${formatter.format(new Date(2024, index, 1))}`,
      };
    });
  }, [locale]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    window.location.href = routes.login;
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      await exportApi.json(exportAll ? undefined : exportMonth);
    } catch (error) {
      console.error('Export error:', error);
      alert(t('settings.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      await exportApi.csv(exportAll ? undefined : exportMonth);
    } catch (error) {
      console.error('Export error:', error);
      alert(t('settings.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className={cardIcon}>
                <MaterialIcon name="settings" className="h-4 w-4" />
              </span>
              <h2 className={cardTitle}>{t('settings.profileTitle')}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                  {t('settings.profileName')}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">
                  {user?.name?.trim() || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                  {t('settings.profileEmail')}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">
                  {user?.email}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                  {t('settings.profileRole')}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">
                  {user?.role ? t(`roles.${user.role}`) : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className={cardIcon}>
                <MaterialIcon name="archive" className="h-4 w-4" />
              </span>
              <h2 className={cardTitle}>{t('settings.exportTitle')}</h2>
              <button
                type="button"
                onClick={() => setShowExportHelp(true)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-[#d27b30] hover:bg-[#d27b30]/10 dark:text-[#a3a3a3] dark:hover:text-[#f0b27a] dark:hover:bg-[#d27b30]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
                aria-label="Помощь"
                title="Помощь"
              >
                <MaterialIcon name="help" className="h-4 w-4" variant="outlined" />
              </button>
            </div>
            <HelpModal helpType="export" isOpen={showExportHelp} onClose={() => setShowExportHelp(false)} />
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#d4d4d8]">
                <input
                  type="checkbox"
                  checked={exportAll}
                  onChange={(e) => setExportAll(e.target.checked)}
                  className="pf-checkbox"
                />
                {t('settings.exportAll')}
              </label>

              {!exportAll && (
                <div>
                  <label className="block text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3] mb-2">
                    {t('settings.exportMonth')}
                  </label>
                  {isIOSNativePickerFallback ? (
                    <div className="grid max-w-xs grid-cols-2 gap-2">
                      <select
                        value={selectedExportYear}
                        onChange={(event) =>
                          setExportMonth(`${event.target.value}-${selectedExportMonth}`)
                        }
                        className="pf-select"
                        aria-label={t('monthSelector.year')}
                      >
                        {exportYearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedExportMonth}
                        onChange={(event) =>
                          setExportMonth(`${selectedExportYear}-${event.target.value}`)
                        }
                        className="pf-select"
                        aria-label={t('monthSelector.month')}
                      >
                        {exportMonthOptions.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <input
                      type="month"
                      value={exportMonth}
                      onChange={(event) => setExportMonth(event.target.value)}
                      className="pf-input w-full sm:w-auto max-w-xs"
                    />
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d27b30] text-white hover:bg-[#b56726] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MaterialIcon name="archive" className="h-4 w-4" />
                  {isExporting ? t('settings.exporting') : t('settings.exportJson')}
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d27b30] text-[#d27b30] hover:bg-[#d27b30]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MaterialIcon name="archive" className="h-4 w-4" />
                  {isExporting ? t('settings.exporting') : t('settings.exportCsv')}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className={cardIcon}>
                <MaterialIcon name="wallet" className="h-4 w-4" />
              </span>
              <h2 className={cardTitle}>{t('settings.currencyTitle')}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-[#a3a3a3]">
              {t('settings.currencyLabel')}{' '}
              <span className="font-medium">
                {t('settings.currencyName', { currency: '₼' })}
              </span>
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className={cardIcon}>
                <MaterialIcon name="grid" className="h-4 w-4" />
              </span>
              <h2 className={cardTitle}>{t('settings.languageTitle')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((option) => {
                const isActive = language === option.value;
                return (
                  <label
                    key={option.value}
                    className={`${themeButtonBase} ${
                      isActive ? themeButtonActive : themeButtonInactive
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={option.value}
                      checked={isActive}
                      onChange={() => setLanguage(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className={cardIcon}>
                <MaterialIcon name="menu" className="h-4 w-4" />
              </span>
              <h2 className={cardTitle}>{t('settings.themeTitle')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((option) => {
                const isActive = themePreference === option.value;
                return (
                  <label
                    key={option.value}
                    className={`${themeButtonBase} ${
                      isActive ? themeButtonActive : themeButtonInactive
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={isActive}
                      onChange={() => setThemePreference(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-[#a3a3a3]">
              {t('settings.themeHint')}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className={cardIcon}>
                <MaterialIcon name="logout" className="h-4 w-4" />
              </span>
              <h2 className={cardTitle}>{t('settings.sessionTitle')}</h2>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300"
            >
              <MaterialIcon name="logout" className="h-4 w-4" />
              {t('settings.logout')}
            </button>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <img src={logoUrl} alt={t('common.appName')} className="h-8 w-auto" />
              <h2 className={cardTitle}>{t('common.appName')}</h2>
            </div>
            <div className="space-y-3">
              <div className="text-xs text-gray-500 dark:text-[#a3a3a3]">
                {t('settings.appTagline')}
              </div>
              <div className="text-sm text-gray-600 dark:text-[#a3a3a3]">
                {t('settings.versionLabel')}{' '}
                <span className="font-medium">{appVersion}</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-[#a3a3a3]">
                {t('settings.updateDate')}: {appReleaseDate}
              </div>
              <div className="pt-2">
                <a
                  href="mailto:faik@nagiyev.com"
                  className="inline-flex items-center gap-2 text-sm text-[#d27b30] hover:text-[#b56726] dark:text-[#f0b27a] dark:hover:text-[#d27b30] transition-colors"
                >
                  <MaterialIcon name="email" className="h-4 w-4" />
                  <span>faik@nagiyev.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
