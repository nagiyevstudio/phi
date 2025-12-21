import { useState } from 'react';
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

  const queryClient = useQueryClient();

  const { data: operationsData, isLoading: operationsLoading } = useQuery({
    queryKey: ['operations', selectedMonth],
    queryFn: () => operationsApi.list({ month: selectedMonth, pageSize: 100 }),
  });

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
      removeOperationFromCache(['operations', selectedMonth], id);
      removeOperationFromCache(['operations'], id);
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

  const removeOperationFromCache = (queryKey: unknown[], id: string) => {
    queryClient.setQueryData<OperationsListResponse>(queryKey, (oldData) => {
      if (!oldData) return oldData;
      const nextOperations = oldData.operations.filter((op) => op.id !== id);
      if (nextOperations.length === oldData.operations.length) {
        return oldData;
      }
      return {
        ...oldData,
        operations: nextOperations,
        pagination: {
          ...oldData.pagination,
          total: Math.max(0, oldData.pagination.total - 1),
        },
      };
    });
  };

  const categories = categoriesData?.categories || [];
  const operations = operationsData?.operations || [];

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
