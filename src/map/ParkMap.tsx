import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Box, Download, Maximize2, Square } from 'lucide-react'
import {
  AttributionControl,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type ExpressionSpecification,
  type GeoJSONSource,
  type StyleSpecification,
} from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { attractions, zoneColor, type Attraction, type Lang, type Zone } from '../data/attractions'
import boundary from '../data/boundary.json'
import { Avatar, type AvatarMode } from '../guide/Avatar'
import type { Character } from '../guide/characters'
import type { Point } from '../guide/geo'
import { languageInfo } from '../i18n/languages'
import { zoneGlyph } from '../ui/ZoneIcon'

setWorkerUrl(workerUrl)

export type Focus = { point: Point; zoom?: number; key: number }

type Props = {
  lang: Lang
  loadingText: string
  youText: string
  guide: Character
  avatar: { pos: Point; mode: AvatarMode; talking: boolean; facing: 'left' | 'right' }
  user: Point | null
  path: Point[]
  route: number[]
  visited: number[]
  nextId: number | null
  selectedId: number | null
  focus: Focus | null
  bottomPadding: number
  onSelect: (place: Attraction) => void
}

const vectorStyle = 'https://tiles.openfreemap.org/styles/liberty'

const rasterStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
}

const ring = boundary as [number, number][]

export function parkBounds(): LngLatBounds {
  return ring.reduce((box, [lng, lat]) => box.extend([lng, lat]), new LngLatBounds(ring[0], ring[0]))
}

function parkShape() {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'Polygon' as const, coordinates: [ring] },
  }
}

function tileUrls(west: number, south: number, east: number, north: number, zoom: number): string[] {
  const size = 2 ** zoom
  const x0 = Math.floor(((west + 180) / 360) * size)
  const x1 = Math.floor(((east + 180) / 360) * size)
  const latTile = (lat: number) => {
    const rad = (lat * Math.PI) / 180
    return Math.floor(((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * size)
  }
  const y0 = latTile(north)
  const y1 = latTile(south)
  const urls: string[] = []
  for (let x = x0; x <= x1; x += 1) {
    for (let y = y0; y <= y1; y += 1) {
      urls.push(`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`)
    }
  }
  if (urls.length <= 40) return urls
  const step = urls.length / 40
  return Array.from({ length: 40 }, (_, index) => urls[Math.floor(index * step)])
}

function ensureRelief(map: MapLibreMap) {
  if (map.getSource('relief')) return
  map.addSource('relief', {
    type: 'raster-dem',
    tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 15,
  })
}

function applyRelief(map: MapLibreMap, on: boolean) {
  try {
    if (!on) {
      map.setTerrain(null)
      return
    }
    ensureRelief(map)
    map.setTerrain({ source: 'relief', exaggeration: 1.4 })
  } catch {
    return
  }
}

function pathShape(path: Point[]) {
  return {
    type: 'Feature' as const,
    properties: {},
    geometry: { type: 'LineString' as const, coordinates: path.map((p) => [p.lng, p.lat]) },
  }
}

/** Dash patterns that, played in a loop, make the route look like it is marching toward the next stop. */
const dashFrames: number[][] = [
  [0, 4, 3],
  [0.5, 4, 2.5],
  [1, 4, 2],
  [1.5, 4, 1.5],
  [2, 4, 1],
  [2.5, 4, 0.5],
  [3, 4, 0],
  [0, 0.5, 3, 3.5],
  [0, 1, 3, 3],
  [0, 1.5, 3, 2.5],
  [0, 2, 3, 2],
  [0, 2.5, 3, 1.5],
  [0, 3, 3, 1],
  [0, 3.5, 3, 0.5],
]

function addLayers(map: MapLibreMap, path: Point[]) {
  if (!map.getSource('park')) {
    map.addSource('park', { type: 'geojson', data: parkShape() })
    map.addLayer({
      id: 'park-fill',
      type: 'fill',
      source: 'park',
      paint: { 'fill-color': '#0e6b56', 'fill-opacity': 0.14 },
    })
    map.addLayer({
      id: 'park-glow',
      type: 'line',
      source: 'park',
      paint: { 'line-color': '#e0b03a', 'line-width': 10, 'line-blur': 8, 'line-opacity': 0.45 },
    })
    map.addLayer({
      id: 'park-line',
      type: 'line',
      source: 'park',
      paint: { 'line-color': '#0c6b52', 'line-width': 2.5, 'line-dasharray': [3, 2] },
    })
  }
  if (!map.getSource('route')) {
    map.addSource('route', { type: 'geojson', data: pathShape(path) })
    map.addLayer({
      id: 'route-casing',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 10, 'line-opacity': 0.92 },
    })
    map.addLayer({
      id: 'route-base',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#f3d2c4', 'line-width': 5 },
    })
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#c45c32', 'line-width': 5, 'line-dasharray': dashFrames[0] },
    })
  }
}

