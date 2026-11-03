import type { Lang } from '../i18n/languages'
import { languageCodes } from '../i18n/languages'
import { blurb, type Kind } from './blurb'
import catalog from './catalog.json'
import { hasHistory, placeHistory } from './history'
import { distanceMeters, type Point } from '../guide/geo'
import { crowds, gateText, gates } from './visit'

export type { Lang }
export type Zone =
  | 'town'
  | 'hotel'
  | 'stay'
  | 'restaurant'
  | 'park'
  | 'cafe'
  | 'nightlife'
  | 'viewpoint'
  | 'popular'
  | 'gate'
export type Taste = 'towns' | 'stay' | 'food' | 'nature' | 'coffee' | 'nightlife' | 'views' | 'family'

export type Attraction = {
  id: number
  lng: number
  lat: number
  zone: Zone
  tags: Taste[]
  town: string
  kind: Kind
  reach: number
  featured: boolean
  historic: boolean
  name: Record<Lang, string>
  info: Record<Lang, string>
}

const towns = [
  'Armenia',
  'Buenavista',
  'Calarcá',
  'Circasia',
  'Córdoba',
  'Filandia',
  'Génova',
  'La Tebaida',
  'Montenegro',
  'Pijao',
  'Quimbaya',
  'Salento',
] as const

export const municipalities: string[] = [...towns]

const townAlias: Record<string, string> = {
  armenia: 'Armenia',
  buenavista: 'Buenavista',
  calarca: 'Calarcá',
  circasia: 'Circasia',
  cordoba: 'Córdoba',
  filandia: 'Filandia',
  genova: 'Génova',
  'la tebaida': 'La Tebaida',
  montenegro: 'Montenegro',
  pijao: 'Pijao',
  quimbaya: 'Quimbaya',
  'quimbaya colombia': 'Quimbaya',
  salento: 'Salento',
}

const landmarks = new Set([
  'Valle de Cocora',
  'Parque Nacional del Café',
  'Parque Nacional de la Cultura Agropecuaria - PANACA',
  'RECUCA, Recorrido de la Cultura Cafetera.',
  'Jardín Botánico del Quindío',
  'Museo del Oro Quimbaya',
  'Cementerio Libre',
  'Reserva Natural Barbas Bremen',
  'Mirador del tiempo detenido',
  'Mirador Valle del Cocora',
  'Parque de La Vida',
])

const coffeeNames = new Set([
  'Parque Nacional del Café',
  'RECUCA, Recorrido de la Cultura Cafetera.',
  'Museo del Oro Quimbaya',
  'Valle de Cocora',
])

const zones: Zone[] = ['town', 'hotel', 'stay', 'restaurant', 'park', 'cafe', 'nightlife', 'viewpoint', 'popular']
const kinds: Kind[] = [
  'pueblo',
  'hotel',
  'finca',
  'hostal',
  'apartamento',
  'camping',
  'restaurante',
  'cafe',
  'rumba',
  'bar',
  'reserva',
  'museo',
  'tematico',
  'plan',
  'parque',
  'mirador',
  'plaza',
]

type Raw = {
  name: string
  town: string
  lat: number
  lng: number
  zone: string
  kind: string
  reach: number
}

