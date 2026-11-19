// localStorage helpers. Every key starts with the app slug, because other apps on the
// same github.io origin share this storage.
const PREFIX = 'fret-buddy:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    // Merge objects so settings added in later versions get their defaults.
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) return { ...fallback, ...parsed };
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Private mode or full storage: the app still works, settings just won't persist.
  }
}
