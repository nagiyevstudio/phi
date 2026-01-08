import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MaterialIcon from "../common/MaterialIcon";
import HelpModal from "../common/HelpModal";
import OperationsList from "../Dashboard/OperationsList";
import { Operation } from "../../services/api";
import { formatCurrency } from "../../utils/format";
import { getCategoryStyle } from "../../utils/categoryStyle";
import { useI18n } from "../../i18n";

const typeButtonBase =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a]";
const typeAllBase =
  "border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/70 dark:hover:bg-[#212121]";
const typeAllActive = "bg-[#d27b30] text-white border-[#d27b30] shadow-sm";
const typeExpenseBase =
  "border-red-200 text-red-700 bg-red-50/60 hover:bg-red-100/70 dark:border-red-500/40 dark:text-red-200 dark:bg-red-500/10";
const typeExpenseActive = "bg-red-600 text-white border-red-600";
const typeIncomeBase =
  "border-emerald-200 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 dark:border-emerald-500/40 dark:text-emerald-200 dark:bg-emerald-500/10";
const typeIncomeActive = "bg-emerald-600 text-white border-emerald-600";

const chipBase =
  "inline-flex items-center gap-2 h-9 px-3 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a]";
const chipAllInactive =
  "border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/70 dark:hover:bg-[#212121]";
const chipAllActive = "bg-[#d27b30] text-white border-[#d27b30] shadow-sm";
const categoryActionBase =
  "inline-flex items-center justify-center h-8 w-8 rounded-full border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a]";
const categoryActionSecondary =
  "border-gray-200 text-gray-600 bg-white/70 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/60 dark:hover:bg-[#212121]";
const categoryActionPrimary =
  "border-[#d27b30]/40 text-[#b56726] bg-[#d27b30]/10 hover:bg-[#d27b30]/20";

interface ActiveCategory {
  id: string;
  name: string;
  color: string | null;
  type: "expense" | "income";
}

interface OperationsPanelProps {
  operations: Operation[];
  isLoading?: boolean;
  limit?: number;
  onAdd?: () => void;
  onEdit: (operation: Operation) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function OperationsPanel({
  operations,
  isLoading,
  limit,
  onAdd,
  onEdit,
  onDelete,
}: OperationsPanelProps) {
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">(
    "all"
  );
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const activeCategories = useMemo<ActiveCategory[]>(() => {
    const map = new Map<string, ActiveCategory>();
    operations.forEach((op) => {
      if (!map.has(op.categoryId)) {
        map.set(op.categoryId, {
          id: op.categoryId,
          name: op.categoryName,
          color: op.categoryColor,
          type: op.categoryType === "expense" ? "expense" : "income",
        });
      }
    });
    return Array.from(map.values());
  }, [operations]);

  const categoryTotals = useMemo(() => {
    return operations.reduce<Record<string, number>>((acc, op) => {
      acc[op.categoryId] = (acc[op.categoryId] || 0) + op.amountMinor;
      return acc;
    }, {});
  }, [operations]);

  const visibleCategories = useMemo(() => {
    if (typeFilter === "all") {
      return activeCategories;
    }
    return activeCategories.filter((cat) => cat.type === typeFilter);
  }, [activeCategories, typeFilter]);
  const categoryTypeParam = typeFilter === "all" ? "" : `&type=${typeFilter}`;
  const addCategoryHref = `/categories?action=add${categoryTypeParam}`;
  const editCategoryHref = `/categories${
    typeFilter === "all" ? "" : `?type=${typeFilter}`
  }`;

  useEffect(() => {
    if (categoryFilter === "all") {
      return;
    }
    const selectedCategory = activeCategories.find(
      (cat) => cat.id === categoryFilter
    );
    if (!selectedCategory) {
      setCategoryFilter("all");
      return;
    }
    if (typeFilter !== "all" && selectedCategory.type !== typeFilter) {
      setCategoryFilter("all");
    }
  }, [activeCategories, categoryFilter, typeFilter]);

