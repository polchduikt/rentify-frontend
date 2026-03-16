import { useQueries } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversationMessagesQuery, useMyConversationsQuery, useReplyToConversationMutation, useSendMessageToPropertyMutation } from '@/hooks/api';
import { queryKeys } from '@/api/queryKeys';
import { propertyService } from '@/services/propertyService';
import { userService } from '@/services/userService';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { getApiErrorMessage } from '@/utils/errors';
import {
  resolvePropertyLinkLabel,
  sortConversationsByCreatedAtDesc,
  sortMessagesByCreatedAtAsc,
  toPositiveId,
} from '@/utils/chatPanel';
import type { ChatPanelProps, ProfileState, PropertyState } from '@/components/chat/ChatPanel.types';

interface UseChatPanelModelParams {
  enabled: boolean;
  pollIntervalMs: number;
  request: ChatPanelProps['request'];
  onRequestHandled?: ChatPanelProps['onRequestHandled'];
  shouldAutoSelectFirstConversation: boolean;
}

export const useChatPanelModel = ({
  enabled,
  pollIntervalMs,
  request,
  onRequestHandled,
  shouldAutoSelectFirstConversation,
}: UseChatPanelModelParams) => {
  const { user } = useAuth();
  const currentUserId = Number(user?.id ?? 0);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [composePropertyId, setComposePropertyId] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const conversationsQuery = useMyConversationsQuery(enabled, enabled ? pollIntervalMs : undefined);
  const replyMutation = useReplyToConversationMutation();
  const sendToPropertyMutation = useSendMessageToPropertyMutation();

  const conversations = useMemo(() => {
    const items = conversationsQuery.data ?? [];
    return [...items].sort(sortConversationsByCreatedAtDesc);
  }, [conversationsQuery.data]);

  const counterpartIdByConversationId = useMemo(() => {
    const map = new Map<number, number>();
    conversations.forEach((conversation) => {
      const counterpartId = currentUserId === conversation.hostId ? conversation.tenantId : conversation.hostId;
      const normalizedCounterpartId = toPositiveId(counterpartId);
      if (normalizedCounterpartId != null) {
        map.set(conversation.id, normalizedCounterpartId);
      }
    });
    return map;
  }, [conversations, currentUserId]);

  const counterpartIds = useMemo(
    () => Array.from(new Set(Array.from(counterpartIdByConversationId.values()))),
    [counterpartIdByConversationId],
  );
  const propertyIds = useMemo(
    () =>
      Array.from(
        new Set(
          [...conversations.map((conversation) => toPositiveId(conversation.propertyId)), composePropertyId].filter(
            (value): value is number => value != null,
          ),
        ),
      ),
    [composePropertyId, conversations],
  );

  const profilesState = useQueries({
    queries: counterpartIds.map((userId) => ({
      queryKey: queryKeys.users.publicProfile(userId),
      queryFn: () => userService.getPublicProfile(userId),
      enabled: enabled && userId > 0,
    })),
    combine: (results): ProfileState => {
      const byId = new Map<number, PublicUserProfileDto>();
      results.forEach((result, index) => {
        if (result.data) {
          byId.set(counterpartIds[index], result.data);
        }
      });
      return {
        byId,
        isLoading: results.some((result) => result.isLoading || result.isFetching),
      };
    },
  });

  const propertiesState = useQueries({
    queries: propertyIds.map((propertyId) => ({
      queryKey: queryKeys.properties.byId(propertyId),
      queryFn: () => propertyService.getPropertyById(propertyId),
      enabled: enabled && propertyId > 0,
    })),
    combine: (results): PropertyState => {
      const byId = new Map<number, PropertyResponseDto>();
      results.forEach((result, index) => {
        if (result.data) {
          byId.set(propertyIds[index], result.data);
        }
      });
      return {
        byId,
        isLoading: results.some((result) => result.isLoading || result.isFetching),
      };
    },
  });

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );

  const messagesQuery = useConversationMessagesQuery(
    activeConversationId ?? 0,
    enabled && activeConversationId != null,
    enabled && activeConversationId != null ? pollIntervalMs : undefined,
  );
  const messages = useMemo(() => {
    const items = messagesQuery.data ?? [];
    return [...items].sort(sortMessagesByCreatedAtAsc);
  }, [messagesQuery.data]);

  const activeCounterpartId = activeConversation ? counterpartIdByConversationId.get(activeConversation.id) ?? null : null;
  const activeCounterpartProfile = activeCounterpartId != null ? profilesState.byId.get(activeCounterpartId) : null;
  const activeProperty = activeConversation ? propertiesState.byId.get(activeConversation.propertyId) : null;
  const composeProperty = composePropertyId != null ? propertiesState.byId.get(composePropertyId) : null;
  const hasTarget = activeConversationId != null || composePropertyId != null;
  const isSending = replyMutation.isPending || sendToPropertyMutation.isPending;
  const canSend = hasTarget && messageDraft.trim().length > 0 && !isSending;

  useEffect(() => {
    if (!enabled || !request) {
      return;
    }
    const requestedConversationId = toPositiveId(request.conversationId);
    const requestedPropertyId = toPositiveId(request.propertyId);

    if (requestedConversationId != null) {
      setActiveConversationId(requestedConversationId);
      setComposePropertyId(null);
    } else if (requestedPropertyId != null) {
      setActiveConversationId(null);
      setComposePropertyId(requestedPropertyId);
    }

    if (request.initialText?.trim()) {
      setMessageDraft(request.initialText.trim());
    }
    setSendError(null);
    onRequestHandled?.();
  }, [enabled, onRequestHandled, request]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (activeConversationId != null) {
      const exists = conversations.some((conversation) => conversation.id === activeConversationId);
      if (!exists) {
        setActiveConversationId(null);
      }
      return;
    }
    if (composePropertyId != null || !shouldAutoSelectFirstConversation || conversations.length === 0) {
      return;
    }
    setActiveConversationId(conversations[0].id);
  }, [activeConversationId, composePropertyId, conversations, enabled, shouldAutoSelectFirstConversation]);

  const selectConversation = useCallback((conversationId: number) => {
    setActiveConversationId(conversationId);
    setComposePropertyId(null);
    setSendError(null);
  }, []);

  const resetSelection = useCallback(() => {
    setActiveConversationId(null);
    setComposePropertyId(null);
    setSendError(null);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = messageDraft.trim();
    if (!text) {
      return;
    }

    setSendError(null);

    try {
      if (activeConversationId != null) {
        await replyMutation.mutateAsync({
          conversationId: activeConversationId,
          payload: { text },
        });
      } else if (composePropertyId != null) {
        const createdMessage = await sendToPropertyMutation.mutateAsync({
          propertyId: composePropertyId,
          payload: { text },
        });
        setActiveConversationId(createdMessage.conversationId);
        setComposePropertyId(null);
      } else {
        return;
      }

      setMessageDraft('');
    } catch (error) {
      setSendError(getApiErrorMessage(error, 'Не вдалося надіслати повідомлення.'));
    }
  }, [
    activeConversationId,
    composePropertyId,
    messageDraft,
    replyMutation,
    sendToPropertyMutation,
  ]);

  const resolveConversationPropertyLabel = useCallback(
    (propertyId: number) => resolvePropertyLinkLabel(propertyId, propertiesState.byId.get(propertyId)),
    [propertiesState.byId],
  );

  return {
    currentUserId,
    activeConversationId,
    composePropertyId,
    messageDraft,
    sendError,
    conversationsQuery,
    conversations,
    counterpartIdByConversationId,
    profilesState,
    propertiesState,
    activeConversation,
    messagesQuery,
    messages,
    activeCounterpartProfile,
    activeProperty,
    composeProperty,
    hasTarget,
    isSending,
    canSend,
    setMessageDraft,
    selectConversation,
    resetSelection,
    sendMessage,
    resolveConversationPropertyLabel,
  };
};
