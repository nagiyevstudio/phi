import { formatCurrency } from '../../utils/format';
import MaterialIcon from '../common/MaterialIcon';

interface BudgetCardProps {
  planned: number;
  spent: number;
  remaining: number;
  isOverBudget: boolean;
  onEdit?: () => void;
  isLoading?: boolean;
}

export default function BudgetCard({
  planned,
  spent,
  remaining,
  isOverBudget,
  onEdit,
  isLoading,
}: BudgetCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] overflow-hidden shadow rounded-lg">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="pf-skeleton h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="pf-skeleton h-3 w-32 rounded-full" />
              <div className="pf-skeleton h-5 w-24 rounded-full" />
            </div>
            <div className="pf-skeleton h-9 w-9 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="pf-skeleton h-3 w-40 rounded-full" />
            <div className="pf-skeleton h-3 w-32 rounded-full" />
            <div className="pf-skeleton h-2 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const percentage = planned > 0 ? Math.min((spent / planned) * 100, 100) : 0;
  const editButton =
    'inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#d27b30]/10 text-[#d27b30] hover:bg-[#d27b30]/20';

  return (
    <div className="bg-white dark:bg-[#1a1a1a] overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#d27b30]/10 text-[#d27b30]">
              <MaterialIcon name="wallet" className="h-5 w-5" />
            </div>
            <div className="ml-5 min-w-0">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-[#a3a3a3] truncate">
                  Бюджет месяца
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb]">
                  {formatCurrency(planned)}
                </dd>
              </dl>
            </div>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className={editButton}
              aria-label="Установить бюджет"
              title="Установить бюджет"
            >
              <MaterialIcon name="edit" className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-[#a3a3a3]">Потрачено:</span>
            <span
              className={`font-medium ${
                isOverBudget ? 'text-red-600' : 'text-gray-900 dark:text-[#e5e7eb]'
              }`}
            >
              {formatCurrency(spent)}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-600 dark:text-[#a3a3a3]">Осталось:</span>
            <span
              className={`font-medium ${
                isOverBudget ? 'text-red-600' : 'text-green-600 dark:text-green-400'
              }`}
            >
              {formatCurrency(remaining)}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-[#d4d4d8]">
                Прогресс: {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-[#1f1f1f] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isOverBudget
                    ? 'bg-red-600'
                    : percentage > 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
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


