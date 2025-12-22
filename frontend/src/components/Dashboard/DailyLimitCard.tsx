import { formatCurrency } from '../../utils/format';
import MaterialIcon from '../common/MaterialIcon';

interface DailyLimitCardProps {
  daysLeft: number;
  dailyLimit: number;
  todayExpenseSum: number;
  isOverBudget: boolean;
  isLoading?: boolean;
}

export default function DailyLimitCard({
  daysLeft,
  dailyLimit,
  todayExpenseSum,
  isOverBudget,
  isLoading,
}: DailyLimitCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1c140f] overflow-hidden shadow rounded-lg">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="pf-skeleton h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="pf-skeleton h-3 w-32 rounded-full" />
              <div className="pf-skeleton h-5 w-24 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="pf-skeleton h-3 w-44 rounded-full" />
            <div className="pf-skeleton h-3 w-36 rounded-full" />
            <div className="pf-skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // dailyLimit приходит в минорных единицах (например, 1815.27)
  const dailyLimitMinor = Math.round(dailyLimit);
  // Вычисляем процент использования дневного лимита
  let percentage = 0;
  if (dailyLimitMinor > 0) {
    percentage = (todayExpenseSum / dailyLimitMinor) * 100;
  } else if (todayExpenseSum > 0) {
    // Если лимит 0, но есть траты, показываем 100%
    percentage = 100;
  }

  // Проверка на валидность значения
  if (!isFinite(percentage) || isNaN(percentage)) {
    percentage = 0;
  }

  const isOverDailyLimit = dailyLimitMinor > 0 && todayExpenseSum > dailyLimitMinor;
  // Для отображения прогресс-бара ограничиваем до 100%, но сохраняем реальный процент для текста
  const displayPercentage = isOverDailyLimit ? 100 : Math.min(Math.max(percentage, 0), 100);

  return (
    <div className="bg-white dark:bg-[#1c140f] overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#d27b30]/10 text-[#d27b30]">
              <MaterialIcon name="calendar" className="h-5 w-5" />
            </div>
            <div className="ml-5 min-w-0">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-[#c7b0a0] truncate">
                  Дневной лимит
                </dt>
                <dd
                  className={`text-lg font-medium ${
                    isOverBudget || isOverDailyLimit
                      ? 'text-red-600'
                      : 'text-[#d27b30] dark:text-[#f0b27a]'
                  }`}
                >
                  {daysLeft > 0 ? formatCurrency(dailyLimitMinor) : 'н/д'}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-[#c7b0a0]">Потрачено сегодня:</span>
            <span
              className={`font-medium ${
                isOverDailyLimit || (dailyLimitMinor === 0 && todayExpenseSum > 0)
                  ? 'text-red-600'
                  : 'text-gray-900 dark:text-[#f8eee5]'
              }`}
            >
              {formatCurrency(todayExpenseSum)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-[#c7b0a0]">Оставшихся дней:</span>
            <span className="font-medium text-gray-900 dark:text-[#f8eee5]">{daysLeft}</span>
          </div>
          {daysLeft > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 dark:text-[#e4d1c1]">
                  Прогресс: {percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#2a1f18] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isOverDailyLimit || (dailyLimitMinor === 0 && todayExpenseSum > 0)
                      ? 'bg-red-600'
                      : percentage > 80
                      ? 'bg-yellow-500'
                      : 'bg-[#d27b30]'
                  }`}
                  style={{ width: `${displayPercentage}%` }}
                />
              </div>
            </div>
          )}
          {isOverBudget && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                ?? Превышен бюджет месяца!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


