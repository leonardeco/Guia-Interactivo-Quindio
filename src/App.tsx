import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, BookOpen, Globe, List, Navigation2, Route as RouteIcon, Settings } from 'lucide-react'
import i18n, { msg, readLang } from './i18n'
import { isLang, languageInfo, languageList, toLang } from './i18n/languages'
import { ParkMap, type Focus } from './map/ParkMap'
import { attractions, entrance, essentials, municipalities, townPoint, type Attraction, type Lang, type Taste } from './data/attractions'
import { characters, findCharacter, type Character, type CharacterId } from './guide/characters'
import { useWalker } from './guide/useWalker'
import { chime, hasVoice, setRateScale, speak, stopSpeaking, unlockAudio, warmVoices, type Mood } from './guide/speech'
import { buildRoute } from './guide/route'
import { findArrival, isInsideQuindio, nearestPlaces } from './guide/checkpoint'
import { answerQuestion } from './guide/ask'
import { roadLine } from './guide/roads'
import { findNamed, placeHref, readShare, routeHref } from './guide/link'
import { bearingDeg, compassIndex, distanceMeters, type Point } from './guide/geo'
import * as lines from './guide/lines'
import { Onboarding } from './guide/Onboarding'
import { GuideDock, type GpsState } from './guide/GuideDock'
import { Celebration } from './guide/Celebration'
import { earnedBadges, levelFor, xpFor, type BadgeId } from './game/progress'
import { PlacesSheet } from './ui/PlacesSheet'
import { CalendarSheet } from './ui/CalendarSheet'
import { PassportSheet } from './ui/PassportSheet'
import { SettingsSheet, speedScale, type Speed } from './ui/SettingsSheet'
import { Sheet } from './ui/Sheet'

const tasteList: Taste[] = ['towns', 'stay', 'food', 'nature', 'coffee', 'nightlife', 'views', 'family']
const speeds: Speed[] = ['slow', 'normal', 'fast']

function load(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    return
  }
}

function readGuide(): CharacterId | null {
  const value = load('qui.guide')
  return characters.find((item) => item.id === value)?.id ?? null
}

function readBase(): string {
  const value = load('qui.base')
  return value && municipalities.includes(value) ? value : 'Armenia'
}

function readList<T>(key: string, allowed: readonly T[]): T[] {
  try {
    const value: unknown = JSON.parse(load(key) ?? '[]')
    return Array.isArray(value) ? Array.from(new Set(value.filter((item): item is T => allowed.includes(item as T)))) : []
  } catch {
    return []
  }
}

function readSpeed(): Speed {
  const value = load('pdc.speed')
  return speeds.find((item) => item === value) ?? 'normal'
}

const placeIds = attractions.map((place) => place.id)

type SheetName = 'places' | 'passport' | 'settings' | 'language' | 'calendar' | null
type Party = { place: Attraction; n: number; xpGain: number; levelUp: number | null; badges: BadgeId[] }

