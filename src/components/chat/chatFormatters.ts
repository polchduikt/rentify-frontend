export const formatChatDateTime = (value?: string) => {
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
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatChatTime = (value?: string) => {
  if (!value) {
    return '--:--';
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return '--:--';
  }
  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

