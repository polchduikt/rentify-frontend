import type { NavigationSection } from '@/types/profile';
import {
  PROFILE_BOOKINGS_NAV_ITEMS,
  PROFILE_PROMOTIONS_NAV_ITEMS,
  PROFILE_PROPERTIES_NAV_ITEMS,
  PROFILE_SETTINGS_NAV_ITEMS,
} from '@/constants/profileNavigation';

export const PROFILE_PAGE_SECTIONS: NavigationSection[] = [
  ...PROFILE_PROPERTIES_NAV_ITEMS.map((item) => item.id),
  'favorites',
  ...PROFILE_BOOKINGS_NAV_ITEMS.map((item) => item.id),
  'payments',
  ...PROFILE_PROMOTIONS_NAV_ITEMS.map((item) => item.id),
  ...PROFILE_SETTINGS_NAV_ITEMS.map((item) => item.id),
];

export const PROFILE_PAGE_SECTION_SET = new Set<NavigationSection>(PROFILE_PAGE_SECTIONS);
