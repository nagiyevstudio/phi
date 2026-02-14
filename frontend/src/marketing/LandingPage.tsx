import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.png';
import { routes } from '../constants/routes';
import { featureCards, screenshotPlaceholders, workflowSteps } from './landingContent';

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Perfinance · Финансовый cockpit для личного и командного учёта';
  }, []);

  return (
    <div className="pf-landing relative min-h-screen overflow-x-hidden text-[#1f130c] dark:text-[#f3ece5]">
      <div className="pf-landing-glow" aria-hidden="true" />

      <header className="sticky top-0 z-40 border-b border-[#d6c1aa]/60 bg-[#f8ecdf]/85 backdrop-blur dark:border-[#3a3028] dark:bg-[#171210]/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to={routes.landing} className="inline-flex items-center gap-3">
            <img src={logoUrl} alt="Perfinance" className="h-10 w-auto rounded-md" />
            <span className="pf-landing-logo text-base font-semibold sm:text-lg">Perfinance</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="#features" className="hover:text-[#a95b1d] transition-colors">
              Возможности
            </a>
            <a href="#screenshots" className="hover:text-[#a95b1d] transition-colors">
              Скриншоты
            </a>
            <a href="#roadmap" className="hover:text-[#a95b1d] transition-colors">
              Доступ и план
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to={routes.login}
              className="rounded-full border border-[#cba37f] px-4 py-2 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f5ddc8] dark:border-[#4f3b2d] dark:text-[#f8d3b1] dark:hover:bg-[#2b211a]"
            >
              Login
            </Link>
            <Link
              to={routes.accessRequest}
              className="rounded-full bg-[#c96f29] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(166,82,19,0.35)] transition-colors hover:bg-[#a85a1f]"
            >
              Запросить доступ
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="pf-landing-kicker">Portfolio landing / Product showcase</p>
            <h1 className="pf-landing-title mt-4 text-4xl leading-tight sm:text-5xl lg:text-6xl">
              Финансовый центр управления для дисциплины, а не для отчётности ради отчётности
            </h1>
            <p className="mt-5 max-w-xl text-base text-[#4b3a2f] dark:text-[#d6c9bf] sm:text-lg">
              Perfinance помогает контролировать бюджет в ежедневном режиме: лимиты, операции,
              аналитика и прогнозы в одном интерфейсе.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to={routes.accessRequest}
                className="rounded-full bg-[#c96f29] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(172,84,20,0.35)] transition-transform hover:-translate-y-0.5 hover:bg-[#a85a1f]"
              >
                Оставить заявку
              </Link>
              <Link
                to={routes.app.root}
                className="rounded-full border border-[#d0ad8b] px-6 py-3 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f6dfcc] dark:border-[#5a4332] dark:text-[#f8d3b1] dark:hover:bg-[#2b221c]"
              >
                Открыть приложение
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="pf-landing-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5c3d] dark:text-[#d1a98a]">
                  Формат
                </p>
                <p className="mt-2 text-sm font-semibold">Web App + Mobile UX</p>
              </div>
              <div className="pf-landing-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5c3d] dark:text-[#d1a98a]">
                  Доступ
                </p>
                <p className="mt-2 text-sm font-semibold">Модерация заявок</p>
              </div>
              <div className="pf-landing-card px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[#8a5c3d] dark:text-[#d1a98a]">
                  Следующий шаг
                </p>
                <p className="mt-2 text-sm font-semibold">Подписка и роли</p>
              </div>
            </div>
          </div>

          <div className="pf-landing-card p-4 sm:p-6">
            <img
              src="/assets/landing/hero-dashboard-placeholder.svg"
              alt="Плейсхолдер главного скриншота дашборда"
              className="pf-landing-shot w-full"
              loading="lazy"
            />
            <div className="mt-4 rounded-2xl bg-white/80 p-4 text-left shadow-[0_8px_16px_rgba(57,39,25,0.08)] dark:bg-[#251e19]/80 dark:shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a673d] dark:text-[#d9b08b]">
                Placeholder ready
              </p>
              <p className="mt-2 text-sm text-[#4f392b] dark:text-[#d6c9bf]">
                Файл для замены: <code>frontend/public/assets/landing/hero-dashboard-placeholder.svg</code>
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="pb-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="pf-landing-kicker">Core value</p>
              <h2 className="pf-landing-title mt-3 text-3xl sm:text-4xl">Ключевые возможности</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
              <article key={card.title} className="pf-landing-card p-5 text-left">
                <h3 className="text-xl font-semibold">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-16">
          <p className="pf-landing-kicker">How it works</p>
          <h2 className="pf-landing-title mt-3 text-3xl sm:text-4xl">Как это работает</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflowSteps.map((step) => (
              <article key={step.title} className="pf-landing-card p-5 text-left">
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="screenshots" className="pb-16">
          <p className="pf-landing-kicker">Visuals</p>
          <h2 className="pf-landing-title mt-3 text-3xl sm:text-4xl">Скриншоты продукта</h2>
          <p className="mt-4 max-w-3xl text-sm text-[#4f392b] dark:text-[#d6c9bf] sm:text-base">
            Ниже подготовлены плейсхолдеры. Ты можешь заменить их своими финальными изображениями без
            изменений кода, сохранив те же имена файлов.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {screenshotPlaceholders.map((shot) => (
              <article key={shot.title} className="pf-landing-card overflow-hidden p-4 text-left sm:p-5">
                <img
                  src={shot.image}
                  alt={`Плейсхолдер: ${shot.title}`}
                  className="pf-landing-shot w-full"
                  loading="lazy"
                />
                <h3 className="mt-4 text-xl font-semibold">{shot.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                  {shot.description}
                </p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#9a673d] dark:text-[#d9b08b]">
                  Заменить на: {shot.replacementFile}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="roadmap" className="pb-16">
          <p className="pf-landing-kicker">Access model</p>
          <h2 className="pf-landing-title mt-3 text-3xl sm:text-4xl">Доступ и развитие</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="pf-landing-card p-6 text-left">
              <h3 className="text-xl font-semibold">MVP сейчас</h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                <li>Только `Login` для уже одобренных пользователей.</li>
                <li>Отдельная форма `Запросить доступ` на лендинге.</li>
                <li>Ручная модерация заявок и подключение пользователей вручную.</li>
              </ul>
            </article>
            <article className="pf-landing-card p-6 text-left">
              <h3 className="text-xl font-semibold">Следующая итерация</h3>
              <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#4f392b] dark:text-[#d6c9bf]">
                <li>Статусы заявок: `pending`, `approved`, `rejected`.</li>
                <li>Подключение подписки с лимитами по планам.</li>
                <li>Ролевая модель доступа и self-service onboarding.</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="pf-landing-card rounded-[2rem] p-6 text-left sm:p-8">
          <p className="pf-landing-kicker">Call to action</p>
          <h2 className="pf-landing-title mt-3 text-3xl sm:text-4xl">
            Хочешь протестировать проект или посмотреть демо под твою задачу?
          </h2>
          <p className="mt-4 max-w-3xl text-sm text-[#4f392b] dark:text-[#d6c9bf] sm:text-base">
            Оставь заявку, опиши контекст использования и ожидаемый результат. После модерации открою
            доступ и помогу с настройкой.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={routes.accessRequest}
              className="rounded-full bg-[#c96f29] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#a85a1f]"
            >
              Отправить заявку
            </Link>
            <Link
              to={routes.login}
              className="rounded-full border border-[#d0ad8b] px-6 py-3 text-sm font-semibold text-[#8a4714] transition-colors hover:bg-[#f6dfcc] dark:border-[#5a4332] dark:text-[#f8d3b1] dark:hover:bg-[#2b221c]"
            >
              Перейти к логину
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
