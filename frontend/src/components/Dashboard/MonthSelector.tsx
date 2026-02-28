import type { ChangeEvent } from "react";
import MaterialIcon from "../common/MaterialIcon";
import {
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
} from "../../utils/format";
import { useI18n } from "../../i18n";

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  showNavigation?: boolean;
}

export default function MonthSelector({
  selectedMonth,
  onMonthChange,
  showNavigation = true,
}: MonthSelectorProps) {
  const { t } = useI18n();
  const currentMonth = getCurrentMonth();
  const [selectedYear, selectedMonthPart] = selectedMonth.split("-");
  const currentYear = new Date().getFullYear();
  const selectedYearNumber = Number(selectedYear);
  const rangeStart = Math.min(currentYear - 5, selectedYearNumber);
  const rangeEnd = Math.max(currentYear + 1, selectedYearNumber);
  const years = Array.from({ length: rangeEnd - rangeStart + 1 }, (_, index) =>
    String(rangeStart + index),
  ).reverse();
  const months = Array.from({ length: 12 }, (_, index) => {
    const value = String(index + 1).padStart(2, "0");
    return { value, label: t(`months.${value}`) };
  });

  const handlePrevious = () => {
    onMonthChange(getPreviousMonth(selectedMonth));
  };

  const handleNext = () => {
    onMonthChange(getNextMonth(selectedMonth));
  };

  const handleCurrent = () => {
    onMonthChange(currentMonth);
  };

  const handleMonthChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(`${selectedYear}-${event.target.value}`);
  };

  const handleYearChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onMonthChange(`${event.target.value}-${selectedMonthPart}`);
  };

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-[#1a1a1a]">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showNavigation && (
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <button
              onClick={handlePrevious}
              className="inline-flex h-10 w-10 items-center justify-center text-gray-700 dark:text-[#d4d4d8] bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#3a3a3a] rounded-md hover:bg-gray-50 dark:hover:bg-[#252525]"
              aria-label={t("monthSelector.prev")}
            >
              <MaterialIcon name="chevron-left" className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="inline-flex h-10 w-10 items-center justify-center text-gray-700 dark:text-[#d4d4d8] bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#3a3a3a] rounded-md hover:bg-gray-50 dark:hover:bg-[#252525]"
              aria-label={t("monthSelector.next")}
            >
              <MaterialIcon name="chevron-right" className="h-5 w-5" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <select
            className="pf-select w-40 max-w-full"
            value={selectedMonthPart}
            onChange={handleMonthChange}
            aria-label={t("monthSelector.month")}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            className="pf-select w-28 max-w-full"
            value={selectedYear}
            onChange={handleYearChange}
            aria-label={t("monthSelector.year")}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {selectedMonth !== currentMonth && (
            <button
              onClick={handleCurrent}
              className="px-3 py-1 text-xs font-medium text-[#d27b30] dark:text-[#f0b27a] hover:text-[#b56726]"
            >
              {t("monthSelector.current")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
