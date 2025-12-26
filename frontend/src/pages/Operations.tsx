import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/common/Layout';
import MonthSelector from '../components/Dashboard/MonthSelector';
import AnalyticsTotals from '../components/Analytics/AnalyticsTotals';
import OperationsPanel from '../components/Operations/OperationsPanel';
import OperationForm from '../components/Dashboard/OperationForm';
import { getCurrentMonth } from '../utils/format';
import {
  categoriesApi,
  analyticsApi,
  operationsApi,
  CreateOperationRequest,
  OperationsListResponse,
  Operation,
} from '../services/api';


export default function Operations() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const pageSize = 50;

  const queryClient = useQueryClient();

  const { data: operationsData, isLoading: operationsLoading, isFetching } = useQuery({
    queryKey: ['operations', selectedMonth, currentPage],
    queryFn: () => operationsApi.list({ month: selectedMonth, page: currentPage, pageSize }),
  });

  // Сбрасываем операции при смене месяца
  useEffect(() => {
    setAllOperations([]);
    setCurrentPage(1);
  }, [selectedMonth]);

  // Объединяем операции при загрузке новой страницы
  useEffect(() => {
    if (operationsData?.operations) {
      if (currentPage === 1) {
        setAllOperations(operationsData.operations);
      } else {
        setAllOperations((prev) => {
          // Проверяем, чтобы не добавлять дубликаты
          const existingIds = new Set(prev.map(op => op.id));
          const newOperations = operationsData.operations.filter(op => !existingIds.has(op.id));
          return [...prev, ...newOperations];
        });
      }
    }
  }, [operationsData, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const hasMore = operationsData?.pagination
    ? currentPage < operationsData.pagination.totalPages
    : false;

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedMonth],
    queryFn: () => analyticsApi.get(selectedMonth),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const operationMutation = useMutation({
    mutationFn: (data: CreateOperationRequest) =>
      editingOperation ? operationsApi.update(editingOperation.id, data) : operationsApi.create(data),
    onSuccess: () => {
      setAllOperations([]);
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: ['operations', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowOperationForm(false);
      setEditingOperation(null);
    },
  });

  const deleteOperationMutation = useMutation({
    mutationFn: (id: string) => operationsApi.delete(id),
    onSuccess: (_, id) => {
      setAllOperations((prev) => prev.filter((op) => op.id !== id));
      queryClient.invalidateQueries({ queryKey: ['operations', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleAddOperation = () => {
    setEditingOperation(null);
    setShowOperationForm(true);
  };

  const handleEditOperation = (operation: Operation) => {
    setEditingOperation(operation);
    setShowOperationForm(true);
  };

  const handleDeleteOperation = async (id: string) => {
    await deleteOperationMutation.mutateAsync(id);
  };

  const handleSaveOperation = async (data: CreateOperationRequest) => {
    await operationMutation.mutateAsync(data);
  };


  const categories = categoriesData?.categories || [];
  const operations = allOperations;

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />
        <div className="mb-6">
          <AnalyticsTotals totals={analyticsData?.totals} isLoading={analyticsLoading} />
        </div>
        <OperationsPanel
          operations={operations}
          isLoading={operationsLoading}
          onAdd={handleAddOperation}
          onEdit={handleEditOperation}
          onDelete={handleDeleteOperation}
        />

        {hasMore && (
          <div className="mt-6">
            <button
              onClick={handleLoadMore}
              disabled={isFetching}
              className="w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#1f1f1f] hover:bg-gray-200 dark:hover:bg-[#252525] rounded-lg border border-gray-200 dark:border-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetching ? 'Загрузка...' : 'Загрузить еще'}
            </button>
          </div>
        )}

        {showOperationForm && (
          <OperationForm
            operation={editingOperation}
            categories={categories}
            onSubmit={handleSaveOperation}
            onCancel={() => {
              setShowOperationForm(false);
              setEditingOperation(null);
            }}
            onDelete={editingOperation ? () => handleDeleteOperation(editingOperation.id) : undefined}
          />
        )}
      </div>
    </Layout>
  );
}
