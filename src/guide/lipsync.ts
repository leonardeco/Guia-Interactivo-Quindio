import type { Lang } from '../data/attractions'
import { isCjk } from '../i18n/languages'
import type { Mood } from './speech'

/** Mouth shapes: closed smile, pressed lips (m/b/p), wide open, half open, round, small round. */
export type Viseme = 'rest' | 'M' | 'A' | 'E' | 'O' | 'U'

export type Gesture = 'wave' | 'point' | 'explain' | 'open' | 'think' | 'celebrate'

const vowelShape: Record<string, Viseme> = {
  a: 'A', á: 'A', à: 'A', â: 'A', ä: 'A', ã: 'A',
  e: 'E', é: 'E', è: 'E', ê: 'E', ë: 'E', i: 'E', í: 'E', ì: 'E', î: 'E', ï: 'E', y: 'E',
  o: 'O', ó: 'O', ò: 'O', ô: 'O', ö: 'O', õ: 'O',
  u: 'U', ú: 'U', ù: 'U', û: 'U', ü: 'U', w: 'U',
  m: 'M', b: 'M', p: 'M',
}

const syllableShapes: Viseme[] = ['A', 'E', 'O', 'A', 'U', 'E', 'M', 'A']

/** Turns a word into the mouth shapes a speaker makes, one per vowel or lip consonant. */
export function visemesFor(word: string, lang: Lang): Viseme[] {
  const shapes: Viseme[] = []
  if (isCjk(lang) || lang === 'ko') {
    for (const char of word) {
      if (/[\p{L}\p{N}]/u.test(char)) shapes.push(syllableShapes[char.codePointAt(0)! % syllableShapes.length])
    }
  } else {
    for (const char of word.toLowerCase()) {
      const shape = vowelShape[char]
      if (shape && shape !== shapes[shapes.length - 1]) shapes.push(shape)
    }
  }
  return shapes.length > 0 || !/[\p{L}\p{N}]/u.test(word) ? shapes : ['E']
}

export type Frame = { shape: Viseme; ms: number }

/** Mouth timeline for a whole sentence, used when the voice does not report word boundaries. */
export function sentenceFrames(text: string, lang: Lang, rate: number): Frame[] {
  const step = 105 / Math.max(0.5, rate)
  const frames: Frame[] = []
  const pieces = isCjk(lang) ? Array.from(text) : text.split(/(\s+|[,;:、，])/)
  for (const piece of pieces) {
    if (!piece.trim()) continue
    if (/^[,;:、，。.!?！？]$/.test(piece)) {
      frames.push({ shape: 'rest', ms: step * 2.2 })
      continue
    }
    for (const shape of visemesFor(piece, lang)) frames.push({ shape, ms: step * (shape === 'M' ? 0.7 : 1) })
    if (!isCjk(lang)) frames.push({ shape: 'M', ms: step * 0.45 })
  }
  return frames
}

export function wordFrames(word: string, lang: Lang, rate: number): Frame[] {
  const step = 95 / Math.max(0.5, rate)
  return [...visemesFor(word, lang).map((shape) => ({ shape, ms: step })), { shape: 'M' as Viseme, ms: step * 0.5 }]
}

const rotation: Gesture[] = ['explain', 'open', 'explain', 'point', 'think', 'explain', 'open']

/** Chooses hand movements so each sentence looks a bit different, starting with the one that fits the moment. */
export function gestureFor(text: string, index: number, mood?: Mood): Gesture {
  if (index === 0 && mood === 'greet') return 'wave'
  if (index === 0 && mood === 'point') return 'point'
  if (index === 0 && mood === 'celebrate') return 'celebrate'
  if (/[?？]\s*$/.test(text)) return 'think'
  if (/[!！]\s*$/.test(text) && index > 0) return 'open'
  let hash = 0
  for (const char of text) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0
  return rotation[(hash + index) % rotation.length]
}
