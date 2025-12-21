import { formatCurrency } from '../../utils/format';

interface BudgetCardProps {
  planned: number;
  spent: number;
  remaining: number;
  isOverBudget: boolean;
}

export default function BudgetCard({ planned, spent, remaining, isOverBudget }: BudgetCardProps) {
  const percentage = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="text-2xl">💰</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                Бюджет месяца
              </dt>
              <dd className="text-lg font-medium text-gray-900 dark:text-white">
                {formatCurrency(planned)}
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Потрачено:</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Осталось:</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600 dark:text-green-400'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Прогресс: {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isOverBudget ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

