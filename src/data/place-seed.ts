import type { Attraction, Taste, Zone } from './attractions'
import { blurb, type Kind } from './blurb'
import { col } from '../i18n/col'
import { languageCodes, type Lang } from '../i18n/languages'

export function sameName(name: string): Record<Lang, string> {
  return col(languageCodes.map(() => name))
}

export type Seed = {
  name: string
  town: string
  lat: number
  lng: number
  zone: Zone
  kind: Kind
  reach: number
  featured?: boolean
  tags: Taste[]
}

export function seedPlaces(rows: Seed[], idStart: number): Attraction[] {
  return rows.map((row, index) => ({
    id: idStart + index,
    lng: row.lng,
    lat: row.lat,
    zone: row.zone,
    tags: row.tags,
    town: row.town,
    kind: row.kind,
    reach: row.reach,
    featured: Boolean(row.featured),
    historic: false,
    name: sameName(row.name),
    info: Object.fromEntries(languageCodes.map((code) => [code, blurb(code, row.kind, row.name, row.town)])) as Record<Lang, string>,
  }))
}
