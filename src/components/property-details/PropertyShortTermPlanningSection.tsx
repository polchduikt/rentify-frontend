import type { UnavailableDateRangeDto } from '@/types/property';
import { diffNights } from '@/utils/bookingDates';
import { PropertyShortTermDateRangeCalendar } from './PropertyShortTermDateRangeCalendar';

interface PropertyShortTermPlanningSectionProps {
  dateFrom: string;
  dateTo: string;
  guests: number;
  maxGuests: number;
  todayIso: string;
  maxDateIso: string;
  nightlyPrice: number;
  currency: string;
  unavailableRanges: UnavailableDateRangeDto[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

const formatDate = (value: string): string => {
  if (!value) {
    return '—';
  }
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatRangeLabel = (dateFrom: string, dateTo: string): string =>
  dateFrom === dateTo ? formatDate(dateFrom) : `${formatDate(dateFrom)} — ${formatDate(dateTo)}`;

const resolveBlockReason = (reason?: string | null): string => {
  const normalized = reason?.trim();
  return normalized ? normalized : '—';
};

export const PropertyShortTermPlanningSection = ({
  dateFrom,
  dateTo,
  guests,
  maxGuests,
  todayIso,
  maxDateIso,
  nightlyPrice,
  currency,
  unavailableRanges,
  onDateFromChange,
  onDateToChange,
}: PropertyShortTermPlanningSectionProps) => {
  const nights = diffNights(dateFrom, dateTo);
  const blockedRanges = unavailableRanges.filter((range) => String(range.source).toUpperCase() === 'BLOCK');
  const blockedRangesByDate = new Map<string, UnavailableDateRangeDto>();

  for (const range of blockedRanges) {
    if (!range.dateFrom || !range.dateTo) {
      continue;
    }

    const key = `${range.dateFrom}|${range.dateTo}`;
    const existing = blockedRangesByDate.get(key);
    if (!existing) {
      blockedRangesByDate.set(key, range);
      continue;
    }

    if (!existing.reason && range.reason) {
      blockedRangesByDate.set(key, range);
    }
  }

  const blockedRangesList = Array.from(blockedRangesByDate.values());

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Планування бронювання</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Оберіть дати проживання</h2>
            <p className="mt-1 text-sm text-slate-600">
              Дати синхронізовані з правою панеллю. Недоступні дні позначені в календарі.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <PropertyShortTermDateRangeCalendar
            dateFrom={dateFrom}
            dateTo={dateTo}
            todayIso={todayIso}
            maxDateIso={maxDateIso}
            nightlyPrice={nightlyPrice}
            currency={currency}
            unavailableRanges={unavailableRanges}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Заїзд</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(dateFrom)}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Виїзд</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(dateTo)}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ночей</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{nights}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Гостей</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {guests} / {maxGuests}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Причина блокування</p>
          {blockedRangesList.length === 0 ? (
            <p className="mt-1 text-sm font-semibold text-amber-900">—</p>
          ) : (
            <div className="mt-2 space-y-2">
              {blockedRangesList.map((range) => (
                <div
                  key={`${range.dateFrom}-${range.dateTo}`}
                  className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-sm text-amber-900"
                >
                  <span className="font-semibold">{formatRangeLabel(range.dateFrom, range.dateTo)}</span>
                  <span>{resolveBlockReason(range.reason)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
