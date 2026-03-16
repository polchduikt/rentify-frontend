
import type { NoticeProps } from './Notice.types';

export const Notice = ({ type, message }: NoticeProps) => (
  <div
    className={`rounded-xl border px-3 py-2 text-sm ${
      type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-700'
    }`}
  >
    {message}
  </div>
);
