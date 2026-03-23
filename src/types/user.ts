import type { SubscriptionPlan } from './enums';
import type { Decimal, ZonedDateTimeString } from './scalars';

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PublicUserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl: string;
  createdAt: ZonedDateTimeString;
}

export interface UpdateUserRequestDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  isActive: boolean;
  balance: Decimal;
  subscriptionPlan: SubscriptionPlan;
  subscriptionActiveUntil: ZonedDateTimeString;
  roles: string[];
  createdAt: ZonedDateTimeString;
  updatedAt: ZonedDateTimeString;
}

type UserSessionRequiredFields = 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'roles';

export type UserSessionDto =
  Pick<UserResponseDto, UserSessionRequiredFields> &
  Partial<Omit<UserResponseDto, UserSessionRequiredFields>>;
