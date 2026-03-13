import { ExternalLink, Home, LoaderCircle, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useBookingByIdQuery, usePropertyByIdQuery } from '@/hooks/api';
import { formatDate } from '@/utils/profileFormatters';
import { isBookingReference, isPropertyReference, resolveReferenceTypeLabel } from '@/utils/profileTransactions';
import type { TransactionReferenceInfoProps } from './TransactionReferenceInfo.types';


const PropertyReferenceInfo = ({ propertyId }: { propertyId: number }) => {
  const propertyQuery = usePropertyByIdQuery(propertyId, propertyId > 0);
  const property = propertyQuery.data;

  if (propertyQuery.isLoading) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <LoaderCircle size={12} className="animate-spin" />
        Завантаження даних оголошення...
      </p>
    );
  }

  if (!property) {
    return (
      <Link
        to={ROUTES.propertyDetails(propertyId)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
      >
        <Home size={12} />
        Оголошення #{propertyId}
        <ExternalLink size={12} />
      </Link>
    );
  }

  const locationLabel = [property.address?.location?.city, property.address?.location?.region].filter(Boolean).join(', ');

  return (
    <div className="space-y-1">
      <Link
        to={ROUTES.propertyDetails(propertyId)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
      >
        <Home size={12} />
        {property.title}
        <ExternalLink size={12} />
      </Link>
      <p className="text-xs text-slate-500">{locationLabel || `Оголошення #${propertyId}`}</p>
    </div>
  );
};

const BookingReferenceInfo = ({ bookingId }: { bookingId: number }) => {
  const bookingQuery = useBookingByIdQuery(bookingId, bookingId > 0);
  const booking = bookingQuery.data;
  const propertyQuery = usePropertyByIdQuery(booking?.propertyId ?? 0, Boolean(booking?.propertyId));

  if (bookingQuery.isLoading) {
    return (
      <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
        <LoaderCircle size={12} className="animate-spin" />
        Завантаження даних бронювання...
      </p>
    );
  }

  if (!booking) {
    return (
      <Link
        to={ROUTES.bookingPayment(bookingId)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
      >
        <ReceiptText size={12} />
        Бронювання #{bookingId}
        <ExternalLink size={12} />
      </Link>
    );
  }

  return (
    <div className="space-y-1">
      <Link
        to={ROUTES.bookingPayment(booking.id)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
      >
        <ReceiptText size={12} />
        Бронювання #{booking.id}
        <ExternalLink size={12} />
      </Link>
      <p className="text-xs text-slate-500">
        {formatDate(booking.dateFrom)} - {formatDate(booking.dateTo)}
      </p>
      <Link
        to={ROUTES.propertyDetails(booking.propertyId)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
      >
        <Home size={12} />
        {propertyQuery.data?.title || `Оголошення #${booking.propertyId}`}
        <ExternalLink size={12} />
      </Link>
    </div>
  );
};

export const TransactionReferenceInfo = ({ referenceType, referenceId }: TransactionReferenceInfoProps) => {
  const normalizedReferenceId = Number(referenceId);
  const hasReference = Number.isFinite(normalizedReferenceId) && normalizedReferenceId > 0;

  if (!hasReference) {
    return <p className="text-xs text-slate-500">Системна операція</p>;
  }

  if (isPropertyReference(referenceType)) {
    return <PropertyReferenceInfo propertyId={normalizedReferenceId} />;
  }

  if (isBookingReference(referenceType)) {
    return <BookingReferenceInfo bookingId={normalizedReferenceId} />;
  }

  return (
    <p className="text-xs text-slate-500">
      {resolveReferenceTypeLabel(referenceType)} #{normalizedReferenceId}
    </p>
  );
};
