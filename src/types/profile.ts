export type ProfilePropertiesSection = 'properties-published' | 'properties-archived' | 'properties-drafts';

export type ProfileSettingsSection = 'account' | 'security';

export type NavigationSection =
  | ProfilePropertiesSection
  | 'chat'
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

export type SectionNotice = { type: 'success' | 'error'; message: string } | null;
