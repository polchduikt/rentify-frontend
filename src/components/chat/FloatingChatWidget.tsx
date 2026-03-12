import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';
import { ChatPanel } from './ChatPanel';
import { CHAT_OPEN_EVENT, type ChatOpenRequest } from './chatEvents';

const WIDGET_PANEL_CLASS_NAME =
  'fixed bottom-24 right-4 z-[70] h-[min(72vh,620px)] w-[min(calc(100vw-1.5rem),680px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6';

export const FloatingChatWidget = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [request, setRequest] = useState<ChatOpenRequest | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsOpen(false);
      setRequest(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const openFromEvent = (event: Event) => {
      const customEvent = event as CustomEvent<ChatOpenRequest>;
      const nextRequest = customEvent.detail ?? {};

      if (!isAuthenticated) {
        navigate(ROUTES.login, { state: { from: location } });
        return;
      }

      setIsOpen(true);
      setRequest(nextRequest);
    };

    window.addEventListener(CHAT_OPEN_EVENT, openFromEvent as EventListener);
    return () => {
      window.removeEventListener(CHAT_OPEN_EVENT, openFromEvent as EventListener);
    };
  }, [isAuthenticated, location, navigate]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <section className={WIDGET_PANEL_CLASS_NAME}>
          <header className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <MessageCircle size={16} className="text-blue-600" />
              Чат Rentify
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100"
              aria-label="Закрити чат"
            >
              <X size={16} />
            </button>
          </header>

          <div className="h-[calc(100%-56px)]">
            <ChatPanel
              variant="widget"
              enabled={isOpen}
              request={request}
              onRequestHandled={() => setRequest(null)}
              autoSelectFirstConversation={false}
            />
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:scale-[1.03] hover:bg-blue-700"
        aria-label={isOpen ? 'Сховати чат' : 'Відкрити чат'}
      >
        <MessageCircle size={22} />
      </button>
    </>
  );
};
