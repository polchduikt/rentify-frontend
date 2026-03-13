import { ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_HOST_PHOTO, HOME_HOST_STATS } from '@/constants/homePageContent';
import { ROUTES } from '@/config/routes';

const HomeHostStatsSection = () => (
  <section className="py-6">
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        <div className="p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
            <Building2 size={14} />
            Для власників
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Здайте своє житло швидше і прозоро</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Керуйте оголошенням, заявками та календарем оренди в одному кабінеті. Усі ключові метрики видно відразу.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {HOME_HOST_STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <Link
            to={ROUTES.createProperty}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Стати власником на Rentify
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="relative min-h-[280px]">
          <img src={HOME_HOST_PHOTO} alt="Власник публікує оголошення про оренду" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-900/15 to-transparent" />
        </div>
      </div>
    </div>
  </section>
);

export default HomeHostStatsSection;
