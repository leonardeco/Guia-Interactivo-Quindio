import { useTranslation } from 'react-i18next'
import { Route, Trash2, UserRound, Volume2, VolumeX } from 'lucide-react'
import type { Lang } from '../data/attractions'
import { languageList } from '../i18n/languages'
import { Sheet } from './Sheet'

export type Speed = 'slow' | 'normal' | 'fast'
export const speedScale: Record<Speed, number> = { slow: 0.82, normal: 1, fast: 1.18 }

type Props = {
  lang: Lang
  voiceOn: boolean
  speed: Speed
  voiceMissing: boolean
  onLanguage: (lang: Lang) => void
  onToggleVoice: () => void
  onSpeed: (speed: Speed) => void
  onTestVoice: () => void
  onChangeGuide: () => void
  onNewRoute: () => void
  onReset: () => void
  onClose: () => void
}

export function SettingsSheet(props: Props) {
  const { t } = useTranslation()
  return (
    <Sheet title={t('settings')} closeLabel={t('close')} onClose={props.onClose}>
      <h3 className="sheet-sub">{t('language')}</h3>
      <div className="lang-grid lang-grid--sheet" role="radiogroup" aria-label={t('language')}>
        {languageList.map((item) => (
          <button
            key={item.code}
            type="button"
            role="radio"
            aria-checked={props.lang === item.code}
            className={`lang-option${props.lang === item.code ? ' is-on' : ''}`}
            onClick={() => props.onLanguage(item.code)}
          >
            <span className="lang-code">{item.short}</span>
            {item.label}
          </button>
        ))}
      </div>

      <h3 className="sheet-sub">{t('voiceSpeed')}</h3>
      <p className="notice">{t('voiceHint')}</p>
      {props.voiceMissing && <p className="notice">{t('noVoice')}</p>}
      <div className="segmented" role="radiogroup" aria-label={t('voiceSpeed')}>
        {(['slow', 'normal', 'fast'] as Speed[]).map((item) => (
          <button
            key={item}
            type="button"
            role="radio"
            aria-checked={props.speed === item}
            className={props.speed === item ? 'is-on' : ''}
            onClick={() => props.onSpeed(item)}
          >
            {t(`speeds.${item}`)}
          </button>
        ))}
      </div>
      <div className="settings-row">
        <button type="button" className="action" onClick={props.onToggleVoice} aria-pressed={!props.voiceOn}>
          {props.voiceOn ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
          {props.voiceOn ? t('mute') : t('unmute')}
        </button>
        <button type="button" className="action" onClick={props.onTestVoice}>
          <Volume2 size={20} aria-hidden="true" />
          {t('voiceTest')}
        </button>
      </div>

      <h3 className="sheet-sub">{t('menu')}</h3>
      <div className="settings-row">
        <button type="button" className="action" onClick={props.onChangeGuide}>
          <UserRound size={20} aria-hidden="true" />
          {t('changeGuide')}
        </button>
        <button type="button" className="action" onClick={props.onNewRoute}>
          <Route size={20} aria-hidden="true" />
          {t('newRoute')}
        </button>
        <button
          type="button"
          className="action action--danger"
          onClick={() => {
            if (window.confirm(t('resetConfirm'))) props.onReset()
          }}
        >
          <Trash2 size={20} aria-hidden="true" />
          {t('resetStamps')}
        </button>
      </div>
    </Sheet>
  )
}
