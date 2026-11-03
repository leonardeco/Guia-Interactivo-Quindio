import { useTranslation } from 'react-i18next'
import { fiestaText, fiestaTowns } from '../data/visit'
import type { Lang } from '../i18n/languages'
import { Sheet } from './Sheet'

type Props = {
  lang: Lang
  onClose: () => void
}

export function CalendarSheet({ lang, onClose }: Props) {
  const { t } = useTranslation()
  return (
    <Sheet title={t('calendar')} closeLabel={t('close')} onClose={onClose}>
      <p className="sheet-note">{t('calendarNote')}</p>
      <ul className="calendar-list">
        {fiestaTowns.map((town) => (
          <li key={town}>
            <strong>{town}</strong>
            <p>{fiestaText(town, lang)}</p>
          </li>
        ))}
      </ul>
    </Sheet>
  )
}
