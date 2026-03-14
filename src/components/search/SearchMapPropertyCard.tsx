import { Layers, MapPin, ZoomIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEARCH_PROPERTY_FALLBACK_IMAGE } from '@/constants/propertyImages';
import { ROUTES } from '@/config/routes';
import { isTopPromotionActive } from '@/utils/promotions';
import { resolveCompactRooms, resolveMapAddressLine, resolveMapPropertyMeta, resolveMapPropertyPrice } from '@/utils/searchMap';
import type { SearchMapPropertyCardProps } from './SearchMapPropertyCard.types';

export const SearchMapPropertyCard = ({ property, onClose }: SearchMapPropertyCardProps) => {
  const { value: selectedPrice, suffix: selectedPriceSuffix, currency: selectedCurrency } = resolveMapPropertyPrice(property);
  const selectedRoomsCompact = resolveCompactRooms(property);
  const isRecommended = isTopPromotionActive(property);

  if (!property) {
    return (
      <aside className="absolute bottom-4 left-4 top-4 z-[640] hidden w-[390px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:block">
        <div className="flex h-full items-center justify-center p-6 text-center text-slate-500">Завантаження оголошення...</div>
      </aside>
    );
  }

  return (
    <aside className="absolute bottom-4 left-4 top-4 z-[640] hidden w-[390px] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:block">
      <div className="h-full overflow-auto p-3">
        <article className="relative rounded-[24px] bg-white p-2 shadow-sm">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg font-semibold text-slate-700 shadow-sm hover:bg-white"
            aria-label="Закрити картку"
          >
            x
          </button>

          <Link
            to={ROUTES.propertyDetails(property.id)}
            aria-label={`Переглянути оголошення: ${property.title}`}
            className="block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="relative overflow-hidden rounded-[20px]">
              <img
                src={property.photos?.[0]?.url || SEARCH_PROPERTY_FALLBACK_IMAGE}
                alt={property.title}
                className="h-[240px] w-full object-cover"
              />
              {isRecommended ? (
                <span className="absolute left-4 top-4 rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  Рекомендовано
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[30px] font-black leading-none text-white">
                      {selectedPrice > 0 ? selectedPrice.toLocaleString('uk-UA') : '0'} {selectedCurrency}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/85">{selectedPriceSuffix}</p>
                  </div>
                  {selectedRoomsCompact ? (
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-slate-900">
                      {selectedRoomsCompact}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="min-w-0 px-1 pb-2 pt-4">
              <p className="text-xl font-extrabold leading-tight text-slate-900 break-words [overflow-wrap:anywhere]">
                {resolveMapAddressLine(property)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-500">{property.address?.location?.city || 'Місто не вказано'}</p>
              <p className="mt-3 text-sm text-slate-700">{resolveMapPropertyMeta(property)}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  <MapPin size={12} className="mr-1" />
                  {property.propertyType}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <ZoomIn size={12} className="mr-1" />
                  {property.rentalType === 'SHORT_TERM' ? 'Подобово' : 'Довгостроково'}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  <Layers size={12} className="mr-1" />
                  {property.marketType}
                </span>
              </div>

              {property.photos && property.photos.length > 1 ? (
                <div className="mt-4 flex gap-2 overflow-auto pb-1">
                  {property.photos.slice(1, 6).map((photo) => (
                    <img key={photo.id} src={photo.url} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" />
                  ))}
                </div>
              ) : null}

              {property.description ? (
                <p
                  className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere]"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {property.description}
                </p>
              ) : null}

            </div>
          </Link>
        </article>
      </div>
    </aside>
  );
};
