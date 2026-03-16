import { useEffect, useRef } from 'react';
import { useChatPanelModel } from '@/hooks/chat/useChatPanelModel';
import type { ChatPanelProps } from './ChatPanel.types';
import { ChatConversationList } from './ChatConversationList';
import { ChatMessagePane } from './ChatMessagePane';

export const ChatPanel = ({
  enabled = true,
  variant = 'page',
  pollIntervalMs = 5_000,
  request,
  onRequestHandled,
  autoSelectFirstConversation,
}: ChatPanelProps) => {
  const shouldAutoSelectFirstConversation = autoSelectFirstConversation ?? variant === 'page';
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const model = useChatPanelModel({
    enabled,
    pollIntervalMs,
    request,
    onRequestHandled,
    shouldAutoSelectFirstConversation,
  });

  useEffect(() => {
    if (!model.activeConversationId) {
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [model.activeConversationId, model.messages.length]);

  const rootClassName =
    variant === 'page'
      ? 'overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'
      : 'h-full overflow-hidden bg-white';
  const showConversationListOnlyMobile = model.activeConversationId == null && model.composePropertyId == null;

  return (
    <section className={rootClassName}>
      <div className={`grid min-h-[560px] ${variant === 'widget' ? 'h-full min-h-0' : ''} md:grid-cols-[280px_minmax(0,1fr)]`}>
        <ChatConversationList
          showOnMobile={showConversationListOnlyMobile}
          conversations={model.conversations}
          conversationsLoading={model.conversationsQuery.isLoading}
          conversationsError={model.conversationsQuery.error}
          activeConversationId={model.activeConversationId}
          counterpartIdByConversationId={model.counterpartIdByConversationId}
          profilesById={model.profilesState.byId}
          propertiesById={model.propertiesState.byId}
          onSelectConversation={model.selectConversation}
          resolveConversationPropertyLabel={model.resolveConversationPropertyLabel}
        />

        <ChatMessagePane
          showOnMobile={showConversationListOnlyMobile}
          activeConversationId={model.activeConversationId}
          activeConversation={model.activeConversation}
          composePropertyId={model.composePropertyId}
          composeProperty={model.composeProperty ?? null}
          activeProperty={model.activeProperty ?? null}
          activeCounterpartProfile={model.activeCounterpartProfile ?? null}
          profilesLoading={model.profilesState.isLoading}
          propertiesLoading={model.propertiesState.isLoading}
          messages={model.messages}
          messagesLoading={model.messagesQuery.isLoading}
          messagesError={model.messagesQuery.error}
          currentUserId={model.currentUserId}
          messageDraft={model.messageDraft}
          sendError={model.sendError}
          hasTarget={model.hasTarget}
          isSending={model.isSending}
          canSend={model.canSend}
          onDraftChange={model.setMessageDraft}
          onSend={model.sendMessage}
          onBack={model.resetSelection}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </section>
  );
};
