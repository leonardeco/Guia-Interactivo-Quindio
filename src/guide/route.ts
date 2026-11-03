import { attractions, townPoint, type Attraction, type Taste } from '../data/attractions'
import { distanceMeters, type Point } from './geo'

export const MAX_STOPS = 6
const CLUSTER = 18000

export function buildRoute(tastes: Taste[], start: Point, pool: Attraction[] = attractions): Attraction[] {
  if (tastes.length === 0) return []

  const scored = pool
    .map((place) => {
      const taste = place.tags.filter((tag) => tastes.includes(tag)).length
      if (taste === 0) return null
      const bonus = (place.featured ? 2 : 0) + (place.historic ? 1 : 0)
      return { place, score: taste * 3 + bonus }
    })
    .filter((row): row is { place: Attraction; score: number } => row !== null)

  const weight = new Map<string, number>()
  for (const row of scored) {
    const hub = townPoint(row.place.town) ?? row.place
    const distance = distanceMeters(start, hub)
    const next = row.score / (1 + distance / 8000)
    weight.set(row.place.town, (weight.get(row.place.town) ?? 0) + next)
  }
  const hub = [...weight.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  if (!hub) return []
  const hubPoint = townPoint(hub) ?? start
  const single = tastes.length === 1

  const nearby = scored
    .filter(({ place }) => place.town === hub || distanceMeters(hubPoint, place) <= CLUSTER)
    .sort((a, b) => b.score - a.score || a.place.id - b.place.id)

  const picked: Attraction[] = []
  const perZone = new Map<string, number>()
  for (const row of nearby) {
    if (picked.length >= MAX_STOPS) break
    const count = perZone.get(row.place.zone) ?? 0
    if (!single && count >= 2) continue
    picked.push(row.place)
    perZone.set(row.place.zone, count + 1)
  }

  const ordered: Attraction[] = []
  let here = start
  const left = [...picked]
  while (left.length > 0) {
    let best = 0
    for (let index = 1; index < left.length; index += 1) {
      if (distanceMeters(here, left[index]) < distanceMeters(here, left[best])) best = index
    }
    const [next] = left.splice(best, 1)
    ordered.push(next)
    here = next
  }
  return ordered
}
