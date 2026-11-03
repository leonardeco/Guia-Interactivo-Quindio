export type Point = { lng: number; lat: number }

const R = 6371000
const rad = (deg: number) => (deg * Math.PI) / 180

export function distanceMeters(a: Point, b: Point): number {
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function bearingDeg(a: Point, b: Point): number {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function compassIndex(bearing: number): number {
  return Math.round(bearing / 45) % 8
}

export function lerpPoint(a: Point, b: Point, k: number): Point {
  return { lng: a.lng + (b.lng - a.lng) * k, lat: a.lat + (b.lat - a.lat) * k }
}
