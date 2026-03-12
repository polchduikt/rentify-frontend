import { BedDouble, CalendarClock, Eye, Layers, MapPin, Pencil, Square, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FALLBACK_IMAGE } from '@/components/property-details/constants';
import { ROUTES } from '@/config/routes';
import type { PropertyResponseDto } from '@/types/property';
import { PROPERTY_STATUS_LABELS } from './constants';
import { formatDate, formatMoney } from './formatters';

interface PropertyPreviewItemProps {
  property: PropertyResponseDto;
  onDelete?: (property: PropertyResponseDto) => void;
  isDeleting?: boolean;
}

export const PropertyPreviewItem = ({ property, onDelete, isDeleting = false }: PropertyPreviewItemProps) => {
  const image = property.photos?.[0]?.url || FALLBACK_IMAGE;
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

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <div className="grid h-full grid-cols-1 md:grid-cols-[minmax(0,360px)_1fr]">
        <Link
          to={ROUTES.propertyDetails(property.id)}
          className="h-[220px] overflow-hidden bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:h-[280px]"
          aria-label={`Переглянути оголошення: ${property.title}`}
        >
          <img src={image} alt={property.title} className="h-full w-full object-cover" />
        </Link>

        <div className="min-w-0 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {PROPERTY_STATUS_LABELS[property.status] || property.status}
            </span>
            <div className="text-right">
              <p className="text-3xl leading-none font-black text-slate-900">{formatMoney(resolvedPrice, currency)}</p>
              <p className="mt-1 text-sm text-slate-500">{priceSuffix}</p>
            </div>
          </div>

          <h3 className="mt-3 text-2xl leading-tight font-bold text-slate-900 break-words [overflow-wrap:anywhere]">{property.title}</h3>

          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin size={15} className="text-slate-500" />
            <span>{addressLine || city}</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-700">
            {property.rooms != null ? (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble size={15} className="text-slate-500" />
                {property.rooms} кімн.
              </span>
            ) : null}
            {property.areaSqm != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Square size={15} className="text-slate-500" />
                {Number(property.areaSqm)} м²
              </span>
            ) : null}
            {property.floor != null ? (
              <span className="inline-flex items-center gap-1.5">
                <Layers size={15} className="text-slate-500" />
                {property.floor}
                {property.totalFloors != null ? ` / ${property.totalFloors}` : ''}
              </span>
            ) : null}
          </div>

          {property.description ? (
            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-600 break-words [overflow-wrap:anywhere]">
              {property.description}
            </p>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <CalendarClock size={14} />
              Опубліковано {formatDate(property.createdAt)}
            </span>
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
