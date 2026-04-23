import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FALLBACK_IMAGE, resolveLocationFallback } from '@/constants/propertyDetails';
import { MAX_BOOKING_WINDOW_DAYS } from '@/constants/propertyDetailsPage';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReviewedBookingIds,
  groupAmenitiesByCategory,
  normalizePropertyPhotos,
  resolveOwnerPhone,
  resolveOwnerPresentation,
  resolvePropertyAddressLine,
  resolvePropertyCity,
} from '@/services/adapters/propertyDetailsAdapter';
import {
  useAvailabilityBlocksQuery,
  useCreateReviewMutation,
  useMyBookingsQuery,
  useMyFavoritesQuery,
  usePropertyByIdQuery,
  usePropertyReviewsQuery,
  usePublicProfileQuery,
  useSearchPropertiesQuery,
  useUnavailableRangesQuery,
} from '@/hooks/api';
import type { ReviewRequestDto } from '@/types/review';
import { parseCoordinate } from '@/utils/propertyDetails';
import { addDays, toIsoDate } from '@/utils/bookingDates';
import { getApiErrorMessage } from '@/utils/errors';
import { geocodeAddress } from '@/utils/geocoding';

const RECOMMENDATION_CARDS_PER_VIEW = 3;

const FALLBACK_CITY_LABEL = 'Місто не вказано';
const FALLBACK_OWNER_LABEL = 'Власник оголошення';
const PROPERTY_ERROR_MESSAGE =
  'Не вдалося завантажити оголошення';
const REVIEWS_ERROR_MESSAGE =
  'Не вдалося завантажити відгуки';
const REVIEW_REQUIRES_COMPLETED_BOOKING_MESSAGE =
  'Відгук можна залишити після завершеного бронювання та успішного виїзду.';
const REVIEW_ALREADY_LEFT_MESSAGE =
  'Ви вже залишили відгук за всі завершені бронювання цієї пропозиції.';
const REVIEW_LOGIN_MESSAGE =
  'Авторизуйтесь, щоб залишити відгук.';
const OWN_PROPERTY_REVIEW_MESSAGE =
  'Ви не можете залишати відгук до власного оголошення.';

