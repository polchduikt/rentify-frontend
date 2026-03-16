import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';

export interface PropertyDetailsSidebarProps {
  property: PropertyResponseDto;
  owner?: PublicUserProfileDto;
  ownerLoading: boolean;
  ownerName: string;
  ownerInitial: string;
  ownerPhone: string;
  isPhoneVisible: boolean;
  onContactHost: () => void;
  onShowPhone: () => void;
  disableContactHost?: boolean;
}
