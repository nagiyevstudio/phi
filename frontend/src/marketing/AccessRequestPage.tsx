import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.png';
import { routes } from '../constants/routes';
import { useI18n } from '../i18n';

interface AccessRequest {
  name: string;
  email: string;
  company: string;
  useCase: string;
  submittedAt: string;
}

const STORAGE_KEY = 'phi_access_requests';

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
  const { t, language, setLanguage } = useI18n();
  const languageOptions: { value: 'ru' | 'az' | 'en'; label: string }[] = [
    { value: 'ru', label: t('settings.languageRu') },
    { value: 'az', label: t('settings.languageAz') },
    { value: 'en', label: t('settings.languageEn') },
  ];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [useCase, setUseCase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  useEffect(() => {
    document.title = t('access.meta.title');
  }, [t]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !useCase.trim()) {
      setError(t('access.error.required'));
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={routes.landing} className="inline-flex items-center gap-3">
            <img src={logoUrl} alt={t('access.brand')} className="h-10 w-auto rounded-md" />
            <span className="pf-landing-logo text-base font-semibold sm:text-lg">{t('access.brand')}</span>
          </Link>
          <div className="inline-flex items-center gap-1 rounded-full border border-[#d5b295] bg-[#fff8f1] p-1 dark:border-[#4f3b2d] dark:bg-[#211912]">
            {languageOptions.map((option) => {
              const isActive = language === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#c96f29] text-white'
                      : 'text-[#7f4c28] hover:bg-[#f4e1d0] dark:text-[#e7c6ab] dark:hover:bg-[#33271f]'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pf-landing-card mt-8 p-6 text-left sm:p-8">
          <p className="pf-landing-kicker">{t('access.kicker')}</p>
          <h1 className="pf-landing-title mt-3 text-3xl sm:text-4xl">{t('access.title')}</h1>
          <p className="mt-4 text-sm text-[#4f392b] dark:text-[#d6c9bf] sm:text-base">
            {t('access.description')}
          </p>

          {submittedAt ? (
            <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
              {t('access.success', { datetime: new Date(submittedAt).toLocaleString() })}
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
                {t('access.form.name.label')}
              </label>
              <input
                id="request-name"
                type="text"
                className="pf-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t('access.form.name.placeholder')}
              />
            </div>

            <div>
              <label htmlFor="request-email" className="mb-1 block text-sm font-medium">
                {t('access.form.email.label')}
              </label>
              <input
                id="request-email"
                type="email"
                className="pf-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t('access.form.email.placeholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="request-company" className="mb-1 block text-sm font-medium">
                {t('access.form.company.label')}
              </label>
              <input
                id="request-company"
                type="text"
                className="pf-input"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder={t('access.form.company.placeholder')}
              />
            </div>

            <div>
              <label htmlFor="request-usecase" className="mb-1 block text-sm font-medium">
                {t('access.form.useCase.label')}
              </label>
              <textarea
                id="request-usecase"
                className="pf-textarea"
                value={useCase}
                onChange={(event) => setUseCase(event.target.value)}
                placeholder={t('access.form.useCase.placeholder')}
                required
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#c96f29] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a85a1f]"
              >
                {t('access.form.submit')}
              </button>
              <Link
                to={routes.login}
                className="rounded-full border border-[#d0ad8b] px-6 py-3 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f6dfcc] dark:border-[#5a4332] dark:text-[#f8d3b1] dark:hover:bg-[#2b221c]"
              >
                {t('access.form.hasAccess')}
              </Link>
            </div>
          </form>

          <p className="mt-6 text-xs text-[#6a5342] dark:text-[#c9b9ab]">
            {t('access.footer.note')}
          </p>
        </div>
      </div>
    </div>
  );
}
