import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import {
  useAmenitiesGroupedQuery,
  useCreateAvailabilityBlockMutation,
  useCreatePropertyMutation,
  useDeletePropertyPhotoMutation,
  useLocationSuggestQuery,
  usePropertyByIdQuery,
  useUpdatePropertyMutation,
  useUploadPropertyPhotoMutation,
} from '@/hooks/api';
import type { LocationSuggestionDto } from '@/types/location';
import type { PropertyPhotoDto } from '@/types/property';
import type { AvailabilityDraft, PropertyCreateFormValues } from '@/types/propertyCreate';
import {
  sortPropertyPhotos,
  toFormValuesFromProperty,
  toLocationRefIdsFromProperty,
  toLocationRefIdsFromSuggestion,
} from '@/services/adapters/propertyCreateAdapter';
import { getApiErrorMessage } from '@/utils/errors';
import {
  buildCreatePropertyPayload,
  createPropertyDefaultValues,
  hasDateRangeConflict,
  type PropertyLocationRefIds,
  propertyCreateSchema,
} from '@/utils/propertyCreate';
import { geocodeAddress, reverseGeocodeCoordinates } from '@/utils/geocoding';
import {
  areIdsEqual,
  createEmptyAvailabilityDraft,
  hasText,
  isNotFoundError,
  STEP_FIELDS,
  toFileFromUrl,
  toNumber,
} from '@/utils/propertyCreatePage';

interface UseCreatePropertyPageOptions {
  propertyId?: number;
}

