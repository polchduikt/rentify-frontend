import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import {
  useAmenitiesGroupedQuery,
  useCreateAvailabilityBlockMutation,
  useCreatePropertyMutation,
  useLocationSuggestQuery,
  useUploadPropertyPhotoMutation,
} from '@/hooks/api';
import type { AvailabilityDraft, PropertyCreateFormValues } from '@/types/propertyCreate';
import { getApiErrorMessage } from '@/utils/errors';
import {
  buildCreatePropertyPayload,
  createPropertyDefaultValues,
  hasDateRangeConflict,
  propertyCreateSchema,
} from '@/utils/propertyCreate';
import { geocodeAddress, reverseGeocodeCoordinates } from '@/utils/geocoding';
import type { LocationSuggestionDto } from '@/types/location';

const STEP_FIELDS: Array<Array<keyof PropertyCreateFormValues>> = [
  ['rentalType', 'propertyType', 'title', 'description'],
  ['cityQuery', 'country', 'city', 'street', 'lat', 'lng'],
  ['rooms', 'floor', 'totalFloors', 'areaSqm', 'maxGuests', 'checkInTime', 'checkOutTime'],
  [],
  ['pricePerNight', 'pricePerMonth', 'currency'],
];

const hasText = (value: string, minLength = 1) => value.trim().length >= minLength;

