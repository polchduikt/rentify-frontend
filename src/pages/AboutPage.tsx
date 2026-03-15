import { Award, Globe2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import aboutHeroIllustration from '@/assets/images/info/about-hero-illustration.svg';
import aboutWorkflowIllustration from '@/assets/images/info/about-workflow-illustration.svg';
import { ROUTES } from '@/config/routes';

const ABOUT_VALUES = [
  {
    icon: ShieldCheck,
    title: 'Безпека та довіра',
    description: 'Модерація оголошень, перевірка контенту та прозорі правила взаємодії між орендарями та власниками.',
  },
  {
    icon: Sparkles,
    title: 'Зручний досвід',
    description: 'Швидкий пошук, фільтри, карта та простий шлях від першого кліку до підтвердженого бронювання.',
  },
  {
    icon: Globe2,
    title: 'Фокус на Україні',
    description: 'Розвиваємо сервіс під реальні потреби українських міст, громад та локального ринку оренди.',
  },
] as const;

const ABOUT_STATS = [
  { value: '14 000+', label: 'активних оголошень на платформі' },
  { value: '180+', label: 'міст і громад у каталозі' },
  { value: '24/7', label: 'підтримка для користувачів' },
] as const;

const AboutPage = () => (
  <div className="bg-slate-50 py-10 sm:py-12">
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 text-white shadow-xl">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative p-7 sm:p-10 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
              <Sparkles size={14} />
              Про Rentify
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Створюємо сучасний ринок оренди житла в Україні
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 sm:text-base">
              Rentify поєднує орендарів і власників у єдиному просторі, де легко знайти житло на добу або на довгий
              термін, керувати бронюваннями та комунікацією без зайвої складності.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {ABOUT_STATS.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-blue-100/90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[280px]">
            <img src={aboutHeroIllustration} alt="Ілюстрація про Rentify" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {ABOUT_VALUES.map((value) => (
          <article
            key={value.title}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <value.icon size={22} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{value.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{value.description}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[260px]">
            <img
              src={aboutWorkflowIllustration}
              alt="Ілюстрація процесу роботи платформи"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="p-7 sm:p-9">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Що ми розвиваємо зараз</h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Users size={20} className="mt-0.5 text-blue-700" />
                <div>
                  <p className="font-semibold text-slate-900">Кращу взаємодію між сторонами</p>
                  <p className="mt-1 text-sm text-slate-600">Швидкі відповіді в чаті, зрозумілі статуси заявок та історія комунікації.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <Award size={20} className="mt-0.5 text-blue-700" />
                <div>
                  <p className="font-semibold text-slate-900">Якість оголошень</p>
                  <p className="mt-1 text-sm text-slate-600">Повніші анкети об’єктів, кращі фото та прозорі умови оренди в кожній картці.</p>
                </div>
              </div>
            </div>

            <Link
              to={ROUTES.search}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Переглянути оголошення
            </Link>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default AboutPage;
