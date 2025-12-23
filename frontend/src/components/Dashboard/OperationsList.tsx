import { useMemo, useState } from "react";
import { Operation } from "../../services/api";
import { formatCurrency, formatCurrencyParts, formatDateTime } from "../../utils/format";
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
    "inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed";
  const actionIconBase =
    "inline-flex items-center justify-center h-10 w-10 rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed";
  const actionEditIcon =
    `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionDeleteIcon =
    `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionConfirm = `${actionBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancel =
    `${actionBase} bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionConfirmIcon = `${actionIconBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancelIcon =
    `${actionIconBase} bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;

  const formatOperationCount = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return `${count} операция`;
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return `${count} операции`;
    }
    return `${count} операций`;
  };

  const formatSignedAmount = (amountMinor: number) => {
    if (amountMinor === 0) {
      return formatCurrency(0);
    }
    const sign = amountMinor > 0 ? "+" : "-";
    return `${sign}${formatCurrency(Math.abs(amountMinor))}`;
  };

  const renderOperationAmount = (amountMinor: number, type: Operation["type"]) => {
    const sign = type === "expense" ? "-" : "+";
    const parts = formatCurrencyParts(Math.abs(amountMinor));

    return (
      <>
        <span className="text-[1.85rem] font-semibold">
          {sign}
          {parts.integer}
        </span>
        <span className="text-[1.1rem] font-light opacity-70">
          {parts.decimal}
          {parts.fraction}
        </span>
        {parts.symbol && (
          <span className="ml-1 text-[0.95rem] font-light opacity-60">{parts.symbol}</span>
        )}
      </>
    );
  };

  const groupedOperations = useMemo(() => {
    const groups: Array<{
      dateKey: string;
      dateLabel: string;
      totalMinor: number;
      items: Operation[];
    }> = [];

    operations.forEach((op) => {
      const dateKey = op.date ? op.date.slice(0, 10) : "";
      const normalizedKey = dateKey || "unknown";
      const lastGroup = groups[groups.length - 1];
      const signedAmount = op.type === "expense" ? -op.amountMinor : op.amountMinor;

      if (!lastGroup || lastGroup.dateKey !== normalizedKey) {
        groups.push({
          dateKey: normalizedKey,
          dateLabel: normalizedKey === "unknown" ? "Без даты" : formatDateTime(normalizedKey),
          totalMinor: signedAmount,
          items: [op],
        });
        return;
      }

      lastGroup.items.push(op);
      lastGroup.totalMinor += signedAmount;
    });

    return groups;
  }, [operations]);

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
    return (
      <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, groupIndex) => (
              <div key={`op-skeleton-${groupIndex}`} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="pf-skeleton h-4 w-24 rounded-full" />
                  <div className="h-px flex-1 bg-gray-200 dark:bg-[#1f1f1f]" />
                  <div className="pf-skeleton h-4 w-16 rounded-full" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, itemIndex) => (
                    <div
                      key={`op-skeleton-${groupIndex}-${itemIndex}`}
                      className="pf-skeleton h-20 w-full rounded-lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Operations */}
        {operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-[#a3a3a3]">
            Нет операций для отображения
          </div>
        ) : (
          <div className="space-y-6">
            {groupedOperations.map((group, groupIndex) => (
              <div key={`${group.dateKey}-${groupIndex}`} className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">
                    {group.dateLabel}
                  </span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-[#1f1f1f]" />
                  <span className="text-xs text-gray-500 dark:text-[#a3a3a3]">
                    {formatOperationCount(group.items.length)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      group.totalMinor > 0
                        ? "text-emerald-600"
                        : group.totalMinor < 0
                        ? "text-red-600"
                        : "text-gray-500 dark:text-[#a3a3a3]"
                    }`}
                  >
                    {formatSignedAmount(group.totalMinor)}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.items.map((op) => (
                    <div
                      key={op.id}
                      className="relative flex items-center justify-between p-4 border border-gray-200 dark:border-[#2a2a2a] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252525]"
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
                            </div>
                            {op.note && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-[#a3a3a3] text-left">
                                {op.note}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
                          <p
                            className={`whitespace-nowrap tabular-nums leading-none ${
                              op.type === "expense" ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {renderOperationAmount(op.amountMinor, op.type)}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

