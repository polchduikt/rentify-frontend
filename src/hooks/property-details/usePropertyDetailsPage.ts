import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FALLBACK_IMAGE, resolveLocationFallback } from '@/constants/propertyDetails';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReviewedBookingIds,
  groupAmenitiesByCategory,
  normalizePropertyPhotos,
  resolveOwnerPresentation,
  resolvePropertyAddressLine,
  resolvePropertyCity,
} from '@/services/adapters/propertyDetailsAdapter';
import {
  useCreateReviewMutation,
  useMyBookingsQuery,
  useMyFavoritesQuery,
  usePropertyByIdQuery,
  usePropertyReviewsQuery,
  usePublicProfileQuery,
  useSearchPropertiesQuery,
} from '@/hooks/api';
import type { ReviewRequestDto } from '@/types/review';
import { parseCoordinate } from '@/utils/propertyDetails';
import { toIsoDate } from '@/utils/bookingDates';
import { getApiErrorMessage } from '@/utils/errors';
import { geocodeAddress } from '@/utils/geocoding';

const RECOMMENDATION_CARDS_PER_VIEW = 3;

const FALLBACK_CITY_LABEL = '\u041c\u0456\u0441\u0442\u043e \u043d\u0435 \u0432\u043a\u0430\u0437\u0430\u043d\u043e';
const FALLBACK_OWNER_LABEL = '\u0412\u043b\u0430\u0441\u043d\u0438\u043a \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f';
const PROPERTY_ERROR_MESSAGE =
  '\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438 \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f';
const REVIEWS_ERROR_MESSAGE =
  '\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438 \u0432\u0456\u0434\u0433\u0443\u043a\u0438';
const REVIEW_REQUIRES_COMPLETED_BOOKING_MESSAGE =
  '\u0412\u0456\u0434\u0433\u0443\u043a \u043c\u043e\u0436\u043d\u0430 \u0437\u0430\u043b\u0438\u0448\u0438\u0442\u0438 \u043f\u0456\u0441\u043b\u044f \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u043e\u0433\u043e \u0431\u0440\u043e\u043d\u044e\u0432\u0430\u043d\u043d\u044f \u0442\u0430 \u0443\u0441\u043f\u0456\u0448\u043d\u043e\u0433\u043e \u0432\u0438\u0457\u0437\u0434\u0443.';
const REVIEW_ALREADY_LEFT_MESSAGE =
  '\u0412\u0438 \u0432\u0436\u0435 \u0437\u0430\u043b\u0438\u0448\u0438\u043b\u0438 \u0432\u0456\u0434\u0433\u0443\u043a \u0437\u0430 \u0432\u0441\u0456 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043d\u0456 \u0431\u0440\u043e\u043d\u044e\u0432\u0430\u043d\u043d\u044f \u0446\u0456\u0454\u0457 \u043f\u0440\u043e\u043f\u043e\u0437\u0438\u0446\u0456\u0457.';
const REVIEW_LOGIN_MESSAGE =
  '\u0410\u0432\u0442\u043e\u0440\u0438\u0437\u0443\u0439\u0442\u0435\u0441\u044f, \u0449\u043e\u0431 \u0437\u0430\u043b\u0438\u0448\u0438\u0442\u0438 \u0432\u0456\u0434\u0433\u0443\u043a.';
const OWN_PROPERTY_REVIEW_MESSAGE =
  '\u0412\u0438 \u043d\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u0437\u0430\u043b\u0438\u0448\u0430\u0442\u0438 \u0432\u0456\u0434\u0433\u0443\u043a \u0434\u043e \u0432\u043b\u0430\u0441\u043d\u043e\u0433\u043e \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f.';

export const usePropertyDetailsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const isValidId = Number.isFinite(numericId) && numericId > 0;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [recommendedStart, setRecommendedStart] = useState(0);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCoordsLoading, setMapCoordsLoading] = useState(false);

  const propertyQuery = usePropertyByIdQuery(numericId, isValidId);
  const property = propertyQuery.data ?? null;
  const isShortTerm = property?.rentalType === 'SHORT_TERM';
  const isOwnProperty = Boolean(property?.hostId && user?.id && property.hostId === user.id);
  const recommendationRentalType = property?.rentalType;
  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const ownerQuery = usePublicProfileQuery(property?.hostId ?? 0, Boolean(property?.hostId));
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
      city: property?.address?.location?.city,
      rentalType: recommendationRentalType,
    },
    { page: 0, size: 18, sort: 'createdAt,desc' },
    Boolean(property?.address?.location?.city && recommendationRentalType)
  );

  const photos = useMemo(() => normalizePropertyPhotos(property, FALLBACK_IMAGE), [property]);
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
      property.address?.location?.city,
      property.address?.location?.region,
      property.address?.location?.country,
    ]
      .filter(Boolean)
      .join(', ');

    if (!query.trim()) {
      const [fallbackLat, fallbackLng] = resolveLocationFallback(
        property.address?.location?.city,
        property.address?.location?.region
      );
      setMapCoords({ lat: fallbackLat, lng: fallbackLng });
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
        const [fallbackLat, fallbackLng] = resolveLocationFallback(
          property.address?.location?.city,
          property.address?.location?.region
        );
        setMapCoords({ lat: fallbackLat, lng: fallbackLng });
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
  }, [property]);

  const fallbackMapCenter = resolveLocationFallback(property?.address?.location?.city, property?.address?.location?.region);
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

  const pricePerMonth = Number(property?.pricing?.pricePerMonth || property?.pricing?.pricePerNight || 0);
  const currency = property?.pricing?.currency || 'UAH';

  const owner = ownerQuery.data;
  const { ownerName, ownerInitial } = resolveOwnerPresentation(owner, FALLBACK_OWNER_LABEL);

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
    pricePerMonth,
    currency,
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