const toNumber = (value: string): number | undefined => {
  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const useCreatePropertyPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [amenitySlugs, setAmenitySlugs] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestionDto>();
  const [availabilityDraft, setAvailabilityDraft] = useState<AvailabilityDraft>({
    dateFrom: '',
    dateTo: '',
    reason: '',
  });
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityDraft[]>([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [reverseGeocodingError, setReverseGeocodingError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const skipForwardGeocodeRef = useRef(false);

  const form = useForm<PropertyCreateFormValues>({
    resolver: zodResolver(propertyCreateSchema),
    defaultValues: createPropertyDefaultValues(),
    mode: 'onChange',
  });
  const { setValue } = form;

  const locationQuery = form.watch('cityQuery');

  const locationSuggestionsQuery = useLocationSuggestQuery(
    {
      q: locationQuery,
      limit: 8,
    },
    locationQuery.trim().length >= 2
  );

  const amenitiesGroupedQuery = useAmenitiesGroupedQuery();
  const createPropertyMutation = useCreatePropertyMutation();
  const uploadPhotoMutation = useUploadPropertyPhotoMutation();
  const createAvailabilityBlockMutation = useCreateAvailabilityBlockMutation();

  const isSubmitting =
    createPropertyMutation.isPending ||
    uploadPhotoMutation.isPending ||
    createAvailabilityBlockMutation.isPending;

  const totalSteps = STEP_FIELDS.length;

  const canGoNext = step < totalSteps - 1;
  const canGoPrev = step > 0;

  const onPickCoordinates = (lat: number, lng: number) => {
    skipForwardGeocodeRef.current = true;
    setSelectedLocation(undefined);
    setValue('lat', lat.toFixed(6), { shouldValidate: true, shouldDirty: true });
    setValue('lng', lng.toFixed(6), { shouldValidate: true, shouldDirty: true });
    setReverseGeocodingError('');
    setIsReverseGeocoding(true);

    const abortController = new AbortController();
    void reverseGeocodeCoordinates(lat, lng, abortController.signal)
      .then((address) => {
        if (!address) {
          return;
        }

        if (address.country) {
          setValue('country', address.country, { shouldDirty: true, shouldValidate: true });
        }
        if (address.region) {
          setValue('region', address.region, { shouldDirty: true, shouldValidate: true });
        }
        if (address.city) {
          setValue('city', address.city, { shouldDirty: true, shouldValidate: true });
          setValue('cityQuery', address.city, { shouldDirty: true, shouldValidate: true });
        }
        if (address.street) {
          setValue('street', address.street, { shouldDirty: true, shouldValidate: true });
        }
        if (address.houseNumber) {
          setValue('houseNumber', address.houseNumber, { shouldDirty: true, shouldValidate: true });
        }
        if (address.postalCode) {
          setValue('postalCode', address.postalCode, { shouldDirty: true, shouldValidate: true });
        }
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name === 'AbortError') {
          return;
        }
        setReverseGeocodingError('Не вдалося автоматично визначити адресу за точкою. Можна ввести вручну.');
      })
      .finally(() => {
        setIsReverseGeocoding(false);
      });
  };

  const onCityQueryChange = (value: string) => {
    setSelectedLocation(undefined);
    form.setValue('cityQuery', value, { shouldValidate: true, shouldDirty: true });
  };

  const onSelectLocationSuggestion = (suggestion: LocationSuggestionDto) => {
    setSelectedLocation(suggestion);
    form.setValue('cityQuery', suggestion.name, { shouldValidate: true, shouldDirty: true });
    form.setValue('country', suggestion.country || 'Ukraine', { shouldValidate: true, shouldDirty: true });
    form.setValue('region', suggestion.region || '', { shouldValidate: true, shouldDirty: true });
    form.setValue('city', suggestion.type === 'CITY' ? suggestion.name : suggestion.cityName, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const toggleAmenity = (slug: string) => {
    setAmenitySlugs((prev) => (prev.includes(slug) ? prev.filter((item) => item !== slug) : [...prev, slug]));
  };

  const addAvailabilityBlock = () => {
    if (!availabilityDraft.dateFrom || !availabilityDraft.dateTo) {
      setAvailabilityError('Вкажіть початок і кінець періоду.');
      return;
    }
    if (hasDateRangeConflict(availabilityDraft.dateFrom, availabilityDraft.dateTo)) {
      setAvailabilityError('Дата початку не може бути пізніше за дату завершення.');
      return;
    }

    setAvailabilityError('');
    setAvailabilityBlocks((prev) => [...prev, availabilityDraft]);
    setAvailabilityDraft({
      dateFrom: '',
      dateTo: '',
      reason: '',
    });
  };

  const removeAvailabilityBlock = (index: number) => {
    setAvailabilityBlocks((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const goNextStep = async () => {
    if (!canGoNext) {
      return;
    }

    if (!stepCompletion[step]) {
      await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
      if (step === 3 && photos.length === 0) {
        setSubmitError('Додайте хоча б одне фото, щоб перейти далі.');
      }
      return;
    }

    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (valid) {
      if (step === 3 && photos.length === 0) {
        setSubmitError('Додайте хоча б одне фото, щоб перейти далі.');
        return;
      }
      setSubmitError('');
      setStep((prev) => Math.min(totalSteps - 1, prev + 1));
    }
  };

  const goPrevStep = () => {
    if (canGoPrev) {
      setStep((prev) => Math.max(0, prev - 1));
    }
  };

  const publishProperty = form.handleSubmit(async (values) => {
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const payload = buildCreatePropertyPayload(values, selectedLocation, amenitySlugs);
      const created = await createPropertyMutation.mutateAsync(payload);

      if (photos.length > 0) {
        await Promise.all(
          photos.map((file) =>
            uploadPhotoMutation.mutateAsync({
              propertyId: created.id,
              file,
            })
          )
        );
      }

      if (availabilityBlocks.length > 0) {
        await Promise.all(
          availabilityBlocks.map((block) =>
            createAvailabilityBlockMutation.mutateAsync({
              propertyId: created.id,
              payload: {
                dateFrom: block.dateFrom,
                dateTo: block.dateTo,
                reason: block.reason || undefined,
              },
            })
          )
        );
      }

      setSubmitSuccess(`Оголошення #${created.id} створено успішно.`);
      navigate(ROUTES.search, { replace: false });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Не вдалося створити оголошення'));
    }
  });

  const latValue = form.watch('lat');
  const lngValue = form.watch('lng');
  const rentalType = form.watch('rentalType');
  const propertyTypeValue = form.watch('propertyType');
  const titleValue = form.watch('title');
  const descriptionValue = form.watch('description');
  const cityQueryValue = form.watch('cityQuery');
  const countryValue = form.watch('country');
  const regionValue = form.watch('region');
  const cityValue = form.watch('city');
  const streetValue = form.watch('street');
  const houseNumberValue = form.watch('houseNumber');
  const roomsValue = form.watch('rooms');
  const floorValue = form.watch('floor');
  const totalFloorsValue = form.watch('totalFloors');
  const areaSqmValue = form.watch('areaSqm');
  const maxGuestsValue = form.watch('maxGuests');
  const checkInTimeValue = form.watch('checkInTime');
  const checkOutTimeValue = form.watch('checkOutTime');
  const pricePerNightValue = form.watch('pricePerNight');
  const pricePerMonthValue = form.watch('pricePerMonth');
  const currencyValue = form.watch('currency');

  useEffect(() => {
    if (rentalType === 'LONG_TERM') {
      setAvailabilityError('');
      setAvailabilityBlocks([]);
      setAvailabilityDraft({
        dateFrom: '',
        dateTo: '',
        reason: '',
      });
      setValue('maxGuests', '', { shouldDirty: true });
      setValue('checkInTime', '', { shouldDirty: true });
      setValue('checkOutTime', '', { shouldDirty: true });
    }
  }, [rentalType, setValue]);

  useEffect(() => {
    const city = cityValue.trim();
    const country = countryValue.trim();

    if (skipForwardGeocodeRef.current) {
      skipForwardGeocodeRef.current = false;
      return undefined;
    }

    if (!city || !country) {
      return undefined;
    }

    const streetLine = [streetValue.trim(), houseNumberValue.trim()].filter(Boolean).join(' ');
    const queryParts = [streetLine, city, regionValue.trim(), country].filter(Boolean);
    const geocodeQuery = queryParts.join(', ');

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void geocodeAddress(geocodeQuery, abortController.signal)
        .then((point) => {
          if (!point) {
            return;
          }
          setValue('lat', point.lat.toFixed(6), { shouldDirty: true, shouldValidate: true });
          setValue('lng', point.lng.toFixed(6), { shouldDirty: true, shouldValidate: true });
        })
        .catch((error: unknown) => {
          if ((error as { name?: string }).name === 'AbortError') {
            return;
          }
        });
    }, 500);

    return () => {
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [cityValue, countryValue, houseNumberValue, regionValue, setValue, streetValue]);

  const selectedCoords = useMemo(() => {
    const lat = Number(latValue);
    const lng = Number(lngValue);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return undefined;
    }
    return { lat, lng };
  }, [latValue, lngValue]);

  const stepCompletion = useMemo(() => {
    const lat = toNumber(latValue);
    const lng = toNumber(lngValue);
    const rooms = toNumber(roomsValue);
    const floor = toNumber(floorValue);
    const totalFloors = toNumber(totalFloorsValue);
    const areaSqm = toNumber(areaSqmValue);
    const maxGuests = toNumber(maxGuestsValue);
    const pricePerNight = toNumber(pricePerNightValue);
    const pricePerMonth = toNumber(pricePerMonthValue);

    const step0 = !!rentalType && hasText(propertyTypeValue) && hasText(titleValue, 10) && hasText(descriptionValue, 30);
    const step1 = hasText(cityQueryValue, 2) && hasText(countryValue, 2) && hasText(cityValue, 2) && hasText(streetValue, 2) && lat != null && lng != null;
    const step2Base = rooms != null && rooms >= 1 && floor != null && floor >= 0 && totalFloors != null && totalFloors >= 1 && areaSqm != null && areaSqm > 0;
    const step2 =
      rentalType === 'SHORT_TERM'
        ? step2Base && maxGuests != null && maxGuests >= 1 && hasText(checkInTimeValue) && hasText(checkOutTimeValue)
        : step2Base;
    const step3 = photos.length > 0;
    const step4 =
      hasText(currencyValue, 3) &&
      (rentalType === 'SHORT_TERM'
        ? pricePerNight != null && pricePerNight > 0
        : pricePerMonth != null && pricePerMonth > 0);

    return [step0, step1, step2, step3, step4];
  }, [
    areaSqmValue,
    checkInTimeValue,
    checkOutTimeValue,
    cityQueryValue,
    cityValue,
    countryValue,
    currencyValue,
    descriptionValue,
    floorValue,
    latValue,
    lngValue,
    maxGuestsValue,
    photos.length,
    pricePerMonthValue,
    pricePerNightValue,
    propertyTypeValue,
    roomsValue,
    rentalType,
    streetValue,
    titleValue,
    totalFloorsValue,
  ]);

  const stepLocks = useMemo(
    () => stepCompletion.map((_, index) => (index === 0 ? false : stepCompletion.slice(0, index).some((done) => !done))),
    [stepCompletion]
  );

  const goToStep = (nextStep: number) => {
    if (nextStep < 0 || nextStep >= totalSteps) {
      return;
    }
    if (stepLocks[nextStep]) {
      return;
    }
    setStep(nextStep);
  };

  return {
    form,
    step,
    totalSteps,
    canGoNext,
    canGoPrev,
    photos,
    setPhotos,
    amenitySlugs,
    availabilityDraft,
    availabilityBlocks,
    availabilityError,
    submitError,
    submitSuccess,
    isReverseGeocoding,
    reverseGeocodingError,
    isSubmitting,
    amenitiesGrouped: amenitiesGroupedQuery.data ?? [],
    amenitiesLoading: amenitiesGroupedQuery.isLoading || amenitiesGroupedQuery.isFetching,
    suggestions: locationSuggestionsQuery.data ?? [],
    suggestionsLoading: locationSuggestionsQuery.isLoading || locationSuggestionsQuery.isFetching,
    selectedCoords,
    stepCompletion,
    stepLocks,
    setStep,
    goToStep,
    goNextStep,
    goPrevStep,
    publishProperty,
    toggleAmenity,
    onPickCoordinates,
    onCityQueryChange,
    onSelectLocationSuggestion,
    setAvailabilityDraft,
    addAvailabilityBlock,
    removeAvailabilityBlock,
  };
};

export type CreatePropertyPageModel = ReturnType<typeof useCreatePropertyPage>;