export const useCreatePropertyPage = (options?: UseCreatePropertyPageOptions) => {
  const navigate = useNavigate();
  const propertyId = Number(options?.propertyId ?? 0);
  const isEditMode = Number.isFinite(propertyId) && propertyId > 0;

  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<PropertyPhotoDto[]>([]);
  const [amenitySlugs, setAmenitySlugs] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestionDto>();
  const [locationRefIds, setLocationRefIds] = useState<PropertyLocationRefIds>({});
  const [availabilityDraft, setAvailabilityDraft] = useState<AvailabilityDraft>(createEmptyAvailabilityDraft);
  const [availabilityBlocks, setAvailabilityBlocks] = useState<AvailabilityDraft[]>([]);
  const [availabilityError, setAvailabilityError] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [reverseGeocodingError, setReverseGeocodingError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const skipForwardGeocodeRef = useRef(false);
  const initializedEditPropertySnapshotRef = useRef<string | null>(null);
  const initialExistingPhotoIdsRef = useRef<number[]>([]);

  const form = useForm<PropertyCreateFormValues>({
    resolver: zodResolver(propertyCreateSchema),
    defaultValues: createPropertyDefaultValues(),
    mode: 'onChange',
  });
  const { reset, setValue } = form;

  const locationQuery = form.watch('cityQuery');

  const locationSuggestionsQuery = useLocationSuggestQuery(
    {
      q: locationQuery,
      limit: 8,
    },
    locationQuery.trim().length >= 2,
  );

  const amenitiesGroupedQuery = useAmenitiesGroupedQuery();
  const editPropertyQuery = usePropertyByIdQuery(propertyId, isEditMode);
  const createPropertyMutation = useCreatePropertyMutation();
  const updatePropertyMutation = useUpdatePropertyMutation();
  const uploadPhotoMutation = useUploadPropertyPhotoMutation();
  const deletePhotoMutation = useDeletePropertyPhotoMutation();
  const createAvailabilityBlockMutation = useCreateAvailabilityBlockMutation();
  const existingPhotosCount = existingPhotos.length;

  const isSubmitting =
    (isEditMode ? updatePropertyMutation.isPending : createPropertyMutation.isPending) ||
    uploadPhotoMutation.isPending ||
    deletePhotoMutation.isPending ||
    createAvailabilityBlockMutation.isPending;

  const totalSteps = STEP_FIELDS.length;

  const canGoNext = step < totalSteps - 1;
  const canGoPrev = step > 0;

  const onPickCoordinates = (lat: number, lng: number) => {
    skipForwardGeocodeRef.current = true;
    setSelectedLocation(undefined);
    setLocationRefIds({});
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
    setLocationRefIds({});
    form.setValue('cityQuery', value, { shouldValidate: true, shouldDirty: true });
  };

  const onSelectLocationSuggestion = (suggestion: LocationSuggestionDto) => {
    setSelectedLocation(suggestion);
    setLocationRefIds(toLocationRefIdsFromSuggestion(suggestion));
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

  const removeExistingPhoto = (photoId: number) => {
    setExistingPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const moveExistingPhoto = (fromIndex: number, toIndex: number) => {
    setExistingPhotos((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length || fromIndex === toIndex) {
        return prev;
      }
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
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
    setAvailabilityDraft(createEmptyAvailabilityDraft());
  };

  const removeAvailabilityBlock = (index: number) => {
    setAvailabilityBlocks((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    if (editPropertyQuery.isFetching) {
      return;
    }

    const property = editPropertyQuery.data;
    if (!property) {
      return;
    }

    const snapshotKey = [
      property.id,
      property.updatedAt ?? '',
      property.rentalType ?? '',
      property.maxGuests ?? '',
      property.checkInTime ?? '',
      property.checkOutTime ?? '',
      (property.photos ?? []).map((photo) => `${photo.id}:${photo.sortOrder}`).join('|'),
    ].join('::');

    if (initializedEditPropertySnapshotRef.current === snapshotKey) {
      return;
    }

    const sortedExistingPhotos = sortPropertyPhotos(property.photos ?? []);

    skipForwardGeocodeRef.current = true;
    reset(toFormValuesFromProperty(property));
    setAmenitySlugs(property.amenities?.map((amenity) => amenity.slug) ?? []);
    setLocationRefIds(toLocationRefIdsFromProperty(property));
    setSelectedLocation(undefined);
    setExistingPhotos(sortedExistingPhotos);
    initialExistingPhotoIdsRef.current = sortedExistingPhotos.map((photo) => photo.id);
    setAvailabilityBlocks([]);
    setAvailabilityDraft(createEmptyAvailabilityDraft());
    setAvailabilityError('');
    setPhotos([]);
    setStep(0);
    setSubmitError('');
    setSubmitSuccess('');
    initializedEditPropertySnapshotRef.current = snapshotKey;
  }, [editPropertyQuery.data, editPropertyQuery.isFetching, isEditMode, reset]);

  const goNextStep = async () => {
    if (!canGoNext) {
      return;
    }

    if (!stepCompletion[step]) {
      await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
      if (step === 3 && photos.length + existingPhotosCount === 0) {
        setSubmitError('Додайте хоча б одне фото, щоб перейти далі.');
      }
      return;
    }

    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (valid) {
      if (step === 3 && photos.length + existingPhotosCount === 0) {
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

    if (photos.length + existingPhotosCount === 0) {
      setStep(3);
      setSubmitError('Додайте хоча б одне фото, щоб зберегти оголошення.');
      return;
    }

    try {
      const payload = buildCreatePropertyPayload(values, selectedLocation, amenitySlugs, locationRefIds);
      const savedProperty = isEditMode
        ? await updatePropertyMutation.mutateAsync({ id: propertyId, payload })
        : await createPropertyMutation.mutateAsync(payload);

      const currentExistingPhotoIds = existingPhotos.map((photo) => photo.id);
      const existingPhotosChanged =
        isEditMode && !areIdsEqual(initialExistingPhotoIdsRef.current, currentExistingPhotoIds);

      if (existingPhotosChanged) {
        const existingFiles = await Promise.all(
          existingPhotos.map((photo, index) => toFileFromUrl(photo.url, `property-${savedProperty.id}-existing-${index + 1}`)),
        );

        for (const photoId of initialExistingPhotoIdsRef.current) {
          try {
            await deletePhotoMutation.mutateAsync({
              propertyId: savedProperty.id,
              photoId,
            });
          } catch (error) {
            if (!isNotFoundError(error)) {
              throw error;
            }
          }
        }

        const orderedFiles = [...existingFiles, ...photos];
        for (const file of orderedFiles) {
          await uploadPhotoMutation.mutateAsync({
            propertyId: savedProperty.id,
            file,
          });
        }
      } else if (photos.length > 0) {
        for (const file of photos) {
          await uploadPhotoMutation.mutateAsync({
            propertyId: savedProperty.id,
            file,
          });
        }
      }

      if (availabilityBlocks.length > 0) {
        await Promise.all(
          availabilityBlocks.map((block) =>
            createAvailabilityBlockMutation.mutateAsync({
              propertyId: savedProperty.id,
              payload: {
                dateFrom: block.dateFrom,
                dateTo: block.dateTo,
                reason: block.reason || undefined,
              },
            }),
          ),
        );
      }

      setSubmitSuccess(
        isEditMode
          ? `Оголошення #${savedProperty.id} оновлено успішно.`
          : `Оголошення #${savedProperty.id} створено успішно.`,
      );
      navigate(isEditMode ? ROUTES.profile : ROUTES.search, { replace: false });
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, isEditMode ? 'Не вдалося оновити оголошення' : 'Не вдалося створити оголошення'),
      );
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
    const step1 =
      hasText(cityQueryValue, 2) &&
      hasText(countryValue, 2) &&
      hasText(cityValue, 2) &&
      hasText(streetValue, 2) &&
      lat != null &&
      lng != null;
    const step2Base =
      rooms != null &&
      rooms >= 1 &&
      floor != null &&
      floor >= 0 &&
      totalFloors != null &&
      totalFloors >= 1 &&
      areaSqm != null &&
      areaSqm > 0;
    const step2 =
      rentalType === 'SHORT_TERM'
        ? step2Base && maxGuests != null && maxGuests >= 1 && hasText(checkInTimeValue) && hasText(checkOutTimeValue)
        : step2Base;
    const step3 = photos.length + existingPhotosCount > 0;
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
    existingPhotosCount,
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
    [stepCompletion],
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

  const initialDataError =
    isEditMode && editPropertyQuery.error
      ? getApiErrorMessage(editPropertyQuery.error, 'Не вдалося завантажити оголошення для редагування.')
      : null;

  return {
    form,
    step,
    totalSteps,
    canGoNext,
    canGoPrev,
    photos,
    setPhotos,
    existingPhotos,
    existingPhotosCount,
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
    removeExistingPhoto,
    moveExistingPhoto,
    onPickCoordinates,
    onCityQueryChange,
    onSelectLocationSuggestion,
    setAvailabilityDraft,
    addAvailabilityBlock,
    removeAvailabilityBlock,
    isEditMode,
    initialDataLoading: isEditMode && editPropertyQuery.isLoading && !editPropertyQuery.data,
    initialDataError,
  };
};

export type CreatePropertyPageModel = ReturnType<typeof useCreatePropertyPage>;
