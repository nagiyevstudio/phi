import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Layout from "../components/common/Layout";
import MonthSelector from "../components/Dashboard/MonthSelector";
import AnalyticsTotals from "../components/Analytics/AnalyticsTotals";
import { analyticsApi, budgetApi } from "../services/api";
import { formatCurrency, getCurrentMonth } from "../utils/format";

const FALLBACK_COLORS = [
  "#d27b30",
  "#e0944f",
  "#f0b272",
  "#c4601c",
  "#a35317",
  "#f4c89b",
  "#8b4715",
];

export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const selectedYear = selectedMonth.split("-")[0];

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", selectedMonth],
    queryFn: () => analyticsApi.get(selectedMonth),
  });

  const { data: yearlyIncome, isLoading: isYearlyIncomeLoading } = useQuery({
    queryKey: ["analytics-year-income", selectedYear],
    queryFn: () => analyticsApi.getYearIncome(selectedYear),
  });

  const { data: budget } = useQuery({
    queryKey: ["budget", selectedMonth],
    queryFn: () => budgetApi.getBudget(selectedMonth),
  });

  const categoryData = analytics
    ? analytics.expensesByCategory.map((item, index) => ({
        name: item.categoryName,
        value: item.totalMinor / 100,
        percentage: item.percentage,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
    : [];

  const dailyData = analytics
    ? analytics.expensesByDay.map((item) => ({
        date: new Date(item.date).toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "short",
        }),
        amount: item.totalMinor / 100,
      }))
    : [];
  const dailyLimitMajor = (budget?.dailyLimit || 0) / 100;

  const yearlyIncomeCategoryData = yearlyIncome
    ? yearlyIncome.incomeByCategory.map((item, index) => ({
        name: item.categoryName,
        value: item.totalMinor / 100,
        percentage: item.percentage,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
    : [];

  const monthlyIncomeData = yearlyIncome
    ? (() => {
        const monthMap = new Map(
          yearlyIncome.incomeByMonth.map((item) => [item.month, item.totalMinor])
        );
        return Array.from({ length: 12 }, (_, index) => {
          const monthIndex = index + 1;
          const monthKey = `${selectedYear}-${String(monthIndex).padStart(
            2,
            "0"
          )}`;
          const amountMinor = monthMap.get(monthKey) || 0;
          return {
            month: new Date(
              Number(selectedYear),
              index,
              1
            ).toLocaleDateString("ru-RU", { month: "short" }),
            amount: amountMinor / 100,
          };
        });
      })()
    : [];
  const hasMonthlyIncome = monthlyIncomeData.some((item) => item.amount > 0);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        {isLoading ? (
          <>
            <div className="mb-6">
              <AnalyticsTotals isLoading />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                <div className="pf-skeleton h-72 w-full rounded-2xl" />
              </div>
              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <div className="pf-skeleton h-5 w-40 rounded-full mb-4" />
                <div className="pf-skeleton h-72 w-full rounded-2xl" />
              </div>
            </div>
            <div className="mb-6">
              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <div className="pf-skeleton h-5 w-44 rounded-full mb-3" />
                <div className="pf-skeleton h-6 w-32 rounded-full" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                <div className="pf-skeleton h-72 w-full rounded-2xl" />
              </div>
              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <div className="pf-skeleton h-5 w-44 rounded-full mb-4" />
                <div className="pf-skeleton h-72 w-full rounded-2xl" />
              </div>
            </div>
          </>
        ) : !analytics ? (
          <div className="text-center py-8">Нет данных для отображения</div>
        ) : (
          <>
            <div className="mb-6">
              <AnalyticsTotals totals={analytics.totals} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">
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
                          label={({ name, percentage }) =>
                            `${name}: ${percentage.toFixed(1)}%`
                          }
                          outerRadius={80}
                          fill="#d27b30"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) =>
                            formatCurrency(value * 100)
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {analytics.expensesByCategory.map((item, index) => (
                        <div
                          key={item.categoryId}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor:
                                  item.color ||
                                  FALLBACK_COLORS[
                                    index % FALLBACK_COLORS.length
                                  ],
                              }}
                            />
                            <span className="text-gray-900 dark:text-[#f8eee5]">
                              {item.categoryName}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-medium text-gray-900 dark:text-[#f8eee5]">
                              {formatCurrency(item.totalMinor)}
                            </span>
                            <span className="text-gray-500 dark:text-[#c7b0a0] ml-2">
                              ({item.percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-[#c7b0a0]">
                    Нет данных о расходах
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">
                  Расходы по дням
                </h2>
                {dailyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) =>
                          formatCurrency(value * 100)
                        }
                      />
                      <Legend />
                      {dailyLimitMajor > 0 && (
                        <ReferenceLine
                          y={dailyLimitMajor}
                          stroke="#b45309"
                          strokeDasharray="4 4"
                          label={{
                            value: "Дневной лимит",
                            position: "insideTopRight",
                            fill: "#b45309",
                          }}
                        />
                      )}
                      <Bar dataKey="amount" fill="#d27b30" name="Сумма (₼)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-[#c7b0a0]">
                    Нет данных о расходах
                  </div>
                )}
              </div>
            </div>

            {isYearlyIncomeLoading ? (
              <>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-44 rounded-full mb-3" />
                    <div className="pf-skeleton h-6 w-32 rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                  <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-44 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
              </>
            ) : yearlyIncome ? (
              <>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5]">
                        Доходы за {selectedYear}
                      </h2>
                      <span className="text-sm font-medium text-emerald-600">
                        Итого: {formatCurrency(yearlyIncome.totalMinor)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">
                      Доходы по категориям
                    </h2>
                    {yearlyIncomeCategoryData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={yearlyIncomeCategoryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) =>
                                `${name}: ${percentage.toFixed(1)}%`
                              }
                              outerRadius={80}
                              fill="#10b981"
                              dataKey="value"
                            >
                              {yearlyIncomeCategoryData.map((entry, index) => (
                                <Cell key={`income-cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) =>
                                formatCurrency(value * 100)
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                          {yearlyIncome.incomeByCategory.map((item, index) => (
                            <div
                              key={item.categoryId}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      item.color ||
                                      FALLBACK_COLORS[
                                        index % FALLBACK_COLORS.length
                                      ],
                                  }}
                                />
                                <span className="text-gray-900 dark:text-[#f8eee5]">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 dark:text-[#f8eee5]">
                                  {formatCurrency(item.totalMinor)}
                                </span>
                                <span className="text-gray-500 dark:text-[#c7b0a0] ml-2">
                                  ({item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#c7b0a0]">
                        Нет данных о доходах
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-[#1c140f] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5] mb-4">
                      Доходы по месяцам
                    </h2>
                    {hasMonthlyIncome ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyIncomeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: number) =>
                              formatCurrency(value * 100)
                            }
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            strokeWidth={2}
                            name="Сумма"
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#c7b0a0]">
                        Нет данных о доходах
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-[#c7b0a0]">
                Нет данных о доходах за год
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
