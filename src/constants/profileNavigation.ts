import type { PropertyStatus } from '@/types/enums';
import type { NavigationSection, ProfilePropertiesSection, ProfileSettingsSection } from '@/types/profile';

interface NavigationItem<TSection extends NavigationSection> {
  id: TSection;
  label: string;
}

export const PROFILE_PROPERTIES_NAV_ITEMS: ReadonlyArray<NavigationItem<ProfilePropertiesSection>> = [
  { id: 'properties-published', label: 'Опубліковані' },
  { id: 'properties-archived', label: 'Архівні' },
  { id: 'properties-drafts', label: 'Чернетки' },
];

export const PROFILE_SETTINGS_NAV_ITEMS: ReadonlyArray<NavigationItem<ProfileSettingsSection>> = [
  { id: 'account', label: 'Налаштування акаунту' },
  { id: 'security', label: 'Безпека' },
];

export const PROFILE_PROPERTIES_TITLE: Record<ProfilePropertiesSection, string> = {
  'properties-published': 'Опубліковані',
  'properties-archived': 'Архівні',
  'properties-drafts': 'Чернетки',
};

export const PROFILE_PROPERTIES_STATUS_FILTERS: Record<ProfilePropertiesSection, readonly PropertyStatus[]> = {
  'properties-published': ['ACTIVE'],
  'properties-archived': ['INACTIVE', 'BLOCKED'],
  'properties-drafts': ['DRAFT'],
};

const PROPERTIES_SECTIONS = new Set<NavigationSection>(['properties-published', 'properties-archived', 'properties-drafts']);

export const isPropertiesSection = (section: NavigationSection | null): section is ProfilePropertiesSection =>
  section !== null && PROPERTIES_SECTIONS.has(section);
