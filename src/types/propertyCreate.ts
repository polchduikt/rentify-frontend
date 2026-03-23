import type { LocationSuggestionDto } from './location';

export interface PropertyCreateFormValues {
  rentalType: 'LONG_TERM' | 'SHORT_TERM';
  propertyType: string;
  marketType?: 'SECONDARY' | 'NEW_BUILD';
  title: string;
  description: string;
  cityQuery: string;
  country: string;
  region: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment: string;
  postalCode: string;
  lat: string;
  lng: string;
  rooms: string;
  floor: string;
  totalFloors: string;
  areaSqm: string;
  maxGuests: string;
  checkInTime: string;
  checkOutTime: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  additionalRules: string;
  isVerifiedProperty: boolean;
  isVerifiedRealtor: boolean;
  isDuplicate: boolean;
  pricePerNight: string;
  pricePerMonth: string;
  securityDeposit: string;
  cleaningFee: string;
  currency: string;
}

type PropertyCreateNumericFormFields =
  | 'lat'
  | 'lng'
  | 'rooms'
  | 'floor'
  | 'totalFloors'
  | 'areaSqm'
  | 'maxGuests'
  | 'pricePerNight'
  | 'pricePerMonth'
  | 'securityDeposit'
  | 'cleaningFee';

export type PropertyCreatePayload = Omit<PropertyCreateFormValues, PropertyCreateNumericFormFields> & {
  lat: number;
  lng: number;
  rooms: number;
  floor: number;
  totalFloors: number;
  areaSqm: number;
  maxGuests: number;
  pricePerNight: number;
  pricePerMonth: number;
  securityDeposit: number;
  cleaningFee: number;
};

export interface AvailabilityDraft {
  dateFrom: string;
  dateTo: string;
  reason: string;
}

export interface CreatePropertySubmissionResult {
  propertyId: number;
  uploadedPhotosCount: number;
  createdAvailabilityBlocksCount: number;
}

export interface SelectedLocationState {
  suggestion?: LocationSuggestionDto;
}
