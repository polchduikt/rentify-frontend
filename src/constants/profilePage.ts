import type { NavigationSection } from '@/types/profile';

export const PROFILE_PAGE_SECTIONS: NavigationSection[] = [
  'properties-published',
  'properties-archived',
  'properties-drafts',
  'favorites',
  'bookings-my',
  'bookings-incoming',
  'payments',
  'promotions-top',
  'promotions-subscriptions',
  'account',
  'security',
];

export const PROFILE_PAGE_SECTION_SET = new Set<NavigationSection>(PROFILE_PAGE_SECTIONS);
