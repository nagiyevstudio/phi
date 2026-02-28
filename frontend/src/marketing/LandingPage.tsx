import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoUrl from "../assets/logo.png";
import { routes } from "../constants/routes";
import { useI18n } from "../i18n";
import {
  getFeatureCards,
  getScreenshotPlaceholders,
  getWorkflowSteps,
} from "./landingContent";

export default function LandingPage() {
  const { t, language, setLanguage } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const featureCards = getFeatureCards(t);
  const workflowSteps = getWorkflowSteps(t);
  const screenshotPlaceholders = getScreenshotPlaceholders(t);
  const languageOptions: { value: "ru" | "az" | "en"; label: string }[] = [
    { value: "ru", label: t("settings.languageRu") },
    { value: "az", label: t("settings.languageAz") },
    { value: "en", label: t("settings.languageEn") },
  ];

  useEffect(() => {
    document.title = t("landing.meta.title");
  }, [t]);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="pf-landing relative min-h-screen overflow-x-hidden text-[#1f130c] dark:text-[#f3ece5]">
      <div className="pf-landing-glow" aria-hidden="true" />

      <header className="sticky top-0 z-40 border-b border-[#d6c1aa]/60 bg-[#f8ecdf]/85 backdrop-blur dark:border-[#3a3028] dark:bg-[#171210]/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            to={routes.landing}
            className="inline-flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <img
              src={logoUrl}
              alt={t("landing.brand")}
              className="h-10 w-auto rounded-md"
            />
            <span className="pf-landing-logo hidden text-base font-semibold sm:inline sm:text-lg">
              {t("landing.brand")}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-[#a95b1d]"
            >
              {t("landing.nav.features")}
            </a>
            <a
              href="#screenshots"
              className="transition-colors hover:text-[#a95b1d]"
            >
              {t("landing.nav.screenshots")}
            </a>
            <a
              href="#roadmap"
              className="transition-colors hover:text-[#a95b1d]"
            >
              {t("landing.nav.roadmap")}
            </a>
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to={routes.login}
              className="rounded-lg border border-[#cba37f] px-4 py-2 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f5ddc8] dark:border-[#4f3b2d] dark:text-[#f8d3b1] dark:hover:bg-[#2b211a]"
            >
              {t("landing.nav.login")}
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to={routes.login}
              className="rounded-lg border border-[#cba37f] px-3 py-1.5 text-xs font-semibold text-[#8a4714] transition-colors hover:bg-[#f5ddc8] dark:border-[#4f3b2d] dark:text-[#f8d3b1] dark:hover:bg-[#2b211a]"
              onClick={closeMobileMenu}
            >
              {t("landing.nav.login")}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#cba37f] bg-[#fff8f1] text-[#8a4714] dark:border-[#4f3b2d] dark:bg-[#211912] dark:text-[#f8d3b1]"
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="landing-mobile-menu"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              <span className="sr-only">Open menu</span>
              <span className="flex flex-col gap-1">
                <span className="h-0.5 w-4 rounded-full bg-current" />
                <span className="h-0.5 w-4 rounded-full bg-current" />
                <span className="h-0.5 w-4 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div
            id="landing-mobile-menu"
            className="border-t border-[#d6c1aa]/70 bg-[#f8ecdf]/95 px-4 py-3 dark:border-[#3a3028] dark:bg-[#171210]/95 md:hidden"
          >
            <nav className="flex flex-col gap-2 text-sm font-semibold">
              <a
                href="#features"
                className="rounded-xl px-3 py-2 hover:bg-[#f2e0d1] dark:hover:bg-[#2a211a]"
                onClick={closeMobileMenu}
              >
                {t("landing.nav.features")}
              </a>
              <a
                href="#screenshots"
                className="rounded-xl px-3 py-2 hover:bg-[#f2e0d1] dark:hover:bg-[#2a211a]"
                onClick={closeMobileMenu}
              >
                {t("landing.nav.screenshots")}
              </a>
              <a
                href="#roadmap"
                className="rounded-xl px-3 py-2 hover:bg-[#f2e0d1] dark:hover:bg-[#2a211a]"
                onClick={closeMobileMenu}
              >
                {t("landing.nav.roadmap")}
              </a>
            </nav>

            <div className="mt-3 flex flex-wrap items-center gap-2">
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
                          ? "bg-[#c96f29] text-white"
                          : "text-[#7f4c28] hover:bg-[#f4e1d0] dark:text-[#e7c6ab] dark:hover:bg-[#33271f]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <Link
                to={routes.accessRequest}
                className="rounded-lg bg-[#c96f29] px-4 py-2 text-xs font-semibold text-white"
                onClick={closeMobileMenu}
              >
                {t("landing.nav.requestAccess")}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <section className="grid items-center gap-8 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-16">
          <div>
            <p className="pf-landing-kicker">{t("landing.hero.kicker")}</p>
            <h1 className="pf-landing-title mt-4 text-3xl leading-tight sm:text-5xl lg:text-6xl">
              {t("landing.hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base text-[#4b3a2f] dark:text-[#d6c9bf] sm:text-lg">
              {t("landing.hero.description")}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                to={routes.accessRequest}
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#c96f29] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(172,84,20,0.3)] transition-transform hover:-translate-y-0.5 hover:bg-[#a85a1f] sm:w-auto"
              >
                {t("landing.hero.cta.request")}
              </Link>
              <Link
                to={routes.app.root}
                className="inline-flex w-full items-center justify-center rounded-lg border border-[#d0ad8b] px-6 py-3 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f6dfcc] dark:border-[#5a4332] dark:text-[#f8d3b1] dark:hover:bg-[#2b221c] sm:w-auto"
              >
                {t("landing.hero.cta.openApp")}
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="pf-landing-card px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5c3d] dark:text-[#d1a98a]">
                  {t("landing.hero.stats.format.label")}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {t("landing.hero.stats.format.value")}
                </p>
              </div>
              <div className="pf-landing-card px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5c3d] dark:text-[#d1a98a]">
                  {t("landing.hero.stats.access.label")}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {t("landing.hero.stats.access.value")}
                </p>
              </div>
              <div className="pf-landing-card px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5c3d] dark:text-[#d1a98a]">
                  {t("landing.hero.stats.next.label")}
                </p>
                <p className="mt-2 text-sm font-semibold">
                  {t("landing.hero.stats.next.value")}
                </p>
              </div>
            </div>
          </div>

          <div className="pf-landing-card p-4 sm:p-6">
            <img
              src="/assets/landing/hero-dashboard-placeholder.jpg"
              alt={`${t("landing.screenshots.placeholderPrefix")} ${t("landing.shot.dashboard.title")}`}
              className="pf-landing-shot w-full"
              loading="lazy"
            />
            <div className="mt-4 rounded-xl bg-white/80 p-4 text-left shadow-[0_4px_12px_rgba(57,39,25,0.07)] dark:bg-[#251e19]/80 dark:shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a673d] dark:text-[#d9b08b]">
                {t("landing.hero.placeholder.ready")}
              </p>
              <p className="mt-2 text-sm text-[#4f392b] dark:text-[#d6c9bf]">
                {t("landing.hero.placeholder.replacement")}
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="pf-landing-kicker">
                {t("landing.features.kicker")}
              </p>
              <h2 className="pf-landing-title mt-4 text-3xl sm:text-4xl">
                {t("landing.features.title")}
              </h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
              <article
                key={card.title}
                className="pf-landing-card p-6 text-left"
              >
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-16">
          <p className="pf-landing-kicker">{t("landing.workflow.kicker")}</p>
          <h2 className="pf-landing-title mt-4 text-3xl sm:text-4xl">
            {t("landing.workflow.title")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article
                key={step.title}
                className="pf-landing-card p-6 text-left"
              >
                <span className="block text-3xl font-bold tabular-nums text-[#c96f29]/25 dark:text-[#c96f29]/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="screenshots" className="pb-16">
          <p className="pf-landing-kicker">{t("landing.screenshots.kicker")}</p>
          <h2 className="pf-landing-title mt-4 text-3xl sm:text-4xl">
            {t("landing.screenshots.title")}
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-[#4f392b] dark:text-[#d6c9bf] sm:text-base">
            {t("landing.screenshots.description")}
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {screenshotPlaceholders.map((shot) => (
              <article
                key={shot.title}
                className="pf-landing-card overflow-hidden p-4 text-left sm:p-5"
              >
                <img
                  src={shot.image}
                  alt={`${t("landing.screenshots.placeholderPrefix")} ${shot.title}`}
                  className="pf-landing-shot w-full"
                  loading="lazy"
                />
                <h3 className="mt-4 text-xl font-semibold">{shot.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                  {shot.description}
                </p>
                <p className="mt-3 text-xs font-semibold text-[#9a673d] dark:text-[#d9b08b]">
                  {shot.subtitle}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="pb-16">
          <p className="pf-landing-kicker">{t("landing.roadmap.kicker")}</p>
          <h2 className="pf-landing-title mt-4 text-3xl sm:text-4xl">
            {t("landing.roadmap.title")}
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="pf-landing-card p-6 text-left">
              <h3 className="text-xl font-semibold">
                {t("landing.roadmap.mvp.title")}
              </h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                <li>{t("landing.roadmap.mvp.item1")}</li>
                <li>{t("landing.roadmap.mvp.item2")}</li>
                <li>{t("landing.roadmap.mvp.item3")}</li>
              </ul>
            </article>
            <article className="pf-landing-card p-6 text-left">
              <h3 className="text-xl font-semibold">
                {t("landing.roadmap.next.title")}
              </h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                <li>{t("landing.roadmap.next.item1")}</li>
                <li>{t("landing.roadmap.next.item2")}</li>
                <li>{t("landing.roadmap.next.item3")}</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="pf-landing-card p-6 text-left sm:p-8">
          <p className="pf-landing-kicker">{t("landing.cta.kicker")}</p>
          <h2 className="pf-landing-title mt-4 text-3xl sm:text-4xl">
            {t("landing.cta.title")}
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-[#4f392b] dark:text-[#d6c9bf] sm:text-base">
            {t("landing.cta.description")}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to={routes.accessRequest}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#c96f29] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a85a1f] sm:w-auto"
            >
              {t("landing.cta.submitRequest")}
            </Link>
            <Link
              to={routes.login}
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#d0ad8b] px-6 py-3 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f6dfcc] dark:border-[#5a4332] dark:text-[#f8d3b1] dark:hover:bg-[#2b221c] sm:w-auto"
            >
              {t("landing.cta.goToLogin")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d6c1aa]/60 dark:border-[#3a3028]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-[#9a7b65] dark:text-[#7a6456]">
            © 2026 {t("landing.brand")}. All rights reserved.
          </p>
          <div className="inline-flex items-center gap-1 rounded-md border border-[#d5b295] bg-[#fff8f1] p-1 dark:border-[#4f3b2d] dark:bg-[#211912]">
            {languageOptions.map((option) => {
              const isActive = language === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLanguage(option.value)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-[#c96f29] text-white"
                      : "text-[#7f4c28] hover:bg-[#f4e1d0] dark:text-[#e7c6ab] dark:hover:bg-[#33271f]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
}
