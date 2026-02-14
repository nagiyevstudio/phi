import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import ru from './locales/ru.json';
import az from './locales/az.json';
import en from './locales/en.json';

export type Language = 'ru' | 'az' | 'en';

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tPlural: (key: string, count: number, params?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'pf-language';
const DEFAULT_LANGUAGE: Language = 'en';
const LOCALE_MAP: Record<Language, string> = {
  ru: 'ru-RU',
  az: 'az-AZ',
  en: 'en-US',
};

const translations: Record<Language, Record<string, string | string[]>> = {
  ru,
  az,
  en,
};

const pluralRules: Record<Language, Intl.PluralRules> = {
  ru: new Intl.PluralRules('ru-RU'),
  az: new Intl.PluralRules('az-AZ'),
  en: new Intl.PluralRules('en-US'),
};

const normalizeLanguage = (value: string | null): Language => {
  if (value === 'ru' || value === 'az' || value === 'en') {
    return value;
  }
  return DEFAULT_LANGUAGE;
};

export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  return normalizeLanguage(localStorage.getItem(STORAGE_KEY));
};

export const setStoredLanguage = (language: Language) => {
  localStorage.setItem(STORAGE_KEY, language);
};

let currentLanguage: Language = getStoredLanguage();

export const getCurrentLanguage = (): Language => currentLanguage;

export const getLocale = (language: Language = currentLanguage): string => LOCALE_MAP[language];

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? ''));
};

const lookup = (language: Language, key: string): string => {
  const dict = translations[language];
  if (dict && key in dict) {
    const value = dict[key];
    // Если значение - массив, возвращаем ключ (для функции t это ошибка)
    // Массивы должны обрабатываться отдельно
    return Array.isArray(value) ? key : String(value);
  }
  const fallback = translations[DEFAULT_LANGUAGE];
  if (fallback && key in fallback) {
    const value = fallback[key];
    return Array.isArray(value) ? key : String(value);
  }
  return key;
};

const translate = (language: Language, key: string, params?: Record<string, string | number>) =>
  interpolate(lookup(language, key), params);

const translatePlural = (
  language: Language,
  key: string,
  count: number,
  params?: Record<string, string | number>
) => {
  const rule = pluralRules[language].select(count);
  const value = lookup(language, `${key}.${rule}`);
  const fallback = lookup(language, `${key}.other`);
  const template = value !== `${key}.${rule}` ? value : fallback;
  return interpolate(template, { count, ...params });
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => getStoredLanguage());

  useEffect(() => {
    currentLanguage = language;
    setStoredLanguage(language);
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language]
  );

  const tPlural = useCallback(
    (key: string, count: number, params?: Record<string, string | number>) =>
      translatePlural(language, key, count, params),
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      tPlural,
    }),
    [language, t, tPlural]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
