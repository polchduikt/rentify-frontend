import { useMemo, useState } from 'react';
import {
  PROFILE_PROPERTIES_STATUS_FILTERS,
  PROFILE_PROPERTIES_TITLE,
  isPropertiesSection as isPropertiesNavigationSection,
} from '@/constants/profileNavigation';
import type { PropertyResponseDto } from '@/types/property';
import type { NavigationSection } from '@/types/profile';

interface UseProfileNavigationParams {
  properties: PropertyResponseDto[];
}

export const useProfileNavigation = ({ properties }: UseProfileNavigationParams) => {
  const [activeSection, setActiveSection] = useState<NavigationSection | null>(null);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return {
    activeSection,
    setActiveSection,
    isPropertiesOpen,
    togglePropertiesOpen: () => setIsPropertiesOpen((prev) => !prev),
    isSettingsOpen,
    toggleSettingsOpen: () => setIsSettingsOpen((prev) => !prev),
    propertiesForActiveTab,
    propertiesTabTitle,
    isPropertiesSection,
  };
};
