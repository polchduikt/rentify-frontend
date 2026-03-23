export type ProfilePropertiesSection = 'properties-published' | 'properties-archived' | 'properties-drafts';

export type ProfileBookingsSection = 'bookings-my' | 'bookings-incoming';

export type ProfilePromotionsSection = 'promotions-top' | 'promotions-subscriptions';

export type ProfileSettingsSection = 'account' | 'security';

export type NavigationSection =
  | ProfilePropertiesSection
  | ProfileBookingsSection
  | ProfilePromotionsSection
  | 'favorites'
  | 'payments'
  | ProfileSettingsSection;

export interface ProfileFormState {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type SectionNotice =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string; code?: string }
  | null;
