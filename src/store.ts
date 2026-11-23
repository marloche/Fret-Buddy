import { useEffect, useState, useSyncExternalStore, type Dispatch, type SetStateAction } from 'react';

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

/** useState that remembers its value across reloads. */
export function useStored<T>(key: string, fallback: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}

/**
 * Like useStored, but one value shared by every component that uses the returned hook,
 * so two cards on screen can't overwrite each other's changes.
 */
export function sharedStored<T>(key: string, fallback: T): () => [T, (update: (prev: T) => T) => void] {
  let value = load(key, fallback);
  const listeners = new Set<() => void>();
  const subscribe = (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  };
  const set = (update: (prev: T) => T) => {
    value = update(value);
    save(key, value);
    listeners.forEach((fn) => fn());
  };
  return () => [useSyncExternalStore(subscribe, () => value), set];
}
