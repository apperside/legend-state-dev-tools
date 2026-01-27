/**
 * Shared UI utilities for Legend State Dev Tools
 */

const STORAGE_PREFIX = 'lsdt';

export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function getStoredBoolean(key: string, defaultValue: boolean): boolean {
  const stored = localStorage.getItem(`${STORAGE_PREFIX}-${key}`);
  if (stored === null) return defaultValue;
  return stored === 'true';
}

export function setStoredBoolean(key: string, value: boolean): void {
  localStorage.setItem(`${STORAGE_PREFIX}-${key}`, String(value));
}

export function getStoredString(key: string, defaultValue: string): string {
  return localStorage.getItem(`${STORAGE_PREFIX}-${key}`) || defaultValue;
}

export function setStoredString(key: string, value: string): void {
  localStorage.setItem(`${STORAGE_PREFIX}-${key}`, value);
}

export function createCleanup(): {
  add: (fn: () => void) => void;
  run: () => void;
} {
  const cleanupFns: (() => void)[] = [];
  return {
    add: (fn: () => void) => cleanupFns.push(fn),
    run: () => {
      cleanupFns.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error('[Legend State DevTools] Cleanup error:', e);
        }
      });
      cleanupFns.length = 0;
    },
  };
}
