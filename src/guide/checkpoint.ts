import { attractions, type Attraction } from '../data/attractions'
import boundary from '../data/boundary.json'
import { distanceMeters, type Point } from './geo'

export const BASE_RADIUS = 55
export const MAX_RADIUS = 250
const DOOR_ACCURACY = 80

export function arrivalRadius(accuracy: number, reach = 60): number | null {
  if (accuracy > MAX_RADIUS) return null
  if (accuracy > DOOR_ACCURACY && reach < 120) return null
  const door = Math.max(BASE_RADIUS, Math.min(accuracy, DOOR_ACCURACY))
  if (reach >= 120) return Math.max(door, Math.min(reach, 180))
  return door
}

export function findArrival(
  position: Point,
  accuracy: number,
  visited: number[],
  pool: Attraction[] = attractions,
): Attraction | null {
  let best: Attraction | null = null
  let bestDistance = Infinity
  for (const place of pool) {
    if (visited.includes(place.id)) continue
    const radius = arrivalRadius(accuracy, place.reach)
    if (radius === null) continue
    const distance = distanceMeters(position, place)
    if (distance <= radius && distance < bestDistance) {
      best = place
      bestDistance = distance
    }
  }
  return best
}

export function nearestPlaces(position: Point, count: number, pool: Attraction[] = attractions) {
  return pool
    .map((place) => ({ place, distance: distanceMeters(position, place) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count)
}

export const PARK_CENTER: Point = { lng: -75.7, lat: 4.46 }
/** The department outline is simplified, so a point just outside the line still counts. */
export const EDGE_MARGIN = 2000

const ring = boundary as [number, number][]

export function insidePolygon(position: Point, polygon: [number, number][] = ring): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    const crosses = yi > position.lat !== yj > position.lat
    if (crosses && position.lng < ((xj - xi) * (position.lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function isInsideQuindio(position: Point): boolean {
  if (insidePolygon(position)) return true
  return ring.some(([lng, lat]) => distanceMeters(position, { lng, lat }) <= EDGE_MARGIN)
}

export const isInsidePark = isInsideQuindio
