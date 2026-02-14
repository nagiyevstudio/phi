import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../store/auth";
import { authApi } from "../services/api";
import { useI18n } from "../i18n";
import { routes } from "../constants/routes";

type RegisterFormData = {
  name?: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Register() {
  const { language, setLanguage, t } = useI18n();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const languageOptions: { value: "ru" | "az" | "en"; label: string }[] = [
    { value: "ru", label: t("settings.languageRu") },
    { value: "az", label: t("settings.languageAz") },
    { value: "en", label: t("settings.languageEn") },
  ];

  const languageButtonBase =
    "inline-flex items-center justify-center h-9 px-3 rounded-full border text-xs font-medium shadow-sm transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-[#d27b30] focus-within:ring-offset-2 focus-within:ring-offset-white dark:focus-within:ring-offset-[#1a1a1a]";
  const languageButtonInactive =
    "border-gray-200 text-gray-700 bg-white/80 hover:bg-gray-50 dark:border-[#2a2a2a] dark:text-[#d4d4d8] dark:bg-[#1a1a1a]/70 dark:hover:bg-[#212121]";
  const languageButtonActive =
    "bg-[#d27b30] text-white border-[#d27b30] shadow-sm";

  useEffect(() => {
    document.title = `${t("register.title")} - ${t("common.appName")}`;
  }, [t]);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .max(120, t("register.validation.nameTooLong"))
            .optional(),
          email: z.string().email(t("register.validation.emailInvalid")),
          password: z.string().min(8, t("register.validation.passwordMin")),
          confirmPassword: z
            .string()
            .min(8, t("register.validation.passwordMin")),
        })
        .refine((data) => data.password === data.confirmPassword, {
          path: ["confirmPassword"],
          message: t("register.validation.passwordMismatch"),
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.register({
        name: data.name?.trim() || null,
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      login(response.token, response.user);
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate(routes.app.root);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("register.error"));
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
            {t("register.title")}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-[#a3a3a3]">
            {t("register.subtitle")}
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
              <label htmlFor="name" className="sr-only">
                {t("register.nameLabel")}
              </label>
              <input
                {...register("name")}
                type="text"
                autoComplete="name"
                className="pf-input"
                placeholder={t("register.namePlaceholder")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                {t("register.emailLabel")}
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="pf-input"
                placeholder={t("register.emailPlaceholder")}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t("register.passwordLabel")}
              </label>
              <input
                {...register("password")}
                type="password"
                autoComplete="new-password"
                className="pf-input"
                placeholder={t("register.passwordPlaceholder")}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                {t("register.confirmPasswordLabel")}
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                autoComplete="new-password"
                className="pf-input"
                placeholder={t("register.confirmPasswordPlaceholder")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#d27b30] hover:bg-[#b56726] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d27b30] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("register.creating") : t("register.submit")}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-[#a3a3a3]">
          {t("register.goToLogin")}{" "}
          <Link to={routes.login} className="text-[#d27b30] hover:text-[#b56726]">
            {t("login.title")}
          </Link>
        </p>
      </div>
    </div>
  );
}
