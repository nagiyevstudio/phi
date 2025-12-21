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
      <div className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
        Загружаем сводку...
      </div>
    );
  }

  const safeTotals = totals ?? { incomeMinor: 0, expenseMinor: 0, netMinor: 0 };
  const muted = totals ? '' : 'opacity-60';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${muted}`}>
      <div className="flex flex-nowrap items-center justify-between divide-x divide-gray-200 dark:divide-gray-700">
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4">
          <MaterialIcon name="income" className="h-4 w-4 text-emerald-500" />
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">
            Доходы:
          </span>
          <span className="text-sm sm:text-xl font-semibold text-emerald-600 whitespace-nowrap">
            {formatCurrency(safeTotals.incomeMinor)}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4">
          <MaterialIcon name="expense" className="h-4 w-4 text-red-500" />
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">
            Расходы:
          </span>
          <span className="text-sm sm:text-xl font-semibold text-red-600 whitespace-nowrap">
            {formatCurrency(safeTotals.expenseMinor)}
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1 sm:gap-2 px-3 py-3 sm:py-4">
          <MaterialIcon name="wallet" className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
          <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">
            Итого:
          </span>
          <span className="text-sm sm:text-xl font-semibold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
            {formatCurrency(safeTotals.netMinor)}
          </span>
        </div>
      </div>
    </div>
  );
}
