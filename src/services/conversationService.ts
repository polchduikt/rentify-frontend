import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { ConversationDto, MessageDto, SendMessageRequestDto } from '@/types/conversation';
import api from './api';

export const conversationService = {
  async sendMessageToProperty(propertyId: number, payload: SendMessageRequestDto): Promise<MessageDto> {
    const { data } = await api.post<MessageDto>(API_ENDPOINTS.conversations.sendToProperty(propertyId), payload);
    return data;
  },

  async replyToConversation(conversationId: number, payload: SendMessageRequestDto): Promise<MessageDto> {
    const { data } = await api.post<MessageDto>(API_ENDPOINTS.conversations.reply(conversationId), payload);
    return data;
  },

  async getMyConversations(): Promise<ConversationDto[]> {
    const { data } = await api.get<ConversationDto[]>(API_ENDPOINTS.conversations.root);
    return data;
  },

  async getConversationMessages(conversationId: number): Promise<MessageDto[]> {
    const { data } = await api.get<MessageDto[]>(API_ENDPOINTS.conversations.messages(conversationId));
    return data;
  },
};
