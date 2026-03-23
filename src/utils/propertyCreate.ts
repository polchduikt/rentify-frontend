import { z } from 'zod';
import type { LocationSuggestionDto } from '@/types/location';
import type { PropertyCreateRequestDto } from '@/types/property';
import type { PropertyCreateFormValues } from '@/types/propertyCreate';

export interface PropertyLocationRefIds {
  cityId?: number;
  districtId?: number;
  metroStationId?: number;
  residentialComplexId?: number;
}

const numberText = z
  .string()
  .trim()
  .regex(/^\d*([.,]\d+)?$/, 'Має бути числом');

export const propertyCreateSchema = z
  .object({
    rentalType: z.enum(['LONG_TERM', 'SHORT_TERM']),
    propertyType: z.string().trim().min(1, 'Оберіть тип нерухомості'),
    marketType: z.enum(['SECONDARY', 'NEW_BUILD']).optional(),
    title: z.string().trim().min(10, 'Мінімум 10 символів').max(160, 'Максимум 160 символів'),
    description: z.string().trim().min(30, 'Мінімум 30 символів').max(5000, 'Максимум 5000 символів'),
    cityQuery: z.string().trim().min(2, 'Вкажіть місто або район'),
    country: z.string().trim().min(2, 'Вкажіть країну'),
    region: z.string().trim(),
    city: z.string().trim().min(2, 'Вкажіть місто'),
    street: z.string().trim().min(2, 'Вкажіть вулицю'),
    houseNumber: z.string().trim(),
    apartment: z.string().trim(),
    postalCode: z.string().trim(),
    lat: z.string().trim().min(1, 'Оберіть точку на карті'),
    lng: z.string().trim().min(1, 'Оберіть точку на карті'),
    rooms: numberText,
    floor: numberText,
    totalFloors: numberText,
    areaSqm: numberText,
    maxGuests: numberText,
    checkInTime: z.string().trim(),
    checkOutTime: z.string().trim(),
    petsAllowed: z.boolean(),
    smokingAllowed: z.boolean(),
    partiesAllowed: z.boolean(),
    additionalRules: z.string().trim().max(2000, 'Максимум 2000 символів'),
    isVerifiedProperty: z.boolean(),
    isVerifiedRealtor: z.boolean(),
    isDuplicate: z.boolean(),
    pricePerNight: numberText,
    pricePerMonth: numberText,
    securityDeposit: numberText,
    cleaningFee: numberText,
    currency: z.string().trim().min(3, 'Вкажіть валюту').max(8, 'Довга назва валюти'),
  })
  .superRefine((values, context) => {
    const pricePerNight = toPositiveNumber(values.pricePerNight);
    const pricePerMonth = toPositiveNumber(values.pricePerMonth);
    const maxGuests = toPositiveNumber(values.maxGuests);

    if (values.rentalType === 'SHORT_TERM') {
      if (!pricePerNight) {
        context.addIssue({
          code: 'custom',
          path: ['pricePerNight'],
          message: 'Для подобової оренди потрібна ціна за ніч',
        });
      }
      if (!maxGuests) {
        context.addIssue({
          code: 'custom',
          path: ['maxGuests'],
          message: 'Для подобової оренди вкажіть кількість гостей',
        });
      }
    }

    if (values.rentalType === 'LONG_TERM' && !pricePerMonth) {
      context.addIssue({
        code: 'custom',
        path: ['pricePerMonth'],
        message: 'Для довгострокової оренди потрібна ціна за місяць',
      });
    }
  });

export const createPropertyDefaultValues = (): PropertyCreateFormValues => ({
  rentalType: 'LONG_TERM',
  propertyType: '',
  marketType: undefined,
  title: '',
  description: '',
  cityQuery: '',
  country: 'Ukraine',
  region: '',
  city: '',
  street: '',
  houseNumber: '',
  apartment: '',
  postalCode: '',
  lat: '49.000000',
  lng: '31.000000',
  rooms: '',
  floor: '',
  totalFloors: '',
  areaSqm: '',
  maxGuests: '',
  checkInTime: '14:00',
  checkOutTime: '12:00',
  petsAllowed: false,
  smokingAllowed: false,
  partiesAllowed: false,
  additionalRules: '',
  isVerifiedProperty: false,
  isVerifiedRealtor: false,
  isDuplicate: false,
  pricePerNight: '',
  pricePerMonth: '',
  securityDeposit: '',
  cleaningFee: '',
  currency: 'UAH',
});

