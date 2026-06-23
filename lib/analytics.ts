'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import posthog from 'posthog-js';

type EventParams = Record<string, unknown>;
type AnalyticsApp = 'satielle';
type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

const PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const API_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
const SESSION_REPLAY_ENABLED =
  process.env.NEXT_PUBLIC_POSTHOG_SESSION_REPLAY === 'true';
const ATTRIBUTION_KEY = 'satielle.attribution.v1';
const SCROLL_MILESTONES = [25, 50, 75, 90] as const;
const TRACKED_QUERY_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'campaignid',
  'adgroupid',
  'adid',
  'pin_click_id',
  'epik',
  'gclid',
  'fbclid',
  'ttclid',
];

let initialized = false;

type Touch = {
  captured_at: string;
  landing_page: string;
  referrer?: string;
} & Record<string, string | undefined>;

type Attribution = {
  first_touch: Touch;
  last_touch: Touch;
};

function safeParseAttribution(value: string | null): Attribution | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Attribution;
  } catch {
    return null;
  }
}

function readQueryAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return TRACKED_QUERY_PARAMS.reduce<Record<string, string>>((acc, key) => {
    const value = params.get(key);
    if (value) acc[key] = value;
    return acc;
  }, {});
}

function currentTouch(queryAttribution: Record<string, string>): Touch {
  return {
    captured_at: new Date().toISOString(),
    landing_page: window.location.href,
    referrer: document.referrer || undefined,
    ...queryAttribution,
  };
}

function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;

  const queryAttribution = readQueryAttribution();
  const hasNewAttribution = Object.keys(queryAttribution).length > 0;
  const stored = safeParseAttribution(localStorage.getItem(ATTRIBUTION_KEY));

  if (!stored || hasNewAttribution) {
    const touch = currentTouch(queryAttribution);
    const next: Attribution = {
      first_touch: stored?.first_touch ?? touch,
      last_touch: touch,
    };
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
    return next;
  }

  return stored;
}

function attributionProperties(): AnalyticsProperties {
  const attribution = getAttribution();
  if (!attribution) return {};

  return {
    first_landing_page: attribution.first_touch.landing_page,
    first_referrer: attribution.first_touch.referrer,
    first_utm_source: attribution.first_touch.utm_source,
    first_utm_medium: attribution.first_touch.utm_medium,
    first_utm_campaign: attribution.first_touch.utm_campaign,
    first_utm_content: attribution.first_touch.utm_content,
    first_utm_term: attribution.first_touch.utm_term,
    last_landing_page: attribution.last_touch.landing_page,
    last_referrer: attribution.last_touch.referrer,
    last_utm_source: attribution.last_touch.utm_source,
    last_utm_medium: attribution.last_touch.utm_medium,
    last_utm_campaign: attribution.last_touch.utm_campaign,
    last_utm_content: attribution.last_touch.utm_content,
    last_utm_term: attribution.last_touch.utm_term,
    pinterest_click_id:
      attribution.last_touch.pin_click_id || attribution.last_touch.epik,
  };
}

function toAnalyticsProperties(params: EventParams): AnalyticsProperties {
  return Object.entries(params).reduce<AnalyticsProperties>((acc, [key, value]) => {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

export function initAnalytics(app: AnalyticsApp): boolean {
  if (typeof window === 'undefined' || !PROJECT_TOKEN) return false;

  if (!initialized) {
    posthog.init(PROJECT_TOKEN, {
      api_host: API_HOST,
      defaults: '2026-05-30',
      capture_pageview: false,
      capture_pageleave: true,
      disable_session_recording: !SESSION_REPLAY_ENABLED,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-ph-mask]',
      },
    });
    initialized = true;
  }

  posthog.register({
    app,
    ...attributionProperties(),
  });

  return true;
}

export function captureAnalyticsEvent(
  app: AnalyticsApp,
  event: string,
  properties: AnalyticsProperties = {},
) {
  if (!initAnalytics(app)) return;

  posthog.capture(event, {
    app,
    path: window.location.pathname,
    url: window.location.href,
    ...properties,
  });
}

export function capturePageView(app: AnalyticsApp) {
  if (!initAnalytics(app)) return;

  posthog.capture('$pageview', {
    app,
    path: window.location.pathname,
    url: window.location.href,
    title: document.title,
    ...attributionProperties(),
  });
}

export function identifyAnalyticsDistinctId(
  app: AnalyticsApp,
  distinctId: string | undefined,
) {
  if (!distinctId || !initAnalytics(app)) return;
  posthog.identify(distinctId);
  posthog.register({ source_distinct_id: distinctId });
}

function currentScrollDepth(): number {
  const doc = document.documentElement;
  const body = document.body;
  const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
  const pageHeight = Math.max(body.scrollHeight, doc.scrollHeight);
  const viewportHeight = window.innerHeight || doc.clientHeight;
  const scrollable = Math.max(pageHeight - viewportHeight, 1);

  return Math.min(100, Math.round((scrollTop / scrollable) * 100));
}

function watchScrollDepth(app: AnalyticsApp) {
  const seen = new Set<number>();
  let ticking = false;

  const check = () => {
    ticking = false;
    const depth = currentScrollDepth();
    for (const milestone of SCROLL_MILESTONES) {
      if (depth >= milestone && !seen.has(milestone)) {
        seen.add(milestone);
        captureAnalyticsEvent(app, 'scroll_depth_reached', {
          depth_percent: milestone,
        });
      }
    }
  };

  const queueCheck = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(check);
  };

  queueCheck();
  window.addEventListener('scroll', queueCheck, { passive: true });
  window.addEventListener('resize', queueCheck);

  return () => {
    window.removeEventListener('scroll', queueCheck);
    window.removeEventListener('resize', queueCheck);
  };
}

export function track(event: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;

  if (gtag) {
    gtag('event', event, params);
  }

  captureAnalyticsEvent('satielle', event, toAnalyticsProperties(params));
}

export function trackOnce(perfKey: string, event: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  const key = `ga_once_${perfKey}`;
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  track(event, params);
}

export function AnalyticsTracker({ app }: { app: AnalyticsApp }) {
  const pathname = usePathname();

  useEffect(() => {
    capturePageView(app);
    return watchScrollDepth(app);
  }, [app, pathname]);

  return null;
}
