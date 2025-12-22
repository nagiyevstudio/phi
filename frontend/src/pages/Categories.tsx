import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/common/Layout';
import MaterialIcon from '../components/common/MaterialIcon';
import { categoriesApi, Category, CreateCategoryRequest } from '../services/api';

const actionBase =
  'inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1c140f]';
const actionNeutral =
  `${actionBase} bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-[#2a1f18]/70 dark:text-[#e4d1c1] dark:hover:bg-[#31251d]`;
const actionConfirm = `${actionBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
const primaryButton =
  'inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium shadow-sm bg-[#d27b30] text-white hover:bg-[#b56726] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1c140f]';
const actionIconBase =
  'inline-flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1c140f]';
const actionEditIcon =
  `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#2a1f18]/70 dark:text-[#e4d1c1] dark:hover:bg-[#31251d]`;
const actionArchiveIcon =
  `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#2a1f18]/70 dark:text-[#e4d1c1] dark:hover:bg-[#31251d]`;
const tabBase =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1c140f]';
const tabExpenseBase =
  'border-red-200 text-red-700 bg-red-50/60 hover:bg-red-100/70 dark:border-red-500/40 dark:text-red-200 dark:bg-red-500/10';
const tabExpenseActive = 'bg-red-600 text-white border-red-600';
const tabIncomeBase =
  'border-emerald-200 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 dark:border-emerald-500/40 dark:text-emerald-200 dark:bg-emerald-500/10';
const tabIncomeActive = 'bg-emerald-600 text-white border-emerald-600';

export default function Categories() {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#d27b30');

  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', activeTab],
    queryFn: () => categoriesApi.list(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAddForm(false);
      setNewCategoryName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string | null } }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      createMutation.mutate({
        type: activeTab,
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });
    }
  };

  const handleUpdateCategory = (id: string, name: string, color: string | null) => {
    updateMutation.mutate({ id, data: { name, color } });
  };

  const handleArchive = (id: string) => {
    if (confirm('Архивировать эту категорию?')) {
      archiveMutation.mutate(id);
    }
  };

  const categories = categoriesData?.categories || [];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-6 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('expense')}
              className={`${tabBase} ${activeTab === 'expense' ? tabExpenseActive : tabExpenseBase}`}
              aria-pressed={activeTab === 'expense'}
            >
              <MaterialIcon name="expense" className="h-4 w-4" />
              Расходы
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`${tabBase} ${activeTab === 'income' ? tabIncomeActive : tabIncomeBase}`}
              aria-pressed={activeTab === 'income'}
            >
              <MaterialIcon name="income" className="h-4 w-4" />
              Доходы
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c140f] shadow rounded-lg p-6 text-left">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-gray-900 dark:text-[#f8eee5]">
              Категории {activeTab === 'expense' ? 'расходов' : 'доходов'}
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`${showAddForm ? actionNeutral : primaryButton} h-10 w-10 justify-center sm:w-auto sm:px-4`}
              aria-label={showAddForm ? 'Отменить' : 'Добавить категорию'}
            >
              {showAddForm ? (
                <>
                  <MaterialIcon name="close" className="h-4 w-4" />
                  <span className="hidden sm:inline">Отмена</span>
                </>
              ) : (
                <>
                  <MaterialIcon name="add" className="h-5 w-5" />
                  <span className="hidden sm:inline">Добавить категорию</span>
                </>
              )}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-[#2a1f18] rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Название категории"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="pf-input flex-1"
                />
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="pf-color"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || createMutation.isPending}
                  className={`${actionConfirm} disabled:opacity-50`}
                >
                  <MaterialIcon name="check" className="h-4 w-4" />
                  Сохранить
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`category-skeleton-${index}`} className="pf-skeleton h-20 rounded-lg" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-[#c7b0a0]">
              Нет категорий. Добавьте первую категорию.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  editing={editingCategory?.id === cat.id}
                  isSaving={updateMutation.isPending && editingCategory?.id === cat.id}
                  onEdit={(name, color) => handleUpdateCategory(cat.id, name, color)}
                  onStartEdit={() => setEditingCategory(cat)}
                  onCancelEdit={() => setEditingCategory(null)}
                  onArchive={() => handleArchive(cat.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

interface CategoryCardProps {
  category: Category;
  editing: boolean;
  isSaving?: boolean;
  onEdit: (name: string, color: string | null) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onArchive: () => void;
}

function CategoryCard({
  category,
  editing,
  isSaving,
  onEdit,
  onStartEdit,
  onCancelEdit,
  onArchive,
}: CategoryCardProps) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color || '#d27b30');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    onEdit(trimmedName, color);
  };

  if (editing) {
    return (
      <div className="p-4 border border-gray-200 dark:border-[#3a2a20] rounded-lg bg-gray-50 dark:bg-[#2a1f18] text-left">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="pf-input mb-2"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="pf-color"
          />
          <button
            onClick={handleSave}
            className={`${actionConfirm} disabled:opacity-50`}
            disabled={isSaving || !name.trim()}
          >
            <MaterialIcon name="check" className="h-4 w-4" />
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            onClick={onCancelEdit}
            className={`${actionNeutral} disabled:opacity-50`}
            disabled={isSaving}
          >
            <MaterialIcon name="close" className="h-4 w-4" />
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-[#3a2a20] rounded-lg hover:bg-gray-50 dark:hover:bg-[#31251d] text-left">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-3.5 w-3.5 rounded-full"
            style={{ backgroundColor: category.color || '#9CA3AF' }}
          />
          <span
            className="min-w-0 truncate font-semibold"
            style={{ color: category.color || '#6B7280' }}
          >
            {category.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onStartEdit}
            className={actionEditIcon}
            aria-label="Изменить"
            title="Изменить"
          >
            <MaterialIcon name="edit" className="h-4 w-4" />
          </button>
          <button
            onClick={onArchive}
            className={actionArchiveIcon}
            aria-label="Архивировать"
            title="Архивировать"
          >
            <MaterialIcon name="archive" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}



