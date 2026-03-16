import { LoaderCircle, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import {
  useMyConversationsQuery,
  usePublicProfileQuery,
  useReplyToConversationMutation,
  useSendMessageToPropertyMutation,
} from '@/hooks/api';
import type { ParticipantCardProps } from '../BookingsSection.types';
import { resolveAvatarUrl } from '@/utils/avatar';
import { getApiErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/profileFormatters';
import { resolveParticipantInitial, resolveParticipantName } from './bookingUtils';

export const ParticipantCard = ({ booking, participantType, propertyId, hostId }: ParticipantCardProps) => {
  const participantId = participantType === 'tenant' ? booking.tenantId : Number(hostId || 0);
  const profileQuery = usePublicProfileQuery(participantId, participantId > 0);
  const conversationsQuery = useMyConversationsQuery();
  const sendToPropertyMutation = useSendMessageToPropertyMutation();
  const replyMutation = useReplyToConversationMutation();
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const existingConversation = useMemo(
    () =>
      conversationsQuery.data?.find(
        (conversation) => conversation.propertyId === propertyId && conversation.tenantId === booking.tenantId,
      ),
    [booking.tenantId, conversationsQuery.data, propertyId],
  );

  const canSendMessage = participantType === 'host' || Boolean(existingConversation);
  const isSending = sendToPropertyMutation.isPending || replyMutation.isPending;

  const sendMessage = async () => {
    setNotice(null);
    const templateText =
      participantType === 'host'
        ? `Доброго дня! Пишу щодо бронювання #${booking.id}.`
        : `Доброго дня! Пишу вам щодо бронювання #${booking.id}.`;

    try {
      if (participantType === 'host') {
        await sendToPropertyMutation.mutateAsync({
          propertyId,
          payload: { text: templateText },
        });
      } else {
        if (!existingConversation) {
          setNotice({
            type: 'error',
            message: 'Орендар ще не створив діалог по цьому оголошенню.',
          });
          return;
        }
        await replyMutation.mutateAsync({
          conversationId: existingConversation.id,
          payload: { text: templateText },
        });
      }

      setNotice({ type: 'success', message: 'Повідомлення надіслано.' });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getApiErrorMessage(error, 'Не вдалося надіслати повідомлення.'),
      });
    }
  };

  const participantLabel = participantType === 'tenant' ? 'Орендар' : 'Власник';
  const participant = profileQuery.data;
  const participantName = resolveParticipantName(participant?.firstName, participant?.lastName);
  const participantInitial = resolveParticipantInitial(participant?.firstName, participant?.lastName);
  const avatarSrc = resolveAvatarUrl(participant?.avatarUrl);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{participantLabel}</p>

      {profileQuery.isLoading ? (
        <div className="h-12 animate-pulse rounded-lg bg-slate-100" />
      ) : participant ? (
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img src={avatarSrc} alt={participantName} className="h-11 w-11 rounded-full border border-slate-200 object-cover" />
          ) : (
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {participantInitial}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{participantName}</p>
            <p className="text-xs text-slate-500">На платформі з {formatDate(participant.createdAt)}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Не вдалося завантажити дані користувача.</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!canSendMessage || isSending}
          onClick={() => void sendMessage()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSending ? <LoaderCircle size={12} className="animate-spin" /> : <MessageCircle size={12} />}
          Зв'язатися
        </button>
        <Link
          to={`${ROUTES.profile}?section=chat`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          Відкрити чат
        </Link>
      </div>

      {participantType === 'tenant' && !existingConversation ? (
        <p className="mt-2 text-[11px] text-slate-500">Хост може писати тільки в існуючому діалозі.</p>
      ) : null}

      {notice ? (
        <p
          className={`mt-2 rounded-lg border px-2 py-1 text-[11px] ${
            notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {notice.message}
        </p>
      ) : null}
    </div>
  );
};
