import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Award, Lock } from 'lucide-react'
import { essentials, zoneColor, type Attraction, type Lang } from '../data/attractions'
import { badgeOrder, levelFor, type BadgeId } from '../game/progress'
import { msg } from '../i18n'
import { Sheet } from './Sheet'

type Props = {
  lang: Lang
  xp: number
  visited: number[]
  badges: BadgeId[]
  onPick: (place: Attraction) => void
  onClose: () => void
}

export function PassportSheet({ lang, xp, visited, badges, onPick, onClose }: Props) {
  const { t } = useTranslation()
  const level = levelFor(xp)
  const words = msg(lang)

  return (
    <Sheet title={t('passport')} closeLabel={t('close')} onClose={onClose} wide>
      <section className="passport-card">
        <div className="level-medal" aria-hidden="true">
          {level.level}
        </div>
        <div className="passport-level">
          <strong>{words.levels[level.level - 1]}</strong>
          <span>
            {t('level', { n: level.level })} · {t('xp', { n: xp })}
          </span>
          <span className="xp-bar" aria-hidden="true">
            <span style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </span>
          <small>{level.ceiling === null ? t('maxLevel') : t('xpToNext', { n: level.ceiling - xp, level: level.level + 1 })}</small>
        </div>
      </section>

      <h3 className="sheet-sub">{t('badgesTitle')}</h3>
      <ul className="badge-grid">
        {badgeOrder.map((id) => {
          const got = badges.includes(id)
          return (
            <li key={id} className={`badge${got ? ' is-got' : ''}`}>
              <span className="badge-icon" aria-hidden="true">
                {got ? <Award size={26} /> : <Lock size={20} />}
              </span>
              <strong>{words.badges[id].name}</strong>
              <small>{words.badges[id].desc}</small>
            </li>
          )
        })}
      </ul>

      <h3 className="sheet-sub">
        {t('stamps')} · {essentials.filter((place) => visited.includes(place.id)).length}/{essentials.length}
      </h3>
      <ul className="stamp-grid">
        {essentials.map((place) => {
          const got = visited.includes(place.id)
          return (
            <li key={place.id}>
              <button
                type="button"
                className={`stamp-cell${got ? ' is-got' : ''}`}
                style={{ '--zone': zoneColor[place.zone] } as CSSProperties}
                onClick={() => onPick(place)}
                aria-label={`${place.id}. ${place.name[lang]}${got ? ` · ${t('visited')}` : ''}`}
              >
                <span>{place.id}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
