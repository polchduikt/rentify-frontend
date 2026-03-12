import { useQueries } from '@tanstack/react-query';
import { LoaderCircle, MessageCircle, SendHorizontal, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useConversationMessagesQuery, useMyConversationsQuery, useReplyToConversationMutation, useSendMessageToPropertyMutation } from '@/hooks/api';
import { queryKeys } from '@/hooks/api/queryKeys';
import { propertyService } from '@/services/propertyService';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatOpenRequest } from '@/components/chat/chatEvents';
import type { ConversationDto, MessageDto } from '@/types/conversation';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { resolveAvatarUrl } from '@/utils/avatar';
import { getApiErrorMessage } from '@/utils/errors';
import { formatChatDateTime, formatChatTime } from './chatFormatters';

const toPositiveId = (value: unknown): number | null => {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
};

const sortConversations = (left: ConversationDto, right: ConversationDto) =>
  new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();

type ChatPanelVariant = 'page' | 'widget';

interface ChatPanelProps {
  enabled?: boolean;
  variant?: ChatPanelVariant;
  pollIntervalMs?: number;
  request?: ChatOpenRequest | null;
  onRequestHandled?: () => void;
  autoSelectFirstConversation?: boolean;
}

interface ProfileState {
  byId: Map<number, PublicUserProfileDto>;
  isLoading: boolean;
}

interface PropertyState {
  byId: Map<number, PropertyResponseDto>;
  isLoading: boolean;
}

const resolveUserName = (profile?: PublicUserProfileDto | null) => {
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Користувач';
};

const resolveUserInitials = (profile?: PublicUserProfileDto | null) => {
  const initials = `${profile?.firstName?.charAt(0) ?? ''}${profile?.lastName?.charAt(0) ?? ''}`.trim().toUpperCase();
  return initials || profile?.firstName?.charAt(0)?.toUpperCase() || 'U';
};

const formatPropertyAddress = (property?: PropertyResponseDto | null) => {
  const city = property?.address?.location?.city?.trim();
  const street = property?.address?.street?.trim();
  const houseNumber = property?.address?.houseNumber?.trim();
  const streetWithHouse = [street, houseNumber].filter(Boolean).join(' ').trim();
  const value = [city, streetWithHouse].filter(Boolean).join(', ').trim();
  return value || null;
};

const formatPropertyPrice = (property?: PropertyResponseDto | null) => {
  const price = property?.pricing?.pricePerMonth ?? property?.pricing?.pricePerNight;
  if (price == null) {
    return null;
  }
  const numeric = Number(price);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return `${numeric.toLocaleString('uk-UA')} ${property?.pricing?.currency || 'UAH'}`;
};

const resolvePropertyLinkLabel = (propertyId: number, property?: PropertyResponseDto | null) => {
  const address = formatPropertyAddress(property);
  const price = formatPropertyPrice(property);
  if (address && price) {
    return `${address} - ${price}`;
  }
  if (address) {
    return address;
  }
  if (price) {
    return price;
  }
  return `Оголошення #${propertyId}`;
};

