import { Clock3, MapPin, Send } from 'lucide-react';
import contactsHeroIllustration from '@/assets/images/info/contacts-hero-illustration.svg';
import contactsPartnershipIllustration from '@/assets/images/info/contacts-partnership-illustration.svg';
import { APP_CONTENT } from '@/constants/appContent';
import { CONTACT_CHANNELS } from '@/constants/infoPages';

const ContactsPage = () => (
  <div className="bg-slate-50 py-10 sm:py-12">
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-7 sm:p-10">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              <Send size={14} />
              Контакти
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">Ми на зв’язку, коли вам потрібно</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Пишіть або телефонуйте з будь-яких питань: пошук житла, бронювання, публікація оголошень, оплати та
              робота профілю.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Локація</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                  <MapPin size={16} className="text-blue-700" />
                  {APP_CONTENT.contacts.location}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Графік роботи</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                  <Clock3 size={16} className="text-blue-700" />
                  Щодня, 09:00 - 21:00
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px]">
            <img src={contactsHeroIllustration} alt="Ілюстрація контактів Rentify" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {CONTACT_CHANNELS.map((channel) => (
          <article
            key={channel.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <channel.icon size={22} />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{channel.title}</h2>
            <p className="mt-1 font-medium text-slate-800">{channel.value}</p>
            <p className="mt-2 text-sm text-slate-600">{channel.description}</p>
            <a
              href={channel.href}
              className="mt-5 inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              {channel.actionLabel}
            </a>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 text-white shadow-xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[240px]">
            <img
              src={contactsPartnershipIllustration}
              alt="Ілюстрація партнерств Rentify"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-7 sm:p-10">
            <h2 className="text-2xl font-bold sm:text-3xl">Запити для партнерств та медіа</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200 sm:text-base">
              Для бізнес-запитів, співпраці, інтеграцій і медіа звертайтесь окремо на адресу <strong>partners@rentify.app</strong>.
              Ми відповідаємо в робочі години протягом 1 робочого дня.
            </p>
            <a
              href="mailto:partners@rentify.app"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Написати для партнерства
            </a>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default ContactsPage;
