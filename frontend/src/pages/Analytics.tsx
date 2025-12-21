import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/common/Layout';
import { analyticsApi } from '../services/api';
import { formatCurrency, getCurrentMonth, formatMonth, getPreviousMonth, getNextMonth } from '../utils/format';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedMonth],
    queryFn: () => analyticsApi.get(selectedMonth),
  });

  const handlePreviousMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonth(selectedMonth));
  };

  const handleCurrentMonth = () => {
    setSelectedMonth(getCurrentMonth());
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">Загрузка аналитики...</div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">Нет данных для отображения</div>
        </div>
      </Layout>
    );
  }

  const categoryData = analytics.expensesByCategory.map((item) => ({
    name: item.categoryName,
    value: item.totalMinor / 100,
    percentage: item.percentage,
  }));

  const dailyData = analytics.expensesByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    amount: item.totalMinor / 100,
  }));

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Аналитика</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousMonth}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              ←
            </button>
            <span className="px-4 py-1 text-sm font-medium text-gray-900 dark:text-white">
              {formatMonth(selectedMonth)}
            </span>
            {selectedMonth !== getCurrentMonth() && (
              <button
                onClick={handleCurrentMonth}
                className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
              >
                Текущий
              </button>
            )}
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              →
            </button>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Доходы</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totals.incomeMinor)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Расходы</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totals.expenseMinor)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Итого</p>
            <p
              className={`text-2xl font-bold ${
                analytics.totals.netMinor >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(analytics.totals.netMinor)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Expenses by Category */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Расходы по категориям
            </h2>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {analytics.expensesByCategory.map((item, index) => (
                    <div key={item.categoryId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-900 dark:text-white">{item.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.totalMinor)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Нет данных о расходах
              </div>
            )}
          </div>

          {/* Expenses by Day */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Расходы по дням
            </h2>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value * 100)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#3B82F6" name="Сумма (AZN)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Нет данных о расходах
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

