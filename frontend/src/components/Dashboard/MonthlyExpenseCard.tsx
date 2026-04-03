import { formatCurrency } from '../../utils/format';
import MaterialIcon from '../common/MaterialIcon';
import { useI18n } from '../../i18n';

interface MonthlyExpenseCardProps {
  expenseMinor: number;
  incomeMinor: number;
  averageDailyMinor: number;
  expectedRemainingMinor: number;
  isLoading?: boolean;
}

export default function MonthlyExpenseCard({
  expenseMinor,
  incomeMinor,
  averageDailyMinor,
  expectedRemainingMinor,
  isLoading,
}: MonthlyExpenseCardProps) {
  const { t } = useI18n();
  if (isLoading) {
    return (
      <div className="pf-glass overflow-hidden !rounded-lg">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="pf-skeleton h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="pf-skeleton h-3 w-36 rounded-full" />
              <div className="pf-skeleton h-5 w-24 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="pf-skeleton h-3 w-48 rounded-full" />
            <div className="pf-skeleton h-3 w-56 rounded-full" />
            <div className="pf-skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  let percentage = 0;
  if (incomeMinor > 0) {
    percentage = (expenseMinor / incomeMinor) * 100;
  } else if (expenseMinor > 0) {
    percentage = 100;
  }
  if (!isFinite(percentage) || isNaN(percentage)) {
    percentage = 0;
  }

  const isOverIncome = incomeMinor > 0 && expenseMinor > incomeMinor;
  const displayPercentage = isOverIncome ? 100 : Math.min(Math.max(percentage, 0), 100);
  const barClass = isOverIncome
    ? 'bg-red-600'
    : percentage > 80
    ? 'bg-yellow-500'
    : 'bg-[#d27b30]';

  return (
    <div className="pf-glass overflow-hidden !rounded-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#d27b30]/10 text-[#d27b30]">
              <MaterialIcon name="expense" className="h-5 w-5" />
            </div>
            <div className="ml-5 min-w-0">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] truncate">
                  {t('monthlyExpense.title')}
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb]">
                  {formatCurrency(expenseMinor)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-[#a3a3a3]">
              {t('monthlyExpense.averageDaily')}
            </span>
            <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
              {formatCurrency(averageDailyMinor)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-[#a3a3a3]">
              {t('monthlyExpense.expectedRemaining')}
            </span>
            <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">
              {formatCurrency(expectedRemainingMinor)}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-[#d4d4d8]">
                {t('monthlyExpense.shareOfIncome', { value: percentage.toFixed(1) })}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-[#1f1f1f] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${barClass}`}
                style={{ width: `${displayPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
