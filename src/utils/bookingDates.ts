export const toIsoDate = (date: Date): string => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

export const addDays = (base: Date, days: number): string => {
  const next = new Date(base);
  next.setDate(base.getDate() + days);
  return toIsoDate(next);
};

export const diffNights = (dateFrom?: string, dateTo?: string): number => {
  if (!dateFrom || !dateTo) {
    return 0;
  }

  const fromMs = new Date(`${dateFrom}T00:00:00`).getTime();
  const toMs = new Date(`${dateTo}T00:00:00`).getTime();

  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || toMs <= fromMs) {
    return 0;
  }

  return Math.round((toMs - fromMs) / (1000 * 60 * 60 * 24));
};
