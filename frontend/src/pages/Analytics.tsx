import { useEffect, useState } from "react";
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
  Label,
} from "recharts";
import Layout from "../components/common/Layout";
import MaterialIcon from "../components/common/MaterialIcon";
import HelpModal from "../components/common/HelpModal";
import MonthSelector from "../components/Dashboard/MonthSelector";
import AnalyticsTotals from "../components/Analytics/AnalyticsTotals";
import { analyticsApi, budgetApi } from "../services/api";
import { formatCurrency, getCurrentMonth } from "../utils/format";
import { getLocale, useI18n } from "../i18n";

const FALLBACK_COLORS = [
  "#d27b30",
  "#e0944f",
  "#f0b272",
  "#c4601c",
  "#a35317",
  "#f4c89b",
  "#8b4715",
];

// Кастомный компонент Tooltip с поддержкой темной темы
const CustomTooltip = ({ active, payload, formatter }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const isDark = document.documentElement.classList.contains("dark");
  const data = payload[0];
  const value = data.value;
  const percentage = data.payload.percentage;

  return (
    <div
      className="rounded-lg border p-3 shadow-lg"
      style={{
        backgroundColor: isDark
          ? "rgba(26, 26, 26, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        borderColor: isDark ? "#2a2a2a" : "#e5e7eb",
        color: isDark ? "#e5e7eb" : "#111827",
      }}
    >
      <p
        className="mb-1 font-semibold"
        style={{
          color: isDark ? "#e5e7eb" : "#111827",
        }}
      >
        {data.name}
      </p>
      <p
        className="text-sm"
        style={{
          color: isDark ? "#a3a3a3" : "#6b7280",
        }}
      >
        {formatter ? formatter(value) : value}
      </p>
      <p
        className="text-xs mt-1"
        style={{
          color: isDark ? "#a3a3a3" : "#6b7280",
        }}
      >
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
};

export default function Analytics() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"month" | "year" | "overall">(
    "month",
  );
  const [showHelp, setShowHelp] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(
    () => selectedMonth.split("-")[0],
  );
  const [selectedMonthYear, selectedMonthPart] = selectedMonth.split("-");
  const selectedMonthIndex = Number(selectedMonthPart) - 1;
  const locale = getLocale();
  const formatDayLabel = (date: string) =>
    new Date(date).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    });
  const isMonthTab = activeTab === "month";
  const isYearTab = activeTab === "year";
  const isOverallTab = activeTab === "overall";
  const tabOptions = [
    { value: "month", label: t("analytics.tabMonth"), icon: "calendar" },
    { value: "year", label: t("analytics.tabYear"), icon: "chart" },
    { value: "overall", label: t("analytics.tabOverall"), icon: "wallet" },
  ] as const;
  const tabBase =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a]";
  const tabActive = "border-[#d27b30] bg-[#d27b30] text-white";
  const tabInactive =
    "border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/70 dark:hover:bg-[#212121]";

  const { data: analytics, isLoading: isMonthLoading } = useQuery({
    queryKey: ["analytics", selectedMonth],
    queryFn: () => analyticsApi.get(selectedMonth),
    enabled: isMonthTab,
  });

  const { data: incomeYearsData } = useQuery({
    queryKey: ["analytics-income-years"],
    queryFn: () => analyticsApi.getIncomeYears(),
    enabled: isYearTab,
  });

  const { data: yearlyIncome, isLoading: isYearlyIncomeLoading } = useQuery({
    queryKey: ["analytics-year-income", selectedYear],
    queryFn: () => analyticsApi.getYearIncome(selectedYear),
    enabled: isYearTab,
  });

  const { data: overallIncome, isLoading: isOverallIncomeLoading } = useQuery({
    queryKey: ["analytics-overall-income"],
    queryFn: () => analyticsApi.getOverallIncome(),
    enabled: isOverallTab,
  });

  const { data: budget } = useQuery({
    queryKey: ["budget", selectedMonth],
    queryFn: () => budgetApi.getBudget(selectedMonth),
    enabled: isMonthTab,
  });

  const incomeYears = incomeYearsData?.years ?? [];

  useEffect(() => {
    if (!isYearTab) {
      return;
    }
    if (incomeYears.length === 0) {
      return;
    }
    if (!incomeYears.includes(selectedYear)) {
      setSelectedYear(incomeYears[0]);
    }
  }, [incomeYears, selectedYear, isYearTab]);

  const categoryData = analytics
    ? analytics.expensesByCategory.map((item, index) => ({
        name: item.categoryName,
        value: item.totalMinor / 100,
        percentage: item.percentage,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
    : [];

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);

  const incomeCategoryData = analytics
    ? analytics.incomesByCategory.map((item, index) => ({
        name: item.categoryName,
        value: item.totalMinor / 100,
        percentage: item.percentage,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
    : [];

  const totalMonthlyIncome = incomeCategoryData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const dailyData = analytics
    ? analytics.expensesByDay.map((item) => ({
        date: formatDayLabel(item.date),
        amount: item.totalMinor / 100,
      }))
    : [];
  const dailyLimitMajor = (budget?.dailyLimit || 0) / 100;
  const dailyStats = analytics?.expensesByDay?.length
    ? (() => {
        const [first, ...rest] = analytics.expensesByDay;
        let min = first;
        let max = first;
        let sumMinor = first.totalMinor;

        for (const item of rest) {
          sumMinor += item.totalMinor;
          if (item.totalMinor < min.totalMinor) {
            min = item;
          }
          if (item.totalMinor > max.totalMinor) {
            max = item;
          }
        }

        return {
          min: {
            date: formatDayLabel(min.date),
            amountMinor: min.totalMinor,
          },
          max: {
            date: formatDayLabel(max.date),
            amountMinor: max.totalMinor,
          },
          averageMinor: Math.round(sumMinor / analytics.expensesByDay.length),
        };
      })()
    : null;
  const remainingDaysInMonth = (() => {
    const now = new Date();
    const daysInMonth = new Date(
      Number(selectedMonthYear),
      selectedMonthIndex + 1,
      0,
    ).getDate();
    if (
      now.getFullYear() === Number(selectedMonthYear) &&
      now.getMonth() === selectedMonthIndex
    ) {
      return Math.max(0, daysInMonth - now.getDate() + 1);
    }
    const selectedMonthStart = new Date(
      Number(selectedMonthYear),
      selectedMonthIndex,
      1,
    );
    if (now < selectedMonthStart) {
      return daysInMonth;
    }
    return 0;
  })();
  const expectedRemainingMinor = dailyStats
    ? dailyStats.averageMinor * remainingDaysInMonth
    : null;

  const yearlyIncomeCategoryData = yearlyIncome
    ? yearlyIncome.incomeByCategory.map((item, index) => ({
        name: item.categoryName,
        value: item.totalMinor / 100,
        percentage: item.percentage,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
    : [];

  const totalYearlyIncome = yearlyIncomeCategoryData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const monthlyIncomeMap = yearlyIncome
    ? new Map(
        yearlyIncome.incomeByMonth.map((item) => [item.month, item.totalMinor]),
      )
    : null;
  const monthlyIncomeData = yearlyIncome
    ? (() => {
        return Array.from({ length: 12 }, (_, index) => {
          const monthIndex = index + 1;
          const monthKey = `${selectedYear}-${String(monthIndex).padStart(
            2,
            "0",
          )}`;
          const amountMinor = monthlyIncomeMap?.get(monthKey) || 0;
          return {
            month: new Date(Number(selectedYear), index, 1).toLocaleDateString(
              locale,
              { month: "short" },
            ),
            amount: amountMinor / 100,
          };
        });
      })()
    : [];
  const hasMonthlyIncome = monthlyIncomeData.some((item) => item.amount > 0);
  const monthlyIncomeStats =
    yearlyIncome && monthlyIncomeMap
      ? (() => {
          const data = Array.from({ length: 12 }, (_, index) => {
            const monthIndex = index + 1;
            const monthKey = `${selectedYear}-${String(monthIndex).padStart(
              2,
              "0",
            )}`;
            return {
              month: new Date(
                Number(selectedYear),
                index,
                1,
              ).toLocaleDateString(locale, { month: "short" }),
              amountMinor: monthlyIncomeMap.get(monthKey) || 0,
            };
          });
          const [first, ...rest] = data;
          let min = first;
          let max = first;
          let sumMinor = first.amountMinor;

          for (const item of rest) {
            sumMinor += item.amountMinor;
            if (item.amountMinor < min.amountMinor) {
              min = item;
            }
            if (item.amountMinor > max.amountMinor) {
              max = item;
            }
          }

          return {
            min,
            max,
            averageMinor: Math.round(sumMinor / data.length),
          };
        })()
      : null;

  const overallCategoryMeta = overallIncome
    ? overallIncome.incomeByCategory.map((item, index) => ({
        ...item,
        color: item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      }))
    : [];

  const overallCategoryData = overallCategoryMeta.map((item) => ({
    name: item.categoryName,
    value: item.totalMinor / 100,
    percentage: item.percentage,
    color: item.color,
  }));

  const totalOverallIncome = overallCategoryData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  // Состояние для выбранных категорий в line chart
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    () => {
      return new Set(overallCategoryMeta.map((cat) => cat.categoryId));
    },
  );

  // Обновляем выбранные категории при изменении данных
  useEffect(() => {
    if (overallCategoryMeta.length > 0) {
      setSelectedCategories(
        new Set(overallCategoryMeta.map((cat) => cat.categoryId)),
      );
    }
  }, [overallCategoryMeta.length]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const visibleCategories = overallCategoryMeta.filter((cat) =>
    selectedCategories.has(cat.categoryId),
  );

  const overallLineData = overallIncome
    ? (() => {
        const yearMap = new Map<string, Map<string, number>>();
        overallIncome.incomeByCategoryYear.forEach((item) => {
          if (!yearMap.has(item.year)) {
            yearMap.set(item.year, new Map());
          }
          yearMap.get(item.year)!.set(item.categoryId, item.totalMinor);
        });

        return overallIncome.incomeByYear.map((item) => {
          const row: Record<string, number | string> = { year: item.year };
          const categoryMap = yearMap.get(item.year);
          overallCategoryMeta.forEach((category) => {
            row[category.categoryId] =
              (categoryMap?.get(category.categoryId) || 0) / 100;
          });
          return row;
        });
      })()
    : [];
  const overallYearTotalsData = overallIncome
    ? overallIncome.incomeByYear.map((item) => ({
        year: item.year,
        amount: item.totalMinor / 100,
      }))
    : [];
  const hasOverallTotals = overallYearTotalsData.some(
    (item) => item.amount > 0,
  );

  const hasOverallLine =
    overallLineData.length > 0 && overallCategoryMeta.length > 0;
  const overallYearStats = overallIncome?.yearStats ?? null;

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {tabOptions.map((tab) => {
            const isActive = tab.value === activeTab;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`${tabBase} ${isActive ? tabActive : tabInactive}`}
                aria-pressed={isActive}
                type="button"
              >
                <MaterialIcon
                  name={tab.icon}
                  className="h-4 w-4"
                  variant={isActive ? "filled" : "outlined"}
                />
                {tab.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-[#d27b30] hover:bg-[#d27b30]/10 dark:border-[#2a2a2a] dark:text-[#a3a3a3] dark:hover:text-[#f0b27a] dark:hover:bg-[#d27b30]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
            aria-label="Помощь"
            title="Помощь"
          >
            <MaterialIcon name="help" className="h-5 w-5" variant="outlined" />
          </button>
        </div>
        <HelpModal
          helpType="analytics"
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />

        {isMonthTab && (
          <>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />

            {isMonthLoading ? (
              <>
                <div className="mb-6">
                  <AnalyticsTotals isLoading />
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-40 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-44 rounded-full mb-3" />
                    <div className="pf-skeleton h-6 w-32 rounded-full" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-44 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
              </>
            ) : !analytics ? (
              <div className="text-center py-8">{t("analytics.empty")}</div>
            ) : (
              <>
                <div className="mb-6">
                  <AnalyticsTotals totals={analytics.totals} />
                </div>

                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.expensesByCategory")}
                    </h2>
                    {categoryData.length > 0 ? (
                      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                        <div className="flex-shrink-0 lg:w-1/2">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percentage }) =>
                                  percentage > 5
                                    ? `${percentage.toFixed(1)}%`
                                    : ""
                                }
                                outerRadius={80}
                                innerRadius={60}
                                fill="#d27b30"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                activeShape={
                                  { outerRadius: 88, innerRadius: 60 } as any
                                }
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                                <Label
                                  value={formatCurrency(totalExpenses * 100)}
                                  position="center"
                                  className="fill-gray-900 dark:fill-[#e5e7eb] text-sm font-semibold"
                                />
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => (
                                  <CustomTooltip
                                    active={active}
                                    payload={payload}
                                    formatter={(value: number) =>
                                      formatCurrency(value * 100)
                                    }
                                  />
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:flex-1 space-y-2">
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
                                <span className="text-gray-900 dark:text-[#e5e7eb]">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                  {formatCurrency(item.totalMinor)}
                                </span>
                                <span className="text-gray-500 dark:text-[#a3a3a3] ml-2">
                                  ({item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noExpenseData")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.expensesByDay")}
                    </h2>
                    {dailyData.length > 0 ? (
                      <>
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
                                  value: t("analytics.dailyLimit"),
                                  position: "insideTopRight",
                                  fill: "#b45309",
                                }}
                              />
                            )}
                            <Bar
                              dataKey="amount"
                              fill="#d27b30"
                              name={t("analytics.amountWithCurrency")}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                        {dailyStats && (
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.maxDay")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {dailyStats.max.date} -{" "}
                                {formatCurrency(dailyStats.max.amountMinor)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.minDay")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {dailyStats.min.date} -{" "}
                                {formatCurrency(dailyStats.min.amountMinor)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.averageDay")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {formatCurrency(dailyStats.averageMinor)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.expectedRemaining")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {formatCurrency(expectedRemainingMinor || 0)}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noExpenseData")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.incomeByCategory")}
                    </h2>
                    {incomeCategoryData.length > 0 ? (
                      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                        <div className="flex-shrink-0 lg:w-1/2">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={incomeCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percentage }) =>
                                  percentage > 5
                                    ? `${percentage.toFixed(1)}%`
                                    : ""
                                }
                                outerRadius={80}
                                innerRadius={60}
                                fill="#10b981"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                activeShape={
                                  { outerRadius: 88, innerRadius: 60 } as any
                                }
                              >
                                {incomeCategoryData.map((entry, index) => (
                                  <Cell
                                    key={`income-cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                                <Label
                                  value={formatCurrency(
                                    totalMonthlyIncome * 100,
                                  )}
                                  position="center"
                                  className="fill-gray-900 dark:fill-[#e5e7eb] text-sm font-semibold"
                                />
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => (
                                  <CustomTooltip
                                    active={active}
                                    payload={payload}
                                    formatter={(value: number) =>
                                      formatCurrency(value * 100)
                                    }
                                  />
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:flex-1 space-y-2">
                          {analytics.incomesByCategory.map((item, index) => (
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
                                <span className="text-gray-900 dark:text-[#e5e7eb]">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                  {formatCurrency(item.totalMinor)}
                                </span>
                                <span className="text-gray-500 dark:text-[#a3a3a3] ml-2">
                                  ({item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noIncomeData")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {isYearTab && (
          <>
            {isYearlyIncomeLoading ? (
              <>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-44 rounded-full mb-3" />
                    <div className="pf-skeleton h-6 w-32 rounded-full" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-48 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-44 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
              </>
            ) : yearlyIncome ? (
              <>
                {incomeYears.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {incomeYears.map((year) => {
                      const isActive = year === selectedYear;
                      return (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] ${
                            isActive
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-emerald-200 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 dark:border-emerald-500/40 dark:text-emerald-200 dark:bg-emerald-500/10"
                          }`}
                          aria-pressed={isActive}
                          type="button"
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb]">
                        {t("analytics.incomeForYear", { year: selectedYear })}
                      </h2>
                      <span className="text-sm font-medium text-emerald-600">
                        {t("analytics.total", {
                          value: formatCurrency(yearlyIncome.totalMinor),
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.incomeByCategory")}
                    </h2>
                    {yearlyIncomeCategoryData.length > 0 ? (
                      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                        <div className="flex-shrink-0 lg:w-1/2">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={yearlyIncomeCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percentage }) =>
                                  percentage > 5
                                    ? `${percentage.toFixed(1)}%`
                                    : ""
                                }
                                outerRadius={80}
                                innerRadius={60}
                                fill="#10b981"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                activeShape={
                                  { outerRadius: 88, innerRadius: 60 } as any
                                }
                              >
                                {yearlyIncomeCategoryData.map(
                                  (entry, index) => (
                                    <Cell
                                      key={`income-cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ),
                                )}
                                <Label
                                  value={formatCurrency(
                                    totalYearlyIncome * 100,
                                  )}
                                  position="center"
                                  className="fill-gray-900 dark:fill-[#e5e7eb] text-sm font-semibold"
                                />
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => (
                                  <CustomTooltip
                                    active={active}
                                    payload={payload}
                                    formatter={(value: number) =>
                                      formatCurrency(value * 100)
                                    }
                                  />
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:flex-1 space-y-2">
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
                                <span className="text-gray-900 dark:text-[#e5e7eb]">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                  {formatCurrency(item.totalMinor)}
                                </span>
                                <span className="text-gray-500 dark:text-[#a3a3a3] ml-2">
                                  ({item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noIncomeData")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.incomeByMonth")}
                    </h2>
                    {hasMonthlyIncome ? (
                      <>
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
                              name={t("analytics.amount")}
                              dot={{ r: 3 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        {monthlyIncomeStats && (
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.maxMonth")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {monthlyIncomeStats.max.month} -{" "}
                                {formatCurrency(
                                  monthlyIncomeStats.max.amountMinor,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.minMonth")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {monthlyIncomeStats.min.month} -{" "}
                                {formatCurrency(
                                  monthlyIncomeStats.min.amountMinor,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.averageMonth")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {formatCurrency(
                                  monthlyIncomeStats.averageMinor,
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noIncomeData")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                {t("analytics.noIncomeYear")}
              </div>
            )}
          </>
        )}

        {isOverallTab && (
          <>
            {isOverallIncomeLoading ? (
              <>
                <div className="mb-4">
                  <div className="pf-skeleton h-5 w-56 rounded-full" />
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-56 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="pf-skeleton h-5 w-60 rounded-full mb-4" />
                    <div className="pf-skeleton h-72 w-full rounded-2xl" />
                  </div>
                </div>
              </>
            ) : overallIncome ? (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {t("analytics.overallTitle")}
                  </h2>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.totalIncomeByYear")}
                    </h3>
                    {hasOverallTotals ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={overallYearTotalsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip
                            formatter={(value: number) =>
                              formatCurrency(value * 100)
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            strokeWidth={2}
                            name={t("analytics.amount")}
                            dot={{ r: 3 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noIncomeData")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-4">
                      {t("analytics.incomeByCategoryAll")}
                    </h3>
                    {overallCategoryData.length > 0 ? (
                      <div className="flex flex-col lg:flex-row lg:items-center lg:gap-6">
                        <div className="flex-shrink-0 lg:w-1/2">
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={overallCategoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ percentage }) =>
                                  percentage > 5
                                    ? `${percentage.toFixed(1)}%`
                                    : ""
                                }
                                outerRadius={80}
                                innerRadius={60}
                                fill="#10b981"
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                                activeShape={
                                  { outerRadius: 88, innerRadius: 60 } as any
                                }
                              >
                                {overallCategoryData.map((entry, index) => (
                                  <Cell
                                    key={`overall-cell-${index}`}
                                    fill={entry.color}
                                  />
                                ))}
                                <Label
                                  value={formatCurrency(
                                    totalOverallIncome * 100,
                                  )}
                                  position="center"
                                  className="fill-gray-900 dark:fill-[#e5e7eb] text-sm font-semibold"
                                />
                              </Pie>
                              <Tooltip
                                content={({ active, payload }) => (
                                  <CustomTooltip
                                    active={active}
                                    payload={payload}
                                    formatter={(value: number) =>
                                      formatCurrency(value * 100)
                                    }
                                  />
                                )}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 lg:mt-0 lg:flex-1 space-y-2">
                          {overallCategoryMeta.map((item) => (
                            <div
                              key={item.categoryId}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor: item.color || "#10b981",
                                  }}
                                />
                                <span className="text-gray-900 dark:text-[#e5e7eb]">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                  {formatCurrency(item.totalMinor)}
                                </span>
                                <span className="text-gray-500 dark:text-[#a3a3a3] ml-2">
                                  ({item.percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noIncomeData")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb]">
                        {t("analytics.incomeByCategoryYear")}
                      </h3>
                      {overallCategoryMeta.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3">
                          {overallCategoryMeta.map((category) => (
                            <label
                              key={category.categoryId}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCategories.has(
                                  category.categoryId,
                                )}
                                onChange={() =>
                                  toggleCategory(category.categoryId)
                                }
                                className="pf-checkbox"
                              />
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      category.color || "#10b981",
                                  }}
                                />
                                <span className="text-sm text-gray-700 dark:text-[#d4d4d8]">
                                  {category.categoryName}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {hasOverallLine ? (
                      <>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={overallLineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip
                              formatter={(value: number) =>
                                formatCurrency(value * 100)
                              }
                            />
                            <Legend />
                            {visibleCategories.map((category) => (
                              <Line
                                key={category.categoryId}
                                type="monotone"
                                dataKey={category.categoryId}
                                name={category.categoryName}
                                stroke={category.color || "#10b981"}
                                strokeWidth={2}
                                dot={{ r: 2 }}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                        {overallYearStats && (
                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.maxYear")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {overallYearStats.max.year} -{" "}
                                {formatCurrency(
                                  overallYearStats.max.totalMinor,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.minYear")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {overallYearStats.min.year} -{" "}
                                {formatCurrency(
                                  overallYearStats.min.totalMinor,
                                )}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-[#a3a3a3]">
                                {t("analytics.averageYear")}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                                {formatCurrency(overallYearStats.averageMinor)}
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                        {t("analytics.noIncomeData")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
                {t("analytics.noIncomeData")}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
