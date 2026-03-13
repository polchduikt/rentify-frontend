import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

type PopularCity = {
  name: string;
  query: string;
  image: string;
  listingsCount: number;
};

type PopularCitiesGridProps = {
  cities: PopularCity[];
};

const formatListingsCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace('.0', '')}k`;
  }
  return String(count);
};

const PopularCitiesGrid = ({ cities }: PopularCitiesGridProps) => (
  <section className="py-6">
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Популярні міста</h2>
          <p className="mt-2 text-sm text-slate-600">Оберіть місто та переходьте одразу до релевантних пропозицій.</p>
        </div>
        <Link
          to={ROUTES.search}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Відкрити весь каталог
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cities.map((city) => (
          <Link
            key={city.name}
            to={`${ROUTES.search}?city=${encodeURIComponent(city.query)}`}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900"
          >
            <img
              src={city.image}
              alt={`Оренда житла у місті ${city.name}`}
              className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-slate-900/5" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-medium text-slate-100/90">
                  <MapPin size={14} />
                  {city.name}
                </p>
                <p className="mt-1 text-lg font-bold">{formatListingsCount(city.listingsCount)}+ оголошень</p>
              </div>
              <span className="rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                Перейти
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default PopularCitiesGrid;
