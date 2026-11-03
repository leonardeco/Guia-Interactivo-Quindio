import { attractions } from '../data/attractions'

export const XP_PER_STAMP = 100
export const XP_PER_BADGE = 50
/** Total XP needed to reach each level (index 0 = level 1). */
export const LEVEL_XP = [0, 100, 400, 800, 1400, 2400, 4000]

export type BadgeId = 'first' | 'five' | 'ten' | 'coffee' | 'views' | 'table' | 'route' | 'legend'

export const badgeOrder: BadgeId[] = ['first', 'five', 'ten', 'coffee', 'views', 'table', 'route', 'legend']

const coffeeIds = attractions.filter((place) => place.tags.includes('coffee')).map((place) => place.id)
const viewIds = attractions.filter((place) => place.zone === 'viewpoint').map((place) => place.id)
const tableIds = attractions.filter((place) => place.zone === 'cafe' || place.zone === 'restaurant').map((place) => place.id)
const legendIds = attractions.filter((place) => place.featured).map((place) => place.id)

export type ProgressInput = { visited: number[]; routesDone: number }

function count(ids: number[], visited: number[]): number {
  return ids.filter((id) => visited.includes(id)).length
}

export function earnedBadges({ visited, routesDone }: ProgressInput): BadgeId[] {
  const rules: Record<BadgeId, boolean> = {
    first: visited.length >= 1,
    five: visited.length >= 5,
    ten: visited.length >= 10,
    coffee: count(coffeeIds, visited) >= 4,
    views: count(viewIds, visited) >= 3,
    table: count(tableIds, visited) >= 4,
    route: routesDone >= 1,
    legend: legendIds.length > 0 && legendIds.every((id) => visited.includes(id)),
  }
  return badgeOrder.filter((id) => rules[id])
}

export function xpFor(input: ProgressInput): number {
  return input.visited.length * XP_PER_STAMP + earnedBadges(input).length * XP_PER_BADGE + input.routesDone * 150
}

export type Level = { level: number; xp: number; floor: number; ceiling: number | null; progress: number }

export function levelFor(xp: number): Level {
  let index = 0
  while (index + 1 < LEVEL_XP.length && xp >= LEVEL_XP[index + 1]) index += 1
  const floor = LEVEL_XP[index]
  const ceiling = LEVEL_XP[index + 1] ?? null
  const progress = ceiling === null ? 1 : (xp - floor) / (ceiling - floor)
  return { level: index + 1, xp, floor, ceiling, progress }
}
