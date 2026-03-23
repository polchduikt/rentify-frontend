import type { ConversationDto, MessageDto } from '@/types/conversation';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';

const toTimestampOrZero = (value: string | null | undefined): number => {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
};

export const toPositiveId = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

export const sortConversationsByCreatedAtDesc = (left: ConversationDto, right: ConversationDto) =>
  toTimestampOrZero(right.createdAt) - toTimestampOrZero(left.createdAt);

export const sortMessagesByCreatedAtAsc = (left: MessageDto, right: MessageDto) =>
  toTimestampOrZero(left.createdAt) - toTimestampOrZero(right.createdAt);

export const resolveUserName = (profile?: PublicUserProfileDto | null) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Користувач';
};

export const resolveUserInitials = (profile?: PublicUserProfileDto | null) => {
  const initials = `${profile?.firstName?.charAt(0) ?? ''}${profile?.lastName?.charAt(0) ?? ''}`.trim().toUpperCase();
  return initials || profile?.firstName?.charAt(0)?.toUpperCase() || 'U';
};

export const formatPropertyAddress = (property?: PropertyResponseDto | null) => {
  const city = property?.address?.location?.city?.trim();
  const street = property?.address?.street?.trim();
  const houseNumber = property?.address?.houseNumber?.trim();
  const streetWithHouse = [street, houseNumber].filter(Boolean).join(' ').trim();
  const value = [city, streetWithHouse].filter(Boolean).join(', ').trim();
  return value || null;
};

export const formatPropertyPrice = (property?: PropertyResponseDto | null) => {
  const price = property?.pricing?.pricePerMonth ?? property?.pricing?.pricePerNight;
  if (price == null) {
    return null;
  }

  const numeric = Number(price);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return `${numeric.toLocaleString('uk-UA')} ${property?.pricing?.currency || 'UAH'}`;
};

export const resolvePropertyLinkLabel = (propertyId: number, property?: PropertyResponseDto | null) => {
  const address = formatPropertyAddress(property);
  const price = formatPropertyPrice(property);
  if (address && price) {
    return `${address} - ${price}`;
  }
  if (address) {
    return address;
  }
  if (price) {
    return price;
  }
  return `Оголошення #${propertyId}`;
};
