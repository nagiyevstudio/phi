import { useEffect, useState } from 'react';
import Layout from '../components/common/Layout';
import MaterialIcon from '../components/common/MaterialIcon';
import { useAuth } from '../store/auth';
import { authApi, exportApi } from '../services/api';
import { getCurrentMonth } from '../utils/format';
import { applyTheme, getStoredTheme, setStoredTheme, type ThemePreference } from '../utils/theme';

export default function Settings() {
  const { user, logout } = useAuth();
  const [exportMonth, setExportMonth] = useState(getCurrentMonth());
  const [isExporting, setIsExporting] = useState(false);
  const [exportAll, setExportAll] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredTheme());

  useEffect(() => {
    setStoredTheme(themePreference);
    applyTheme(themePreference);
  }, [themePreference]);

  const themeButtonBase =
    'inline-flex items-center justify-center h-10 px-4 rounded-full border text-sm font-medium shadow-sm transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-[#d27b30] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-[#1c140f]';
  const themeButtonInactive =
    'border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#3a2a20] dark:text-[#f3e7dd] dark:bg-[#1c140f]/70 dark:hover:bg-[#251a14]';
  const themeButtonActive =
    'bg-[#d27b30] text-white border-[#d27b30] shadow-sm';
  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: 'Светлая' },
    { value: 'dark', label: 'Темная' },
    { value: 'auto', label: 'Авто' },
  ];

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    window.location.href = '/login';
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      await exportApi.json(exportAll ? undefined : exportMonth);
    } catch (error) {
      console.error('Export error:', error);
      alert('Ошибка при экспорте данных');
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
      alert('Ошибка при экспорте данных');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="bg-white dark:bg-[#1c140f] shadow rounded-lg p-6 text-left">
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">Профиль</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#d27b30]/10 text-[#d27b30] flex items-center justify-center">
                  <MaterialIcon name="settings" className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#c7b0a0]">
                    Имя
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-[#f8eee5]">
                    {user?.name?.trim() || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#c7b0a0]">
                    Email
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-[#f8eee5]">
                    {user?.email}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#c7b0a0]">
                    Роль
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-[#f8eee5]">
                    {user?.role || '—'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1c140f] shadow rounded-lg p-6 text-left">
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">
                Экспорт данных
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-[#e4d1c1]">
                  <input
                    type="checkbox"
                    checked={exportAll}
                    onChange={(e) => setExportAll(e.target.checked)}
                    className="pf-checkbox"
                  />
                  Экспортировать все данные
                </label>

                {!exportAll && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 dark:text-[#c7b0a0] mb-2">
                      Месяц для экспорта
                    </label>
                    <input
                      type="month"
                      value={exportMonth}
                      onChange={(e) => setExportMonth(e.target.value)}
                      className="pf-input w-full sm:w-auto max-w-xs"
                    />
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleExportJSON}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d27b30] text-white hover:bg-[#b56726] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MaterialIcon name="archive" className="h-4 w-4" />
                    {isExporting ? 'Экспорт...' : 'Экспорт JSON'}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d27b30] text-[#d27b30] hover:bg-[#d27b30]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MaterialIcon name="archive" className="h-4 w-4" />
                    {isExporting ? 'Экспорт...' : 'Экспорт CSV'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1c140f] shadow rounded-lg p-6 text-left">
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">Тема</h2>
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
              <p className="mt-3 text-xs text-gray-500 dark:text-[#c7b0a0]">
                Авто — как в системе.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1c140f] shadow rounded-lg p-6 text-left">
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">Валюта</h2>
              <p className="text-sm text-gray-600 dark:text-[#c7b0a0]">
                Текущая валюта: <span className="font-medium">₼ (Азербайджанский манат)</span>
              </p>
            </div>

            <div className="bg-white dark:bg-[#1c140f] shadow rounded-lg p-6 text-left">
              <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">Сессия</h2>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300"
              >
                <MaterialIcon name="logout" className="h-4 w-4" />
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}



