import { API_ENDPOINTS } from '@/config/apiEndpoints';
import type { ConversationDto, MessageDto, SendMessageRequestDto } from '@/types/conversation';
import api from './api';

const conversationIdByPropertyId = new Map<number, number>();
const conversationRequestByPropertyId = new Map<number, Promise<number>>();

const createConversation = async (propertyId: number): Promise<ConversationDto> => {
  const { data } = await api.post<ConversationDto>(API_ENDPOINTS.conversations.create, { propertyId });
  conversationIdByPropertyId.set(propertyId, data.id);
  return data;
};

const sendMessageToConversation = async (
  conversationId: number,
  payload: SendMessageRequestDto,
): Promise<MessageDto> => {
  const { data } = await api.post<MessageDto>(API_ENDPOINTS.conversations.send(conversationId), payload);
  return data;
};

const getOrCreateConversationId = async (propertyId: number): Promise<number> => {
  const cachedConversationId = conversationIdByPropertyId.get(propertyId);
  if (cachedConversationId != null) {
    return cachedConversationId;
  }

  const inFlightRequest = conversationRequestByPropertyId.get(propertyId);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = createConversation(propertyId)
    .then((conversation) => conversation.id)
    .finally(() => {
      conversationRequestByPropertyId.delete(propertyId);
    });

  conversationRequestByPropertyId.set(propertyId, request);
  return request;
};

export const conversationService = {
  async createConversation(propertyId: number): Promise<ConversationDto> {
    return createConversation(propertyId);
  },

  async sendMessageToProperty(propertyId: number, payload: SendMessageRequestDto): Promise<MessageDto> {
    const conversationId = await getOrCreateConversationId(propertyId);

    try {
      const data = await sendMessageToConversation(conversationId, payload);
      conversationIdByPropertyId.set(propertyId, data.conversationId);
      return data;
    } catch (error) {
      const status = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;

      if (status !== 403 && status !== 404) {
        throw error;
      }

      conversationIdByPropertyId.delete(propertyId);
      const newConversation = await createConversation(propertyId);
      const data = await sendMessageToConversation(newConversation.id, payload);
      conversationIdByPropertyId.set(propertyId, data.conversationId);
      return data;
    }
  },

  async replyToConversation(conversationId: number, payload: SendMessageRequestDto): Promise<MessageDto> {
    return sendMessageToConversation(conversationId, payload);
  },

  async getMyConversations(): Promise<ConversationDto[]> {
    const { data } = await api.get<ConversationDto[]>(API_ENDPOINTS.conversations.root);
    data.forEach((conversation) => {
      conversationIdByPropertyId.set(conversation.propertyId, conversation.id);
    });
    return data;
  },

  async getConversationMessages(conversationId: number): Promise<MessageDto[]> {
    const { data } = await api.get<MessageDto[]>(API_ENDPOINTS.conversations.messages(conversationId));
    return data;
  },

  clearConversationCache(): void {
    conversationIdByPropertyId.clear();
    conversationRequestByPropertyId.clear();
  },
};
