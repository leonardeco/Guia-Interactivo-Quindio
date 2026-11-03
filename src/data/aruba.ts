import type { Seed } from './place-seed'

/** Towns and landmarks with coordinates taken from OpenStreetMap. */
export const arubaSeeds: Seed[] = [
  { name: 'Oranjestad', town: 'Oranjestad', lat: 12.5201024, lng: -70.0371329, zone: 'town', kind: 'pueblo', reach: 450, featured: true, tags: ['towns', 'family'] },
  { name: 'San Nicolaas', town: 'San Nicolaas', lat: 12.436375, lng: -69.9090028, zone: 'town', kind: 'pueblo', reach: 450, featured: true, tags: ['towns', 'family'] },
  { name: 'Noord', town: 'Noord', lat: 12.5645311, lng: -70.0319284, zone: 'town', kind: 'pueblo', reach: 400, featured: true, tags: ['towns', 'family'] },
  { name: 'Santa Cruz', town: 'Santa Cruz', lat: 12.5113591, lng: -69.9804307, zone: 'town', kind: 'pueblo', reach: 400, featured: true, tags: ['towns', 'family'] },
  { name: 'Savaneta', town: 'Savaneta', lat: 12.4526385, lng: -69.9496521, zone: 'town', kind: 'pueblo', reach: 350, featured: true, tags: ['towns', 'family'] },
  { name: 'Paradera', town: 'Paradera', lat: 12.535434, lng: -70.0049851, zone: 'town', kind: 'pueblo', reach: 350, featured: true, tags: ['towns', 'family'] },
  { name: 'Aeropuerto Internacional Reina Beatriz', town: 'Oranjestad', lat: 12.5021129, lng: -70.0141166, zone: 'gate', kind: 'plan', reach: 300, featured: true, tags: ['towns'] },
  { name: 'Eagle Beach', town: 'Noord', lat: 12.546562, lng: -70.0599149, zone: 'park', kind: 'parque', reach: 250, featured: true, tags: ['nature', 'family'] },
  { name: 'Palm Beach', town: 'Noord', lat: 12.5704412, lng: -70.0394103, zone: 'park', kind: 'parque', reach: 250, featured: true, tags: ['nature', 'family'] },
  { name: 'Arashi Beach', town: 'Noord', lat: 12.6099338, lng: -70.0531969, zone: 'park', kind: 'parque', reach: 180, featured: false, tags: ['nature', 'views'] },
  { name: 'Baby Beach', town: 'San Nicolaas', lat: 12.4132522, lng: -69.8835994, zone: 'park', kind: 'parque', reach: 180, featured: true, tags: ['nature', 'family'] },
  { name: 'Mangel Halto', town: 'Savaneta', lat: 12.4634064, lng: -69.9684266, zone: 'park', kind: 'reserva', reach: 160, featured: false, tags: ['nature'] },
  { name: 'Arikok National Park', town: 'Santa Cruz', lat: 12.4931388, lng: -69.9254772, zone: 'park', kind: 'reserva', reach: 700, featured: true, tags: ['nature', 'views', 'family'] },
  { name: 'California Lighthouse', town: 'Noord', lat: 12.6137665, lng: -70.0513486, zone: 'viewpoint', kind: 'mirador', reach: 80, featured: true, tags: ['views'] },
  { name: 'Alto Vista Chapel', town: 'Noord', lat: 12.5759787, lng: -70.0109298, zone: 'park', kind: 'plan', reach: 80, featured: false, tags: ['views', 'towns'] },
  { name: 'Bushiribana Gold Smelter Ruins', town: 'Noord', lat: 12.5537068, lng: -69.9766236, zone: 'park', kind: 'plan', reach: 80, featured: false, tags: ['nature', 'towns'] },
  { name: 'Fort Zoutman', town: 'Oranjestad', lat: 12.5176861, lng: -70.0356123, zone: 'park', kind: 'museo', reach: 60, featured: true, tags: ['towns', 'family'] },
]
