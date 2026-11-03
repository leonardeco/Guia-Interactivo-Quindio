export type Sky = { temp: number; rain: boolean }

export async function skyNow(lat: number, lng: number): Promise<Sky | null> {
  if (import.meta.env.VITEST) return null
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
    '&current=temperature_2m,precipitation,weather_code&timezone=America%2FBogota&forecast_days=1'
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) })
    if (!response.ok) return null
    const body = (await response.json()) as { current?: { temperature_2m?: number; precipitation?: number; weather_code?: number } }
    const current = body.current
    if (!current || typeof current.temperature_2m !== 'number') return null
    const code = current.weather_code ?? 0
    const rain = (current.precipitation ?? 0) > 0 || code >= 51
    return { temp: Math.round(current.temperature_2m), rain }
  } catch {
    return null
  }
}
