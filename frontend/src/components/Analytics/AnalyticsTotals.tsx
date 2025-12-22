import MaterialIcon from '../common/MaterialIcon';
import { formatCurrency } from '../../utils/format';

interface AnalyticsTotalsProps {
  totals?: {
    incomeMinor: number;
    expenseMinor: number;
    netMinor: number;
  };
  isLoading?: boolean;
}

export default function AnalyticsTotals({ totals, isLoading }: AnalyticsTotalsProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1c140f] rounded-lg shadow">
        <div className="flex flex-nowrap items-center justify-between divide-x divide-gray-200 dark:divide-[#3a2a20]">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`totals-skeleton-${index}`}
              className="flex flex-1 items-center justify-center gap-2 px-3 py-3 sm:py-4"
            >
              <div className="pf-skeleton h-4 w-4 rounded-full" />
              <div className="space-y-2">
                <div className="pf-skeleton h-3 w-16 sm:w-24 rounded-full" />
                <div className="pf-skeleton h-4 w-20 sm:w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const safeTotals = totals ?? { incomeMinor: 0, expenseMinor: 0, netMinor: 0 };
  const muted = totals ? '' : 'opacity-60';

  return (
    <div className={`bg-white dark:bg-[#1c140f] rounded-lg shadow ${muted}`}>
      <div className="flex flex-nowrap items-center justify-between divide-x divide-gray-200 dark:divide-[#3a2a20]">
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4">
          <MaterialIcon name="income" className="h-4 w-4 text-emerald-500" />
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-[#c7b0a0]">
            Доходы:
          </span>
          <span className="text-sm sm:text-xl font-semibold text-emerald-600 whitespace-nowrap">
            {formatCurrency(safeTotals.incomeMinor)}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4">
          <MaterialIcon name="expense" className="h-4 w-4 text-red-500" />
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-[#c7b0a0]">
            Расходы:
          </span>
          <span className="text-sm sm:text-xl font-semibold text-red-600 whitespace-nowrap">
            {formatCurrency(safeTotals.expenseMinor)}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4">
          <MaterialIcon name="wallet" className="h-4 w-4 text-[#d27b30] dark:text-[#f0b27a]" />
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-[#c7b0a0]">
            Итого:
          </span>
          <span className="text-sm sm:text-xl font-semibold text-[#d27b30] dark:text-[#f0b27a] whitespace-nowrap">
            {formatCurrency(safeTotals.netMinor)}
          </span>
        </div>
      </div>
    </div>
  );
}

