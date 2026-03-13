export const formatMoney = (value?: number | string, currency = 'UAH') =>
  `${Number(value || 0).toLocaleString('uk-UA', { maximumFractionDigits: 2 })} ${currency}`;

export const formatDate = (value?: string) => {
  if (!value) {
    return 'Нещодавно';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Нещодавно';
  }
  return date.toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Нещодавно';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Нещодавно';
  }
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