export function App() {
  const { t } = useTranslation()
  const lang = toLang(i18n.language)
  const [guideId, setGuideId] = useState<CharacterId | null>(readGuide)
  const guide = findCharacter(guideId)
  const [onboarding, setOnboarding] = useState<1 | 2 | 3 | null>(() => (readGuide() ? null : 1))
  const [tastes, setTastes] = useState<Taste[]>(() => readList('qui.tastes', tasteList))
  const [base, setBase] = useState(readBase)
  const [route, setRoute] = useState<Attraction[]>(() =>
    readGuide() ? buildRoute(readList('qui.tastes', tasteList), townPoint(readBase()) ?? entrance) : [],
  )
  const [visited, setVisited] = useState<number[]>(() => readList('qui.visited', placeIds))
  const [routesDone, setRoutesDone] = useState(() => Math.max(0, Number(load('qui.routes')) || 0))
  const [selected, setSelected] = useState<Attraction | null>(null)
  const [target, setTarget] = useState<Attraction | null>(null)
  const [text, setText] = useState('')
  const [talking, setTalking] = useState(false)
  const [previewId, setPreviewId] = useState<CharacterId | null>(null)
  const [cheering, setCheering] = useState(false)
  const [voiceOn, setVoiceOn] = useState(() => load('pdc.voice') !== 'off')
  const [speed, setSpeed] = useState<Speed>(readSpeed)
  const [autoWalk, setAutoWalk] = useState(false)
  const [gps, setGps] = useState<GpsState>('off')
  const [user, setUser] = useState<Point | null>(null)
  const [focus, setFocus] = useState<Focus | null>(null)
  const [party, setParty] = useState<Party | null>(null)
  const [dockOpen, setDockOpen] = useState(true)
  const [dockHeight, setDockHeight] = useState(280)
  const [sheet, setSheet] = useState<SheetName>(null)
  const walker = useWalker(entrance)

  const live = useRef({ lang, voiceOn, guide, autoWalk, route, gps, user, target })
  live.current = { lang, voiceOn, guide, autoWalk, route, gps, user, target }
  const visitedRef = useRef(visited)
  visitedRef.current = visited
  const routesRef = useRef(routesDone)
  routesRef.current = routesDone
  const watchId = useRef<number | null>(null)
  const focusKey = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const stored = readLang()
    document.documentElement.lang = stored
    document.documentElement.dir = languageInfo(stored).dir ?? 'ltr'
    void i18n.changeLanguage(stored)
    setRateScale(speedScale[readSpeed()])
    warmVoices()
    if (readGuide()) {
      const share = readShare(window.location.search)
      if (!share.place && !share.base && share.tastes.length === 0) {
        const plan = buildRoute(readList('qui.tastes', tasteList), townPoint(readBase()) ?? entrance)
        setText(`${lines.greeting(stored, findCharacter(readGuide()))} ${lines.startHint(stored, plan.length > 0)}`)
      }
    }
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    const list = timers.current
    return () => {
      window.removeEventListener('pointerdown', unlock)
      stopSpeaking()
      list.forEach((id) => window.clearTimeout(id))
      if (watchId.current !== null) navigator.geolocation?.clearWatch(watchId.current)
    }
  }, [])

  useEffect(() => {
    document.title = msg(lang).appName
  }, [lang])

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms))
  }

  function clearLater() {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
    setCheering(false)
  }

  function say(message: string, options: { then?: () => void; lang?: Lang; as?: Character; mood?: Mood } = {}) {
    setText(message)
    speak(
      message,
      options.lang ?? live.current.lang,
      live.current.voiceOn,
      options.as ?? live.current.guide,
      {
        onStart: () => setTalking(true),
        onEnd: () => {
          setTalking(false)
          setPreviewId(null)
          options.then?.()
        },
      },
      options.mood,
    )
  }

  function hush() {
    clearLater()
    stopSpeaking()
    setTalking(false)
  }

  function showOnMap(point: Point, zoom?: number) {
    focusKey.current += 1
    setFocus({ point: { lng: point.lng, lat: point.lat }, zoom, key: focusKey.current })
  }

  function here(): Point {
    return live.current.user ?? walker.current.current
  }

  function upcoming(): Attraction | null {
    return live.current.route.find((stop) => !visitedRef.current.includes(stop.id)) ?? null
  }

  function routeComplete(stamps: number[]): boolean {
    const plan = live.current.route
    return plan.length > 0 && plan.every((stop) => stamps.includes(stop.id))
  }

  function continueTour(place: Attraction) {
    if (routeComplete(visitedRef.current) && live.current.route.some((stop) => stop.id === place.id)) {
      setAutoWalk(false)
      later(() => say(lines.routeDone(live.current.lang, visitedRef.current.length), { mood: 'celebrate' }), 700)
      return
    }
    if (!live.current.autoWalk) return
    const next = upcoming()
    if (next) {
      later(() => {
        setSelected(null)
        goTo(next)
      }, 1400)
    }
  }

  function checkpoint(place: Attraction) {
    clearLater()
    setTarget(null)
    setSelected(place)
    setDockOpen(true)
    if (visitedRef.current.includes(place.id)) {
      say(lines.aboutPlace(live.current.lang, place), { then: () => continueTour(place) })
      return
    }
    const before = { visited: visitedRef.current, routesDone: routesRef.current }
    const stamps = [...visitedRef.current, place.id]
    const finishes = routeComplete(stamps) && live.current.route.some((stop) => stop.id === place.id)
    const after = { visited: stamps, routesDone: routesRef.current + (finishes ? 1 : 0) }
    visitedRef.current = stamps
    routesRef.current = after.routesDone
    setVisited(stamps)
    setRoutesDone(after.routesDone)
    save('qui.visited', JSON.stringify(stamps))
    save('qui.routes', String(after.routesDone))

    const xpBefore = xpFor(before)
    const xpAfter = xpFor(after)
    const levelBefore = levelFor(xpBefore).level
    const levelAfter = levelFor(xpAfter).level
    const oldBadges = earnedBadges(before)
    const newBadges = earnedBadges(after).filter((id) => !oldBadges.includes(id))

    stopSpeaking()
    setTalking(false)
    chime('stamp')
    if (levelAfter > levelBefore) later(() => chime('levelup'), 700)
    else if (newBadges.length > 0) later(() => chime('badge'), 700)
    setCheering(true)
    setParty({ place, n: stamps.length, xpGain: xpAfter - xpBefore, levelUp: levelAfter > levelBefore ? levelAfter : null, badges: newBadges })

    const code = live.current.lang
    const words = msg(code)
    const extra = [
      levelAfter > levelBefore ? lines.levelUpLine(code, levelAfter, words.levels[levelAfter - 1]) : '',
      ...newBadges.map((id) => lines.badgeLine(code, words.badges[id].name)),
    ].filter(Boolean)
    later(
      () => {
        setCheering(false)
        say([lines.arrival(code, place, stamps.length), ...extra].join(' '), {
          mood: 'celebrate',
          then: () => continueTour(place),
        })
      },
      extra.length > 0 ? 2600 : 1700,
    )
  }

  function goTo(place: Attraction) {
    clearLater()
    const from = here()
    const meters = distanceMeters(from, place)
    const compass = compassIndex(bearingDeg(from, place))
    setTarget(place)
    showOnMap(place, place.reach >= 120 ? 14 : 16)
    walker.face(place)
    say(lines.nextStop(live.current.lang, place, meters, compass), { mood: 'point' })
    if (live.current.gps === 'on') return
    walker.walkTo(place, { onArrive: () => checkpoint(place) })
  }

  function stopGps(next: GpsState = 'off') {
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    watchId.current = null
    setUser(null)
    live.current.user = null
    setGps(next)
    live.current.gps = next
  }

  function startGps() {
    if (!('geolocation' in navigator)) {
      setGps('unavailable')
      say(lines.gpsLine(live.current.lang, 'unavailable'))
      return
    }
    clearLater()
    setAutoWalk(false)
    walker.stop()
    setGps('searching')
    live.current.gps = 'searching'
    say(lines.gpsLine(live.current.lang, 'searching'))
    if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current)
    let first = true
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const point = { lng: position.coords.longitude, lat: position.coords.latitude }
        if (first) {
          first = false
          if (!isInsideQuindio(point)) {
            stopGps('outside')
            say(lines.gpsLine(live.current.lang, 'outside'))
            return
          }
          setGps('on')
          live.current.gps = 'on'
          walker.walkTo(point, { speed: 80 })
          showOnMap(point, 13)
          say(lines.gpsLine(live.current.lang, 'on'), { mood: 'greet' })
        } else {
          walker.walkTo(point, { speed: 5 })
        }
        setUser(point)
        live.current.user = point
        const goal = live.current.target
        if (!goal) return
        const arrived = findArrival(point, position.coords.accuracy, visitedRef.current, [goal])
        if (arrived) checkpoint(arrived)
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          stopGps('denied')
          say(lines.gpsLine(live.current.lang, 'denied'))
          return
        }
        if (!first) return
        stopGps('unavailable')
        say(lines.gpsLine(live.current.lang, 'unavailable'))
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 },
    )
  }

  function onLanguage(next: string) {
    if (!isLang(next)) return
    const code = next
    save('pdc.lang', code)
    document.documentElement.lang = code
    document.documentElement.dir = languageInfo(code).dir ?? 'ltr'
    void i18n.changeLanguage(code)
    live.current.lang = code
    if (onboarding === null) say(i18n.getFixedT(code)('langChanged'), { lang: code, mood: 'greet' })
  }

  function selectPlace(place: Attraction) {
    clearLater()
    setAutoWalk(false)
    walker.stop()
    setSelected(place)
    setDockOpen(true)
    walker.face(place)
    showOnMap(place, place.reach >= 120 ? 14 : 16)
    chime('tap')
    say(lines.aboutPlace(live.current.lang, place))
    window.history.replaceState(null, '', placeHref(window.location.href, place.name.es))
  }

  function shareLink() {
    const href = selected
      ? placeHref(window.location.href, selected.name.es)
      : routeHref(window.location.href, base, tastes)
    window.history.replaceState(null, '', href)
    const write = navigator.clipboard?.writeText(href)
    if (!write) {
      say(i18n.t('shareFail'))
      return
    }
    void write.then(
      () => say(i18n.t('copied')),
      () => say(i18n.t('shareFail')),
    )
  }

  function finishOnboarding(id: CharacterId, likes: Taste[], home: string) {
    const chosen = findCharacter(id)
    const start = townPoint(home) ?? entrance
    const plan = buildRoute(likes, start)
    save('qui.guide', id)
    save('qui.tastes', JSON.stringify(likes))
    save('qui.base', home)
    setGuideId(id)
    setTastes(likes)
    setBase(home)
    setRoute(plan)
    live.current.route = plan
    live.current.guide = chosen
    setOnboarding(null)
    setSelected(null)
    setTarget(null)
    setDockOpen(true)
    const parts = [lines.greeting(live.current.lang, chosen)]
    if (likes.length > 0) parts.push(lines.routeSummary(live.current.lang, plan))
    parts.push(lines.startHint(live.current.lang, plan.length > 0))
    say(parts.join(' '), { as: chosen, mood: 'greet' })
    const first = plan[0]
    showOnMap(first ?? start, first && first.reach >= 120 ? 13 : 15)
  }

  function resetProgress() {
    hush()
    setVisited([])
    visitedRef.current = []
    setRoutesDone(0)
    routesRef.current = 0
    save('qui.visited', '[]')
    save('qui.routes', '0')
    setSheet(null)
  }

  function openSheet(next: SheetName) {
    chime('open')
    setSheet(next)
  }

  const closeCelebration = useCallback(() => setParty(null), [])
  const closeSheet = useCallback(() => setSheet(null), [])
  const updateDockHeight = useCallback((height: number) => setDockHeight(height), [])

  const remaining = route.filter((stop) => !visited.includes(stop.id))
  const next = remaining[0] ?? null
  const position = user ?? walker.pos
  const openedLink = useRef(false)
  useEffect(() => {
    if (onboarding !== null || openedLink.current) return
    openedLink.current = true
    const share = readShare(window.location.search)
    if (share.place) {
      const place = findNamed(share.place)
      if (place) selectPlace(place)
      return () => {
        openedLink.current = false
      }
    }
    if (!share.base && share.tastes.length === 0) {
      return () => {
        openedLink.current = false
      }
    }
    const home = share.base && municipalities.includes(share.base) ? share.base : base
    const likes = share.tastes.length > 0 ? share.tastes : tastes
    const start = townPoint(home) ?? entrance
    const plan = buildRoute(likes, start)
    if (share.base && municipalities.includes(share.base)) {
      setBase(home)
      save('qui.base', home)
    }
    if (share.tastes.length > 0) {
      setTastes(likes)
      save('qui.tastes', JSON.stringify(likes))
    }
    setRoute(plan)
    live.current.route = plan
    setSelected(null)
    setTarget(null)
    const first = plan[0]
    showOnMap(first ?? start, first && first.reach >= 120 ? 13 : 15)
    return () => {
      openedLink.current = false
    }
  }, [onboarding])
  const roadKey = target ? `go:${target.id}` : remaining.map((stop) => stop.id).join(',')
  const [road, setRoad] = useState<{ key: string; line: Point[] | null }>({ key: '', line: null })
  if (road.key !== roadKey) setRoad({ key: roadKey, line: null })
  useEffect(() => {
    if (!roadKey) return
    let live = true
    const points = target ? [here(), target] : remaining.length > 0 ? [here(), ...remaining] : []
    roadLine(points).then((line) => {
      if (live) setRoad({ key: roadKey, line })
    })
    return () => {
      live = false
    }
  }, [roadKey])
  const straight: Point[] = target ? [position, target] : remaining.length > 0 ? [position, ...remaining] : []
  const path = road.key === roadKey && road.line && road.line.length > 1 ? road.line : straight
  const routeDone = route.filter((stop) => visited.includes(stop.id)).length
  const mode = cheering ? 'cheer' : walker.walking ? 'walk' : 'idle'
  const progress = { visited, routesDone }
  const xp = xpFor(progress)
  const level = levelFor(xp)
  const badges = earnedBadges(progress)
  const heading = target ?? next
  const headingMeters = heading ? lines.formatDistance(lang, distanceMeters(position, heading)) : ''
  const essentialGot = essentials.filter((place) => visited.includes(place.id)).length
  const headingAngle = heading ? bearingDeg(position, heading) : 0

  return (
    <div className="app">
      <header className="topbar">
        <h1>{t('appName')}</h1>
        <button type="button" className="level-chip" onClick={() => openSheet('passport')} aria-label={`${t('passport')}: ${t('level', { n: level.level })}, ${t('xp', { n: xp })}`}>
          <span className="level-num">{level.level}</span>
          <span className="level-xp">
            <span className="level-title">{msg(lang).levels[level.level - 1]}</span>
            <span className="xp-bar" aria-hidden="true">
              <span style={{ width: `${Math.round(level.progress * 100)}%` }} />
            </span>
          </span>
        </button>
        <nav className="topbar-actions">
          <button type="button" className="top-btn" onClick={() => openSheet('places')} aria-label={t('places')} title={t('places')}>
            <List size={20} aria-hidden="true" />
          </button>
          <button type="button" className="top-btn" onClick={() => openSheet('passport')} aria-label={t('passport')} title={t('passport')}>
            <BookOpen size={20} aria-hidden="true" />
          </button>
          <button type="button" className="top-btn top-btn--lang" onClick={() => openSheet('language')} aria-label={t('language')} title={t('language')}>
            <Globe size={18} aria-hidden="true" />
            <span>{languageInfo(lang).short}</span>
          </button>
          <button type="button" className="top-btn" onClick={() => openSheet('settings')} aria-label={t('settings')} title={t('settings')}>
            <Settings size={20} aria-hidden="true" />
          </button>
        </nav>
      </header>
      <main className="map-frame" aria-label={t('map')}>
        <ParkMap
          lang={lang}
          loadingText={t('loading')}
          youText={t('you')}
          guide={guide}
          avatar={{ pos: walker.pos, mode, talking, facing: walker.facing }}
          user={user}
          path={path}
          route={route.map((stop) => stop.id)}
          visited={visited}
          nextId={next?.id ?? null}
          selectedId={selected?.id ?? null}
          focus={focus}
          bottomPadding={onboarding === null && dockOpen ? dockHeight : 40}
          onSelect={selectPlace}
        />

        <div className="hud">
          <button type="button" className="hud-chip" onClick={() => openSheet('passport')} aria-label={`${t('stamps')}: ${essentialGot}/${essentials.length}`}>
            <BadgeCheck size={18} aria-hidden="true" />
            {essentialGot}/{essentials.length}
          </button>
          {route.length > 0 && (
            <span className="hud-chip hud-chip--route">
              <RouteIcon size={18} aria-hidden="true" />
              {t('routeProgress', { done: routeDone, total: route.length })}
              <span className="hud-bar" aria-hidden="true">
                <span style={{ width: `${(routeDone / route.length) * 100}%` }} />
              </span>
            </span>
          )}
          {heading && !selected && onboarding === null && (
            <button type="button" className="hud-chip hud-chip--next" onClick={() => showOnMap(heading)}>
              <Navigation2 size={18} aria-hidden="true" style={{ transform: `rotate(${headingAngle}deg)` }} />
              <span className="hud-next-text">
                <small>{t('nextLabel')}</small>
                <strong>
                  {heading.id}. {heading.name[lang]}
                </strong>
              </span>
              <span className="hud-dist">{t('away', { m: headingMeters })}</span>
            </button>
          )}
        </div>

        {onboarding === null && (
          <GuideDock
            guide={guide}
            lang={lang}
            text={text}
            talking={talking}
            mode={mode}
            facing={walker.facing}
            open={dockOpen}
            selected={selected}
            selectedVisited={selected ? visited.includes(selected.id) : false}
            selectedInRoute={selected ? route.some((stop) => stop.id === selected.id) : false}
            routeDone={routeDone}
            routeTotal={route.length}
            gps={gps}
            voiceOn={voiceOn}
            autoWalk={autoWalk}
            onToggle={() => setDockOpen((open) => !open)}
            onNext={() => {
              const stop = upcoming()
              setSelected(null)
              if (stop) goTo(stop)
            }}
            onToggleWalk={() => {
              if (autoWalk) {
                setAutoWalk(false)
                live.current.autoWalk = false
                clearLater()
                walker.stop()
                return
              }
              setAutoWalk(true)
              live.current.autoWalk = true
              setSelected(null)
              const stop = upcoming()
              if (stop) goTo(stop)
            }}
            onWhere={() => {
              setSelected(null)
              const point = here()
              showOnMap(point)
              say(lines.whereAmI(live.current.lang, nearestPlaces(point, 3)), { mood: 'point' })
            }}
            onPark={() => {
              setSelected(null)
              say(lines.parkStory(live.current.lang), { mood: 'explain' })
            }}
            onCalendar={() => openSheet('calendar')}
            onShare={shareLink}
            onLocate={() => (gps === 'on' || gps === 'searching' ? stopGps() : startGps())}
            onRepeat={() => say(text)}
            onHush={hush}
            onToggleVoice={() => {
              const on = !voiceOn
              setVoiceOn(on)
              live.current.voiceOn = on
              save('pdc.voice', on ? 'on' : 'off')
              if (!on) {
                stopSpeaking()
                setTalking(false)
              }
            }}
            onNewRoute={() => setOnboarding(3)}
            onGoThere={() => {
              if (!selected) return
              const place = selected
              setSelected(null)
              goTo(place)
            }}
            onArrived={() => {
              if (!selected) return
              walker.teleport(selected)
              checkpoint(selected)
            }}
            onListen={() => selected && say(lines.aboutPlace(live.current.lang, selected))}
            onCloseSelected={() => setSelected(null)}
            onAsk={(question) => {
              const answer = answerQuestion(question, live.current.lang, here(), tastes)
              if (answer.place) {
                setSelected(answer.place)
                setDockOpen(true)
                showOnMap(answer.place, answer.place.reach >= 120 ? 14 : 16)
              }
              say(answer.text, { mood: 'explain' })
            }}
            onHeight={updateDockHeight}
          />
        )}
      </main>

      {onboarding !== null && (
        <Onboarding
          key={onboarding}
          lang={lang}
          startStep={onboarding}
          guideId={guideId ?? 'camila'}
          tastes={tastes}
          baseTown={base}
          talkingId={talking ? previewId : null}
          onLanguage={onLanguage}
          onPreview={(id) => {
            const who = findCharacter(id)
            setPreviewId(id)
            say(who.hello[live.current.lang], { as: who, mood: 'greet' })
          }}
          onDone={finishOnboarding}
        />
      )}

      {sheet === 'calendar' && <CalendarSheet lang={lang} onClose={closeSheet} />}

      {sheet === 'places' && (
        <PlacesSheet
          lang={lang}
          here={position}
          visited={visited}
          route={route.map((stop) => stop.id)}
          onPick={(place) => {
            setSheet(null)
            selectPlace(place)
          }}
          onClose={closeSheet}
        />
      )}

      {sheet === 'passport' && (
        <PassportSheet
          lang={lang}
          xp={xp}
          visited={visited}
          badges={badges}
          onPick={(place) => {
            setSheet(null)
            selectPlace(place)
          }}
          onClose={closeSheet}
        />
      )}

      {sheet === 'language' && (
        <Sheet title={t('language')} closeLabel={t('close')} onClose={closeSheet}>
          <div className="lang-grid lang-grid--sheet" role="radiogroup" aria-label={t('language')}>
            {languageList.map((item) => (
              <button
                key={item.code}
                type="button"
                role="radio"
                aria-checked={lang === item.code}
                className={`lang-option${lang === item.code ? ' is-on' : ''}`}
                onClick={() => {
                  onLanguage(item.code)
                  setSheet(null)
                }}
              >
                <span className="lang-code">{item.short}</span>
                {item.label}
              </button>
            ))}
          </div>
        </Sheet>
      )}

      {sheet === 'settings' && (
        <SettingsSheet
          lang={lang}
          voiceOn={voiceOn}
          speed={speed}
          voiceMissing={voiceOn && !hasVoice(lang)}
          onLanguage={onLanguage}
          onToggleVoice={() => {
            const on = !voiceOn
            setVoiceOn(on)
            live.current.voiceOn = on
            save('pdc.voice', on ? 'on' : 'off')
            if (!on) {
              stopSpeaking()
              setTalking(false)
            }
          }}
          onSpeed={(value) => {
            setSpeed(value)
            setRateScale(speedScale[value])
            save('pdc.speed', value)
            say(guide.hello[live.current.lang], { mood: 'greet' })
          }}
          onTestVoice={() => say(guide.hello[live.current.lang], { mood: 'greet' })}
          onChangeGuide={() => {
            setSheet(null)
            setOnboarding(2)
          }}
          onNewRoute={() => {
            setSheet(null)
            setOnboarding(3)
          }}
          onReset={resetProgress}
          onClose={closeSheet}
        />
      )}

      {party && (
        <Celebration
          place={party.place}
          number={party.n}
          guide={guide}
          lang={lang}
          xpGain={party.xpGain}
          levelUp={party.levelUp}
          badges={party.badges}
          onDone={closeCelebration}
        />
      )}
    </div>
  )
}
