import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '@/services/conversationService';
import type { SendMessageRequestDto } from '@/types/conversation';
import { queryKeys } from '@/api/queryKeys';

export const useMyConversationsQuery = (enabled = true, refetchInterval?: number) =>
  useQuery({
    queryKey: queryKeys.conversations.mine(),
    queryFn: () => conversationService.getMyConversations(),
    enabled,
    refetchInterval,
  });

export const useConversationMessagesQuery = (conversationId: number, enabled = true, refetchInterval?: number) =>
  useQuery({
    queryKey: queryKeys.conversations.messages(conversationId),
    queryFn: () => conversationService.getConversationMessages(conversationId),
    enabled: enabled && Number.isFinite(conversationId) && conversationId > 0,
    refetchInterval,
  });

export const useSendMessageToPropertyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, payload }: { propertyId: number; payload: SendMessageRequestDto }) =>
      conversationService.sendMessageToProperty(propertyId, payload),
    onSuccess: (createdMessage) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.mine() });
      if (createdMessage.conversationId > 0) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversations.messages(createdMessage.conversationId),
        });
      }
    },
  });
};

export const useReplyToConversationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, payload }: { conversationId: number; payload: SendMessageRequestDto }) =>
      conversationService.replyToConversation(conversationId, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversations.mine() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(variables.conversationId),
      });
    },
  });
};
