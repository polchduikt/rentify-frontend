import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FALLBACK_IMAGE } from '@/constants/propertyDetails';
import { PROPERTY_STATUS_LABELS } from '@/constants/profileUi';
import { ROUTES } from '@/config/routes';
import { isTopPromotionActive } from '@/utils/promotions';
import { formatDate, formatMoney } from '@/utils/profileFormatters';
import type { PropertyPreviewItemProps } from './PropertyPreviewItem.types';


const formatPromotionUntilDate = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const PropertyPreviewItem = ({ property, onDelete, isDeleting = false }: PropertyPreviewItemProps) => {
  const image = property.photos?.[0]?.url || FALLBACK_IMAGE;
  const isRecommended = isTopPromotionActive(property);
  const promotionUntilDate = formatPromotionUntilDate(property.topPromotedUntil);

  const city = property.address?.location?.city || property.address?.location?.region || 'Місто не вказано';
  const addressLine = [property.address?.street, property.address?.houseNumber].filter(Boolean).join(', ');

  const isShortTerm = property.rentalType === 'SHORT_TERM';
  const resolvedPrice =
    Number(
      isShortTerm
        ? property.pricing?.pricePerNight || property.pricing?.pricePerMonth
        : property.pricing?.pricePerMonth || property.pricing?.pricePerNight,
    ) || 0;
  const priceSuffix = isShortTerm ? '/ доба' : '/ міс';
  const currency = property.pricing?.currency || 'UAH';

  const metaParts = [
    property.rooms != null ? `${property.rooms} кімн.` : null,
    property.areaSqm != null ? `${Number(property.areaSqm)} м²` : null,
    property.floor != null ? `${property.floor}${property.totalFloors != null ? ` / ${property.totalFloors}` : ''}` : null,
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <div className="grid h-full grid-cols-1 md:grid-cols-[360px_minmax(0,1fr)] md:items-stretch">
        <div className="relative h-56 md:h-auto">
          <Link
            to={ROUTES.propertyDetails(property.id)}
            className="block h-full overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={`Переглянути оголошення: ${property.title}`}
          >
            <img src={image} alt={property.title} className="h-full w-full object-cover" />
          </Link>

          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
              {PROPERTY_STATUS_LABELS[property.status] || property.status}
            </span>
            {isRecommended ? (
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">Рекомендовано</span>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-5 md:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <h3 className="min-w-0 text-lg font-bold leading-snug text-slate-900 break-words [overflow-wrap:anywhere]">
              {property.title}
            </h3>
            <p className="whitespace-nowrap text-sm font-semibold text-slate-900 md:text-base">
              {formatMoney(resolvedPrice, currency)} {priceSuffix}
            </p>
          </div>

          <p className="mt-2 text-sm text-slate-700 break-words [overflow-wrap:anywhere]">{addressLine || city}</p>

          {metaParts.length > 0 ? <p className="mt-2 text-sm text-slate-700">{metaParts.join('   ')}</p> : null}

          {property.description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere]">
              {property.description}
            </p>
          ) : null}

          <div className="mt-4 space-y-1 text-sm text-slate-500">
            <p>Опубліковано {formatDate(property.createdAt)}</p>
            {isRecommended && promotionUntilDate ? <p className="font-semibold text-blue-700">Просування до {promotionUntilDate}</p> : null}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
            <Link
              to={ROUTES.propertyDetails(property.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={15} />
              Переглянути
            </Link>
            <Link
              to={ROUTES.editProperty(property.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <Pencil size={15} />
              Редагувати
            </Link>
            <button
              type="button"
              onClick={() => onDelete?.(property)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={15} />
              {isDeleting ? 'Видалення...' : 'Видалити'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