  const filteredOperations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return operations.filter((op) => {
      if (typeFilter !== "all" && op.type !== typeFilter) return false;
      if (categoryFilter !== "all" && op.categoryId !== categoryFilter)
        return false;
      if (query) {
        const noteMatch = op.note?.toLowerCase().includes(query);
        const categoryMatch = op.categoryName.toLowerCase().includes(query);
        if (!noteMatch && !categoryMatch) return false;
      }
      const opDate = op.date.slice(0, 10);
      if (dateFrom && opDate < dateFrom) return false;
      if (dateTo && opDate > dateTo) return false;
      return true;
    });
  }, [operations, typeFilter, categoryFilter, searchQuery, dateFrom, dateTo]);

  const displayOperations = limit
    ? filteredOperations.slice(0, limit)
    : filteredOperations;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTypeFilter("all");
              setCategoryFilter("all");
            }}
            className={`${typeButtonBase} ${
              typeFilter === "all" ? typeAllActive : typeAllBase
            }`}
            aria-pressed={typeFilter === "all"}
          >
            {t("filters.all")}
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter("expense");
              setCategoryFilter("all");
            }}
            className={`${typeButtonBase} ${
              typeFilter === "expense" ? typeExpenseActive : typeExpenseBase
            }`}
            aria-pressed={typeFilter === "expense"}
          >
            <MaterialIcon name="expense" className="h-4 w-4" />
            {t("filters.expenses")}
          </button>
          <button
            type="button"
            onClick={() => {
              setTypeFilter("income");
              setCategoryFilter("all");
            }}
            className={`${typeButtonBase} ${
              typeFilter === "income" ? typeIncomeActive : typeIncomeBase
            }`}
            aria-pressed={typeFilter === "income"}
          >
            <MaterialIcon name="income" className="h-4 w-4" />
            {t("filters.income")}
          </button>
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            className="sm:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:hover:bg-[#212121] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
            aria-pressed={showSearch}
            aria-label={t("filters.searchAndDate")}
            title={t("filters.searchAndDate")}
          >
            <MaterialIcon name="search" className="h-5 w-5" />
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSearch((prev) => !prev)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:hover:bg-[#212121] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
            aria-pressed={showSearch}
            aria-label={t("filters.searchAndDate")}
            title={t("filters.searchAndDate")}
          >
            <MaterialIcon name="search" className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-gray-200 text-gray-400 hover:text-[#d27b30] hover:bg-[#d27b30]/10 dark:border-[#2a2a2a] dark:text-[#a3a3a3] dark:hover:text-[#f0b27a] dark:hover:bg-[#d27b30]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
            aria-label="Помощь"
            title="Помощь"
          >
            <MaterialIcon name="help" className="h-5 w-5" variant="outlined" />
          </button>
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#d27b30] text-white rounded-full hover:bg-[#b56726] text-sm"
            >
              <MaterialIcon name="add" className="h-4 w-4" />
              {t("operations.add")}
            </button>
          )}
        </div>
      </div>

      {onAdd && (
        <button
          onClick={onAdd}
          className="sm:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 z-50 h-14 w-14 rounded-full bg-[#d27b30] text-white shadow-lg shadow-[#d27b30]/30 hover:bg-[#b56726] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] flex items-center justify-center"
          aria-label={t("operations.add")}
        >
          <MaterialIcon name="add" className="h-6 w-6 -translate-y-[1px]" />
        </button>
      )}

      <div className="bg-white dark:bg-[#1a1a1a] shadow rounded-lg p-6 text-left">
        <div className="space-y-6">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                {t("filters.categories")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={editCategoryHref}
                  className={`${categoryActionBase} ${categoryActionSecondary}`}
                  aria-label={t("categories.editAction")}
                  title={t("categories.editAction")}
                >
                  <MaterialIcon name="edit" className="h-3.5 w-3.5" />
                </Link>
                <Link
                  to={addCategoryHref}
                  className={`${categoryActionBase} ${categoryActionPrimary}`}
                  aria-label={t("categories.addCategory")}
                  title={t("categories.addCategory")}
                >
                  <MaterialIcon name="add" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-start">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`${chipBase} ${
                  categoryFilter === "all" ? chipAllActive : chipAllInactive
                }`}
                aria-pressed={categoryFilter === "all"}
              >
                {t("filters.all")}
              </button>
              {visibleCategories.map((cat) => {
                const isActive = categoryFilter === cat.id;
                const iconName = cat.type === "expense" ? "expense" : "income";
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={chipBase}
                    style={getCategoryStyle(cat.color, isActive)}
                    aria-pressed={isActive}
                  >
                    <MaterialIcon name={iconName} className="h-3.5 w-3.5" />
                    <span className="font-normal">{cat.name}</span>

                    <span className="text-[12px] font-bold opacity-80">
                      {formatCurrency(categoryTotals[cat.id] || 0)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showSearch && (
            <div className="grid gap-3 md:grid-cols-3">
              <div className="min-w-0">
                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                  {t("filters.search")}
                </label>
                <input
                  type="text"
                  placeholder={t("filters.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pf-input mt-2"
                />
              </div>
              <div className="min-w-0">
                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                  {t("filters.dateFrom")}
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pf-input mt-2"
                />
              </div>
              <div className="min-w-0">
                <label className="text-xs uppercase tracking-wide text-gray-500 dark:text-[#a3a3a3]">
                  {t("filters.dateTo")}
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pf-input mt-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <OperationsList
        operations={displayOperations}
        onEdit={onEdit}
        onDelete={onDelete}
        isLoading={isLoading}
      />
      <HelpModal helpType="filters" isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
