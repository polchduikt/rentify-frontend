import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FALLBACK_IMAGE, resolveLocationFallback } from '@/components/property-details/constants';
import { parseCoordinate } from '@/components/property-details/utils';
import { usePropertyByIdQuery, usePublicProfileQuery, useSearchPropertiesQuery } from '@/hooks/api';
import type { AmenityDto } from '@/types/property';
import { getApiErrorMessage } from '@/utils/errors';
import { geocodeAddress } from '@/utils/geocoding';

const RECOMMENDATION_CARDS_PER_VIEW = 3;

const FALLBACK_CITY_LABEL = '\u041c\u0456\u0441\u0442\u043e \u043d\u0435 \u0432\u043a\u0430\u0437\u0430\u043d\u043e';
const FALLBACK_OWNER_LABEL = '\u0412\u043b\u0430\u0441\u043d\u0438\u043a \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f';
const PROPERTY_ERROR_MESSAGE =
  '\u041d\u0435 \u0432\u0434\u0430\u043b\u043e\u0441\u044f \u0437\u0430\u0432\u0430\u043d\u0442\u0430\u0436\u0438\u0442\u0438 \u043e\u0433\u043e\u043b\u043e\u0448\u0435\u043d\u043d\u044f';

export const usePropertyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const isValidId = Number.isFinite(numericId) && numericId > 0;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [recommendedStart, setRecommendedStart] = useState(0);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCoordsLoading, setMapCoordsLoading] = useState(false);

  const propertyQuery = usePropertyByIdQuery(numericId, isValidId);
  const property = propertyQuery.data ?? null;

  const ownerQuery = usePublicProfileQuery(property?.hostId ?? 0, Boolean(property?.hostId));
  const recommendationsQuery = useSearchPropertiesQuery(
    {
      city: property?.address?.location?.city,
      rentalType: 'LONG_TERM',
    },
    { page: 0, size: 18, sort: 'createdAt,desc' },
    Boolean(property?.address?.location?.city)
  );

  const photos = useMemo(() => {
    if (!property?.photos?.length) {
      return [FALLBACK_IMAGE];
    }

    const mapped = property.photos.map((photo) => photo.url).filter((url): url is string => Boolean(url));
    return mapped.length > 0 ? mapped : [FALLBACK_IMAGE];
  }, [property?.photos]);

  const groupedAmenities = useMemo(() => {
    const amenitiesByCategory = new Map<string, AmenityDto[]>();
    if (!property?.amenities) {
      return [] as Array<{ category: string; amenities: AmenityDto[] }>;
    }

    property.amenities.forEach((amenity) => {
      const current = amenitiesByCategory.get(amenity.category) ?? [];
      current.push(amenity);
      amenitiesByCategory.set(amenity.category, current);
    });

    return Array.from(amenitiesByCategory.entries()).map(([category, amenities]) => ({ category, amenities }));
  }, [property?.amenities]);

  const recommended = useMemo(() => {
    const items = recommendationsQuery.data?.content ?? [];
    return items.filter((item) => item.id !== property?.id && item.rentalType === 'LONG_TERM');
  }, [recommendationsQuery.data?.content, property?.id]);

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

  const city = property?.address?.location?.city || FALLBACK_CITY_LABEL;
  const addressLine = [property?.address?.street, property?.address?.houseNumber, property?.address?.apartment]
    .filter(Boolean)
    .join(', ');
  const pricePerMonth = Number(property?.pricing?.pricePerMonth || property?.pricing?.pricePerNight || 0);
  const currency = property?.pricing?.currency || 'UAH';

  const owner = ownerQuery.data;
  const ownerName =
    owner?.firstName || owner?.lastName ? [owner?.firstName, owner?.lastName].filter(Boolean).join(' ') : FALLBACK_OWNER_LABEL;
  const ownerInitial = owner?.firstName?.charAt(0)?.toUpperCase() || 'U';

  const hasPropertyError = !propertyQuery.isLoading && (Boolean(propertyQuery.error) || !property);

  return {
    numericId,
    isValidId,
    isLoading: propertyQuery.isLoading,
    hasPropertyError,
    errorMessage: hasPropertyError ? getApiErrorMessage(propertyQuery.error, PROPERTY_ERROR_MESSAGE) : null,
    isShortTerm: property?.rentalType === 'SHORT_TERM',
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
  };
};

export type PropertyDetailsPageModel = ReturnType<typeof usePropertyDetailsPage>;
