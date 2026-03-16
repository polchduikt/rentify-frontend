import type { MetricCardProps } from './MetricCard.types';


export const MetricCard = ({
  title,
  value,
  hint,
  icon: Icon,
  actionLabel,
  actionDisabled = false,
  actionLoading = false,
  onAction,
}: MetricCardProps) => (
  <article className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
    <div className="flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
        <Icon size={16} />
      </span>
    </div>
    <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        disabled={actionDisabled || actionLoading}
        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {actionLoading ? 'Зачекайте...' : actionLabel}
      </button>
    ) : null}
  </article>
);
