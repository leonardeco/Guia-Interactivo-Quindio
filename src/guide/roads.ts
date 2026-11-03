import type { Point } from './geo'

export async function roadLine(points: Point[]): Promise<Point[] | null> {
  if (points.length < 2) return null
  if (import.meta.env.VITEST) return null
  const coords = points.map((point) => `${point.lng.toFixed(5)},${point.lat.toFixed(5)}`).join(';')
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(5000) },
    )
    if (!response.ok) return null
    const body = (await response.json()) as { routes?: { geometry?: { coordinates?: [number, number][] } }[] }
    const line = body.routes?.[0]?.geometry?.coordinates
    if (!line || line.length < 2) return null
    return line.map(([lng, lat]) => ({ lng, lat }))
  } catch {
    return null
  }
}
