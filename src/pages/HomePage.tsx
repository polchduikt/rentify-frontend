import { ChevronRight, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomeSectionHeader from '@/components/home/HomeSectionHeader';
import PropertySlider from '@/components/home/PropertySlider';
import { APP_CONTENT, FEATURES, HERO_CITIES } from '@/constants/appContent';
import { ROUTES } from '@/config/routes';
import { useHomePage } from '@/hooks';

const HomePage = () => {
  const { query, setQuery, shortTerm, longTerm, loadingShort, loadingLong, handleSearchSubmit } = useHomePage();

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
              {APP_CONTENT.companyName}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 lg:text-6xl">
              Знайдіть ідеальне житло в Україні
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">{APP_CONTENT.tagline}</p>

            <form
              onSubmit={handleSearchSubmit}
              className="mx-auto mt-10 flex max-w-2xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
            >
              <div className="relative flex-1">
                <MapPin
                  size={20}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Місто, район, метро..."
                  className="h-full w-full rounded-xl border-0 bg-transparent py-3 pl-11 pr-4 text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Search size={16} />
                Знайти
              </button>
            </form>

            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {HERO_CITIES.map((city) => (
                <Link
                  key={city}
                  to={`${ROUTES.search}?city=${encodeURIComponent(city)}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="py-12">
          <HomeSectionHeader
            title="Короткострокова оренда"
            subtitle="Квартири та будинки подобово"
            linkTo={ROUTES.search}
          />
          <PropertySlider items={shortTerm} loading={loadingShort} />
        </section>

        <section className="border-t border-slate-200/70 py-12">
          <HomeSectionHeader
            title="Довгострокова оренда"
            subtitle="Оренда від одного місяця"
            linkTo={ROUTES.search}
          />
          <PropertySlider items={longTerm} loading={loadingLong} />
        </section>

        <section className="border-t border-slate-200/70 py-12">
          <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">Чому обирають Rentify?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div
                  className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.colorClass}`}
                >
                  <feature.icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pb-16 pt-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-blue-600 p-10 shadow-2xl shadow-blue-600/20 lg:p-14">
            <div className="absolute right-0 top-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-52 w-52 translate-y-1/3 -translate-x-1/3 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl text-white">
                <h2 className="text-3xl font-bold leading-tight lg:text-4xl">Маєте житло для оренди?</h2>
                <p className="mt-3 text-lg text-blue-100">Додайте оголошення і знайдіть перевірених орендарів.</p>
              </div>

              <Link
                to={ROUTES.createProperty}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 transition hover:scale-[1.02]"
              >
                Додати оголошення
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
