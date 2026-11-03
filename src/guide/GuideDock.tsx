import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Flag,
  Footprints,
  Info,
  Landmark,
  LocateFixed,
  MapPin,
  Mic,
  Navigation,
  Pause,
  RotateCcw,
  Route,
  Share2,
  Square,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { zoneColor, type Attraction, type Lang } from '../data/attractions'
import { fiestaText, placePhoto } from '../data/visit'
import { isCjk, languageInfo } from '../i18n/languages'
import { zoneIcon } from '../ui/ZoneIcon'
import { Avatar, type AvatarMode } from './Avatar'
import type { Character } from './characters'
import { chime } from './speech'
import { skyNow } from './weather'
import { canListen, listenOnce } from './listen'

export type GpsState = 'off' | 'searching' | 'on' | 'denied' | 'outside' | 'unavailable'

type Props = {
  guide: Character
  lang: Lang
  text: string
  talking: boolean
  mode: AvatarMode
  facing: 'left' | 'right'
  open: boolean
  selected: Attraction | null
  selectedVisited: boolean
  selectedInRoute: boolean
  routeDone: number
  routeTotal: number
  gps: GpsState
  voiceOn: boolean
  autoWalk: boolean
  onToggle: () => void
  onNext: () => void
  onToggleWalk: () => void
  onWhere: () => void
  onPark: () => void
  onLocate: () => void
  onRepeat: () => void
  onHush: () => void
  onToggleVoice: () => void
  onNewRoute: () => void
  onGoThere: () => void
  onArrived: () => void
  onListen: () => void
  onCloseSelected: () => void
  onAsk: (question: string) => void
  onCalendar: () => void
  onShare: () => void
  onHeight: (height: number) => void
}

function useTyped(text: string, lang: Lang, blip: (() => void) | null, take: number) {
  const [count, setCount] = useState(0)
  const [full, setFull] = useState(false)
  const blipRef = useRef(blip)
  blipRef.current = blip
  useEffect(() => {
    setCount(0)
    setFull(false)
    if (!text) return
    const perSecond = isCjk(lang) || lang === 'ko' ? 22 : 48
    const began = performance.now()
    let last = 0
    const timer = window.setInterval(() => {
      const next = Math.min(text.length, Math.floor(((performance.now() - began) / 1000) * perSecond))
      if (next - last >= 3) {
        last = next
        blipRef.current?.()
      }
      setCount(next)
      if (next >= text.length) window.clearInterval(timer)
    }, 30)
    return () => window.clearInterval(timer)
  }, [text, lang, take])
  const done = full || count >= text.length
  return { shown: done ? text : text.slice(0, count), done, finish: () => setFull(true) }
}

