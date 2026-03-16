import { MessageCircle } from 'lucide-react';
import { ChatPanel } from '@/components/chat';

export const ChatSection = () => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <MessageCircle size={18} className="text-slate-500" />
      <h2 className="text-xl font-bold text-slate-900">Чат</h2>
    </div>
    <ChatPanel variant="widget" />
  </section>
);
