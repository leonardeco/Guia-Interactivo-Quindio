import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { isLang, type Lang } from './languages'
import { messages, resources } from './resources'

export type { Lang }

function store(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function detected(): Lang {
  const wanted = typeof navigator === 'undefined' ? [] : (navigator.languages ?? [navigator.language])
  for (const tag of wanted) {
    const code = tag?.toLowerCase().split(/[-_]/)[0]
    if (isLang(code)) return code
  }
  return 'es'
}

/** Stored choice first, then the phone's own language, then Spanish. */
export function readLang(): Lang {
  const stored = store()?.getItem('pdc.lang')
  if (isLang(stored)) return stored
  const guess = stored ? 'es' : detected()
  store()?.setItem('pdc.lang', guess)
  return guess
}

export function msg(lang: Lang) {
  return messages[lang]
}

void i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
  showSupportNotice: false,
})

export default i18n
