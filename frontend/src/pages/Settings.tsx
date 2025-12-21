import { useState } from 'react';
import Layout from '../components/common/Layout';
import { useAuth } from '../store/auth';
import { exportApi } from '../services/api';
import { getCurrentMonth } from '../utils/format';

export default function Settings() {
  const { user } = useAuth();
  const [exportMonth, setExportMonth] = useState(getCurrentMonth());
  const [isExporting, setIsExporting] = useState(false);
  const [exportAll, setExportAll] = useState(false);

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Настройки</h1>

        <div className="space-y-6">
          {/* Profile */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Профиль</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Export */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Экспорт данных
            </h2>
            <div className="space-y-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exportAll}
                    onChange={(e) => setExportAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Экспортировать все данные
                  </span>
                </label>
              </div>

              {!exportAll && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Месяц для экспорта
                  </label>
                  <input
                    type="month"
                    value={exportMonth}
                    onChange={(e) => setExportMonth(e.target.value)}
                    className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleExportJSON}
                  disabled={isExporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Экспорт...' : 'Экспорт JSON'}
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Экспорт...' : 'Экспорт CSV'}
                </button>
              </div>
            </div>
          </div>

          {/* Currency Info */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Валюта</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Текущая валюта: <span className="font-medium">AZN (Азербайджанский манат)</span>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