export function GuideDock(props: Props) {
  const { t } = useTranslation()
  const { guide, lang, text, selected } = props
  const [question, setQuestion] = useState('')
  const [take, setTake] = useState(0)
  const [hearing, setHearing] = useState(false)
  const hearingRef = useRef(false)
  const dockRef = useRef<HTMLElement>(null)
  const stopListen = useRef<(() => void) | null>(null)
  const listenSession = useRef(0)
  const blip = !props.voiceOn && props.talking ? () => chime('blip', guide.pitch) : null
  const typed = useTyped(text, lang, blip, take)
  const photo = selected ? placePhoto(selected.name.es) : null
  const fiesta = selected?.zone === 'town' ? fiestaText(selected.town, lang) : null
  const [sky, setSky] = useState('')
  useEffect(() => {
    if (!selected) {
      setSky('')
      return
    }
    setSky('')
    let live = true
    skyNow(selected.lat, selected.lng).then((next) => {
      if (!live || !next) return
      setSky(`${next.temp} °C · ${t(next.rain ? 'rain' : 'clear')}`)
    })
    return () => {
      live = false
    }
  }, [selected, t])
  const hasRoute = props.routeTotal > 0
  const routeFinished = hasRoute && props.routeDone >= props.routeTotal
  const gpsLabel = props.gps === 'on' ? t('gpsOn') : props.gps === 'searching' ? t('locating') : t('locate')
  const { onHeight } = props

  useEffect(() => {
    const dock = dockRef.current
    if (!dock) return
    const report = () => onHeight(dock.offsetHeight)
    report()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(report)
    observer.observe(dock)
    return () => observer.disconnect()
  }, [onHeight])

  useEffect(() => () => stopListen.current?.(), [])

  function talkToGuide() {
    if (hearingRef.current) {
      listenSession.current += 1
      stopListen.current?.()
      hearingRef.current = false
      setHearing(false)
      return
    }
    const mine = (listenSession.current += 1)
    props.onHush()
    hearingRef.current = true
    setHearing(true)
    stopListen.current = listenOnce(
      languageInfo(lang).locales[0],
      (said) => {
        if (listenSession.current !== mine) return
        setQuestion('')
        props.onAsk(said)
      },
      () => {
        if (listenSession.current !== mine) return
        hearingRef.current = false
        setHearing(false)
      },
    )
  }

  const ZoneIcon = selected ? zoneIcon[selected.zone] : null

  return (
    <section ref={dockRef} className={`dock${props.open ? '' : ' dock--closed'}${selected && props.open ? ' dock--card' : ''}`} aria-label={guide.name}>
      <button
        type="button"
        className="dock-handle"
        onClick={props.onToggle}
        aria-expanded={props.open}
        aria-label={props.open ? t('hideGuide') : t('showGuide')}
      >
        {props.open ? <ChevronDown size={22} aria-hidden="true" /> : <ChevronUp size={22} aria-hidden="true" />}
      </button>

      {selected && props.open && ZoneIcon && (
        <header className="place-card" style={{ '--zone': zoneColor[selected.zone] } as CSSProperties}>
          <span className="place-token place-token--big">{selected.id}</span>
          <div className="place-card-text">
            <h2>{selected.name[lang]}</h2>
            <p className="chips">
              <span className="chip chip--zone">
                <ZoneIcon size={14} aria-hidden="true" />
                {t(`zones.${selected.zone}`)}
              </span>
              <span className="chip">{selected.town}</span>
              {props.selectedInRoute && !props.selectedVisited && (
                <span className="chip chip--route">
                  <Route size={14} aria-hidden="true" />
                  {t('inRoute')}
                </span>
              )}
              {props.selectedVisited && (
                <span className="chip chip--done">
                  <BadgeCheck size={14} aria-hidden="true" />
                  {t('visited')}
                </span>
              )}
            </p>
            {photo && (
              <figure className="place-photo">
                <img src={photo.src} alt="" />
                <figcaption>{photo.credit}</figcaption>
              </figure>
            )}
            {sky && <p className="place-sky">{sky} · Open-Meteo</p>}
            {fiesta && <p className="place-fiesta">{fiesta}</p>}
            <p className="place-links">
              <a href="https://paisajeculturalcafetero.org.co/municipios-en-quindio/" target="_blank" rel="noreferrer">
                paisajeculturalcafetero.org.co
              </a>
              <a href="https://www.quindiocorazondecolombia.com/" target="_blank" rel="noreferrer">
                quindiocorazondecolombia.com
              </a>
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={props.onCloseSelected} aria-label={t('close')}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>
      )}

      <div className="dock-main">
        <div className="dock-avatar">
          <div className="portrait-glow" aria-hidden="true" />
          <Avatar character={guide} mode={props.mode} talking={props.talking} facing={props.facing} size={150} />
        </div>

        <div className="dock-talk">
          <p className="nameplate">
            {guide.name}
            <small>{guide.role[lang]}</small>
          </p>
          <div
            className={`bubble${props.talking ? ' bubble--talking' : ''}`}
            onClick={typed.finish}
            role="presentation"
          >
            <p aria-hidden="true">
              {typed.shown}
              {!typed.done && <span className="caret" />}
            </p>
            {typed.done && !props.talking && <span className="bubble-more" aria-hidden="true" />}
            <p className="sr-only" aria-live="polite">
              {text}
            </p>
          </div>
        </div>
      </div>

      {props.open && (
        <form
          className="ask-row"
          onSubmit={(event) => {
            event.preventDefault()
            const value = question.trim()
            if (!value) return
            setQuestion('')
            props.onAsk(value)
          }}
        >
          <label className="sr-only" htmlFor="guide-ask">
            {t('ask')}
          </label>
          <input
            id="guide-ask"
            value={question}
            placeholder={hearing ? t('listening') : t('askPlaceholder')}
            aria-label={t('ask')}
            onChange={(event) => setQuestion(event.target.value)}
          />
          {canListen() && (
            <button
              type="button"
              className={`btn ask-mic${hearing ? ' is-on' : ''}`}
              aria-pressed={hearing}
              aria-label={hearing ? t('listening') : t('mic')}
              onClick={talkToGuide}
            >
              <Mic size={18} aria-hidden="true" />
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {t('askSend')}
          </button>
        </form>
      )}

      <div className="dock-actions">
        <div className="dock-primary">
          {selected ? (
            <>
              <button type="button" className="action action--primary" onClick={props.onGoThere}>
                <Navigation size={20} aria-hidden="true" />
                {t('goThere')}
              </button>
              <button type="button" className="action action--secondary" onClick={props.onArrived}>
                <Flag size={20} aria-hidden="true" />
                {t('arrived')}
              </button>
              <button type="button" className="action" onClick={props.onListen}>
                <Info size={20} aria-hidden="true" />
                {t('listen')}
              </button>
            </>
          ) : hasRoute && !routeFinished ? (
            <>
              <button type="button" className="action action--primary" onClick={props.onNext}>
                <Footprints size={20} aria-hidden="true" />
                {t('next')}
              </button>
              <button type="button" className={`action action--secondary${props.autoWalk ? ' is-on' : ''}`} onClick={props.onToggleWalk}>
                {props.autoWalk ? <Pause size={20} aria-hidden="true" /> : <Route size={20} aria-hidden="true" />}
                {props.autoWalk ? t('pause') : t('walk')}
              </button>
            </>
          ) : (
            <button type="button" className="action action--primary" onClick={props.onNewRoute}>
              <Route size={20} aria-hidden="true" />
              {t('newRoute')}
            </button>
          )}
          <button
            type="button"
            className={`action${props.gps === 'on' ? ' is-on' : ''}${props.gps === 'searching' ? ' is-busy' : ''}`}
            onClick={props.onLocate}
            aria-pressed={props.gps === 'on' || props.gps === 'searching'}
          >
            <LocateFixed size={20} aria-hidden="true" />
            {gpsLabel}
          </button>
        </div>
        <div className="dock-tools">
          <button type="button" className="tool" onClick={props.onWhere} aria-label={t('where')} title={t('where')}>
            <MapPin size={20} aria-hidden="true" />
            <span>{t('where')}</span>
          </button>
          <button type="button" className="tool" onClick={props.onPark} aria-label={t('park')} title={t('park')}>
            <Landmark size={20} aria-hidden="true" />
            <span>{t('park')}</span>
          </button>
          <button type="button" className="tool" onClick={props.onCalendar} aria-label={t('calendar')} title={t('calendar')}>
            <CalendarDays size={20} aria-hidden="true" />
            <span>{t('calendar')}</span>
          </button>
          <button type="button" className="tool" onClick={props.onShare} aria-label={t('share')} title={t('share')}>
            <Share2 size={20} aria-hidden="true" />
            <span>{t('share')}</span>
          </button>
          {props.talking ? (
            <button type="button" className="tool" onClick={props.onHush} aria-label={t('stop')} title={t('stop')}>
              <Square size={18} aria-hidden="true" />
              <span>{t('stop')}</span>
            </button>
          ) : (
            <button
              type="button"
              className="tool"
              onClick={() => {
                setTake((n) => n + 1)
                props.onRepeat()
              }}
              aria-label={t('repeat')}
              title={t('repeat')}
            >
              <RotateCcw size={20} aria-hidden="true" />
              <span>{t('repeat')}</span>
            </button>
          )}
          <button
            type="button"
            className="tool"
            onClick={props.onToggleVoice}
            aria-pressed={!props.voiceOn}
            aria-label={props.voiceOn ? t('mute') : t('unmute')}
            title={props.voiceOn ? t('mute') : t('unmute')}
          >
            {props.voiceOn ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
            <span>{props.voiceOn ? t('mute') : t('unmute')}</span>
          </button>
        </div>
      </div>
    </section>
  )
}
