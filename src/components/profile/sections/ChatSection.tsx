import { MessageCircle } from 'lucide-react';

export const ChatSection = () => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="mb-2 flex items-center gap-2">
      <MessageCircle size={18} className="text-slate-500" />
      <h2 className="text-xl font-bold text-slate-900">Чат</h2>
    </div>
    <p className="text-sm text-slate-600">Розділ повідомлень буде винесений в окремий інтерфейс чату.</p>
  </section>
);
