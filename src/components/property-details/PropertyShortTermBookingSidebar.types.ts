import type { PropertyResponseDto } from '@/types/property';
import type { UnavailableDateRangeDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';

export interface PropertyShortTermBookingSidebarProps {
  property: PropertyResponseDto;
  dateFrom: string;
  dateTo: string;
  guests: number;
  maxGuests: number;
  todayIso: string;
  maxDateIso: string;
  nightlyPrice: number;
  currency: string;
  unavailableRanges: UnavailableDateRangeDto[];
  unavailableLoading: boolean;
  owner?: PublicUserProfileDto;
  ownerLoading: boolean;
  ownerName: string;
  ownerInitial: string;
  ownerPhone: string;
  isPhoneVisible: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onContactHost: () => void;
  onShowPhone: () => void;
  disableContactHost?: boolean;
}