const toOptionalString = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const toNumber = (value?: string): number | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toPositiveNumber = (value?: string): number | undefined => {
  const parsed = toNumber(value);
  return parsed && parsed > 0 ? parsed : undefined;
};

const toPositiveInteger = (value?: number): number | undefined => {
  if (value == null || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return Math.round(value);
};

const toLocationRefIds = (suggestion?: LocationSuggestionDto) => {
  if (!suggestion) {
    return {
      cityId: undefined,
      districtId: undefined,
      metroStationId: undefined,
      residentialComplexId: undefined,
    };
  }

  return {
    cityId: toPositiveInteger(suggestion.type === 'CITY' ? suggestion.id : suggestion.cityId),
    districtId: toPositiveInteger(suggestion.type === 'DISTRICT' ? suggestion.id : undefined),
    metroStationId: toPositiveInteger(suggestion.type === 'METRO' ? suggestion.id : undefined),
    residentialComplexId: toPositiveInteger(suggestion.type === 'RESIDENTIAL_COMPLEX' ? suggestion.id : undefined),
  };
};

const toIntegerOrUndefined = (value?: string): number | undefined => {
  const parsed = toNumber(value);
  if (!parsed && parsed !== 0) {
    return undefined;
  }
  const intValue = Math.round(parsed);
  return intValue > 0 ? intValue : undefined;
};

export const buildCreatePropertyPayload = (
  values: PropertyCreateFormValues,
  selectedLocation: LocationSuggestionDto | undefined,
  amenitySlugs: string[],
  locationRefIdsOverride?: PropertyLocationRefIds
): PropertyCreateRequestDto => {
  const locationRefIds = locationRefIdsOverride ?? toLocationRefIds(selectedLocation);
  const isShortTerm = values.rentalType === 'SHORT_TERM';

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    rentalType: values.rentalType,
    propertyType: values.propertyType,
    marketType: values.marketType,
    isVerifiedProperty: values.isVerifiedProperty,
    isVerifiedRealtor: values.isVerifiedRealtor,
    isDuplicate: values.isDuplicate,
    rooms: toIntegerOrUndefined(values.rooms),
    floor: toIntegerOrUndefined(values.floor),
    totalFloors: toIntegerOrUndefined(values.totalFloors),
    areaSqm: toNumber(values.areaSqm),
    maxGuests: isShortTerm ? toIntegerOrUndefined(values.maxGuests) : undefined,
    checkInTime: isShortTerm ? toOptionalString(values.checkInTime) : undefined,
    checkOutTime: isShortTerm ? toOptionalString(values.checkOutTime) : undefined,
    amenitySlugs: amenitySlugs.length > 0 ? amenitySlugs : undefined,
    address: {
      location: {
        country: values.country.trim(),
        region: toOptionalString(values.region),
        city: values.city.trim(),
      },
      cityId: locationRefIds.cityId,
      districtId: locationRefIds.districtId,
      metroStationId: locationRefIds.metroStationId,
      residentialComplexId: locationRefIds.residentialComplexId,
      street: values.street.trim(),
      houseNumber: toOptionalString(values.houseNumber),
      apartment: toOptionalString(values.apartment),
      postalCode: toOptionalString(values.postalCode),
      lat: toNumber(values.lat),
      lng: toNumber(values.lng),
    },
    pricing: {
      currency: values.currency.trim().toUpperCase(),
      pricePerNight: toNumber(values.pricePerNight),
      pricePerMonth: toNumber(values.pricePerMonth),
      securityDeposit: toNumber(values.securityDeposit) ?? 0,
      cleaningFee: toNumber(values.cleaningFee) ?? 0,
    },
    rules: {
      petsAllowed: values.petsAllowed,
      smokingAllowed: values.smokingAllowed,
      partiesAllowed: values.partiesAllowed,
      additionalRules: toOptionalString(values.additionalRules),
    },
  };
};

export const hasDateRangeConflict = (dateFrom: string, dateTo: string): boolean => {
  if (!dateFrom || !dateTo) {
    return false;
  }

  const fromTimestamp = Date.parse(dateFrom);
  const toTimestamp = Date.parse(dateTo);
  if (!Number.isFinite(fromTimestamp) || !Number.isFinite(toTimestamp)) {
    return false;
  }

  return fromTimestamp > toTimestamp;
};