/** Shows map labels (streets, towns, rivers) in the visitor's language when OpenStreetMap has them. */
function localizeLabels(map: MapLibreMap, lang: Lang) {
  const field = languageInfo(lang).mapField
  const expression: ExpressionSpecification = ['coalesce', ['get', field], ['get', 'name']]
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type !== 'symbol') continue
    const current = JSON.stringify(map.getLayoutProperty(layer.id, 'text-field') ?? '')
    if (!current.includes('name')) continue
    try {
      map.setLayoutProperty(layer.id, 'text-field', expression)
    } catch {
      continue
    }
  }
}

function zoomBand(zoom: number): 'far' | 'mid' | 'near' {
  if (zoom < 11.5) return 'far'
  if (zoom < 14.2) return 'mid'
  return 'near'
}

const zoneFilters: Zone[] = ['town', 'gate', 'hotel', 'stay', 'restaurant', 'park', 'cafe', 'nightlife', 'viewpoint', 'popular']

function pinVisible(
  place: Attraction,
  zoom: 'far' | 'mid' | 'near',
  only: Zone | null,
  marked: boolean,
): boolean {
  if (marked) return true
  if (only) return place.zone === only
  if (zoom === 'near') return true
  if (zoom === 'mid') return place.zone !== 'restaurant' && place.zone !== 'cafe'
  return place.zone === 'town' || place.featured || place.zone === 'viewpoint' || place.zone === 'park' || place.zone === 'popular' || place.zone === 'gate'
}

function buildPin(place: Attraction): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'pin'
  button.style.setProperty('--pin', zoneColor[place.zone])
  button.innerHTML =
    `<span class="pin-token"><span class="pin-num">${place.id}</span>` +
    `<svg class="pin-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${zoneGlyph[place.zone]}</svg></span>` +
    `<span class="pin-label"></span>`
  return button
}

