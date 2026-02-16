import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Category, CreateOperationRequest } from '../../services/api';
import MaterialIcon from '../common/MaterialIcon';
import HelpModal from '../common/HelpModal';
import { useI18n } from '../../i18n';

const isIOSSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const webkit = /WebKit/.test(ua);
  return iOS && webkit;
};

type OperationFormData = {
  type: 'expense' | 'income';
  amountMinor: number;
  categoryId: string;
  date: string;
  note?: string;
};

interface OperationFormProps {
  operation?: {
    id: string;
    type: 'expense' | 'income';
    amountMinor: number;
    categoryId: string;
    date: string;
    note?: string | null;
  } | null;
  categories: Category[];
  onSubmit: (data: CreateOperationRequest) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}

const padTimeValue = (value: number) => String(value).padStart(2, '0');

const getLocalDateTimeValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${padTimeValue(now.getMonth() + 1)}-${padTimeValue(
    now.getDate()
  )}T${padTimeValue(now.getHours())}:${padTimeValue(now.getMinutes())}`;
};

const normalizeDateTimeValue = (value?: string | null) => {
  if (!value) {
    return getLocalDateTimeValue();
  }

  const normalized = value.replace(' ', 'T');
  if (normalized.length >= 16) {
    return normalized.slice(0, 16);
  }

  if (normalized.length === 10) {
    return `${normalized}T00:00`;
  }

  return normalized;
};

const splitDateTimeValue = (value?: string | null) => {
  const normalized = normalizeDateTimeValue(value);
  const [datePart = '', timePart = '00:00'] = normalized.split('T');
  return {
    datePart,
    timePart: timePart.slice(0, 5),
  };
};

const NOTE_TEMPLATES_KEY = 'pf.note-templates.v1';
const NOTE_TEMPLATES_LIMIT = 8;
const NOTE_SUGGESTIONS_LIMIT = 5;

const readNoteTemplates = (): Record<string, string[]> => {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const raw = localStorage.getItem(NOTE_TEMPLATES_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return parsed as Record<string, string[]>;
  } catch {
    return {};
  }
};

const writeNoteTemplates = (templates: Record<string, string[]>) => {
  try {
    localStorage.setItem(NOTE_TEMPLATES_KEY, JSON.stringify(templates));
  } catch {
    // ignore storage errors
  }
};

const addNoteTemplate = (categoryId: string, note: string) => {
  const normalized = note.trim();
  if (!normalized) {
    return;
  }
  const templates = readNoteTemplates();
  const existing = templates[categoryId] ?? [];
  const filtered = existing.filter(
    (item) => item.trim().toLowerCase() !== normalized.toLowerCase()
  );
  templates[categoryId] = [normalized, ...filtered].slice(0, NOTE_TEMPLATES_LIMIT);
  writeNoteTemplates(templates);
};

export default function OperationForm({
  operation,
  categories,
  onSubmit,
  onCancel,
  onDelete,
}: OperationFormProps) {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [amountInput, setAmountInput] = useState('0');
  const [showHelp, setShowHelp] = useState(false);
  const previousType = useRef<OperationFormData['type'] | null>(null);
  const actionBase =
    "inline-flex items-center gap-2 h-10 px-3 rounded-full text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#1a1a1a]";
  const actionDelete = `${actionBase} bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-300`;
  const actionConfirm = `${actionBase} bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300`;
  const actionCancel =
    `${actionBase} bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-[#1f1f1f]/70 dark:text-[#d4d4d8] dark:hover:bg-[#252525]`;
  const actionPrimary = `${actionBase} px-4 bg-[#d27b30] text-white hover:bg-[#b56726]`;
  const typeButtonBase =
    'inline-flex items-center justify-center h-10 px-4 rounded-full border text-sm font-medium shadow-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-gray-800';
  const typeExpense =
    `${typeButtonBase} border-red-200 text-red-700 bg-red-50/60 hover:bg-red-100/70 dark:border-red-500/40 dark:text-red-200 dark:bg-red-500/10 peer-checked:bg-red-600 peer-checked:text-white peer-checked:border-red-600`;
  const typeIncome =
    `${typeButtonBase} border-emerald-200 text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 dark:border-emerald-500/40 dark:text-emerald-200 dark:bg-emerald-500/10 peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:border-emerald-600`;

  const operationSchema = useMemo(
    () =>
      z.object({
        type: z.enum(['expense', 'income']),
        amountMinor: z.number().positive(t('operationForm.validation.amountPositive')),
        categoryId: z.string().uuid(t('operationForm.validation.categoryRequired')),
        date: z
          .string()
          .regex(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
            t('operationForm.validation.dateInvalid')
          ),
        note: z.string().optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OperationFormData>({
    resolver: zodResolver(operationSchema),
    defaultValues: operation
      ? {
          type: operation.type,
          amountMinor: operation.amountMinor, // В минорных единицах для хранения
          categoryId: operation.categoryId,
          date: normalizeDateTimeValue(operation.date),
          note: operation.note || '',
        }
      : {
          type: 'expense',
          amountMinor: 0,
          categoryId: '',
          date: getLocalDateTimeValue(),
          note: '',
        },
  });

  const amountValue = watch('amountMinor');
  const displayAmount = amountValue ? String(amountValue / 100) : '0';

  const selectedType = watch('type');
  const selectedCategoryId = watch('categoryId');
  const watchedDate = watch('date');
  const noteValue = watch('note') ?? '';
  const isIOSNativePickerFallback = useMemo(() => isIOSSafari(), []);
  const { datePart, timePart } = useMemo(
    () => splitDateTimeValue(watchedDate),
    [watchedDate]
  );
  const noteSuggestions = useMemo(() => {
    if (!selectedCategoryId) {
      return [];
    }
    const templates = readNoteTemplates();
    const items = templates[selectedCategoryId] ?? [];
    if (!items.length) {
      return [];
    }
    const query = noteValue.trim().toLowerCase();
    const filtered = query
      ? items.filter((item) => item.toLowerCase().includes(query))
      : items;
    return filtered.slice(0, NOTE_SUGGESTIONS_LIMIT);
  }, [noteValue, selectedCategoryId]);

  useEffect(() => {
    if (previousType.current === null) {
      previousType.current = selectedType;
      return;
    }
    if (previousType.current !== selectedType) {
      setValue('categoryId', '');
      previousType.current = selectedType;
    }
  }, [selectedType, setValue]);

  useEffect(() => {
    if (!isAmountFocused) {
      setAmountInput(displayAmount);
    }
  }, [displayAmount, isAmountFocused]);

  const onFormSubmit = async (data: OperationFormData) => {
    try {
      setIsLoading(true);
      await onSubmit({
        type: data.type,
        amountMinor: data.amountMinor,
        categoryId: data.categoryId,
        date: data.date,
        note: data.note,
      });
      if (data.categoryId && data.note) {
        addNoteTemplate(data.categoryId, data.note);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        setIsLoading(true);
        await onDelete();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const currentFilteredCategories = categories.filter((cat) => cat.type === selectedType);
  const updateDateField = (nextDatePart: string, nextTimePart: string) => {
    if (!nextDatePart || !nextTimePart) {
      return;
    }
    setValue('date', `${nextDatePart}T${nextTimePart}`, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#120c08]/70 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto w-[92vw] max-w-lg p-6 sm:p-7 border shadow-xl rounded-3xl bg-white dark:bg-[#1a1a1a]">
        <button
          type="button"
          onClick={onCancel}
          className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-[#d4d4d8] dark:hover:bg-[#252525] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <MaterialIcon name="close" className="h-7 w-7" />
        </button>
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">
            {operation ? t('operationForm.editTitle') : t('operationForm.addTitle')}
          </h3>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-[#d27b30] hover:bg-[#d27b30]/10 dark:text-[#a3a3a3] dark:hover:text-[#f0b27a] dark:hover:bg-[#d27b30]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d27b30]"
            aria-label="Помощь"
            title="Помощь"
          >
            <MaterialIcon name="help" className="h-5 w-5" variant="outlined" />
          </button>
        </div>
        <HelpModal helpType="addOperation" isOpen={showHelp} onClose={() => setShowHelp(false)} />

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8]">
              {t('operationForm.type')}
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <label>
                <input
                  type="radio"
                  value="expense"
                  {...register('type')}
                  className="peer sr-only"
                />
                <span className={typeExpense}>{t('operations.typeExpense')}</span>
              </label>
              <label>
                <input
                  type="radio"
                  value="income"
                  {...register('type')}
                  className="peer sr-only"
                />
                <span className={typeIncome}>{t('operations.typeIncome')}</span>
              </label>
            </div>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8]">
              {t('operationForm.amount')}
            </label>
            <div className="relative mt-2">
              <input
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amountInput}
                onFocus={() => {
                  setIsAmountFocused(true);
                  const normalized = amountInput.replace(',', '.');
                  const numericValue = parseFloat(normalized);
                  if (!amountInput || (!isNaN(numericValue) && numericValue === 0)) {
                    setAmountInput('');
                  }
                }}
                onBlur={() => {
                  setIsAmountFocused(false);
                  const normalized = amountInput.replace(',', '.').trim();
                  const numericValue = parseFloat(normalized);
                  if (!normalized || isNaN(numericValue)) {
                    setValue('amountMinor', 0, { shouldValidate: false });
                    setAmountInput('0');
                  } else {
                    setValue('amountMinor', Math.round(numericValue * 100), {
                      shouldValidate: true,
                    });
                  }
                }}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  setAmountInput(rawValue);
                  const normalized = rawValue.replace(',', '.');
                  if (!normalized) {
                    setValue('amountMinor', 0, { shouldValidate: false });
                    return;
                  }
                  const aznValue = parseFloat(normalized);
                  if (!isNaN(aznValue)) {
                    setValue('amountMinor', Math.round(aznValue * 100), {
                      shouldValidate: true,
                    });
                  }
                }}
                className="pf-input h-14 text-center text-3xl font-semibold tracking-tight pr-12"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs uppercase tracking-wide text-gray-400 dark:text-[#ad8f7a]">
                ₼
              </span>
            </div>
            {errors.amountMinor && (
              <p className="mt-1 text-sm text-red-600">{errors.amountMinor.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8]">
              {t('operationForm.category')}
            </label>
            <select
              {...register('categoryId')}
              className="pf-select mt-1"
            >
              <option value="">{t('operationForm.categoryPlaceholder')}</option>
              {currentFilteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8]">
              {t('operationForm.dateTime')}
            </label>
            <input type="hidden" {...register('date')} />
            {isIOSNativePickerFallback ? (
              <div className="mt-1 grid grid-cols-[minmax(0,1fr)_7.25rem] gap-2">
                <input
                  type="date"
                  value={datePart}
                  onChange={(event) => updateDateField(event.target.value, timePart)}
                  className="pf-input min-w-0"
                />
                <input
                  type="time"
                  value={timePart}
                  onChange={(event) => updateDateField(datePart, event.target.value)}
                  className="pf-input min-w-0"
                  step={60}
                />
              </div>
            ) : (
              <input
                type="datetime-local"
                value={normalizeDateTimeValue(watchedDate)}
                onChange={(event) =>
                  setValue('date', normalizeDateTimeValue(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="pf-input mt-1"
              />
            )}
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-[#d4d4d8]">
              {t('operationForm.note')}
            </label>
            <textarea
              {...register('note')}
              rows={3}
              className="pf-textarea mt-1"
            />
            {noteSuggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-[#a3a3a3]">
                <span className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-[#ad8f7a]">
                  {t('operationForm.suggestions')}
                </span>
                {noteSuggestions.map((note, index) => (
                  <span
                    key={`${note}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setValue('note', note, { shouldDirty: true })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        setValue('note', note, { shouldDirty: true });
                      }
                    }}
                    className="cursor-pointer text-gray-600 hover:text-gray-900 dark:text-[#d4d4d8] dark:hover:text-white"
                  >
                    {note}
                    {index < noteSuggestions.length - 1 && (
                      <span className="text-gray-300 dark:text-[#7b5d4d]"> · </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {operation && onDelete && (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className={actionDelete}
                    >
                      <MaterialIcon name="delete" className="h-4 w-4" />
                      {t('common.delete')}
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className={`${actionConfirm} disabled:opacity-50`}
                      >
                        <MaterialIcon name="check" className="h-4 w-4" />
                        {t('common.confirm')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className={actionCancel}
                      >
                        <MaterialIcon name="close" className="h-4 w-4" />
                        {t('common.cancel')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className={actionCancel}
              >
                <MaterialIcon name="close" className="h-4 w-4" />
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`${actionPrimary} disabled:opacity-50`}
              >
                <MaterialIcon name="check" className="h-4 w-4" />
                {isLoading ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
