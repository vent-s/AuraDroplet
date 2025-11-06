'use client';

type EventParams = Record<string, unknown>;

export function track(event: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  // GA4 event call
  gtag('event', event, params);
}

export function trackOnce(perfKey: string, event: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  const key = `ga_once_${perfKey}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  track(event, params);
}
