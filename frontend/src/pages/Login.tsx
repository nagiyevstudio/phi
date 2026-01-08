import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../store/auth';
import { authApi } from '../services/api';
import { useI18n } from '../i18n';

type LoginFormData = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const languageOptions: { value: 'ru' | 'az' | 'en'; label: string }[] = [
    { value: 'ru', label: t('settings.languageRu') },
    { value: 'az', label: t('settings.languageAz') },
    { value: 'en', label: t('settings.languageEn') },
  ];

  const languageButtonBase =
    'inline-flex items-center justify-center h-9 px-3 rounded-full border text-xs font-medium shadow-sm transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-[#d27b30] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-[#1a1a1a]';
  const languageButtonInactive =
    'border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/70 dark:hover:bg-[#212121]';
  const languageButtonActive = 'bg-[#d27b30] text-white border-[#d27b30] shadow-sm';

  useEffect(() => {
    document.title = `${t('login.title')} · ${t('common.appName')}`;
  }, [t]);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('login.validation.emailInvalid')),
        password: z.string().min(8, t('login.validation.passwordMin')),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.login(data);
      login(response.token, response.user);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.error'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pf-app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="inline-flex flex-wrap gap-2">
              {languageOptions.map((option) => {
                const isActive = language === option.value;
                return (
                  <label
                    key={option.value}
                    className={`${languageButtonBase} ${
                      isActive ? languageButtonActive : languageButtonInactive
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={option.value}
                      checked={isActive}
                      onChange={() => setLanguage(option.value)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-[#e5e7eb]">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-[#a3a3a3]">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-[#d27b30] hover:text-[#b56726]">
              {t('login.createAccount')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('login.emailLabel')}
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="pf-input"
                placeholder={t('login.emailPlaceholder')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('login.passwordLabel')}
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="pf-input"
                placeholder={t('login.passwordPlaceholder')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#d27b30] hover:bg-[#b56726] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d27b30] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('login.signingIn') : t('login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


