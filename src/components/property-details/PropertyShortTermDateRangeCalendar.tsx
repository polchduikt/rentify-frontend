import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { UnavailableDateRangeDto } from '@/types/property';
import { toIsoDate } from '@/utils/bookingDates';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const toLocalDate = (iso: string): Date => new Date(`${iso}T00:00:00`);
const monthStart = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);
const addMonths = (date: Date, delta: number): Date => new Date(date.getFullYear(), date.getMonth() + delta, 1);

const isRangeUnavailable = (dateFrom: string, dateTo: string, ranges: UnavailableDateRangeDto[]): boolean =>
  ranges.some((range) => {
    if (!range.dateFrom || !range.dateTo) {
      return false;
    }
    if (String(range.source).toUpperCase() === 'BLOCK') {
      return dateFrom <= range.dateTo && dateTo >= range.dateFrom;
    }
    return dateFrom < range.dateTo && dateTo > range.dateFrom;
  });

type UnavailableKind = 'BLOCK' | 'BOOKING';

const getUnavailableKindByDate = (iso: string, ranges: UnavailableDateRangeDto[]): UnavailableKind | null => {
  let hasBlock = false;
  let hasBooking = false;

  for (const range of ranges) {
    if (!range.dateFrom || !range.dateTo || iso < range.dateFrom || iso > range.dateTo) {
      continue;
    }

    const source = String(range.source || '').toUpperCase();
    const hasBookingStatus = Boolean(range.bookingStatus);

    if (source === 'BOOKING' || source.includes('BOOK') || hasBookingStatus) {
      hasBooking = true;
      break;
    }
    if (source === 'BLOCK' || source.includes('BLOCK')) {
      hasBlock = true;
    }
  }

  if (hasBooking) {
    return 'BOOKING';
  }
  if (hasBlock) {
    return 'BLOCK';
  }
  return null;
};

type CalendarCell = { iso: string; day: number } | null;

const buildMonthCells = (monthDate: Date): CalendarCell[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: toIsoDate(new Date(year, month, day)), day });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
};

export interface PropertyShortTermDateRangeCalendarProps {
  dateFrom: string;
  dateTo: string;
  todayIso: string;
  maxDateIso: string;
  nightlyPrice: number;
  currency: string;
  unavailableRanges: UnavailableDateRangeDto[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export const PropertyShortTermDateRangeCalendar = ({
  dateFrom,
  dateTo,
  todayIso,
  maxDateIso,
  nightlyPrice,
  currency,
  unavailableRanges,
  onDateFromChange,
  onDateToChange,
}: PropertyShortTermDateRangeCalendarProps) => {
  const todayMonthStart = useMemo(() => monthStart(toLocalDate(todayIso)), [todayIso]);
  const maxMonthStart = useMemo(() => monthStart(toLocalDate(maxDateIso)), [maxDateIso]);
  const [visibleMonth, setVisibleMonth] = useState(todayMonthStart);

  const firstMonth = visibleMonth;
  const secondMonth = addMonths(visibleMonth, 1);
  const canPrev = firstMonth.getTime() > todayMonthStart.getTime();
  const canNext = secondMonth.getTime() < maxMonthStart.getTime();

  const handleDayClick = (iso: string) => {
    const unavailableKind = getUnavailableKindByDate(iso, unavailableRanges);
    const outOfRange = iso < todayIso || iso > maxDateIso;
    if (unavailableKind || outOfRange) {
      return;
    }

    if (!dateFrom || (dateFrom && dateTo)) {
      onDateFromChange(iso);
      onDateToChange('');
      return;
    }

    if (iso <= dateFrom) {
      onDateFromChange(iso);
      onDateToChange('');
      return;
    }

    if (isRangeUnavailable(dateFrom, iso, unavailableRanges)) {
      onDateFromChange(iso);
      onDateToChange('');
      return;
    }

    onDateToChange(iso);
  };

  const renderMonth = (monthDate: Date) => {
    const monthLabel = monthDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });
    const cells = buildMonthCells(monthDate);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="text-center text-lg font-semibold capitalize text-slate-900">{monthLabel}</p>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
          {WEEKDAYS.map((label) => (
            <span key={`${monthLabel}-${label}`}>{label}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell) {
              return <span key={`${monthLabel}-empty-${index}`} className="block h-14 rounded-lg bg-transparent" />;
            }

            const unavailableKind = getUnavailableKindByDate(cell.iso, unavailableRanges);
            const isOutsideRange = cell.iso < todayIso || cell.iso > maxDateIso;
            const isSelectedStart = Boolean(dateFrom && cell.iso === dateFrom);
            const isSelectedEnd = Boolean(dateTo && cell.iso === dateTo);
            const isInSelectedRange = Boolean(dateFrom && dateTo && cell.iso > dateFrom && cell.iso < dateTo);
            const isUnavailable = Boolean(unavailableKind);
            const isBlocked = unavailableKind === 'BLOCK';
            const isBooked = unavailableKind === 'BOOKING';

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => handleDayClick(cell.iso)}
                disabled={isUnavailable || isOutsideRange}
                className={`h-14 rounded-lg border px-1 text-left transition ${
                  isSelectedStart || isSelectedEnd
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : isInSelectedRange
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : isBooked
                        ? 'cursor-not-allowed border-red-300 bg-red-50 text-red-600'
                        : isBlocked
                          ? 'cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600'
                        : isOutsideRange
                          ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-sm font-semibold">{cell.day}</div>
                {!isUnavailable && !isOutsideRange ? (
                  <div className={`mt-1 text-[10px] ${isSelectedStart || isSelectedEnd ? 'text-white/90' : 'text-slate-500'}`}>
                    {currency} {Math.round(nightlyPrice)}
                  </div>
                ) : null}
                {isBlocked ? <div className="mt-1 text-[10px] font-semibold uppercase">ЗАБЛ.</div> : null}
                {isBooked ? <div className="mt-1 text-[10px] font-semibold uppercase">ЗАБР.</div> : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => addMonths(prev, -1))}
          disabled={!canPrev}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Попередні місяці"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
          disabled={!canNext}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Наступні місяці"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        {renderMonth(firstMonth)}
        {renderMonth(secondMonth)}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-slate-300 bg-slate-50" />
          доступно
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-amber-300 bg-amber-100" />
          заблоковано
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-red-300 bg-red-100" />
          заброньовано
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-emerald-600 bg-emerald-600" />
          вибрані дати
        </span>
      </div>
    </div>
  );
};
