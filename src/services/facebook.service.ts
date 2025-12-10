export function track(event: string, params?: Record<string, any>) {
  try {
    const fbq = (window as any).fbq
    if (typeof fbq === 'function') fbq('track', event, params || {})
  } catch {}
}

function getCookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'))
  return m && m[2] ? decodeURIComponent(m[2]) : undefined
}

function getFbp(): string | undefined {
  return getCookie('_fbp')
}

function getFbc(): string | undefined {
  const url = new URL(window.location.href)
  const fbclid = url.searchParams.get('fbclid')
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined
}

export async function sendEvent(event_name: string, custom_data?: Record<string, any>) {
  const pixelId = import.meta.env.VITE_FB_PIXEL_ID
  const token = import.meta.env.VITE_FB_CAPI_TOKEN
  if (!pixelId || !token) return
  const body = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        action_source: 'website',
        user_data: {
          client_user_agent: navigator.userAgent,
          fbp: getFbp(),
          fbc: getFbc(),
        },
        custom_data: custom_data || {},
      },
    ],
  }
  try {
    await fetch(`https://graph.facebook.com/v24.0/${pixelId}/events?access_token=${token}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {}
}
