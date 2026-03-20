import type { MessageType } from './enums';
import type { ZonedDateTimeString } from './scalars';

export interface ConversationDto {
  id: number;
  propertyId: number;
  hostId: number;
  tenantId: number;
  createdAt: ZonedDateTimeString;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  type: MessageType;
  text: string;
  isRead: boolean;
  mediaUrl: string;
  createdAt: ZonedDateTimeString;
}

export interface SendMessageRequestDto {
  text: string;
}

export interface CreateConversationRequestDto {
  propertyId: number;
}
