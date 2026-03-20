import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { ConversationDto, MessageDto, SendMessageRequestDto } from '@/types/conversation';
import api from './api';

const createConversation = async (propertyId: number): Promise<ConversationDto> => {
  const { data } = await api.post<ConversationDto>(API_ENDPOINTS.conversations.create, { propertyId });
  return data;
};

export const conversationService = {
  async createConversation(propertyId: number): Promise<ConversationDto> {
    return createConversation(propertyId);
  },

  async sendMessageToProperty(propertyId: number, payload: SendMessageRequestDto): Promise<MessageDto> {
    const conversation = await createConversation(propertyId);
    const { data } = await api.post<MessageDto>(API_ENDPOINTS.conversations.send(conversation.id), payload);
    return data;
  },

  async replyToConversation(conversationId: number, payload: SendMessageRequestDto): Promise<MessageDto> {
    const { data } = await api.post<MessageDto>(API_ENDPOINTS.conversations.send(conversationId), payload);
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
