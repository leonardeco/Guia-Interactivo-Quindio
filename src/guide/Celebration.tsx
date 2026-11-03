import { useEffect, useMemo, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Award, BadgeCheck, Star } from 'lucide-react'
import { zoneColor, type Attraction, type Lang } from '../data/attractions'
import type { BadgeId } from '../game/progress'
import { msg } from '../i18n'
import { Avatar } from './Avatar'
import type { Character } from './characters'

type Props = {
  place: Attraction
  number: number
  guide: Character
  lang: Lang
  xpGain: number
  levelUp: number | null
  badges: BadgeId[]
  legendName?: string
  onDone: () => void
}

const colors = ['#0e6b56', '#c45c32', '#e0b03a', '#1c7c8c', '#f7fbf8', '#1d4f91', '#6d3d98']

export function Celebration({ place, number, guide, lang, xpGain, levelUp, badges, legendName, onDone }: Props) {
  const { t } = useTranslation()
  const words = msg(lang)
  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 7) * 0.08}s`,
        color: colors[i % colors.length],
        spin: `${(i % 2 === 0 ? 1 : -1) * (240 + (i % 5) * 60)}deg`,
        drift: `${((i % 9) - 4) * 16}px`,
        round: i % 3 === 0,
      })),
    [],
  )
  const long = levelUp !== null || badges.length > 0

  useEffect(() => {
    const timer = window.setTimeout(onDone, long ? 4200 : 2800)
    return () => window.clearTimeout(timer)
  }, [onDone, long])

  return (
    <div className="celebration" role="status" onClick={onDone}>
      <div className="rays" aria-hidden="true" />
      <div className="confetti" aria-hidden="true">
        {pieces.map((piece, i) => (
          <span
            key={i}
            style={
              {
                left: piece.left,
                background: piece.color,
                borderRadius: piece.round ? '999px' : '2px',
                animationDelay: piece.delay,
                '--spin': piece.spin,
                '--drift': piece.drift,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="celebration-card">
        <div className="celebration-avatar" aria-hidden="true">
          <Avatar character={guide} mode="cheer" size={150} />
        </div>
        <div className="stamp">
          <BadgeCheck size={30} aria-hidden="true" />
          <span>{t('checkpoint', { n: number })}</span>
        </div>
        <p className="celebration-place">
          <span className="place-token" style={{ background: zoneColor[place.zone] }}>
            {place.id}
          </span>
          {place.name[lang]}
        </p>
        <p className="xp-gain">
          <Star size={18} aria-hidden="true" /> +{t('xp', { n: xpGain })}
        </p>
        {levelUp !== null && (
          <p className="level-banner">
            <span>{t('levelUp')}</span>
            <strong>
              {t('level', { n: levelUp })} · {words.levels[levelUp - 1]}
            </strong>
          </p>
        )}
        {badges.map((id) => (
          <p key={id} className="badge-banner">
            <Award size={22} aria-hidden="true" />
            <span>
              {t('badgeUnlocked')} <strong>{id === 'legend' && legendName ? legendName : words.badges[id].name}</strong>
            </span>
          </p>
        ))}
      </div>
    </div>
  )
}
