import { ArrowRight, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_MAP_PHOTO } from '@/constants/homePageContent';
import { ROUTES } from '@/config/routes';

const HomeMapEntrySection = () => (
  <section className="py-6">
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative order-2 min-h-[260px] lg:order-1">
          <img src={HOME_MAP_PHOTO} alt="Оголошення на мапі" className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 to-slate-900/15 lg:bg-gradient-to-r" />
          <div className="absolute inset-0 flex items-end p-6">
            <p className="text-sm font-medium text-white/90">Досліджуйте локації візуально та знаходьте житло у потрібному районі.</p>
          </div>
        </div>
        <div className="order-1 p-6 sm:p-8 lg:order-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
            <Map size={14} />
            Оголошення на мапі
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Перейдіть у map-пошук</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Перемикайтесь на карту, щоб бачити пропозиції по районах і швидко оцінювати локацію перед бронюванням.
          </p>
          <Link
            to={ROUTES.searchMap}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Відкрити карту
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default HomeMapEntrySection;
