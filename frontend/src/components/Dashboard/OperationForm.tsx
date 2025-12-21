import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, CreateOperationRequest } from '../../services/api';

const operationSchema = z.object({
  type: z.enum(['expense', 'income']),
  amountMinor: z.number().positive('Сумма должна быть положительной'),
  categoryId: z.string().uuid('Выберите категорию'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата'),
  note: z.string().optional(),
});

type OperationFormData = z.infer<typeof operationSchema>;

interface OperationFormProps {
  operation?: {
    id: string;
    type: 'expense' | 'income';
    amountMinor: number;
    categoryId: string;
    date: string;
    note?: string | null;
  } | null;
  categories: Category[];
  onSubmit: (data: CreateOperationRequest) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

export default function OperationForm({
  operation,
  categories,
  onSubmit,
  onCancel,
  onDelete,
}: OperationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.type === (operation?.type || 'expense'));

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: operation
      ? {
          type: operation.type,
          amountMinor: operation.amountMinor,
          categoryId: operation.categoryId,
          date: operation.date,
          note: operation.note || '',
        }
      : {
          type: 'expense',
          amountMinor: 0,
          categoryId: '',
          date: new Date().toISOString().split('T')[0],
          note: '',
        },
  });

  const selectedType = watch('type');

  useEffect(() => {
    // Reset category when type changes
    setValue('categoryId', '');
  }, [selectedType, setValue]);

  const onFormSubmit = async (data: OperationFormData) => {
    try {
      setIsLoading(true);
      await onSubmit({
        type: data.type,
        amountMinor: data.amountMinor,
        categoryId: data.categoryId,
        date: data.date,
        note: data.note,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        setIsLoading(true);
        await onDelete();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentFilteredCategories = categories.filter((cat) => cat.type === selectedType);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          {operation ? 'Редактировать операцию' : 'Добавить операцию'}
        </h3>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Тип
            </label>
            <div className="mt-1 flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="expense"
                  {...register('type')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Расход</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="income"
                  {...register('type')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">Доход</span>
              </label>
            </div>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Сумма (AZN)
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amountMinor', {
                valueAsNumber: true,
                setValueAs: (v) => (v === '' ? 0 : Math.round(parseFloat(v) * 100)),
              })}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.amountMinor && (
              <p className="mt-1 text-sm text-red-600">{errors.amountMinor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Категория
            </label>
            <select
              {...register('categoryId')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Выберите категорию</option>
              {currentFilteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Дата
            </label>
            <input
              type="date"
              {...register('date')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Заметка
            </label>
            <textarea
              {...register('note')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {operation && onDelete && (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Удалить
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Подтвердить
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

