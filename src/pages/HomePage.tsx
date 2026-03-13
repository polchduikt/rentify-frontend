import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomeFaqSection from '@/components/home/HomeFaqSection';
import HomeHero from '@/components/home/HomeHero';
import HomeHostStatsSection from '@/components/home/HomeHostStatsSection';
import HomeHowItWorksSection from '@/components/home/HomeHowItWorksSection';
import HomeMapEntrySection from '@/components/home/HomeMapEntrySection';
import HomeSectionHeader from '@/components/home/HomeSectionHeader';
import PopularCitiesGrid from '@/components/home/PopularCitiesGrid';
import PropertySlider from '@/components/home/PropertySlider';
import { APP_CONTENT, FEATURES, HERO_CITIES } from '@/constants/appContent';
import { ROUTES } from '@/config/routes';
import { useHomePage } from '@/hooks';

const HomePage = () => {
  const {
    query,
    setQuery,
    heroRentalType,
    setHeroRentalType,
    shortTerm,
    longTerm,
    popularCities,
    favoriteIds,
    loadingShort,
    loadingLong,
    handleSearchSubmit,
  } = useHomePage();

  return (
    <div className="min-h-screen bg-slate-50">
      <HomeHero
        query={query}
        onQueryChange={setQuery}
        heroRentalType={heroRentalType}
        onHeroRentalTypeChange={setHeroRentalType}
        onSearchSubmit={handleSearchSubmit}
        heroCities={HERO_CITIES}
        tagline={APP_CONTENT.tagline}
        companyName={APP_CONTENT.companyName}
      />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <PopularCitiesGrid cities={popularCities} />

        <section className="py-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <HomeSectionHeader
              title="Короткострокова оренда"
              subtitle="Квартири та будинки подобово"
              linkTo={ROUTES.search}
            />
            <PropertySlider items={shortTerm} loading={loadingShort} favoriteIds={favoriteIds} />
          </div>
        </section>

        <section className="py-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <HomeSectionHeader
              title="Довгострокова оренда"
              subtitle="Оренда від одного місяця"
              linkTo={ROUTES.search}
            />
            <PropertySlider items={longTerm} loading={loadingLong} favoriteIds={favoriteIds} />
          </div>
        </section>

        <HomeHowItWorksSection />

        <section className="border-t border-slate-200/70 py-10">
          <h2 className="mb-10 text-center text-3xl font-bold text-slate-900">Чому обирають Rentify</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
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

        <HomeMapEntrySection />
        <HomeHostStatsSection />
        <HomeFaqSection />

        <section className="pb-16 pt-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-blue-600 p-8 shadow-2xl shadow-blue-600/20 lg:p-10">
            <div className="absolute right-0 top-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-52 w-52 translate-y-1/3 -translate-x-1/3 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-xl text-white">
                <h2 className="text-3xl font-bold leading-tight lg:text-4xl">Маєте житло для оренди?</h2>
                <p className="mt-3 text-lg text-blue-100">Додайте оголошення і знайдіть перевірених орендарів.</p>
                <Link
                  to={ROUTES.createProperty}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-blue-700 transition hover:scale-[1.02]"
                >
                  Додати оголошення
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