export function ParkMap(props: Props) {
  const { t } = useTranslation()
  const { lang, guide, avatar, user, path, route, visited, nextId, selectedId, focus, onSelect } = props
  const host = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const pinsRef = useRef<Map<number, HTMLButtonElement>>(new Map())
  const avatarMarker = useRef<Marker | null>(null)
  const userMarker = useRef<Marker | null>(null)
  const pathRef = useRef(path)
  const selectRef = useRef(onSelect)
  const langRef = useRef(lang)
  const paddingRef = useRef(props.bottomPadding)
  const tiltedRef = useRef(false)
  const [avatarEl] = useState(() => {
    const el = document.createElement('div')
    el.className = 'avatar-marker'
    return el
  })
  const [userEl] = useState(() => {
    const el = document.createElement('div')
    el.className = 'user-dot'
    return el
  })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [tilted, setTilted] = useState(false)
  const [band, setBand] = useState<'far' | 'mid' | 'near'>('far')
  const [filter, setFilter] = useState<Zone | null>(null)
  const [saving, setSaving] = useState<'idle' | 'saving' | 'done' | 'fail'>('idle')

  pathRef.current = path
  selectRef.current = onSelect
  langRef.current = lang
  paddingRef.current = props.bottomPadding

  useEffect(() => {
    if (!host.current || mapRef.current || import.meta.env.MODE === 'test') return

    const map = new MapLibreMap({
      container: host.current,
      style: vectorStyle,
      center: [-75.68, 4.46],
      zoom: 9,
      maxPitch: 70,
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right')
    map.addControl(new AttributionControl({ compact: true }), 'top-right')
    host.current.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')

    for (const place of attractions) {
      const button = buildPin(place)
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        selectRef.current(place)
      })
      pinsRef.current.set(place.id, button)
      new Marker({ element: button, anchor: 'bottom' }).setLngLat([place.lng, place.lat]).addTo(map)
    }

    avatarMarker.current = new Marker({ element: avatarEl, anchor: 'bottom', offset: [28, 4] })
      .setLngLat([avatar.pos.lng, avatar.pos.lat])
      .addTo(map)

    const syncBand = () => setBand(zoomBand(map.getZoom()))
    syncBand()
    map.on('zoom', syncBand)

    let usingRaster = false
    const giveUp = window.setTimeout(() => {
      if (!map.isStyleLoaded()) setFailed(true)
    }, 15000)
    map.on('style.load', () => {
      addLayers(map, pathRef.current)
      if (tiltedRef.current) applyRelief(map, true)
      map.fitBounds(parkBounds(), { padding: { top: 72, bottom: 96, left: 28, right: 28 }, duration: 0 })
      if (!usingRaster) localizeLabels(map, langRef.current)
      window.requestAnimationFrame(() => {
        host.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')
      })
      window.clearTimeout(giveUp)
      setFailed(false)
      setReady(true)
    })
    map.once('idle', () => {
      host.current?.querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show')
    })
    map.on('error', () => {
      if (map.isStyleLoaded()) return
      if (usingRaster) {
        setFailed(true)
        return
      }
      usingRaster = true
      map.setStyle(rasterStyle, { diff: false })
    })

    // March the route dashes toward the next stop (paused when the tab is hidden or motion is reduced).
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let step = 0
    let last = 0
    const animate = (now: number) => {
      frame = window.requestAnimationFrame(animate)
      if (now - last < 70 || document.hidden || !map.getLayer('route-line')) return
      last = now
      step = (step + 1) % dashFrames.length
      map.setPaintProperty('route-line', 'line-dasharray', dashFrames[step])
    }
    if (!still) frame = window.requestAnimationFrame(animate)

    const pins = pinsRef.current
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(giveUp)
      map.remove()
      mapRef.current = null
      pins.clear()
    }
  }, [avatarEl])

  useEffect(() => {
    const map = mapRef.current
    if (map && ready && map.isStyleLoaded()) localizeLabels(map, lang)
  }, [lang, ready])

  useEffect(() => {
    avatarMarker.current?.setLngLat([avatar.pos.lng, avatar.pos.lat])
  }, [avatar.pos])

  useEffect(() => {
    avatarEl.classList.toggle('is-talking', avatar.talking)
    avatarEl.classList.toggle('is-walking', avatar.mode === 'walk')
  }, [avatar.talking, avatar.mode, avatarEl])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (!user) {
      userMarker.current?.remove()
      userMarker.current = null
      return
    }
    if (!userMarker.current) {
      userMarker.current = new Marker({ element: userEl, anchor: 'center' }).setLngLat([user.lng, user.lat]).addTo(map)
    } else {
      userMarker.current.setLngLat([user.lng, user.lat])
    }
  }, [user, userEl])

  useEffect(() => {
    const source = mapRef.current?.getSource('route') as GeoJSONSource | undefined
    source?.setData(pathShape(path))
  }, [path, ready])

  useEffect(() => {
    for (const [id, pin] of pinsRef.current) {
      const place = attractions.find((item) => item.id === id)
      if (!place) continue
      const done = visited.includes(id)
      const onRoute = route.includes(id)
      pin.classList.toggle('pin--visited', done)
      pin.classList.toggle('pin--route', onRoute)
      pin.classList.toggle('pin--next', id === nextId)
      pin.classList.toggle('pin--selected', id === selectedId)
      pin.hidden = !pinVisible(place, band, filter, onRoute || id === nextId || id === selectedId)
      if (place) {
        pin.setAttribute('aria-label', `${id}. ${place.name[lang]}${done ? ' ✓' : ''}`)
        const label = pin.querySelector('.pin-label')
        if (label) label.textContent = place.name[lang]
      }
    }
  }, [visited, route, nextId, selectedId, lang, ready, band, filter])

  useEffect(() => {
    userEl.setAttribute('aria-label', props.youText)
    userEl.setAttribute('role', 'img')
  }, [props.youText, userEl])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    // Reads the dock height from a ref so a dock resize does not yank the map back to an old focus.
    map.easeTo({
      center: [focus.point.lng, focus.point.lat],
      zoom: focus.zoom ?? Math.max(map.getZoom(), 16.2),
      duration: 900,
      padding: {
        top: 60,
        bottom: bottomInset(map),
        left: 20,
        right: 20,
      },
    })
  }, [focus])

  /** Keeps focused places above the guide panel, but never asks MapLibre for more padding than the map has. */
  function bottomInset(map: MapLibreMap): number {
    const { clientHeight, clientWidth } = map.getContainer()
    const sideways = clientWidth > clientHeight * 1.3 && clientHeight < 520
    if (sideways) return 30
    const wanted = Math.max(paddingRef.current + 24, Math.round(clientHeight * 0.38))
    return Math.min(wanted, Math.round(clientHeight * 0.72))
  }

  function toggleTilt() {
    const map = mapRef.current
    if (!map) return
    const next = !tilted
    tiltedRef.current = next
    setTilted(next)
    applyRelief(map, next)
    map.easeTo({ pitch: next ? 64 : 0, bearing: next ? -24 : 0, duration: 900 })
  }

  function showWholePark() {
    mapRef.current?.fitBounds(parkBounds(), {
      padding: { top: 70, bottom: bottomInset(mapRef.current), left: 30, right: 30 },
      duration: 900,
    })
  }

  async function saveView() {
    const map = mapRef.current
    if (!map || saving === 'saving') return
    setSaving('saving')
    const bounds = map.getBounds()
    const zoom = Math.min(15, Math.max(11, Math.round(map.getZoom())))
    const urls = tileUrls(bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(), zoom)
    let kept = 0
    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url)
          if (response.ok) kept += 1
        } catch {
          return
        }
      }),
    )
    setSaving(kept > 0 ? 'done' : 'fail')
  }

  return (
    <div className={`map-stage map-stage--${band}`}>
      <div ref={host} className="map-canvas" />
      {!ready && !failed && (
        <p className="map-status">
          <span className="spinner" aria-hidden="true" />
          {props.loadingText}
        </p>
      )}
      {failed && <p className="map-status map-status--error">{t('mapError')}</p>}
      <div className="map-filters" role="group" aria-label={t('places')}>
        {zoneFilters.map((item) => (
          <button
            key={item}
            type="button"
            className={`zone-chip${filter === item ? ' is-on' : ''}`}
            style={{ '--zone': zoneColor[item] } as CSSProperties}
            aria-pressed={filter === item}
            onClick={() => setFilter((current) => (current === item ? null : item))}
          >
            {t(`zones.${item}`)}
          </button>
        ))}
      </div>
      <div className="map-tools">
        <button type="button" className="map-tool" onClick={toggleTilt} aria-pressed={tilted} aria-label={tilted ? t('view2d') : t('view3d')} title={tilted ? t('view2d') : t('view3d')}>
          {tilted ? <Square size={18} aria-hidden="true" /> : <Box size={18} aria-hidden="true" />}
          <span>{tilted ? '2D' : '3D'}</span>
        </button>
        <button type="button" className="map-tool" onClick={showWholePark} aria-label={t('wholePark')} title={t('wholePark')}>
          <Maximize2 size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="map-tool"
          onClick={() => void saveView()}
          aria-label={t('saveView')}
          title={saving === 'done' ? t('viewSaved') : saving === 'fail' ? t('viewSaveFail') : t('saveView')}
        >
          <Download size={18} aria-hidden="true" />
        </button>
      </div>
      {createPortal(
        <>
          <span className="avatar-ring" aria-hidden="true" />
          <span className="avatar-talk" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Avatar character={guide} mode={avatar.mode} talking={avatar.talking} facing={avatar.facing} size={92} detail={false} />
        </>,
        avatarEl,
      )}
    </div>
  )
}
