import MaterialIcon from '../common/MaterialIcon';
import { getCurrentMonth, getPreviousMonth, getNextMonth, formatMonth } from '../../utils/format';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const currentMonth = getCurrentMonth();

  const handlePrevious = () => {
    onMonthChange(getPreviousMonth(selectedMonth));
  };

  const handleNext = () => {
    onMonthChange(getNextMonth(selectedMonth));
  };

  const handleCurrent = () => {
    onMonthChange(currentMonth);
  };

  return (
    <div className="flex items-center justify-between mb-6 bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow">
      <button
        onClick={handlePrevious}
        className="inline-flex h-10 w-10 items-center justify-center text-gray-700 dark:text-[#d4d4d8] bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#3a3a3a] rounded-md hover:bg-gray-50 dark:hover:bg-[#252525]"
        aria-label="Предыдущий месяц"
      >
        <MaterialIcon name="chevron-left" className="h-5 w-5" />
      </button>

      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-[#e5e7eb]">
          {formatMonth(selectedMonth)}
        </h2>
        {selectedMonth !== currentMonth && (
          <button
            onClick={handleCurrent}
            className="px-3 py-1 text-xs font-medium text-[#d27b30] dark:text-[#f0b27a] hover:text-[#b56726]"
          >
            Текущий месяц
          </button>
        )}
      </div>

      <button
        onClick={handleNext}
        className="inline-flex h-10 w-10 items-center justify-center text-gray-700 dark:text-[#d4d4d8] bg-white dark:bg-[#1f1f1f] border border-gray-300 dark:border-[#3a3a3a] rounded-md hover:bg-gray-50 dark:hover:bg-[#252525]"
        aria-label="Следующий месяц"
      >
        <MaterialIcon name="chevron-right" className="h-5 w-5" />
      </button>
    </div>
  );
}


