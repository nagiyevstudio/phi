import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.png';
import { routes } from '../constants/routes';

interface AccessRequest {
  name: string;
  email: string;
  company: string;
  useCase: string;
  submittedAt: string;
}

const STORAGE_KEY = 'pf_access_requests';

const readRequests = (): AccessRequest[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => {
      if (!item || typeof item !== 'object') {
        return false;
      }
      return typeof item.email === 'string' && typeof item.useCase === 'string';
    }) as AccessRequest[];
  } catch {
    return [];
  }
};

export default function AccessRequestPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [useCase, setUseCase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Запрос доступа · Perfinance';
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !useCase.trim()) {
      setError('Укажи email и цель использования проекта.');
      return;
    }

    const now = new Date().toISOString();
    const payload: AccessRequest = {
      name: name.trim(),
      email: email.trim(),
      company: company.trim(),
      useCase: useCase.trim(),
      submittedAt: now,
    };

    const existing = readRequests();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([payload, ...existing]));
    setSubmittedAt(now);
    setName('');
    setEmail('');
    setCompany('');
    setUseCase('');
  };

  return (
    <div className="pf-landing min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link to={routes.landing} className="inline-flex items-center gap-3">
          <img src={logoUrl} alt="Perfinance" className="h-10 w-auto rounded-md" />
          <span className="pf-landing-logo text-base font-semibold sm:text-lg">Perfinance</span>
        </Link>

        <div className="pf-landing-card mt-8 p-6 text-left sm:p-8">
          <p className="pf-landing-kicker">Moderated onboarding</p>
          <h1 className="pf-landing-title mt-3 text-3xl sm:text-4xl">Запрос доступа к приложению</h1>
          <p className="mt-4 text-sm text-[#4f392b] dark:text-[#d6c9bf] sm:text-base">
            Открытая регистрация отключена. Оставь заявку, и после проверки я подключу доступ вручную.
          </p>

          {submittedAt ? (
            <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
              Заявка отправлена {new Date(submittedAt).toLocaleString()}. Я свяжусь с тобой после проверки.
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label htmlFor="request-name" className="mb-1 block text-sm font-medium">
                Имя
              </label>
              <input
                id="request-name"
                type="text"
                className="pf-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Например: Фаиг Нагиев"
              />
            </div>

            <div>
              <label htmlFor="request-email" className="mb-1 block text-sm font-medium">
                Email *
              </label>
              <input
                id="request-email"
                type="email"
                className="pf-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <label htmlFor="request-company" className="mb-1 block text-sm font-medium">
                Компания / проект
              </label>
              <input
                id="request-company"
                type="text"
                className="pf-input"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Например: Personal budgeting"
              />
            </div>

            <div>
              <label htmlFor="request-usecase" className="mb-1 block text-sm font-medium">
                Зачем тебе доступ? *
              </label>
              <textarea
                id="request-usecase"
                className="pf-textarea"
                value={useCase}
                onChange={(event) => setUseCase(event.target.value)}
                placeholder="Кратко опиши задачу и формат использования..."
                required
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#c96f29] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a85a1f]"
              >
                Отправить заявку
              </button>
              <Link
                to={routes.login}
                className="rounded-full border border-[#d0ad8b] px-6 py-3 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f6dfcc] dark:border-[#5a4332] dark:text-[#f8d3b1] dark:hover:bg-[#2b221c]"
              >
                У меня уже есть доступ
              </Link>
            </div>
          </form>

          <p className="mt-6 text-xs text-[#6a5342] dark:text-[#c9b9ab]">
            MVP-режим: заявки сохраняются локально в браузере. Следующий шаг - подключение серверной
            очереди заявок и статусов `pending / approved / rejected`.
          </p>
        </div>
      </div>
    </div>
  );
}
