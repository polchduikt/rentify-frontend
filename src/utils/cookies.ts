export const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const parts = document.cookie
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);

  const cookie = parts.find((item) => item.startsWith(`${name}=`));
  if (!cookie) {
    return null;
  }

  const rawValue = cookie.slice(name.length + 1);
  if (!rawValue) {
    return null;
  }

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
};
