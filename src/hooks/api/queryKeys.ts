import type { PageQuery } from '@/types/api';
import type { LocationSuggestQuery } from '@/services/locationService';
import type { PropertySearchCriteriaDto } from '@/types/property';
import type { UnavailableRangesQuery } from '@/services/propertyService';
import type { AmenityCategory } from '@/types/enums';

export const queryKeys = {
  auth: {
    profile: () => ['auth', 'profile'] as const,
  },
  users: {
    profile: () => ['users', 'profile'] as const,
    publicProfile: (userId: number) => ['users', 'public', userId] as const,
  },
  bookings: {
    my: (page?: PageQuery) => ['bookings', 'my', page ?? null] as const,
    incoming: (page?: PageQuery) => ['bookings', 'incoming', page ?? null] as const,
    byId: (id: number) => ['bookings', 'byId', id] as const,
  },
  conversations: {
    mine: () => ['conversations', 'mine'] as const,
    messages: (conversationId: number) => ['conversations', 'messages', conversationId] as const,
  },
  favorites: {
    mine: () => ['favorites', 'mine'] as const,
  },
  locations: {
    suggest: (query: LocationSuggestQuery) => ['locations', 'suggest', query] as const,
  },
  amenities: {
    all: (category?: AmenityCategory) => ['amenities', 'all', category ?? null] as const,
    grouped: () => ['amenities', 'grouped'] as const,
  },
  payments: {
    mine: () => ['payments', 'mine'] as const,
    byBooking: (bookingId: number) => ['payments', 'booking', bookingId] as const,
  },
  promotions: {
    topPackages: () => ['promotions', 'topPackages'] as const,
    subscriptionPackages: () => ['promotions', 'subscriptionPackages'] as const,
  },
  properties: {
    all: (page?: PageQuery) => ['properties', 'all', page ?? null] as const,
    mine: (page?: PageQuery) => ['properties', 'mine', page ?? null] as const,
    byId: (id: number) => ['properties', 'byId', id] as const,
    search: (criteria?: PropertySearchCriteriaDto, page?: PageQuery) =>
      ['properties', 'search', criteria ?? null, page ?? null] as const,
    availability: (propertyId: number) => ['properties', 'availability', propertyId] as const,
    unavailableRanges: (propertyId: number, query?: UnavailableRangesQuery) =>
      ['properties', 'unavailableRanges', propertyId, query ?? null] as const,
  },
  reviews: {
    byProperty: (propertyId: number, page?: PageQuery) => ['reviews', 'property', propertyId, page ?? null] as const,
  },
  wallet: {
    balance: () => ['wallet', 'balance'] as const,
    transactions: (page?: PageQuery) => ['wallet', 'transactions', page ?? null] as const,
    topUpOptions: () => ['wallet', 'topUpOptions'] as const,
  },
} as const;
