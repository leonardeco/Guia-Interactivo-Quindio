import { attractions, type Attraction, type Taste } from '../data/attractions'

const tasteKeys: Taste[] = ['towns', 'stay', 'food', 'nature', 'coffee', 'nightlife', 'views', 'family']

function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

export function findNamed(name: string, pool: Attraction[] = attractions): Attraction | undefined {
  const key = fold(name.trim())
  if (!key) return undefined
  const matches = pool.filter((place) => fold(place.name.es) === key)
  return matches.find((place) => place.zone === 'town') ?? matches[0]
}

export function readShare(search: string): { place: string | null; base: string | null; tastes: Taste[]; map: string | null } {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const place = params.get('lugar')?.trim() || null
  const base = params.get('desde')?.trim() || null
  const map = params.get('mapa')?.trim() || null
  const tastes = (params.get('gustos') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is Taste => tasteKeys.includes(item as Taste))
  return { place, base, tastes, map }
}

function tagMap(url: URL, region?: string) {
  if (region && region !== 'quindio') url.searchParams.set('mapa', region)
}

export function placeHref(page: string, name: string, region?: string): string {
  const url = new URL(page)
  url.search = ''
  url.hash = ''
  url.searchParams.set('lugar', name)
  tagMap(url, region)
  return url.toString()
}

export function routeHref(page: string, base: string, tastes: readonly string[], region?: string): string {
  const url = new URL(page)
  url.search = ''
  url.hash = ''
  url.searchParams.set('desde', base)
  if (tastes.length > 0) url.searchParams.set('gustos', tastes.join(','))
  tagMap(url, region)
  return url.toString()
}
