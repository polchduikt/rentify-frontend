export interface ChatOpenRequest {
  propertyId?: number;
  conversationId?: number;
  initialText?: string;
}

export const CHAT_OPEN_EVENT = 'rentify:chat-open';

export const openChatWidget = (request: ChatOpenRequest) => {
  window.dispatchEvent(new CustomEvent<ChatOpenRequest>(CHAT_OPEN_EVENT, { detail: request }));
};

