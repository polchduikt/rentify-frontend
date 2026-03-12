export const formatLocalTime = (value?: string, fallback = '--:--'): string => {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const parts = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(trimmed);
  if (parts) {
    const hours = parts[1].padStart(2, '0');
    const minutes = parts[2];
    return `${hours}:${minutes}`;
  }

  const date = new Date(trimmed);
  if (!Number.isFinite(date.getTime())) {
    return trimmed;
  }

  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
