import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';

export interface PropertyShortTermBookingSidebarProps {
  property: PropertyResponseDto;
  owner?: PublicUserProfileDto;
  ownerLoading: boolean;
  ownerName: string;
  ownerInitial: string;
  onContactHost: () => void;
  disableContactHost?: boolean;
}
