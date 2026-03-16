import type { UserSessionDto } from './user';

export interface AuthenticationRequestDto {
  email: string;
  password: string;
}

export interface AuthenticationResponseDto {
  token?: string | null;
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
  token: string | null;
  user: UserSessionDto;
}
