export const formatBookingPaymentDate = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const formatBookingPaymentDateTime = (value?: string): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatBookingPaymentMoney = (value: number, currency: string) =>
  `${Number(value || 0).toLocaleString('uk-UA')} ${currency}`;
