import type { TabButtonProps } from '../BookingsSection.types';

export const TabButton = ({ active, label, count, onClick }: TabButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
      active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
    }`}
  >
    <span>{label}</span>
    <span className="rounded-full bg-white px-1.5 py-0.5 text-[11px] text-slate-600">{count}</span>
  </button>
);
