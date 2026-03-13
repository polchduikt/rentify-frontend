import { MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import type { ConversationDto } from '@/types/conversation';
import type { PropertyResponseDto } from '@/types/property';
import type { PublicUserProfileDto } from '@/types/user';
import { resolveAvatarUrl } from '@/utils/avatar';
import { formatChatDateTime } from '@/utils/chatFormatters';
import { resolveUserInitials, resolveUserName } from '@/utils/chatPanel';
import { getApiErrorMessage } from '@/utils/errors';

interface ChatConversationListProps {
  showOnMobile: boolean;
  conversations: ConversationDto[];
  conversationsLoading: boolean;
  conversationsError: unknown;
  activeConversationId: number | null;
  counterpartIdByConversationId: Map<number, number>;
  profilesById: Map<number, PublicUserProfileDto>;
  propertiesById: Map<number, PropertyResponseDto>;
  onSelectConversation: (conversationId: number) => void;
  resolveConversationPropertyLabel: (propertyId: number) => string;
}

export const ChatConversationList = ({
  showOnMobile,
  conversations,
  conversationsLoading,
  conversationsError,
  activeConversationId,
  counterpartIdByConversationId,
  profilesById,
  propertiesById,
  onSelectConversation,
  resolveConversationPropertyLabel,
}: ChatConversationListProps) => (
  <aside className={`border-slate-200 bg-slate-50 md:border-r ${showOnMobile ? 'block border-b' : 'hidden md:block'}`}>
    <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
      <MessageCircle size={16} className="text-slate-500" />
      <p className="text-sm font-semibold text-slate-900">Діалоги</p>
    </div>

    {conversationsError ? (
      <p className="p-4 text-xs text-rose-700">{getApiErrorMessage(conversationsError, 'Не вдалося завантажити діалоги.')}</p>
    ) : conversationsLoading ? (
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
          const counterpartProfile = profilesById.get(counterpartIdByConversationId.get(conversation.id) ?? -1);
          const property = propertiesById.get(conversation.propertyId);
          const isActive = activeConversationId === conversation.id;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                isActive ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-100'
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
                    {resolveConversationPropertyLabel(conversation.propertyId)}
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
);
