import { useMemo, useState } from 'react';
import {
  PROFILE_PROPERTIES_STATUS_FILTERS,
  PROFILE_PROPERTIES_TITLE,
  isBookingsSection as isBookingsNavigationSection,
  isPromotionsSection as isPromotionsNavigationSection,
  isPropertiesSection as isPropertiesNavigationSection,
} from '@/constants/profileNavigation';
import type { PropertyResponseDto } from '@/types/property';
import type { NavigationSection } from '@/types/profile';

interface UseProfileNavigationParams {
  properties: PropertyResponseDto[];
  initialSection?: NavigationSection | null;
}

export const useProfileNavigation = ({ properties, initialSection = null }: UseProfileNavigationParams) => {
  const [activeSection, setActiveSection] = useState<NavigationSection | null>(initialSection);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(() => isPropertiesNavigationSection(initialSection));
  const [isBookingsOpen, setIsBookingsOpen] = useState(() => isBookingsNavigationSection(initialSection));
  const [isPromotionsOpen, setIsPromotionsOpen] = useState(() => isPromotionsNavigationSection(initialSection));
  const [isSettingsOpen, setIsSettingsOpen] = useState(() => initialSection === 'account' || initialSection === 'security');

  const propertiesForActiveTab = useMemo(() => {
    if (!isPropertiesNavigationSection(activeSection)) {
      return [] as PropertyResponseDto[];
    }
    const statuses = PROFILE_PROPERTIES_STATUS_FILTERS[activeSection];
    return properties.filter((property) => statuses.includes(property.status));
  }, [activeSection, properties]);

  const propertiesTabTitle = useMemo(() => {
    if (!isPropertiesNavigationSection(activeSection)) {
      return PROFILE_PROPERTIES_TITLE['properties-drafts'];
    }
    return PROFILE_PROPERTIES_TITLE[activeSection];
  }, [activeSection]);

  const isPropertiesSection = isPropertiesNavigationSection(activeSection);
  const isBookingsSection = isBookingsNavigationSection(activeSection);
  const isPromotionsSection = isPromotionsNavigationSection(activeSection);

  return {
    activeSection,
    setActiveSection,
    isPropertiesOpen,
    togglePropertiesOpen: () => setIsPropertiesOpen((prev) => !prev),
    isBookingsOpen,
    toggleBookingsOpen: () => setIsBookingsOpen((prev) => !prev),
    isPromotionsOpen,
    togglePromotionsOpen: () => setIsPromotionsOpen((prev) => !prev),
    isSettingsOpen,
    toggleSettingsOpen: () => setIsSettingsOpen((prev) => !prev),
    propertiesForActiveTab,
    propertiesTabTitle,
    isPropertiesSection,
    isBookingsSection,
    isPromotionsSection,
  };
};
