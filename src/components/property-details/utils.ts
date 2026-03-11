export const parseCoordinate = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    return Number(normalized);
  }
  return Number.NaN;
};

export const yesNo = (value?: boolean) => (value ? 'Так' : 'Ні');

export const formatPrice = (value?: number, currency = 'UAH') => `${Number(value || 0).toLocaleString('uk-UA')} ${currency}`;

export const formatCreatedAt = (value?: string) => {
  if (!value) {
    return 'Нещодавно';
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Нещодавно';
  }

  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};
