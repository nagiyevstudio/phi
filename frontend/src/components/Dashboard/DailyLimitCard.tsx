import { formatCurrency } from '../../utils/format';

interface DailyLimitCardProps {
  daysLeft: number;
  dailyLimit: number;
  isOverBudget: boolean;
}

export default function DailyLimitCard({ daysLeft, dailyLimit, isOverBudget }: DailyLimitCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl">📅</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Дневной лимит
              </dt>
              <dd className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'}`}>
                {daysLeft > 0 ? formatCurrency(Math.round(dailyLimit * 100)) : 'н/д'}
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Оставшихся дней:</span>
            <span className="font-medium text-gray-900 dark:text-white">{daysLeft}</span>
          </div>
          {isOverBudget && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                ⚠️ Превышен бюджет месяца!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

