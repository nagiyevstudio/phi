import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/common/Layout';
import MonthSelector from '../components/Dashboard/MonthSelector';
import BudgetCard from '../components/Dashboard/BudgetCard';
import DailyLimitCard from '../components/Dashboard/DailyLimitCard';
import OperationsList from '../components/Dashboard/OperationsList';
import OperationForm from '../components/Dashboard/OperationForm';
import { getCurrentMonth } from '../utils/format';
import {
  budgetApi,
  operationsApi,
  categoriesApi,
  CreateOperationRequest,
  Operation,
} from '../services/api';

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
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
    queryFn: () => operationsApi.list({ month: selectedMonth, pageSize: 100 }),
  });

  // Fetch categories
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

  // Mutation for creating/updating operations
  const operationMutation = useMutation({
    mutationFn: (data: CreateOperationRequest) =>
      editingOperation ? operationsApi.update(editingOperation.id, data) : operationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      setShowOperationForm(false);
      setEditingOperation(null);
    },
  });

  // Mutation for deleting operations
  const deleteOperationMutation = useMutation({
    mutationFn: (id: string) => operationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['budget', selectedMonth] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleAddExpense = () => {
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

  const handleSaveBudget = () => {
    const amount = prompt('Введите бюджет на месяц (в AZN):');
    if (amount) {
      const amountMinor = Math.round(parseFloat(amount) * 100);
      if (!isNaN(amountMinor) && amountMinor >= 0) {
        setBudgetMutation.mutate(amountMinor);
      }
    }
  };

  const categories = categoriesData?.categories || [];
  const operations = operationsData?.operations || [];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <MonthSelector selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <BudgetCard
            planned={budget?.planned || 0}
            spent={budget?.expenseSum || 0}
            remaining={budget?.remaining || 0}
            isOverBudget={budget?.isOverBudget || false}
          />
          <DailyLimitCard
            daysLeft={budget?.daysLeft || 0}
            dailyLimit={budget?.dailyLimit || 0}
            isOverBudget={budget?.isOverBudget || false}
          />
        </div>

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Операции</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveBudget}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Установить бюджет
            </button>
            <button
              onClick={handleAddExpense}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + Добавить операцию
            </button>
          </div>
        </div>

        <OperationsList
          operations={operations}
          categories={categories}
          onEdit={handleEditOperation}
          onDelete={handleDeleteOperation}
          isLoading={operationsLoading || budgetLoading}
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

