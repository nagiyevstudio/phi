import { useMemo, useState, useEffect } from "react";
import { Operation } from "../../services/api";
import {
  formatCurrency,
  formatCurrencyParts,
  formatDateTime,
} from "../../utils/format";
import MaterialIcon from "../common/MaterialIcon";
import { useI18n } from "../../i18n";

const formatTime = (date: string): string => {
  if (!date) return "";
  const normalized = date.trim();
  if (!normalized) return "";

  try {
    const parsed = new Date(normalized.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return "";

    // Проверяем, есть ли время в строке
    const hasTime = /[T ]\d{2}:\d{2}/.test(normalized);
    if (!hasTime) return "";

    return parsed.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

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
  const { t, tPlural } = useI18n();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const actionIconBase =
    "inline-flex items-center justify-center h-8 w-8 rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed";
  const actionEditIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionDeleteIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionConfirm =
    "inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300";
  const actionCancel =
    "inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]";
  const actionConfirmIcon = `${actionIconBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancelIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;

  const toggleGroup = (dateKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const formatOperationCount = (count: number) =>
    tPlural("operations.count", count, { count });

  const renderOperationAmount = (
    amountMinor: number,
    type: Operation["type"],
  ) => {
    const sign = type === "expense" ? "-" : "+";
    const parts = formatCurrencyParts(Math.abs(amountMinor));

    return (
      <>
        <span className="text-3xl font-semibold">
          {sign}
          {parts.integer}
        </span>
        <span className="text-lg font-light opacity-70">
          {parts.decimal}
          {parts.fraction}
        </span>
        {parts.symbol && (
          <span className="ml-1 text-md font-light opacity-60">
            {parts.symbol}
          </span>
        )}
      </>
    );
  };

  const groupedOperations = useMemo(() => {
    const groups: Array<{
      dateKey: string;
      dateLabel: string;
      incomeMinor: number;
      expenseMinor: number;
      items: Operation[];
    }> = [];

    operations.forEach((op) => {
      const dateKey = op.date ? op.date.slice(0, 10) : "";
      const normalizedKey = dateKey || "unknown";
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.dateKey !== normalizedKey) {
        groups.push({
          dateKey: normalizedKey,
          dateLabel:
            normalizedKey === "unknown"
              ? t("operations.noDate")
              : formatDateTime(normalizedKey),
          incomeMinor: op.type === "income" ? op.amountMinor : 0,
          expenseMinor: op.type === "expense" ? op.amountMinor : 0,
          items: [op],
        });
        return;
      }

      lastGroup.items.push(op);
      if (op.type === "income") {
        lastGroup.incomeMinor += op.amountMinor;
      } else {
        lastGroup.expenseMinor += op.amountMinor;
      }
    });

    return groups;
  }, [operations, t]);

  // Открываем только сегодняшнюю группу по умолчанию
  useEffect(() => {
    if (groupedOperations.length > 0 && expandedGroups.size === 0) {
      const today = new Date().toISOString().split("T")[0];
      const todayGroup = groupedOperations.find((g) => g.dateKey === today);
      if (todayGroup) {
        setExpandedGroups(new Set([today]));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations.length]);

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
            {t("operations.empty")}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedOperations.map((group, groupIndex) => {
              const isExpanded = expandedGroups.has(group.dateKey);
              return (
                <div
                  key={`${group.dateKey}-${groupIndex}`}
                  className="border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleGroup(group.dateKey)}
                    className="w-full px-4 pt-3 pb-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                  >
                    <span className="hidden sm:inline-flex">
                      <MaterialIcon
                        name="chevron-right"
                        className={`h-5 w-5 text-gray-500 dark:text-[#a3a3a3] transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-[#d4d4d8]">
                      {group.dateLabel}
                    </span>
                    <span className="hidden sm:inline text-xs text-gray-500 dark:text-[#a3a3a3]">
                      {formatOperationCount(group.items.length)}
                    </span>
                    <div className="flex items-center gap-3 ml-auto">
                      {group.incomeMinor > 0 && (
                        <span className="text-sm font-semibold text-emerald-600">
                          +{formatCurrency(group.incomeMinor)}
                        </span>
                      )}
                      {group.expenseMinor > 0 && (
                        <span className="text-sm font-semibold text-red-600">
                          -{formatCurrency(group.expenseMinor)}
                        </span>
                      )}
                      {group.incomeMinor === 0 && group.expenseMinor === 0 && (
                        <span className="text-sm font-semibold text-gray-500 dark:text-[#a3a3a3]">
                          {formatCurrency(0)}
                        </span>
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-gray-200 dark:divide-[#2a2a2a] border-t border-gray-200 dark:border-[#2a2a2a]">
                      {group.items.map((op) => (
                        <div
                          key={op.id}
                          className="relative flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#252525]"
                        >
                          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <div
                                className="mt-1 h-2.5 w-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    op.categoryColor || "#9CA3AF",
                                }}
                              />
                              <div className="min-w-0 text-left pr-12 sm:pr-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className="text-sm font-semibold truncate"
                                    style={{
                                      color: op.categoryColor || "#9CA3AF",
                                    }}
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
                                      name={
                                        op.type === "expense"
                                          ? "expense"
                                          : "income"
                                      }
                                      className="h-3 w-3"
                                    />
                                    {op.type === "expense"
                                      ? t("operations.typeExpense")
                                      : t("operations.typeIncome")}
                                  </span>
                                  {formatTime(op.date) && (
                                    <span className="text-xs text-gray-500 dark:text-[#a3a3a3]">
                                      {formatTime(op.date)}
                                    </span>
                                  )}
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
                                className={`whitespace-nowrap tabular-nums leading-none flex items-baseline ${
                                  op.type === "expense"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`}
                              >
                                {renderOperationAmount(op.amountMinor, op.type)}
                              </p>
                              <div className="flex items-center gap-2">
                                {deleteConfirm !== op.id && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(op);
                                    }}
                                    className={actionEditIcon}
                                    aria-label={t("common.edit")}
                                    title={t("common.edit")}
                                    disabled={deletingId === op.id}
                                  >
                                    <MaterialIcon
                                      name="edit"
                                      className="h-3.5 w-3.5"
                                    />
                                  </button>
                                )}
                                {deleteConfirm === op.id ? (
                                  <>
                                    <div className="hidden sm:flex flex-wrap items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(op.id);
                                        }}
                                        className={actionConfirm}
                                        disabled={deletingId === op.id}
                                      >
                                        <MaterialIcon
                                          name="check"
                                          className="h-3.5 w-3.5"
                                        />
                                        {deletingId === op.id
                                          ? t("common.deleting")
                                          : t("common.confirm")}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirm(null);
                                        }}
                                        className={actionCancel}
                                        disabled={deletingId === op.id}
                                      >
                                        <MaterialIcon
                                          name="close"
                                          className="h-3.5 w-3.5"
                                        />
                                        {t("common.cancel")}
                                      </button>
                                    </div>
                                    <div className="flex sm:hidden items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(op.id);
                                        }}
                                        className={actionConfirmIcon}
                                        disabled={deletingId === op.id}
                                        aria-label={t(
                                          "operations.confirmDelete",
                                        )}
                                        title={t("common.confirm")}
                                      >
                                        <MaterialIcon
                                          name="check"
                                          className="h-3.5 w-3.5"
                                        />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeleteConfirm(null);
                                        }}
                                        className={actionCancelIcon}
                                        disabled={deletingId === op.id}
                                        aria-label={t(
                                          "operations.cancelDelete",
                                        )}
                                        title={t("common.cancel")}
                                      >
                                        <MaterialIcon
                                          name="close"
                                          className="h-3.5 w-3.5"
                                        />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirm(op.id);
                                    }}
                                    className={actionDeleteIcon}
                                    aria-label={t("common.delete")}
                                    title={t("common.delete")}
                                    disabled={deletingId === op.id}
                                  >
                                    <MaterialIcon
                                      name="delete"
                                      className="h-3.5 w-3.5"
                                    />
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
