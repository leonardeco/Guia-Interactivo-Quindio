export const languageCodes = [
  'es', 'en', 'pt', 'fr', 'de', 'it', 'nl', 'ca', 'sv', 'da', 'nb',
  'pl', 'cs', 'ro', 'hu', 'el', 'tr', 'ru', 'uk', 'ar', 'hi', 'id', 'zh', 'ja', 'ko',
] as const

export type Lang = (typeof languageCodes)[number]

export type LanguageInfo = {
  code: Lang
  label: string
  short: string
  locales: string[]
  mapField: string
  dir?: 'rtl'
}

export const languageList: LanguageInfo[] = [
  { code: 'es', label: 'Español', short: 'ES', locales: ['es-CO', 'es-US', 'es-MX', 'es-419', 'es-ES', 'es'], mapField: 'name:es' },
  { code: 'en', label: 'English', short: 'EN', locales: ['en-US', 'en-GB', 'en-AU', 'en-CA', 'en'], mapField: 'name:en' },
  { code: 'pt', label: 'Português', short: 'PT', locales: ['pt-BR', 'pt-PT', 'pt'], mapField: 'name:pt' },
  { code: 'fr', label: 'Français', short: 'FR', locales: ['fr-FR', 'fr-CA', 'fr-BE', 'fr-CH', 'fr'], mapField: 'name:fr' },
  { code: 'de', label: 'Deutsch', short: 'DE', locales: ['de-DE', 'de-AT', 'de-CH', 'de'], mapField: 'name:de' },
  { code: 'it', label: 'Italiano', short: 'IT', locales: ['it-IT', 'it-CH', 'it'], mapField: 'name:it' },
  { code: 'nl', label: 'Nederlands', short: 'NL', locales: ['nl-NL', 'nl-BE', 'nl'], mapField: 'name:nl' },
  { code: 'ca', label: 'Català', short: 'CA', locales: ['ca-ES', 'ca'], mapField: 'name:ca' },
  { code: 'sv', label: 'Svenska', short: 'SV', locales: ['sv-SE', 'sv'], mapField: 'name:sv' },
  { code: 'da', label: 'Dansk', short: 'DA', locales: ['da-DK', 'da'], mapField: 'name:da' },
  { code: 'nb', label: 'Norsk', short: 'NO', locales: ['nb-NO', 'no-NO', 'nb', 'no'], mapField: 'name:nb' },
  { code: 'pl', label: 'Polski', short: 'PL', locales: ['pl-PL', 'pl'], mapField: 'name:pl' },
  { code: 'cs', label: 'Čeština', short: 'CS', locales: ['cs-CZ', 'cs'], mapField: 'name:cs' },
  { code: 'ro', label: 'Română', short: 'RO', locales: ['ro-RO', 'ro'], mapField: 'name:ro' },
  { code: 'hu', label: 'Magyar', short: 'HU', locales: ['hu-HU', 'hu'], mapField: 'name:hu' },
  { code: 'el', label: 'Ελληνικά', short: 'EL', locales: ['el-GR', 'el'], mapField: 'name:el' },
  { code: 'tr', label: 'Türkçe', short: 'TR', locales: ['tr-TR', 'tr'], mapField: 'name:tr' },
  { code: 'ru', label: 'Русский', short: 'RU', locales: ['ru-RU', 'ru'], mapField: 'name:ru' },
  { code: 'uk', label: 'Українська', short: 'UK', locales: ['uk-UA', 'uk'], mapField: 'name:uk' },
  { code: 'ar', label: 'العربية', short: 'AR', locales: ['ar-SA', 'ar-EG', 'ar'], mapField: 'name:ar', dir: 'rtl' },
  { code: 'hi', label: 'हिन्दी', short: 'HI', locales: ['hi-IN', 'hi'], mapField: 'name:hi' },
  { code: 'id', label: 'Indonesia', short: 'ID', locales: ['id-ID', 'id'], mapField: 'name:id' },
  { code: 'zh', label: '中文', short: '中', locales: ['zh-CN', 'cmn-CN', 'zh-SG', 'zh-TW', 'zh-HK', 'zh'], mapField: 'name:zh' },
  { code: 'ja', label: '日本語', short: '日', locales: ['ja-JP', 'ja'], mapField: 'name:ja' },
  { code: 'ko', label: '한국어', short: '한', locales: ['ko-KR', 'ko'], mapField: 'name:ko' },
]

const alias: Record<string, Lang> = { no: 'nb', nn: 'nb', cmn: 'zh', in: 'id' }

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (languageCodes as readonly string[]).includes(value)
}

export function toLang(value: string | null | undefined): Lang {
  if (!value) return 'es'
  const code = value.toLowerCase().split(/[-_]/)[0]
  if (isLang(code)) return code
  return alias[code] ?? 'es'
}

export function languageInfo(code: Lang): LanguageInfo {
  return languageList.find((item) => item.code === code) ?? languageList[0]
}

/** Languages written without spaces between words. */
export function isCjk(code: Lang): boolean {
  return code === 'zh' || code === 'ja'
}
