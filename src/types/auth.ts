import type { UserResponseDto } from './user';

export interface AuthenticationRequestDto {
  email: string;
  password: string;
}

export interface AuthenticationResponseDto {
  token: string;
}

export interface GoogleOAuthRequestDto {
  idToken: string;
}

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  phone?: string;
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  user: UserResponseDto;
}
