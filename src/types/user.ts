import type { SubscriptionPlan } from './enums';
import type { Decimal, ZonedDateTimeString } from './scalars';

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequestDto {
  currentPassword?: string;
}

export interface PublicUserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
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

export type User = UserResponseDto;
