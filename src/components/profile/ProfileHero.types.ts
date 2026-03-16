export interface ProfileHeroProps {
  avatarSrc: string;
  avatarLoadFailed: boolean;
  onAvatarError: () => void;
  initials: string;
  fullName: string;
  email: string;
  createdAt?: string;
  walletBalance: number;
  walletCurrency: string;
  propertiesCount: number;
  activePropertiesInPreview: number;
  favoritesCount: number;
  bookingsCount: number;
  paidBookingsCount: number;
  walletTopUpPending?: boolean;
  onWalletTopUp?: () => void;
}
