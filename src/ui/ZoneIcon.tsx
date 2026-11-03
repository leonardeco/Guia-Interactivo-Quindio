import { BedDouble, Binoculars, Coffee, Landmark, Moon, Trees, Utensils, type LucideIcon } from 'lucide-react'
import type { Zone } from '../data/attractions'

export const zoneIcon: Record<Zone, LucideIcon> = {
  town: Landmark,
  hotel: BedDouble,
  stay: BedDouble,
  restaurant: Utensils,
  park: Trees,
  cafe: Coffee,
  nightlife: Moon,
  viewpoint: Binoculars,
  popular: Landmark,
  gate: Landmark,
}

/** Raw SVG markup for the map pins, which are plain DOM elements outside React. */
export const zoneGlyph: Record<Zone, string> = {
  town: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/>',
  hotel: '<path d="M3 18V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10M3 14h18M7 10h.01M12 10h.01M17 10h.01"/>',
  stay: '<path d="M3 20V9l9-6 9 6v11M9 20v-6h6v6"/>',
  restaurant: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  park: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  cafe: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 3"/>',
  nightlife: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  viewpoint: '<path d="M3 20l7-14 4 8 3-5 4 11"/><path d="M3 20h18"/>',
  popular: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  gate: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
}
