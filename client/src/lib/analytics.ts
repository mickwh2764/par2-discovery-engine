const SESSION_KEY = 'par2_session_id';
const LANDING_REF_KEY = 'par2_landing_referrer';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getLandingReferrer(): string | null {
  let cached = sessionStorage.getItem(LANDING_REF_KEY);
  if (cached) return cached;

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const rawReferrer = document.referrer || null;

  const hasUtm = utmSource || utmMedium || utmCampaign;

  if (!rawReferrer && !hasUtm) return null;

  const referrerData: Record<string, string> = {};
  if (rawReferrer) referrerData.url = rawReferrer;
  if (utmSource) referrerData.utm_source = utmSource;
  if (utmMedium) referrerData.utm_medium = utmMedium;
  if (utmCampaign) referrerData.utm_campaign = utmCampaign;

  try {
    if (rawReferrer) {
      const u = new URL(rawReferrer);
      referrerData.domain = u.hostname;
    }
  } catch {}

  const encoded = JSON.stringify(referrerData);
  sessionStorage.setItem(LANDING_REF_KEY, encoded);
  return encoded;
}

export function trackPageView(page: string) {
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'page_view',
        page,
        sessionId: getSessionId(),
        referrer: getLandingReferrer(),
      }),
    }).catch(() => {});
  } catch {
  }
}

export function trackEvent(eventType: string, page?: string) {
  try {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        page: page || window.location.pathname,
        sessionId: getSessionId(),
      }),
    }).catch(() => {});
  } catch {
  }
}

export function trackDownload(fileName: string) {
  trackEvent('file_download', window.location.pathname);
}

export function trackShare(shareId: string) {
  trackEvent('share_link', window.location.pathname);
}
