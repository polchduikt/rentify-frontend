import { LoaderCircle, SendHorizontal, UserRound } from 'lucide-react';
import { type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { ConversationDto, MessageDto } from '@/types/conversation';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { formatChatTime } from '@/utils/chatFormatters';
import { resolvePropertyLinkLabel, resolveUserName } from '@/utils/chatPanel';
import { getApiErrorMessage } from '@/utils/errors';

interface ChatMessagePaneProps {
  showOnMobile: boolean;
  activeConversationId: number | null;
  activeConversation: ConversationDto | null;
  composePropertyId: number | null;
  composeProperty: PropertyResponseDto | null;
  activeProperty: PropertyResponseDto | null;
  activeCounterpartProfile: PublicUserProfileDto | null;
  profilesLoading: boolean;
  propertiesLoading: boolean;
  messages: MessageDto[];
  messagesLoading: boolean;
  messagesError: unknown;
  currentUserId: number;
  messageDraft: string;
  sendError: string | null;
  hasTarget: boolean;
  isSending: boolean;
  canSend: boolean;
  onDraftChange: (nextValue: string) => void;
  onSend: () => Promise<void> | void;
  onBack: () => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export const ChatMessagePane = ({
  showOnMobile,
  activeConversationId,
  activeConversation,
  composePropertyId,
  composeProperty,
  activeProperty,
  activeCounterpartProfile,
  profilesLoading,
  propertiesLoading,
  messages,
  messagesLoading,
  messagesError,
  currentUserId,
  messageDraft,
  sendError,
  hasTarget,
  isSending,
  canSend,
  onDraftChange,
  onSend,
  onBack,
  messagesEndRef,
}: ChatMessagePaneProps) => (
  <div className={`min-h-0 flex-col ${showOnMobile ? 'hidden md:flex' : 'flex'}`}>
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <button
          type="button"
          onClick={onBack}
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
      {(profilesLoading || propertiesLoading) && activeConversation ? (
        <LoaderCircle size={14} className="shrink-0 animate-spin text-slate-400" />
      ) : null}
    </div>

    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4">
      {activeConversation ? (
        messagesError ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {getApiErrorMessage(messagesError, 'Не вдалося завантажити повідомлення.')}
          </p>
        ) : messagesLoading ? (
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
      {sendError ? <p className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs text-rose-700">{sendError}</p> : null}

      <div className="flex items-end gap-2">
        <textarea
          value={messageDraft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void onSend();
            }
          }}
          rows={2}
          disabled={!hasTarget || isSending}
          placeholder={hasTarget ? 'Напишіть повідомлення...' : 'Спочатку оберіть діалог або відкрийте чат з оголошення.'}
          className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
        <button
          type="button"
          onClick={() => void onSend()}
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
);
