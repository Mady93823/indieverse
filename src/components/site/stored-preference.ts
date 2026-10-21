"use client";

import { useSyncExternalStore } from "react";

// Reading preferences (lyrics language, text size) remembered across songs and visits.
const listeners = new Set<() => void>();

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or storage blocked: the choice still applies, it just isn't remembered.
  }
  listeners.forEach((notify) => notify());
}

/** A value kept in localStorage. The server render always uses the fallback. */
export function useStoredPreference<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, allowed, fallback),
    () => fallback,
  );
  return [value, (next: T) => write(key, next)] as const;
}
