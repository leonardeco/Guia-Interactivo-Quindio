import type { Seed } from './place-seed'

/**
 * Capitals and northern Valle towns next to Quindío.
 * Coordinates from OpenStreetMap. The town pin sits on the center people use:
 * Pereira on its main square, Manizales on the cathedral.
 */
export const neighborSeeds: Seed[] = [
  { name: 'Pereira', town: 'Pereira', lat: 4.8143547, lng: -75.6946682, zone: 'town', kind: 'pueblo', reach: 500, featured: true, tags: ['towns', 'coffee', 'family'] },
  { name: 'Aeropuerto Internacional Matecaña', town: 'Pereira', lat: 4.8125188, lng: -75.7402798, zone: 'gate', kind: 'plan', reach: 280, featured: true, tags: ['towns'] },
  { name: 'Manizales', town: 'Manizales', lat: 5.0673855, lng: -75.5173225, zone: 'town', kind: 'pueblo', reach: 500, featured: true, tags: ['towns', 'coffee', 'family'] },
  { name: 'Aeropuerto La Nubia', town: 'Manizales', lat: 5.0295719, lng: -75.4640872, zone: 'gate', kind: 'plan', reach: 250, featured: true, tags: ['towns'] },
  { name: 'Sevilla', town: 'Sevilla', lat: 4.2645071, lng: -75.934396, zone: 'town', kind: 'pueblo', reach: 400, featured: true, tags: ['towns', 'coffee', 'family'] },
  { name: 'Caicedonia', town: 'Caicedonia', lat: 4.3076028, lng: -75.8397908, zone: 'town', kind: 'pueblo', reach: 400, featured: true, tags: ['towns', 'coffee', 'family'] },
  { name: 'Alcalá', town: 'Alcalá', lat: 4.6748944, lng: -75.781669, zone: 'town', kind: 'pueblo', reach: 350, featured: true, tags: ['towns', 'coffee', 'family'] },
]
