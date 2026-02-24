const SESSION_KEY = 'par2_session_id';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
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
        referrer: document.referrer || null,
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
