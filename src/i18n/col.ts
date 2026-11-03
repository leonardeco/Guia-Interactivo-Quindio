import { languageCodes, type Lang } from './languages'

/** One sentence per language, in the same order as `languageCodes`. */
export function col(parts: readonly string[]): Record<Lang, string> {
  if (parts.length !== languageCodes.length) {
    throw new Error(`Se esperaban ${languageCodes.length} idiomas y llegaron ${parts.length}`)
  }
  return Object.fromEntries(languageCodes.map((code, index) => [code, parts[index]])) as Record<Lang, string>
}
