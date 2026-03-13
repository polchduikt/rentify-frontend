import { useState } from 'react';
import { ArrowRight, CalendarClock, Home, MessageCircle, Phone, Share2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { openChatWidget } from '@/components/chat';
import { PUBLIC_PROFILE_FALLBACK_PROPERTY_IMAGE } from '@/constants/publicProfile';
import { ROUTES } from '@/config/routes';
import { usePublicProfilePage } from '@/hooks';
import type { PropertyResponseDto } from '@/types/property';
import { formatPublicProfilePropertyAddress, formatPublicProfilePropertyPrice } from '@/utils/publicProfile';

const formatPropertyAddress = (property: PropertyResponseDto) => formatPublicProfilePropertyAddress(property);

const PublicProfilePropertyCard = ({ property }: { property: PropertyResponseDto }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <Link
      to={ROUTES.propertyDetails(property.id)}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label={`Переглянути оголошення: ${property.title}`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={property.photos?.[0]?.url || PUBLIC_PROFILE_FALLBACK_PROPERTY_IMAGE}
          alt={property.title}
          className="h-full w-full object-cover transition hover:scale-[1.02]"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-2xl font-black text-slate-900">{formatPublicProfilePropertyPrice(property)}</p>
        <p className="line-clamp-1 text-lg font-bold text-slate-900">{property.title}</p>
        <p className="line-clamp-1 text-sm text-slate-600">{formatPropertyAddress(property)}</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
          Детальніше <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  </article>
);

const PublicProfilePage = () => {
  const model = usePublicProfilePage();
  const [isShareSuccess, setIsShareSuccess] = useState(false);

  const handleOpenChat = () => {
    if (!model.firstPropertyForChat || model.isOwnProfile) {
      return;
    }

    openChatWidget({
      propertyId: model.firstPropertyForChat.id,
      initialText: `Доброго дня! Цікавлять ваші оголошення на Rentify.`,
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsShareSuccess(true);
      window.setTimeout(() => setIsShareSuccess(false), 1600);
    } catch {
      setIsShareSuccess(false);
    }
  };

  if (model.isInitialLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-10 w-72 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (model.criticalError || !model.profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {model.criticalError || 'Профіль користувача не знайдено.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,transparent_42%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] pb-14">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {model.avatarUrl ? (
                  <img src={model.avatarUrl} alt={model.fullName} className="h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28" />
                ) : (
                  <span className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-100 text-3xl font-black text-blue-700 sm:h-28 sm:w-28">
                    {model.initials}
                  </span>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Публічний профіль</p>
                  <h1 className="mt-1 text-3xl font-black text-slate-900">{model.fullName}</h1>
                  <p className="mt-2 text-sm text-slate-500">На Rentify з {model.joinedAtLabel}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleShare()}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <Share2 size={16} />
                {isShareSuccess ? 'Посилання скопійовано' : 'Поділитися'}
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Активні оголошення</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{model.activePropertiesCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Усього оголошень</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{model.allPropertiesCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Середній рейтинг</p>
                <p className="mt-2 inline-flex items-center gap-1 text-2xl font-black text-slate-900">
                  <Star size={18} className="text-amber-500" />
                  {model.averageRating.toFixed(1)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{model.totalReviews} відгуків</p>
              </div>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Контакти</p>
            <div className="mt-4 space-y-2">
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-900">
                <Phone size={15} />
                {model.maskedPhone || 'Телефон прихований'}
              </div>

              <button
                type="button"
                onClick={handleOpenChat}
                disabled={!model.firstPropertyForChat || model.isOwnProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <MessageCircle size={16} />
                {model.isOwnProfile ? 'Це ваш профіль' : 'Відкрити чат'}
              </button>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600">
              <p className="inline-flex items-center gap-2">
                <CalendarClock size={15} className="text-slate-400" />
                Активний на платформі з {model.joinedAtLabel}
              </p>
              <p className="mt-2 inline-flex items-center gap-2">
                <Home size={15} className="text-slate-400" />
                {model.displayedCount} оголошень у публічному профілі
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-3xl font-black text-slate-900">Оголошення користувача</h2>
            <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-700">
              {model.displayedCount}
            </span>
          </div>

          {model.propertiesError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{model.propertiesError}</div>
          ) : model.propertiesLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
              <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          ) : model.displayedProperties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
              Користувач ще не має публічних оголошень.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {model.displayedProperties.map((property) => (
                <PublicProfilePropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PublicProfilePage;