export const ChatPanel = ({
  enabled = true,
  variant = 'page',
  pollIntervalMs = 5_000,
  request,
  onRequestHandled,
  autoSelectFirstConversation,
}: ChatPanelProps) => {
  const { user } = useAuth();
  const currentUserId = Number(user?.id ?? 0);
  const shouldAutoSelectFirstConversation = autoSelectFirstConversation ?? variant === 'page';
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [composePropertyId, setComposePropertyId] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const conversationsQuery = useMyConversationsQuery(enabled, enabled ? pollIntervalMs : undefined);
  const replyMutation = useReplyToConversationMutation();
  const sendToPropertyMutation = useSendMessageToPropertyMutation();

  const conversations = useMemo(() => {
    const items = conversationsQuery.data ?? [];
    return [...items].sort(sortConversations);
  }, [conversationsQuery.data]);

  const counterpartIdByConversationId = useMemo(() => {
    const map = new Map<number, number>();
    conversations.forEach((conversation) => {
      const counterpartId =
        currentUserId === conversation.hostId ? conversation.tenantId : conversation.hostId;
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
          [
            ...conversations.map((conversation) => toPositiveId(conversation.propertyId)),
            composePropertyId,
          ].filter((value): value is number => value != null),
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
    return [...items].sort(
      (left: MessageDto, right: MessageDto) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
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

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, messages.length]);

  const sendMessage = async () => {
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
  };

  const rootClassName =
    variant === 'page'
      ? 'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'
      : 'h-full overflow-hidden bg-white';

  const showConversationListOnlyMobile = activeConversationId == null && composePropertyId == null;

  return (
    <section className={rootClassName}>
      <div className={`grid min-h-[560px] ${variant === 'widget' ? 'h-full min-h-0' : ''} md:grid-cols-[280px_minmax(0,1fr)]`}>
        <aside
          className={`border-slate-200 bg-slate-50 md:border-r ${
            showConversationListOnlyMobile ? 'block border-b' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <MessageCircle size={16} className="text-slate-500" />
            <p className="text-sm font-semibold text-slate-900">Діалоги</p>
          </div>

          {conversationsQuery.error ? (
            <p className="p-4 text-xs text-rose-700">
              {getApiErrorMessage(conversationsQuery.error, 'Не вдалося завантажити діалоги.')}
            </p>
          ) : conversationsQuery.isLoading ? (
            <div className="space-y-2 p-3">
              <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-xs text-slate-600">У вас ще немає діалогів. Напишіть власнику з картки оголошення.</p>
          ) : (
            <div className="max-h-[520px] space-y-2 overflow-y-auto p-3 md:max-h-none">
              {conversations.map((conversation) => {
                const counterpartProfile = profilesState.byId.get(counterpartIdByConversationId.get(conversation.id) ?? -1);
                const property = propertiesState.byId.get(conversation.propertyId);
                const isActive = activeConversationId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      setActiveConversationId(conversation.id);
                      setComposePropertyId(null);
                      setSendError(null);
                    }}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700">
                        {(() => {
                          const avatarUrl = resolveAvatarUrl(counterpartProfile?.avatarUrl);
                          if (avatarUrl) {
                            return <img src={avatarUrl} alt={resolveUserName(counterpartProfile)} className="h-full w-full object-cover" />;
                          }
                          return resolveUserInitials(counterpartProfile);
                        })()}
                      </span>
                      <div className="min-w-0 chat-conversation-meta">
                        <p className="truncate text-xs font-semibold text-slate-900">{resolveUserName(counterpartProfile)}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{property?.title || `Оголошення #${conversation.propertyId}`}</p>
                        <Link
                          to={ROUTES.propertyDetails(conversation.propertyId)}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-0.5 block truncate text-xs text-blue-700 transition hover:text-blue-900 hover:underline"
                        >
                          {resolvePropertyLinkLabel(conversation.propertyId, property)}
                        </Link>
                        <p className="mt-1 text-[11px] text-slate-400">{formatChatDateTime(conversation.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className={`min-h-0 flex-col ${showConversationListOnlyMobile ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => {
                  setActiveConversationId(null);
                  setComposePropertyId(null);
                  setSendError(null);
                }}
                className="mb-1 inline-flex text-xs font-semibold text-slate-500 hover:text-slate-800 md:hidden"
              >
                До діалогів
              </button>

              {activeConversation ? (
                <>
                  <p className="truncate text-sm font-semibold text-slate-900">{resolveUserName(activeCounterpartProfile)}</p>
                  <Link
                    to={ROUTES.propertyDetails(activeConversation.propertyId)}
                    className="chat-active-conversation-link mt-0.5 block truncate text-xs text-blue-700 transition hover:text-blue-900 hover:underline"
                  >
                    {resolvePropertyLinkLabel(activeConversation.propertyId, activeProperty)}
                  </Link>
                  <p className="truncate text-xs text-slate-500">{activeProperty?.title || `Оголошення #${activeConversation.propertyId}`}</p>
                </>
              ) : composePropertyId != null ? (
                <>
                  <p className="truncate text-sm font-semibold text-slate-900">Нове повідомлення</p>
                  <p className="truncate text-xs text-slate-500">{composeProperty?.title || `Оголошення #${composePropertyId}`}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-slate-900">Оберіть діалог</p>
                  <p className="text-xs text-slate-500">Щоб переглянути повідомлення та відповісти</p>
                </>
              )}
            </div>
            {(profilesState.isLoading || propertiesState.isLoading) && activeConversation ? (
              <LoaderCircle size={14} className="shrink-0 animate-spin text-slate-400" />
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
            {activeConversation ? (
              messagesQuery.error ? (
                <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {getApiErrorMessage(messagesQuery.error, 'Не вдалося завантажити повідомлення.')}
                </p>
              ) : messagesQuery.isLoading ? (
                <div className="space-y-2">
                  <div className="h-10 w-2/3 animate-pulse rounded-xl bg-slate-200" />
                  <div className="ml-auto h-10 w-1/2 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-10 w-3/5 animate-pulse rounded-xl bg-slate-200" />
                </div>
              ) : messages.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-600">
                  Повідомлень ще немає. Напишіть першим.
                </p>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => {
                    const isMine = currentUserId > 0 && message.senderId === currentUserId;

                    return (
                      <article key={message.id} className={`max-w-[85%] rounded-2xl px-3 py-2 ${isMine ? 'ml-auto bg-blue-600 text-white' : 'bg-white text-slate-800'}`}>
                        <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                        <p className={`mt-1 text-[11px] ${isMine ? 'text-blue-100' : 'text-slate-400'}`}>{formatChatTime(message.createdAt)}</p>
                      </article>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )
            ) : composePropertyId != null ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <p className="font-semibold">Початок нового діалогу</p>
                <p className="mt-1 text-xs text-blue-800">Надішліть перше повідомлення власнику оголошення.</p>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-600">
                  Виберіть діалог у списку зліва.
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white p-3">
            {sendError ? (
              <p className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700">{sendError}</p>
            ) : null}

            <div className="flex items-end gap-2">
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={2}
                disabled={!hasTarget || isSending}
                placeholder={
                  hasTarget ? 'Напишіть повідомлення...' : 'Спочатку оберіть діалог або відкрийте чат з оголошення.'
                }
                className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!canSend}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                aria-label="Надіслати повідомлення"
              >
                {isSending ? <LoaderCircle size={16} className="animate-spin" /> : <SendHorizontal size={16} />}
              </button>
            </div>

            {hasTarget && activeConversationId == null && composePropertyId != null ? (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-500">
                <UserRound size={11} />
                Після надсилання буде створено діалог з власником.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
