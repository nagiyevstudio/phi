import { useState } from 'react';
import { Operation, Category } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';

interface OperationsListProps {
  operations: Operation[];
  categories: Category[];
  onEdit: (operation: Operation) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function OperationsList({
  operations,
  categories,
  onEdit,
  onDelete,
  isLoading,
}: OperationsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOperations = operations.filter((op) => {
    if (typeFilter !== 'all' && op.type !== typeFilter) return false;
    if (categoryFilter !== 'all' && op.categoryId !== categoryFilter) return false;
    if (searchQuery && !op.note?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !op.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Операции</h3>

        {/* Filters */}
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">Все типы</option>
              <option value="expense">Расходы</option>
              <option value="income">Доходы</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="all">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Поиск по заметке или категории..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Operations */}
        {filteredOperations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Нет операций для отображения
          </div>
        ) : (
          <div className="space-y-2">
            {filteredOperations.map((op) => (
              <div
                key={op.id}
                className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: op.categoryColor || '#9CA3AF' }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {op.categoryName}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          op.type === 'expense'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {op.type === 'expense' ? 'Расход' : 'Доход'}
                      </span>
                    </div>
                    {op.note && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{op.note}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(op.date)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        op.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {op.type === 'expense' ? '-' : '+'}
                      {formatCurrency(op.amountMinor)}
                    </p>
                  </div>
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => onEdit(op)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    Редактировать
                  </button>
                  {deleteConfirm === op.id ? (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDelete(op.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                      >
                        Подтвердить
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 text-sm"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(op.id)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

