import type { FormEvent } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HOME_HERO_BADGES, HOME_HERO_PHOTO, HOME_HERO_RENTAL_OPTIONS, HOME_HERO_STATS } from '@/constants/homePageContent';
import { ROUTES } from '@/config/routes';
import type { RentalType } from '@/types/enums';

type HomeHeroProps = {
  query: string;
  onQueryChange: (value: string) => void;
  heroRentalType: RentalType;
  onHeroRentalTypeChange: (value: RentalType) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  heroCities: readonly string[];
  tagline: string;
  companyName: string;
};

const HomeHero = ({
  query,
  onQueryChange,
  heroRentalType,
  onHeroRentalTypeChange,
  onSearchSubmit,
  heroCities,
  tagline,
  companyName,
}: HomeHeroProps) => (
  <section className="relative overflow-hidden border-b border-slate-200/30 bg-slate-950 text-white">
    <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
    <div className="absolute right-0 top-8 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
    <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

    <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8 lg:pb-20 lg:pt-20">
      <div>
        <p className="mb-5 inline-flex rounded-full border border-blue-200/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
          {companyName}
        </p>
        <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Знайдіть ідеальне житло в Україні</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/90 sm:text-lg">{tagline}</p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          {HOME_HERO_BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 backdrop-blur"
            >
              {badge}
            </span>
          ))}
        </div>

        <form
          onSubmit={onSearchSubmit}
          className="mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border border-white/20 bg-white/90 p-2 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center"
        >
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {HOME_HERO_RENTAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onHeroRentalTypeChange(option.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                  heroRentalType === option.value
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <MapPin size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Місто, район, метро..."
              className="h-full w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Search size={16} />
            Знайти
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          {heroCities.map((city) => (
            <Link
              key={city}
              to={`${ROUTES.search}?city=${encodeURIComponent(city)}&rentalType=${heroRentalType}`}
              className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:border-white/40 hover:bg-white/20 hover:text-white"
            >
              {city}
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
          {HOME_HERO_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
              <p className="text-xl font-bold leading-none text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-blue-100/90 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur">
          <img src={HOME_HERO_PHOTO} alt="Панорама міста для оренди житла" className="h-full w-full rounded-[1.4rem] object-cover" />
          <div className="absolute inset-3 rounded-[1.4rem] bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/70 bg-white/90 p-4 text-slate-900 shadow-xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Ринок оренди</p>
            <p className="mt-1 text-xl font-bold">Знайдіть ідеальне житло в Україні</p>
            <p className="mt-1 text-sm text-slate-600">Реальні обʼєкти для коротких і довгих поїздок в одному каталозі.</p>
          </div>
        </div>

        <div className="absolute -left-6 top-14 hidden rounded-2xl border border-white/40 bg-white/85 p-4 text-slate-900 shadow-lg backdrop-blur sm:block">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Live update</p>
          <p className="mt-1 text-sm font-semibold">Оголошення оновлюються щохвилини</p>
        </div>
      </div>
    </div>
  </section>
);

export default HomeHero;
