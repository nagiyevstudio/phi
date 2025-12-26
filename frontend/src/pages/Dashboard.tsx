import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/common/Layout';
import BudgetCard from '../components/Dashboard/BudgetCard';
import DailyLimitCard from '../components/Dashboard/DailyLimitCard';
import MonthlyExpenseCard from '../components/Dashboard/MonthlyExpenseCard';
import AnalyticsTotals from '../components/Analytics/AnalyticsTotals';
import OperationsPanel from '../components/Operations/OperationsPanel';
import OperationForm from '../components/Dashboard/OperationForm';
import { getCurrentMonth } from '../utils/format';
import { useI18n } from '../i18n';
import {
  budgetApi,
  analyticsApi,
  operationsApi,
  categoriesApi,
  CreateOperationRequest,
  OperationsListResponse,
  Operation,
} from '../services/api';

export default function Dashboard() {
  const { t } = useI18n();
  const selectedMonth = getCurrentMonth();
  const [showOperationForm, setShowOperationForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const queryClient = useQueryClient();

  // Fetch budget
  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget', selectedMonth],
    queryFn: () => budgetApi.getBudget(selectedMonth),
  });

  // Fetch operations
  const { data: operationsData, isLoading: operationsLoading } = useQuery({
    queryKey: ['operations', selectedMonth],
    queryFn: () => operationsApi.list({ month: selectedMonth, pageSize: 10000 }),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedMonth],
    queryFn: () => analyticsApi.get(selectedMonth),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  // Mutation for setting budget
  const setBudgetMutation = useMutation({
    mutationFn: (amount: number) => budgetApi.setBudget(selectedMonth, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth] });
    },
  });

  const operationMutation = useMutation({
    mutationFn: (data: CreateOperationRequest) =>
      editingOperation ? operationsApi.update(editingOperation.id, data) : operationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth] });
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


  const handleSaveBudget = () => {
    const amount = prompt(t('dashboard.budgetPrompt', { currency: '₼' }));
    if (amount) {
      const amountMinor = Math.round(parseFloat(amount) * 100);
      if (!isNaN(amountMinor) && amountMinor >= 0) {
        setBudgetMutation.mutate(amountMinor);
      }
    }
  };

  const categories = categoriesData?.categories || [];
  const operations = operationsData?.operations || [];
  const expenseMinor = analyticsData?.totals?.expenseMinor ?? budget?.expenseSum ?? 0;
  const incomeMinor = analyticsData?.totals?.incomeMinor ?? budget?.incomeSum ?? 0;
  const expensesByDay = analyticsData?.expensesByDay ?? [];
  const averageDailyMinor = expensesByDay.length
    ? Math.round(
        expensesByDay.reduce((sum, item) => sum + item.totalMinor, 0) / expensesByDay.length
      )
    : 0;
  const remainingDays = budget?.daysLeft ?? 0;
  const expectedRemainingMinor = averageDailyMinor * Math.max(remainingDays, 0);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayOperations = operations.filter((operation) => operation.date.slice(0, 10) === todayKey);
  const todayExpenseSumFromOps = operations.reduce((sum, operation) => {
    if (operation.type === 'expense' && operation.date.slice(0, 10) === todayKey) {
      return sum + operation.amountMinor;
    }
    return sum;
  }, 0);
  const todayExpenseSum = Math.max(budget?.todayExpenseSum || 0, todayExpenseSumFromOps);

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <BudgetCard
            planned={budget?.planned || 0}
            spent={budget?.expenseSum || 0}
            remaining={budget?.remaining || 0}
            isOverBudget={budget?.isOverBudget || false}
            onEdit={handleSaveBudget}
            isLoading={budgetLoading}
          />
          <DailyLimitCard
            daysLeft={budget?.daysLeft || 0}
            dailyLimit={budget?.dailyLimit || 0}
            todayExpenseSum={todayExpenseSum}
            isOverBudget={budget?.isOverBudget || false}
            isLoading={budgetLoading}
          />
          <MonthlyExpenseCard
            expenseMinor={expenseMinor}
            incomeMinor={incomeMinor}
            averageDailyMinor={averageDailyMinor}
            expectedRemainingMinor={expectedRemainingMinor}
            isLoading={budgetLoading || analyticsLoading}
          />
        </div>

        <div className="mb-6">
          <AnalyticsTotals totals={analyticsData?.totals} isLoading={analyticsLoading} />
        </div>

        {operationsLoading && (
          <div className="text-center py-6 text-sm text-gray-500 dark:text-[#a3a3a3]">
            {t('dashboard.refreshOperations')}
          </div>
        )}

        <div className="mt-8">
          <OperationsPanel
            operations={todayOperations}
            isLoading={operationsLoading}
            limit={10}
            onAdd={handleAddOperation}
            onEdit={handleEditOperation}
            onDelete={handleDeleteOperation}
          />
        </div>

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


