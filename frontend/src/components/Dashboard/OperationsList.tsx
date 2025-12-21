import { useState } from "react";
import { Operation } from "../../services/api";
import { formatCurrency, formatDateTime } from "../../utils/format";
import MaterialIcon from "../common/MaterialIcon";

interface OperationsListProps {
  operations: Operation[];
  onEdit: (operation: Operation) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function OperationsList({
  operations,
  onEdit,
  onDelete,
  isLoading,
}: OperationsListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const actionBase =
    "inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
  const actionIconBase =
    "inline-flex items-center justify-center h-10 w-10 rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
  const actionEditIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20`;
  const actionDeleteIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20`;
  const actionConfirm = `${actionBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancel = `${actionBase} bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20`;
  const actionConfirmIcon = `${actionIconBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancelIcon = `${actionIconBase} bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20`;

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await onDelete(id);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteConfirm(null);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Operations */}
        {operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Нет операций для отображения
          </div>
        ) : (
          <div className="space-y-2">
            {operations.map((op) => (
              <div
                key={op.id}
                className="relative flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div
                      className="mt-1 h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: op.categoryColor || "#9CA3AF" }}
                    />
                    <div className="min-w-0 text-left pr-12 sm:pr-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-sm font-semibold truncate"
                          style={{ color: op.categoryColor || "#9CA3AF" }}
                        >
                          {op.categoryName}
                        </span>
                        <span
                          className={`absolute top-3 right-3 sm:static inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            op.type === "expense"
                              ? "bg-red-500/10 text-red-700 dark:text-red-300"
                              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          }`}
                        >
                          <MaterialIcon
                            name={op.type === "expense" ? "expense" : "income"}
                            className="h-3 w-3"
                          />
                          {op.type === "expense" ? "Расход" : "Доход"}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDateTime(op.date)}
                        </span>
                      </div>
                      {op.note && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-left">
                          {op.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                    <p
                      className={`text-[1.85rem] font-light whitespace-nowrap ${
                        op.type === "expense" ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {op.type === "expense" ? "-" : "+"}
                      {formatCurrency(op.amountMinor)}
                    </p>
                    <div className="flex items-center gap-2">
                      {deleteConfirm !== op.id && (
                        <button
                          onClick={() => onEdit(op)}
                          className={actionEditIcon}
                          aria-label="Редактировать"
                          title="Редактировать"
                          disabled={deletingId === op.id}
                        >
                          <MaterialIcon name="edit" className="h-4 w-4" />
                        </button>
                      )}
                      {deleteConfirm === op.id ? (
                        <>
                          <div className="hidden sm:flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleDelete(op.id)}
                              className={actionConfirm}
                              disabled={deletingId === op.id}
                            >
                              <MaterialIcon name="check" className="h-4 w-4" />
                              {deletingId === op.id ? "Удаление..." : "Подтвердить"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className={actionCancel}
                              disabled={deletingId === op.id}
                            >
                              <MaterialIcon name="close" className="h-4 w-4" />
                              Отмена
                            </button>
                          </div>
                          <div className="flex sm:hidden items-center gap-2">
                            <button
                              onClick={() => handleDelete(op.id)}
                              className={actionConfirmIcon}
                              disabled={deletingId === op.id}
                              aria-label="Подтвердить удаление"
                              title="Подтвердить"
                            >
                              <MaterialIcon name="check" className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className={actionCancelIcon}
                              disabled={deletingId === op.id}
                              aria-label="Отменить удаление"
                              title="Отмена"
                            >
                              <MaterialIcon name="close" className="h-4 w-4" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(op.id)}
                          className={actionDeleteIcon}
                          aria-label="Удалить"
                          title="Удалить"
                          disabled={deletingId === op.id}
                        >
                          <MaterialIcon name="delete" className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
