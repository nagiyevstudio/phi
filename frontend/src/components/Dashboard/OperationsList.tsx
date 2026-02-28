import { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // Какая плашка сейчас "активна" (показывает кнопки ред/уд)
  const [activeOpId, setActiveOpId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Для double-tap на мобиле
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  const actionIconBase =
    "inline-flex items-center justify-center h-8 w-8 rounded-full shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed";
  const actionEditIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionDeleteIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionConfirmIcon = `${actionIconBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancelIcon = `${actionIconBase} bg-slate-200/70 text-slate-600 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;

  // Сброс активной плашки при клике вне
  const activeOpRef = useRef<string | null>(null);
  activeOpRef.current = activeOpId;

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const activeId = activeOpRef.current;
    if (!activeId) return;
    const row = document.querySelector(`[data-op-id="${activeId}"]`);
    if (row && !row.contains(target)) {
      setActiveOpId(null);
      setDeleteConfirm(null);
    }
  }, []);

  useEffect(() => {
    if (activeOpId) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [activeOpId, handleOutsideClick]);

  const handleRowClick = (opId: string, e: React.MouseEvent) => {
    const now = Date.now();
    const last = lastTapRef.current;
    const DOUBLE_TAP_MS = 300;

    if (last && last.id === opId && now - last.time < DOUBLE_TAP_MS) {
      // Double-tap / double-click
      lastTapRef.current = null;
      e.stopPropagation();
      setActiveOpId((prev) => (prev === opId ? null : opId));
      setDeleteConfirm(null);
    } else {
      lastTapRef.current = { id: opId, time: now };
    }
  };

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
        <span className="text-xl font-semibold">
          {sign}
          {parts.integer}
        </span>
        <span className="text-base font-light opacity-70">
          {parts.decimal}
          {parts.fraction}
        </span>
        {parts.symbol && (
          <span className="ml-1 text-sm font-light opacity-60">
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
      setActiveOpId(null);
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
                      className="pf-skeleton h-12 w-full rounded-lg"
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
                      {group.items.map((op) => {
                        const isActive = activeOpId === op.id;
                        const isConfirming = deleteConfirm === op.id;
                        const isDeleting = deletingId === op.id;

                        return (
                          <div
                            key={op.id}
                            data-op-id={op.id}
                            style={{ touchAction: "manipulation" }}
                            onClick={(e) => handleRowClick(op.id, e)}
                            className={`group relative flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                              isActive
                                ? "bg-gray-50 dark:bg-[#252525]"
                                : "hover:bg-gray-50 dark:hover:bg-[#252525]"
                            }`}
                          >
                            {/* Left: dot + category + badge + time + note */}
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                              <div
                                className="shrink-0 h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    op.categoryColor || "#9CA3AF",
                                }}
                              />
                              <div className="min-w-0 text-left">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                  <span
                                    className="text-sm font-semibold truncate"
                                    style={{
                                      color: op.categoryColor || "#9CA3AF",
                                    }}
                                  >
                                    {op.categoryName}
                                  </span>
                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
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
                                    <span className="text-xs text-gray-400 dark:text-[#a3a3a3]">
                                      {formatTime(op.date)}
                                    </span>
                                  )}
                                </div>
                                {op.note && (
                                  <p className="mt-0.5 text-xs text-gray-500 dark:text-[#a3a3a3]">
                                    {op.note}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: price / active actions */}
                            <div className="shrink-0 flex items-center gap-2 ml-3">
                              {!isActive ? (
                                <>
                                  {/* Price */}
                                  <p
                                    className={`whitespace-nowrap tabular-nums leading-none flex items-baseline ${
                                      op.type === "expense"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {renderOperationAmount(
                                      op.amountMinor,
                                      op.type,
                                    )}
                                  </p>
                                  {/* Kebab — desktop only, visible on group hover */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveOpId(op.id);
                                      setDeleteConfirm(null);
                                    }}
                                    className={`hidden sm:inline-flex opacity-0 group-hover:opacity-100 transition-opacity ${actionIconBase} text-gray-400 hover:text-gray-600 hover:bg-slate-200/70 dark:text-[#a3a3a3] dark:hover:text-[#d4d4d8] dark:hover:bg-[#252525]`}
                                    aria-label="Действия"
                                    title="Действия"
                                    disabled={isDeleting}
                                  >
                                    <MaterialIcon
                                      name="more-vert"
                                      className="h-4 w-4"
                                    />
                                  </button>
                                </>
                              ) : isConfirming ? (
                                /* Confirm delete icons */
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(op.id);
                                    }}
                                    className={actionConfirmIcon}
                                    disabled={isDeleting}
                                    aria-label={t("common.confirm")}
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
                                    disabled={isDeleting}
                                    aria-label={t("common.cancel")}
                                    title={t("common.cancel")}
                                  >
                                    <MaterialIcon
                                      name="close"
                                      className="h-3.5 w-3.5"
                                    />
                                  </button>
                                </>
                              ) : (
                                /* Edit / Delete icons */
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(op);
                                      setActiveOpId(null);
                                    }}
                                    className={actionEditIcon}
                                    aria-label={t("common.edit")}
                                    title={t("common.edit")}
                                    disabled={isDeleting}
                                  >
                                    <MaterialIcon
                                      name="edit"
                                      className="h-3.5 w-3.5"
                                    />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteConfirm(op.id);
                                    }}
                                    className={actionDeleteIcon}
                                    aria-label={t("common.delete")}
                                    title={t("common.delete")}
                                    disabled={isDeleting}
                                  >
                                    <MaterialIcon
                                      name="delete"
                                      className="h-3.5 w-3.5"
                                    />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
