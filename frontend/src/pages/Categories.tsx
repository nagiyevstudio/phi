import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/common/Layout';
import { categoriesApi, Category, CreateCategoryRequest } from '../services/api';

export default function Categories() {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');

  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories', activeTab],
    queryFn: () => categoriesApi.list(activeTab),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowAddForm(false);
      setNewCategoryName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; color?: string | null } }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.archive(id),
    onSuccess: () => {
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Категории</h1>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('expense')}
                className={`${
                  activeTab === 'expense'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Расходы
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`${
                  activeTab === 'income'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Доходы
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Категории {activeTab === 'expense' ? 'расходов' : 'доходов'}
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {showAddForm ? 'Отмена' : '+ Добавить категорию'}
            </button>
          </div>

          {showAddForm && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Название категории"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-16 h-10 rounded border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || createMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  Сохранить
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-8">Загрузка...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Нет категорий. Добавьте первую категорию.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  editing={editingCategory?.id === cat.id}
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
  onEdit: (name: string, color: string | null) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onArchive: () => void;
}

function CategoryCard({
  category,
  editing,
  onEdit,
  onStartEdit,
  onCancelEdit,
  onArchive,
}: CategoryCardProps) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color || '#3B82F6');

  const handleSave = () => {
    onEdit(name.trim(), color);
  };

  if (editing) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white text-sm"
        />
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-8 rounded border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={handleSave}
            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            Сохранить
          </button>
          <button
            onClick={onCancelEdit}
            className="px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
      <div className="flex items-center space-x-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: category.color || '#9CA3AF' }}
        />
        <span className="flex-1 text-gray-900 dark:text-white font-medium">{category.name}</span>
        <button
          onClick={onStartEdit}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
        >
          Изменить
        </button>
        <button
          onClick={onArchive}
          className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
        >
          Архивировать
        </button>
      </div>
    </div>
  );
}

