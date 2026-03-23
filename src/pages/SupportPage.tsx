import { CircleAlert, LifeBuoy, Mail, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import supportFaqIllustration from '@/assets/images/info/support-faq-illustration.svg';
import supportHeroIllustration from '@/assets/images/info/support-hero-illustration.svg';
import { APP_CONTENT } from '@/constants/appContent';
import { SUPPORT_FAQ, SUPPORT_TOPICS } from '@/constants/infoPages';
import { ROUTES } from '@/config/routes';

const SupportPage = () => (
  <div className="bg-slate-50 py-10 sm:py-12">
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-7 sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              <LifeBuoy size={14} />
              Підтримка Rentify
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">Допомагаємо швидко вирішувати питання</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Якщо виникли складнощі з орендою, оголошеннями або акаунтом, команда підтримки на зв’язку щодня.
              Опишіть проблему і ми підкажемо найкоротший шлях до рішення.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${APP_CONTENT.contacts.phone.replace(/\s|\(|\)|-/g, '')}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
              >
                <PhoneCall size={16} />
                {APP_CONTENT.contacts.phone}
              </a>
              <a
                href={`mailto:${APP_CONTENT.contacts.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                <Mail size={16} />
                {APP_CONTENT.contacts.email}
              </a>
            </div>
          </div>

          <div className="relative min-h-[280px]">
            <img src={supportHeroIllustration} alt="Ілюстрація підтримки Rentify" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {SUPPORT_TOPICS.map((topic) => (
          <article
            key={topic.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <topic.icon size={22} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{topic.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{topic.description}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[250px]">
            <img src={supportFaqIllustration} alt="Ілюстрація блоку частих питань" className="h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="p-7 sm:p-9">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Часті питання</h2>
            <div className="mt-5 space-y-3">
              {SUPPORT_FAQ.map((item) => (
                <details key={item.question} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 open:bg-white">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-sm font-semibold text-slate-900">
                    <span>{item.question}</span>
                    <span className="rounded-full bg-slate-200 p-1 text-slate-600 transition group-open:rotate-45 group-open:bg-blue-100 group-open:text-blue-700">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
            <Link
              to={ROUTES.contacts}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Потрібна інша допомога
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 sm:p-6">
        <p className="flex items-start gap-2 text-sm font-medium sm:text-base">
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          Якщо помітили підозріле оголошення або шахрайські дії, негайно зверніться в підтримку та вкажіть посилання
          на об’єкт.
        </p>
      </section>
    </div>
  </div>
);

export default SupportPage;
