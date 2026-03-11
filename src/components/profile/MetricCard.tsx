import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

export const MetricCard = ({ title, value, hint, icon: Icon }: MetricCardProps) => (
  <article className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={16} />
      </span>
    </div>
    <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </article>
);
