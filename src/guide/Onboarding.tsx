import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BedDouble, Binoculars, Coffee, Landmark, Moon, Trees, Users, Utensils, type LucideIcon } from 'lucide-react'
import { municipalities, type Lang, type Taste } from '../data/attractions'
import { Avatar } from './Avatar'
import { characters, type CharacterId } from './characters'
import { languageList } from '../i18n/languages'

const tasteIcons: Record<Taste, LucideIcon> = {
  towns: Landmark,
  stay: BedDouble,
  food: Utensils,
  nature: Trees,
  coffee: Coffee,
  nightlife: Moon,
  views: Binoculars,
  family: Users,
}

const tasteOrder: Taste[] = ['towns', 'nature', 'coffee', 'food', 'views', 'stay', 'nightlife', 'family']

type Props = {
  lang: Lang
  startStep: 1 | 2 | 3
  guideId: CharacterId
  tastes: Taste[]
  baseTown: string
  talkingId: CharacterId | null
  onLanguage: (lang: Lang) => void
  onPreview: (id: CharacterId) => void
  onDone: (guideId: CharacterId, tastes: Taste[], base: string) => void
}

export function Onboarding({ lang, startStep, guideId, tastes, baseTown, talkingId, onLanguage, onPreview, onDone }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<1 | 2 | 3>(startStep)
  const [picked, setPicked] = useState<CharacterId>(guideId)
  const [likes, setLikes] = useState<Taste[]>(tastes)
  const [home, setHome] = useState(municipalities.includes(baseTown) ? baseTown : 'Armenia')

  function toggle(taste: Taste) {
    setLikes((current) => (current.includes(taste) ? current.filter((item) => item !== taste) : [...current, taste]))
  }

  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <p className="onboarding-step">{t('step', { n: step })}</p>

        {step === 1 && (
          <>
            <h2 id="onboarding-title">{t('welcomeTitle')}</h2>
            <p className="onboarding-text">{t('welcomeText')}</p>
            <div className="onboarding-hero" aria-hidden="true">
              {characters.slice(0, 3).map((item, index) => (
                <Avatar key={item.id} character={item} mode="idle" facing={index === 2 ? 'left' : 'right'} size={110} detail={false} />
              ))}
            </div>
            <h3>{t('pickLanguage')}</h3>
            <div className="lang-grid" role="radiogroup" aria-label={t('pickLanguage')}>
              {languageList.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  role="radio"
                  aria-checked={lang === item.code}
                  className={`lang-option${lang === item.code ? ' is-on' : ''}`}
                  onClick={() => onLanguage(item.code)}
                >
                  <span className="lang-code">{item.short}</span>
                  {item.label}
                </button>
              ))}
            </div>
            <div className="onboarding-nav">
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                {t('continue')}
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 id="onboarding-title">{t('pickGuide')}</h2>
            <p className="onboarding-text">{t('tapToHear')}</p>
            <div className="guide-grid" role="radiogroup" aria-label={t('pickGuide')}>
              {characters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={picked === item.id}
                  className={`guide-option${picked === item.id ? ' is-on' : ''}`}
                  onClick={() => {
                    setPicked(item.id)
                    onPreview(item.id)
                  }}
                >
                  <span className="guide-stage">
                    <Avatar character={item} mode="idle" talking={talkingId === item.id} size={118} />
                  </span>
                  <span className="guide-name">{item.name}</span>
                  <span className="guide-role">{item.role[lang]}</span>
                </button>
              ))}
            </div>
            <div className="onboarding-nav">
              <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                {t('back')}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                {t('continue')}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 id="onboarding-title">{t('pickTastes')}</h2>
            <p className="onboarding-text">{t('tastesHint')}</p>
            <div className="taste-grid">
              {tasteOrder.map((taste) => {
                const Icon = tasteIcons[taste]
                const on = likes.includes(taste)
                return (
                  <button
                    key={taste}
                    type="button"
                    aria-pressed={on}
                    className={`taste-chip${on ? ' is-on' : ''}`}
                    onClick={() => toggle(taste)}
                  >
                    <Icon size={20} aria-hidden="true" />
                    {t(`tastes.${taste}`)}
                  </button>
                )
              })}
            </div>
            <h3>{t('base')}</h3>
            <p className="onboarding-text">{t('baseHint')}</p>
            <label className="search">
              <span className="sr-only">{t('base')}</span>
              <select value={home} onChange={(event) => setHome(event.target.value)} aria-label={t('base')}>
                {municipalities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <p className="onboarding-privacy">{t('privacy')}</p>
            <div className="onboarding-nav onboarding-nav--stack">
              <button
                type="button"
                className="btn btn-primary"
                disabled={likes.length === 0}
                onClick={() => onDone(picked, likes, home)}
              >
                {t('start')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => onDone(picked, [], home)}>
                {t('explore')}
              </button>
              <button type="button" className="btn btn-link" onClick={() => setStep(2)}>
                {t('back')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