export const usePropertyDetailsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const isValidId = Number.isFinite(numericId) && numericId > 0;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [recommendedStart, setRecommendedStart] = useState(0);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCoordsLoading, setMapCoordsLoading] = useState(false);
  const [bookingDateFrom, setBookingDateFrom] = useState('');
  const [bookingDateTo, setBookingDateTo] = useState('');
  const [bookingGuestsState, setBookingGuestsState] = useState(1);

  const propertyQuery = usePropertyByIdQuery(numericId, isValidId);
  const property = propertyQuery.data ?? null;
  const isShortTerm = property?.rentalType === 'SHORT_TERM';
  const isOwnProperty = Boolean(property?.hostId && user?.id && property.hostId === user.id);
  const recommendationRentalType = property?.rentalType;
  const todayIso = useMemo(() => toIsoDate(new Date()), []);
  const unavailableFromIso = useMemo(() => addDays(new Date(), -31), []);
  const maxDateIso = useMemo(() => addDays(new Date(), MAX_BOOKING_WINDOW_DAYS), []);
  const bookingMaxGuests = Math.max(1, Number(property?.maxGuests || 1));
  const shortTermCurrency = property?.pricing?.currency || 'UAH';
  const shortTermNightlyPrice = useMemo(() => {
    const directNightly = Number(property?.pricing?.pricePerNight || 0);
    if (directNightly > 0) {
      return directNightly;
    }
    const monthly = Number(property?.pricing?.pricePerMonth || 0);
    return monthly > 0 ? monthly / 30 : 0;
  }, [property?.pricing?.pricePerNight, property?.pricing?.pricePerMonth]);

  const ownerQuery = usePublicProfileQuery(property?.hostId ?? 0, Boolean(property?.hostId));
  const unavailableRangesQuery = useUnavailableRangesQuery(
    property?.id ?? 0,
    {
      dateFrom: unavailableFromIso,
      dateTo: maxDateIso,
    },
    Boolean(property?.id && isShortTerm)
  );
  const availabilityBlocksQuery = useAvailabilityBlocksQuery(property?.id ?? 0, Boolean(property?.id && isShortTerm));
  const favoritesQuery = useMyFavoritesQuery(isAuthenticated);
  const myBookingsQuery = useMyBookingsQuery(
    { page: 0, size: 200, sort: 'dateTo,desc' },
    isAuthenticated && isShortTerm
  );
  const propertyReviewsQuery = usePropertyReviewsQuery(
    numericId,
    { page: 0, size: 200, sort: 'createdAt,desc' },
    isValidId && isShortTerm
  );
  const createReviewMutation = useCreateReviewMutation();
  const recommendationsQuery = useSearchPropertiesQuery(
    {
      city: property?.address?.city,
      rentalType: recommendationRentalType,
    },
    { page: 0, size: 18, sort: 'createdAt,desc' },
    Boolean(property?.address?.city && recommendationRentalType)
  );

  const photos = useMemo(() => normalizePropertyPhotos(property, FALLBACK_IMAGE), [property]);
  const bookingUnavailableRanges = useMemo(() => {
    const apiUnavailableRanges = unavailableRangesQuery.data ?? [];
    const blockRanges = (availabilityBlocksQuery.data ?? []).map((block) => ({
      dateFrom: block.dateFrom,
      dateTo: block.dateTo,
      source: 'BLOCK',
      bookingStatus: null,
      reason: block.reason ?? null,
    }));

    if (blockRanges.length === 0) {
      return apiUnavailableRanges;
    }

    const byKey = new Map(apiUnavailableRanges.map((range) => [`${range.source}|${range.dateFrom}|${range.dateTo}`, range]));

    for (const block of blockRanges) {
      const key = `${block.source}|${block.dateFrom}|${block.dateTo}`;
      const existing = byKey.get(key);
      if (existing) {
        byKey.set(key, {
          ...existing,
          reason: existing.reason ?? block.reason ?? null,
        });
        continue;
      }
      byKey.set(key, block);
    }

    return Array.from(byKey.values());
  }, [availabilityBlocksQuery.data, unavailableRangesQuery.data]);

  useEffect(() => {
    setBookingDateFrom('');
    setBookingDateTo('');
    setBookingGuestsState(1);
  }, [isShortTerm, property?.id]);

  const setBookingGuests = (value: number) => {
    if (!Number.isFinite(value)) {
      return;
    }
    setBookingGuestsState(Math.min(bookingMaxGuests, Math.max(1, Math.trunc(value))));
  };
  const groupedAmenities = useMemo(() => groupAmenitiesByCategory(property?.amenities), [property?.amenities]);

  const recommended = useMemo(() => {
    const items = recommendationsQuery.data?.content ?? [];
    return items.filter(
      (item) =>
        item.id !== property?.id &&
        (!recommendationRentalType || item.rentalType === recommendationRentalType)
    );
  }, [recommendationsQuery.data?.content, property?.id, recommendationRentalType]);

  const canSlidePrev = recommendedStart > 0;
  const canSlideNext = recommendedStart + RECOMMENDATION_CARDS_PER_VIEW < recommended.length;
  const recommendedVisible = recommended.slice(recommendedStart, recommendedStart + RECOMMENDATION_CARDS_PER_VIEW);

  useEffect(() => {
    setActivePhotoIndex(0);
  }, [property?.id]);

  useEffect(() => {
    setRecommendedStart(0);
  }, [property?.id, recommended.length]);

  useEffect(() => {
    const city = property?.address?.city;
    const region = property?.address?.region;

    const setFallbackCoords = () => {
      const [fallbackLat, fallbackLng] = resolveLocationFallback(city, region);
      setMapCoords({ lat: fallbackLat, lng: fallbackLng });
    };

    if (!property) {
      setMapCoords(null);
      setMapCoordsLoading(false);
      return;
    }

    const lat = parseCoordinate(property.address?.lat);
    const lng = parseCoordinate(property.address?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setMapCoords({ lat, lng });
      setMapCoordsLoading(false);
      return;
    }

    const query = [
      property.address?.street,
      property.address?.houseNumber,
      property.address?.city,
      property.address?.region,
      property.address?.country,
    ]
      .filter(Boolean)
      .join(', ');

    if (!query.trim()) {
      setFallbackCoords();
      setMapCoordsLoading(false);
      return;
    }

    let active = true;
    const abortController = new AbortController();
    setMapCoordsLoading(true);

    void geocodeAddress(query, abortController.signal)
      .then((point) => {
        if (!active) {
          return;
        }
        if (point) {
          setMapCoords(point);
          return;
        }
        setFallbackCoords();
      })
      .catch((error: unknown) => {
        if (!active || (error as { name?: string }).name === 'AbortError') {
          return;
        }
        setFallbackCoords();
      })
      .finally(() => {
        if (active) {
          setMapCoordsLoading(false);
        }
      });

    return () => {
      active = false;
      abortController.abort();
    };
  }, [
    property?.id,
    property?.address?.houseNumber,
    property?.address?.lat,
    property?.address?.lng,
    property?.address?.city,
    property?.address?.country,
    property?.address?.region,
    property?.address?.street,
  ]);

  const fallbackMapCenter = resolveLocationFallback(property?.address?.city, property?.address?.region);
  const mapCenter: [number, number] = mapCoords ? [mapCoords.lat, mapCoords.lng] : fallbackMapCenter;

  const city = resolvePropertyCity(property, FALLBACK_CITY_LABEL);
  const addressLine = resolvePropertyAddressLine(property);

  const propertyReviews = propertyReviewsQuery.data?.content ?? [];
  const completedMyShortTermBookings = useMemo(() => {
    if (!property?.id) {
      return [];
    }

    const bookings = myBookingsQuery.data?.content ?? [];
    return bookings.filter(
      (booking) =>
        booking.propertyId === property.id &&
        booking.status === 'COMPLETED' &&
        booking.dateTo <= todayIso
    );
  }, [myBookingsQuery.data?.content, property?.id, todayIso]);

  const reviewedBookingIds = useMemo(() => getReviewedBookingIds(propertyReviews, user?.id), [propertyReviews, user?.id]);

  const pendingReviewBooking = useMemo(
    () => completedMyShortTermBookings.find((booking) => !reviewedBookingIds.has(booking.id)) ?? null,
    [completedMyShortTermBookings, reviewedBookingIds]
  );

  const shortTermReviewHint = useMemo(() => {
    if (!isShortTerm) {
      return null;
    }
    if (!isAuthenticated) {
      return REVIEW_LOGIN_MESSAGE;
    }
    if (isOwnProperty) {
      return OWN_PROPERTY_REVIEW_MESSAGE;
    }
    if (myBookingsQuery.isLoading || propertyReviewsQuery.isLoading) {
      return null;
    }
    if (completedMyShortTermBookings.length === 0) {
      return REVIEW_REQUIRES_COMPLETED_BOOKING_MESSAGE;
    }
    if (!pendingReviewBooking) {
      return REVIEW_ALREADY_LEFT_MESSAGE;
    }
    return null;
  }, [
    completedMyShortTermBookings.length,
    isAuthenticated,
    isOwnProperty,
    isShortTerm,
    myBookingsQuery.isLoading,
    pendingReviewBooking,
    propertyReviewsQuery.isLoading,
  ]);

  const canLeaveShortTermReview =
    isShortTerm && isAuthenticated && !isOwnProperty && Boolean(pendingReviewBooking);

  const createShortTermReview = async ({ rating, comment }: { rating: number; comment?: string }) => {
    if (!property?.id || !pendingReviewBooking?.id) {
      throw new Error(REVIEW_REQUIRES_COMPLETED_BOOKING_MESSAGE);
    }

    const normalizedComment = comment?.trim();
    const payload: ReviewRequestDto = {
      propertyId: property.id,
      bookingId: pendingReviewBooking.id,
      rating,
      ...(normalizedComment ? { comment: normalizedComment } : {}),
    };

    await createReviewMutation.mutateAsync(payload);
  };

  const owner = ownerQuery.data;
  const { ownerName, ownerInitial } = resolveOwnerPresentation(owner, FALLBACK_OWNER_LABEL);
  const ownerPhone = resolveOwnerPhone(owner);

  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data?.map((fav) => fav.propertyId) ?? []),
    [favoritesQuery.data]
  );
  const isFavorite = property?.id ? favoriteIds.has(property.id) : false;

  const hasPropertyError = !propertyQuery.isLoading && (Boolean(propertyQuery.error) || !property);

  return {
    numericId,
    isValidId,
    isLoading: propertyQuery.isLoading,
    hasPropertyError,
    errorMessage: hasPropertyError ? getApiErrorMessage(propertyQuery.error, PROPERTY_ERROR_MESSAGE) : null,
    isShortTerm,
    property,
    photos,
    activePhoto: photos[activePhotoIndex] || photos[0] || FALLBACK_IMAGE,
    activePhotoIndex,
    selectPhoto: (index: number) => setActivePhotoIndex(Math.max(0, Math.min(index, photos.length - 1))),
    groupedAmenities,
    mapCenter,
    hasExactMapCoords: Boolean(mapCoords),
    mapCoordsLoading,
    city,
    addressLine,
    recommendationsLoading: recommendationsQuery.isLoading,
    recommendedVisible,
    canSlidePrev,
    canSlideNext,
    slideRecommendationsPrev: () =>
      setRecommendedStart((prev) => Math.max(0, prev - RECOMMENDATION_CARDS_PER_VIEW)),
    slideRecommendationsNext: () =>
      setRecommendedStart((prev) =>
        Math.min(Math.max(0, recommended.length - RECOMMENDATION_CARDS_PER_VIEW), prev + RECOMMENDATION_CARDS_PER_VIEW)
      ),
    owner,
    ownerLoading: ownerQuery.isLoading,
    ownerName,
    ownerInitial,
    ownerPhone,
    bookingDateFrom,
    setBookingDateFrom,
    bookingDateTo,
    setBookingDateTo,
    bookingGuests: bookingGuestsState,
    setBookingGuests,
    bookingMaxGuests,
    bookingTodayIso: todayIso,
    bookingMaxDateIso: maxDateIso,
    bookingUnavailableRanges,
    bookingUnavailableLoading: unavailableRangesQuery.isLoading || availabilityBlocksQuery.isLoading,
    shortTermNightlyPrice,
    shortTermCurrency,
    isFavorite,
    favoriteIds,
    isOwnProperty,
    propertyReviews,
    propertyReviewsLoading: propertyReviewsQuery.isLoading,
    propertyReviewsError: propertyReviewsQuery.error
      ? getApiErrorMessage(propertyReviewsQuery.error, REVIEWS_ERROR_MESSAGE)
      : null,
    canLeaveShortTermReview,
    shortTermReviewHint,
    pendingReviewBookingId: pendingReviewBooking?.id ?? null,
    pendingReviewBookingDateTo: pendingReviewBooking?.dateTo ?? null,
    createShortTermReview,
    createShortTermReviewPending: createReviewMutation.isPending,
  };
};

export type PropertyDetailsPageModel = ReturnType<typeof usePropertyDetailsPage>;
