import { BadgeCheck, BedDouble, Layers, MapPin, Ruler, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MARKET_TYPE_LABELS, RENTAL_TYPE_LABELS } from '@/constants/propertyLabels';
import { SEARCH_PROPERTY_FALLBACK_IMAGE } from '@/constants/propertyImages';
import { ROUTES } from '@/config/routes';
import { isTopPromotionActive } from '@/utils/promotions';
import { resolveMapAddressLine, resolveMapPropertyPrice } from '@/utils/searchMap';
import type { SearchMapPropertyCardProps } from './SearchMapPropertyCard.types';

const formatPublishedDate = (value?: string): string => {
  if (!value) {
    return 'Опубліковано нещодавно';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Опубліковано нещодавно';
  }

  return `Опубліковано ${date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const sidePanelClassName =
  'absolute bottom-4 left-4 z-[640] hidden h-[min(66vh,680px)] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.28)] lg:block xl:w-[390px]';

export const SearchMapPropertyCard = ({ property, onClose }: SearchMapPropertyCardProps) => {
  if (!property) {
    return (
      <aside className={sidePanelClassName}>
        <div className="flex h-full items-center justify-center p-6 text-center text-slate-500">Завантаження оголошення...</div>
      </aside>
    );
  }

  const { value: selectedPrice, suffix: selectedPriceSuffix, currency: selectedCurrency } = resolveMapPropertyPrice(property);
  const heroPhoto = property.photos?.[0]?.url || SEARCH_PROPERTY_FALLBACK_IMAGE;
  const galleryPhotos = property.photos?.slice(1, 5) ?? [];
  const cityLabel = property.address?.location?.city || property.address?.location?.region || 'Місто не вказано';
  const isRecommended = isTopPromotionActive(property);
  const rentalTypeLabel = RENTAL_TYPE_LABELS[property.rentalType] || property.rentalType;
  const marketTypeLabel = MARKET_TYPE_LABELS[property.marketType] || property.marketType;

  return (
    <aside className={sidePanelClassName}>
      <div className="flex h-full flex-col">
        <header className="border-b border-slate-200 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg leading-tight font-bold text-slate-900">{resolveMapAddressLine(property)}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                <MapPin size={14} />
                {cityLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              aria-label="Закрити картку"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-3">
          <article className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200">
              <img src={heroPhoto} alt={property.title} className="h-[182px] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/15 to-transparent" />

              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                {isRecommended ? (
                  <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">Рекомендовано</span>
                ) : null}
                {property.isVerifiedProperty ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    <BadgeCheck size={12} />
                    Перевірене
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[34px] leading-none font-black text-white">
                  {selectedPrice > 0 ? selectedPrice.toLocaleString('uk-UA') : '0'} {selectedCurrency}
                </p>
                <p className="mt-1 text-xs font-semibold text-white/90">{selectedPriceSuffix}</p>
              </div>
            </div>

            {galleryPhotos.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {galleryPhotos.map((photo) => (
                  <img key={photo.id} src={photo.url} alt="" className="h-14 w-20 shrink-0 rounded-xl border border-slate-200 object-cover" />
                ))}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <BedDouble size={13} />
                  {property.rooms || 0} кім.
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Ruler size={13} />
                  {property.areaSqm ? `${Number(property.areaSqm)} м²` : 'Площа не вказана'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Layers size={13} />
                  {property.floor && property.totalFloors ? `${property.floor}/${property.totalFloors} поверх` : 'Поверх не вказано'}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Users size={13} />
                  {property.maxGuests || 0} гостей
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                {rentalTypeLabel}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {marketTypeLabel}
              </span>
              {property.rules?.petsAllowed ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Можна з тваринами
                </span>
              ) : null}
            </div>

            {property.description ? <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">{property.description}</p> : null}

            <p className="text-[11px] text-slate-500">{formatPublishedDate(property.createdAt)}</p>
          </article>
        </div>

        <footer className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.propertyDetails(property.id)}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Відкрити повний перегляд
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Закрити
            </button>
          </div>
        </footer>
      </div>
    </aside>
  );
};
