import { Clock3, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FALLBACK_PROPERTY_IMAGE } from '@/constants/bookingUi';
import { ROUTES } from '@/config/routes';
import { usePropertyByIdQuery } from '@/hooks/api';
import type { BookingDto } from '@/types/booking';
import type { ViewMode } from '../BookingsSection.types';
import { formatDate } from '@/utils/profileFormatters';
import { formatLocalTime } from '@/utils/time';
import { buildPropertyAddress, getPropertyMapUrl, hasExactCoordinates } from './bookingUtils';
import { ParticipantCard } from './ParticipantCard';

interface BookingDetailsBlockProps {
  booking: BookingDto;
  viewMode: ViewMode;
}

export const BookingDetailsBlock = ({ booking, viewMode }: BookingDetailsBlockProps) => {
  const propertyQuery = usePropertyByIdQuery(booking.propertyId);
  const property = propertyQuery.data;
  const address = buildPropertyAddress(property);
  const mapUrl = getPropertyMapUrl(property);
  const hasCoords = hasExactCoordinates(property);

  if (propertyQuery.isLoading) {
    return <div className="h-36 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (propertyQuery.error || !property) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-semibold text-slate-900">Оголошення #{booking.propertyId}</p>
        <p className="mt-1 text-xs text-slate-500">Не вдалося завантажити деталі оголошення.</p>
        <Link to={ROUTES.propertyDetails(booking.propertyId)} className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:underline">
          Відкрити оголошення
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-3 md:grid-cols-[150px_minmax(0,1fr)]">
        <img
          src={property.photos?.[0]?.url || FALLBACK_PROPERTY_IMAGE}
          alt={property.title}
          className="h-28 w-full rounded-lg object-cover md:h-full"
        />

        <div className="min-w-0">
          <p className="line-clamp-1 text-sm font-bold text-slate-900">{property.title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">{address.primary}</p>
          <p className="mt-1 text-xs text-slate-500">{address.secondary}</p>
          {hasCoords ? (
            <p className="mt-1 text-[11px] text-slate-400">
              Координати: {property.address.lat}, {property.address.lng}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <Users size={12} /> до {property.maxGuests || booking.guests} гостей
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              {formatLocalTime(property.checkInTime)} / {formatLocalTime(property.checkOutTime)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 size={12} />
              З {formatDate(booking.dateFrom)} до {formatDate(booking.dateTo)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={ROUTES.propertyDetails(booking.propertyId)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <MapPin size={12} />
          Деталі оголошення
        </Link>
        {mapUrl ? (
          <a
            href={mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
          >
            <MapPin size={12} />
            Показати на карті
          </a>
        ) : null}
      </div>

      <ParticipantCard
        booking={booking}
        participantType={viewMode === 'my' ? 'host' : 'tenant'}
        propertyId={booking.propertyId}
        hostId={property.hostId}
      />
    </div>
  );
};