function plain(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function knownTown(value: string): string | null {
  return townAlias[plain(value)] ?? null
}

function dropName(name: string): boolean {
  const text = plain(name)
  if (text.includes('msnm')) return true
  if (text.includes('no way down')) return true
  if (text.includes('campamento inoficial')) return true
  if (text.includes('ultimo broche')) return true
  if (text.includes('subida al mirador')) return true
  if (text.includes('lot by the road')) return true
  if (text === 'finca' || text === 'notaria' || text === 'bomberos') return true
  if (text.startsWith('parqueadero') || text.startsWith('arborizacion')) return true
  if (text === 'portugal') return true
  if (text.includes('sevilla')) return true
  if (['mirador', 'hotel', 'bar', 'cafe', 'restaurante', 'parque', 'park', 'hostel', 'hostal'].includes(text)) return true
  return /^mirador \d+$/.test(text)
}

function nearestTown(point: Point, centers: Map<string, Point>): string {
  let best = 'Armenia'
  let bestDistance = Infinity
  for (const [name, center] of centers) {
    const distance = distanceMeters(point, center)
    if (distance < bestDistance) {
      best = name
      bestDistance = distance
    }
  }
  return best
}

function settleTown(row: Raw, centers: Map<string, Point>): string {
  if (row.name === 'Museo del Oro Quimbaya') return 'Armenia'
  if (row.name.startsWith('RECUCA')) return 'Calarcá'
  return knownTown(row.town) ?? nearestTown(row, centers)
}

function historicPlace(name: string, town: string, zone: Zone): boolean {
  if (zone === 'town' && (towns as readonly string[]).includes(name)) return true
  if (name === 'Plaza de Bolívar') return town === 'Salento'
  return landmarks.has(name)
}

function tagsFor(zone: Zone, kind: Kind, name: string): Taste[] {
  const tags = new Set<Taste>()
  if (zone === 'town' || zone === 'popular') tags.add('towns')
  if (zone === 'hotel' || zone === 'stay') tags.add('stay')
  if (zone === 'restaurant' || zone === 'cafe') tags.add('food')
  if (zone === 'cafe' || coffeeNames.has(name)) tags.add('coffee')
  if (zone === 'park' || zone === 'viewpoint' || kind === 'reserva') tags.add('nature')
  if (zone === 'nightlife') tags.add('nightlife')
  if (zone === 'viewpoint') tags.add('views')
  if (zone === 'park' || zone === 'town' || kind === 'tematico' || zone === 'popular') tags.add('family')
  return [...tags]
}

function named(name: string): Record<Lang, string> {
  return Object.fromEntries(languageCodes.map((code) => [code, name])) as Record<Lang, string>
}

function described(name: string, town: string, kind: Kind, historic: boolean): Record<Lang, string> {
  const gate = gateText(name, 'es')
  if (gate) {
    return Object.fromEntries(languageCodes.map((code) => [code, gateText(name, code) ?? gate])) as Record<Lang, string>
  }
  return Object.fromEntries(
    languageCodes.map((code) => {
      const story = historic ? placeHistory(name, town, code) : null
      return [code, story ?? blurb(code, kind, name, town)]
    }),
  ) as Record<Lang, string>
}

const rows = catalog as Raw[]
const centers = new Map<string, Point>()
for (const row of rows) {
  if (row.zone !== 'town') continue
  const town = knownTown(row.name)
  if (town) centers.set(town, { lng: row.lng, lat: row.lat })
}

const cleaned = rows
  .filter((row) => zones.includes(row.zone as Zone))
  .filter((row) => !dropName(row.name) && !plain(row.town).includes('sevilla'))
  .map((row) => {
    const zone = row.zone as Zone
    const kind = kinds.includes(row.kind as Kind) ? (row.kind as Kind) : 'plan'
    const town = settleTown(row, centers)
    const historic = historicPlace(row.name, town, zone) && hasHistory(row.name, town)
    return {
      lng: row.lng,
      lat: row.lat,
      zone,
      town,
      kind,
      reach: row.reach,
      historic,
      featured: historic,
      tags: tagsFor(zone, kind, row.name),
      name: row.name,
    }
  })
  .sort((a, b) => a.town.localeCompare(b.town, 'es') || a.zone.localeCompare(b.zone) || a.name.localeCompare(b.name, 'es'))

for (const gate of gates) {
  cleaned.push({
    lng: gate.lng,
    lat: gate.lat,
    zone: 'gate',
    town: gate.town,
    kind: 'plan',
    reach: gate.reach,
    historic: false,
    featured: false,
    tags: [],
    name: gate.name,
  })
}
for (const spot of crowds) {
  cleaned.push({
    lng: spot.lng,
    lat: spot.lat,
    zone: 'popular',
    town: spot.town,
    kind: 'plaza',
    reach: spot.reach,
    historic: false,
    featured: false,
    tags: ['towns', 'family'],
    name: spot.name,
  })
}
cleaned.sort((a, b) => a.town.localeCompare(b.town, 'es') || a.zone.localeCompare(b.zone) || a.name.localeCompare(b.name, 'es'))

export const attractions: Attraction[] = cleaned.map((row, index) => ({
  id: index + 1,
  lng: row.lng,
  lat: row.lat,
  zone: row.zone,
  tags: row.tags,
  town: row.town,
  kind: row.kind,
  reach: row.reach,
  featured: row.featured,
  historic: row.historic,
  name: named(row.name),
  info: described(row.name, row.town, row.kind, row.historic),
}))

export const essentials = attractions.filter((place) => place.featured)

const townCenters = new Map<string, Point>()
for (const place of attractions) {
  if (place.zone === 'town') townCenters.set(place.town, place)
}

export function townPoint(name: string): Point | null {
  return townCenters.get(name) ?? null
}

export const entrance: Point = townPoint('Armenia') ?? { lng: -75.6724, lat: 4.5363 }

export const zoneColor: Record<Zone, string> = {
  town: '#0e6b56',
  hotel: '#1d4f91',
  stay: '#3d6b58',
  restaurant: '#c45c32',
  park: '#2e8f55',
  cafe: '#8a5a2b',
  nightlife: '#6d3d98',
  viewpoint: '#1c7c8c',
  popular: '#b8860b',
  gate: '#0b4f6c',
}

export function findAttraction(id: number): Attraction | undefined {
  return attractions.find((place) => place.id === id)
}

export function findPlace(name: string, town?: string): Attraction | undefined {
  return attractions.find((place) => place.name.es === name && (town === undefined || place.town === town))
}
