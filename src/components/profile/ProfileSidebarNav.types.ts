import type { NavigationSection } from '@/types/profile';

export interface ProfileSidebarNavProps {
  activeSection: NavigationSection | null;
  isPropertiesOpen: boolean;
  isBookingsOpen: boolean;
  isPromotionsOpen: boolean;
  isSettingsOpen: boolean;
  onToggleProperties: () => void;
  onToggleBookings: () => void;
  onTogglePromotions: () => void;
  onToggleSettings: () => void;
  onSelectSection: (section: NavigationSection) => void;
  onOpenChat: () => void;
  onLogout: () => void;
}
