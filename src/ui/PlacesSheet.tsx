import { useMemo, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Search, Route as RouteIcon } from 'lucide-react'
import { zoneColor, type Attraction, type Lang, type Zone } from '../data/attractions'
import { distanceMeters, type Point } from '../guide/geo'
import { formatDistance } from '../guide/lines'
import { Sheet } from './Sheet'
import { zoneIcon } from './ZoneIcon'

const zones: Zone[] = ['town', 'gate', 'hotel', 'stay', 'restaurant', 'park', 'cafe', 'nightlife', 'viewpoint', 'popular']

/** Accent-insensitive match, so "teleferico" finds "Teleférico". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

type Props = {
  lang: Lang
  here: Point
  visited: number[]
  route: number[]
  places: Attraction[]
  onPick: (place: Attraction) => void
  onClose: () => void
}

export function PlacesSheet({ lang, here, visited, route, places, onPick, onClose }: Props) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [zone, setZone] = useState<Zone | null>(null)
  const [origin] = useState(here)

  const list = useMemo(() => {
    const words = normalize(query.trim())
    return places
      .filter((place) => !zone || place.zone === zone)
      .filter(
        (place) =>
          !words ||
          normalize(place.name[lang]).includes(words) ||
          normalize(place.name.es).includes(words) ||
          normalize(place.town).includes(words) ||
          String(place.id) === words,
      )
      .map((place) => ({ place, distance: distanceMeters(origin, place) }))
      .sort((a, b) => a.distance - b.distance)
  }, [query, zone, lang, origin, places])

  return (
    <Sheet title={t('places')} closeLabel={t('close')} onClose={onClose}>
      <label className="search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={query}
          placeholder={t('search')}
          aria-label={t('search')}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="zone-filter" role="group" aria-label={t('places')}>
        <button type="button" className={`zone-chip${zone === null ? ' is-on' : ''}`} aria-pressed={zone === null} onClick={() => setZone(null)}>
          {t('all')}
        </button>
        {zones.map((item) => {
          const Icon = zoneIcon[item]
          return (
            <button
              key={item}
              type="button"
              className={`zone-chip${zone === item ? ' is-on' : ''}`}
              style={{ '--zone': zoneColor[item] } as CSSProperties}
              aria-pressed={zone === item}
              onClick={() => setZone(zone === item ? null : item)}
            >
              <Icon size={16} aria-hidden="true" />
              {t(`zones.${item}`)}
            </button>
          )
        })}
      </div>
      {list.length === 0 && <p className="empty">{t('noResults')}</p>}
      <ul className="place-list">
        {list.map(({ place, distance }) => {
          const Icon = zoneIcon[place.zone]
          const done = visited.includes(place.id)
          return (
            <li key={place.id}>
              <button type="button" className="place-row" onClick={() => onPick(place)}>
                <span className="place-token" style={{ background: zoneColor[place.zone] }}>
                  {place.id}
                </span>
                <span className="place-row-text">
                  <strong>{place.name[lang]}</strong>
                  <small>
                    <Icon size={14} aria-hidden="true" /> {place.town} · {t(`zones.${place.zone}`)} · {t('away', { m: formatDistance(lang, distance) })}
                  </small>
                </span>
                {route.includes(place.id) && !done && <RouteIcon size={18} className="row-route" aria-label={t('inRoute')} />}
                {done && <BadgeCheck size={20} className="row-done" aria-label={t('visited')} />}
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
