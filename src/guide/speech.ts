import type { Lang } from '../data/attractions'
import { isCjk, languageInfo } from '../i18n/languages'

export type VoiceHint = { gender: 'female' | 'male'; variant: number }
export type VoiceGender = 'female' | 'male'
export type Mood = 'greet' | 'point' | 'explain' | 'celebrate'

type Handlers = {
  onStart?: () => void
  onEnd?: () => void
}

/** What the avatars listen to so their mouth and hands follow the voice. */
export type SpeechEvent =
  | { type: 'sentence'; text: string; index: number; rate: number; mood?: Mood; lang: Lang }
  | { type: 'word'; text: string; rate: number; lang: Lang }
  | { type: 'end' }

type Listener = (event: SpeechEvent) => void

const listeners = new Set<Listener>()

export function subscribeSpeech(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit(event: SpeechEvent) {
  listeners.forEach((listener) => listener(event))
}

let fallbackTimer: number | undefined
let startTimer: number | undefined
let keepAlive: number | undefined
let session = 0
/** Chrome can garbage-collect an utterance mid-sentence and never fire `end`; holding it prevents that. */
let alive: SpeechSynthesisUtterance[] = []
let rateScale = 1

export function setRateScale(scale: number) {
  rateScale = Math.min(1.4, Math.max(0.6, scale))
}

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}

export function quality(voice: { name: string; localService?: boolean }): number {
  const name = voice.name.toLowerCase()
  if (/espeak|compact|eloquence|robot/.test(name)) return -1
  if (/natural|neural|wavenet|premium|enhanced|mejorad|siri/.test(name)) return 4
  if (name.includes('online')) return 3
  if (name.includes('google')) return 2
  return voice.localService ? 0 : 1
}

const femaleTokens = new Set([
  // es / pt / fr / en
  'sabina', 'helena', 'laura', 'elvira', 'dalia', 'paloma', 'salome', 'ximena', 'paulina', 'monica', 'mónica',
  'francisca', 'thalita', 'maria', 'maría', 'raquel', 'vitoria', 'vitória', 'julie', 'hortense', 'denise',
  'amelie', 'amélie', 'sylvie', 'zira', 'jenny', 'aria', 'susan', 'hazel', 'samantha', 'karen', 'moira', 'tessa',
  'fiona', 'victoria', 'allison', 'ava', 'emma', 'michelle', 'libby', 'sonia', 'natasha', 'clara', 'elena', 'lucia',
  'lucía', 'marisol', 'esperanza', 'camila', 'luciana', 'joana', 'fernanda', 'francisca', 'leila', 'audrey',
  'aurelie', 'aurélie', 'marie', 'chantal', 'brigitte', 'eloise', 'éloïse', 'female', 'mujer', 'femme', 'weiblich',
  // de / it
  'katja', 'hedda', 'anna', 'petra', 'amala', 'seraphina', 'louisa', 'ingrid', 'gisela', 'marlene', 'elsa',
  'isabella', 'alice', 'federica', 'paola', 'cosima', 'palmira', 'carla', 'giulia', 'fiamma', 'donna',
  // zh / ja / ko
  'xiaoxiao', 'xiaoyi', 'huihui', 'yaoyao', 'tingting', 'meijia', 'sinji', 'lili', 'xiaochen', 'xiaohan', 'hiumaan',
  'hsiaochen', 'hanhan', 'nanami', 'haruka', 'ayumi', 'sayaka', 'kyoko', 'mizuki', 'aoi', 'mayu', 'shiori', 'o-ren',
  'sunhi', 'sun-hi', 'heami', 'yuna', 'jimin', 'seoyeon', 'sora', 'yujin',
])
const maleTokens = new Set([
  'raul', 'raúl', 'pablo', 'jorge', 'juan', 'diego', 'alvaro', 'álvaro', 'gonzalo', 'antonio', 'duarte',
  'enrique', 'lorenzo', 'andres', 'andrés', 'alonso', 'carlos', 'manuel', 'tomas', 'tomás', 'henri', 'paul',
  'claude', 'thomas', 'daniel', 'david', 'mark', 'guy', 'george', 'ryan', 'alex', 'fred', 'oliver', 'arthur',
  'gonzalo', 'jorge', 'felipe', 'reed', 'eddy', 'rocko', 'grandpa', 'ralph', 'christopher', 'eric', 'roger',
  'brian', 'william', 'liam', 'jacques', 'jean', 'remy', 'rémy', 'antoine', 'male', 'hombre', 'homme', 'männlich',
  // de / it
  'stefan', 'conrad', 'markus', 'yannick', 'killian', 'florian', 'christoph', 'ralf', 'bernd', 'cosimo', 'luca',
  'diego', 'giuseppe', 'benigno', 'calimero', 'rinaldo', 'gianni', 'marcello',
  // zh / ja / ko
  'kangkang', 'yunyang', 'yunxi', 'yunjian', 'yunhao', 'yunze', 'wanlung', 'danny', 'ichiro', 'keita', 'otoya',
  'hattori', 'naoki', 'daichi', 'injoon', 'bongjin', 'gookmin', 'hyunsu', 'minsu',
])

function tokens(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[^a-záéíóúñüäöàèìòùâêîôûçãõ-]+/)
    .flatMap((part) => [part, ...part.split('-')])
    .filter(Boolean)
}

export function genderOf(name: string): VoiceGender | null {
  const parts = tokens(name)
  if (parts.some((part) => ['female', 'mujer', 'femme', 'weiblich'].includes(part))) return 'female'
  if (parts.some((part) => ['male', 'hombre', 'homme', 'männlich'].includes(part))) return 'male'
  if (parts.some((part) => maleTokens.has(part))) return 'male'
  if (parts.some((part) => femaleTokens.has(part))) return 'female'
  return null
}

export function assumedGender(voice: { name: string; lang: string }): VoiceGender | null {
  const named = genderOf(voice.name)
  if (named) return named
  const name = voice.name.toLowerCase()
  const lang = voice.lang.toLowerCase()
  // Chrome's single "Google <language>" voices are female in every language this app speaks.
  if (name.startsWith('google') && /^(es|pt|fr|it|de|nl|zh|ja|ko|cmn)/.test(lang)) return 'female'
  return null
}

/**
 * When the device offers a voice of the character's gender, a gentle nudge is enough
 * (extreme pitch on a real voice sounds robotic). Only a mismatch needs the full shift.
 */
export function pitchFor(base: number, want: VoiceGender, got: VoiceGender | null): number {
  if (got === want) return Number((1 + (base - 1) * 0.45).toFixed(3))
  if (want === 'male') return base >= 1.2 ? base : Math.min(base, 0.5)
  return Math.max(base, 1.3)
}

function matches(voiceLang: string, locale: string): boolean {
  return voiceLang.toLowerCase().replace('_', '-').startsWith(locale.toLowerCase())
}

/** 0 for the accents a visitor expects first (Latin American Spanish, US English…), 1 for other regions. */
function localeScore(lang: Lang, voiceLang: string): number {
  const index = languageInfo(lang).locales.findIndex((locale) => matches(voiceLang, locale))
  if (index < 0) return 2
  return index < (lang === 'es' ? 4 : 1) ? 0 : 1
}

function tier(voice: { name: string; localService?: boolean }): number {
  const score = quality(voice)
  return score >= 3 ? 2 : score >= 0 ? 1 : 0
}

export function chooseVoice<T extends { name: string; lang: string; localService?: boolean }>(
  voices: T[],
  lang: Lang,
  hint?: VoiceHint,
): T | null {
  const inLang = voices
    .filter((voice) => languageInfo(lang).locales.some((locale) => matches(voice.lang, locale)))
    .sort((a, b) => quality(b) - quality(a) || localeScore(lang, a.lang) - localeScore(lang, b.lang))
  if (inLang.length === 0) return null
  if (!hint) return inLang[0]
  const pool = inLang
    .map((voice) => ({ voice, gender: assumedGender(voice), explicit: genderOf(voice.name) === hint.gender }))
    .filter((item) => item.gender === hint.gender)
    .sort((a, b) => {
      const good = tier(b.voice) - tier(a.voice)
      if (good !== 0) return good
      const place = localeScore(lang, a.voice.lang) - localeScore(lang, b.voice.lang)
      if (place !== 0) return place
      if (a.explicit !== b.explicit) return a.explicit ? -1 : 1
      const voiceQuality = quality(b.voice) - quality(a.voice)
      if (voiceQuality !== 0) return voiceQuality
      return a.voice.name.localeCompare(b.voice.name)
    })
    .map((item) => item.voice)
  if (pool.length === 0) return inLang[0]
  return pool[hint.variant % pool.length]
}

function allVoices(): SpeechSynthesisVoice[] {
  return synth()?.getVoices() ?? []
}

export function pickVoice(lang: Lang, hint?: VoiceHint): SpeechSynthesisVoice | null {
  return chooseVoice(allVoices(), lang, hint)
}

/** False only when the browser listed its voices and none speaks this language. */
export function hasVoice(lang: Lang): boolean {
  const voices = allVoices()
  if (voices.length === 0) return true
  return chooseVoice(voices, lang) !== null
}

type VoiceEngine = Pick<SpeechSynthesis, 'getVoices'> & Partial<Pick<SpeechSynthesis, 'addEventListener' | 'removeEventListener'>>

export function voicesReady(engine: VoiceEngine, timeout = 800): Promise<void> {
  if (engine.getVoices().length > 0) return Promise.resolve()
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      engine.removeEventListener?.('voiceschanged', finish)
      resolve()
    }
    const timer = window.setTimeout(finish, timeout)
    if (engine.addEventListener) engine.addEventListener('voiceschanged', finish)
    else (engine as { onvoiceschanged?: () => void }).onvoiceschanged = finish
  })
}

/** Splits text into sentences, including Chinese and Japanese full stops that have no space after them. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…؟])\s+|(?<=[。！？])/)
    .map((part) => part.trim())
    .filter(Boolean)
}

const speedWords: Record<Lang, string> = {
  es: 'kilómetros por hora',
  en: 'kilometres per hour',
  pt: 'quilômetros por hora',
  fr: 'kilomètres à l’heure',
  de: 'Kilometer pro Stunde',
  it: 'chilometri orari',
  nl: 'kilometer per uur',
  ca: 'quilòmetres per hora',
  sv: 'kilometer i timmen',
  da: 'kilometer i timen',
  nb: 'kilometer i timen',
  pl: 'kilometrów na godzinę',
  cs: 'kilometrů za hodinu',
  ro: 'kilometri pe oră',
  hu: 'kilométer per óra',
  el: 'χιλιόμετρα την ώρα',
  tr: 'saatte kilometre',
  ru: 'километров в час',
  uk: 'кілометрів на годину',
  ar: 'كيلومتر في الساعة',
  hi: 'किलोमीटर प्रति घंटा',
  id: 'kilometer per jam',
  zh: '公里每小时',
  ja: 'キロ毎時',
  ko: '시속 킬로미터',
}

/** Rewrites symbols that voices read badly ("km/h", "4 g", quotes) into words. */
export function speakable(text: string, lang: Lang): string {
  return text
    .replace(/km\/h/g, speedWords[lang])
    .replace(/(\d)\s?g\b/g, '$1 G')
    .replace(/[«»“”„"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

let clip: HTMLAudioElement | null = null
let neuralOff = false

export function stopSpeaking() {
  session += 1
  window.clearTimeout(fallbackTimer)
  window.clearTimeout(startTimer)
  window.clearInterval(keepAlive)
  alive = []
  if (clip) {
    clip.pause()
    clip.src = ''
    clip = null
  }
  synth()?.cancel()
  emit({ type: 'end' })
}

/** Rough reading time when there is no voice, so the avatar's mouth and the tour keep a natural pace. */
export function silentDuration(text: string, lang: Lang, rate = 1): number {
  const perChar = isCjk(lang) || lang === 'ko' ? 170 : 62
  return Math.min(14000, Math.max(1400, (600 + text.length * perChar) / Math.max(0.5, rate)))
}

export function speak(
  text: string,
  lang: Lang,
  voiceOn: boolean,
  tone: { pitch: number; rate: number; voice?: VoiceHint },
  handlers: Handlers = {},
  mood?: Mood,
) {
  stopSpeaking()
  const current = session
  const rate = tone.rate * rateScale
  const parts = sentences(text)
  handlers.onStart?.()

  const finish = () => {
    if (current !== session) return
    window.clearInterval(keepAlive)
    emit({ type: 'end' })
    handlers.onEnd?.()
  }

  const silent = () => {
    let at = 0
    parts.forEach((part, index) => {
      const begin = at
      window.setTimeout(() => {
        if (current === session) emit({ type: 'sentence', text: part, index, rate, mood, lang })
      }, begin + 80)
      at += silentDuration(part, lang, rate) * 0.8
    })
    fallbackTimer = window.setTimeout(finish, Math.max(at, silentDuration(text, lang, rate)))
  }

  const browser = () => {
    const talking = synth()
    if (!voiceOn || !talking || parts.length === 0) {
      silent()
      return
    }
    void voicesReady(talking).then(() => {
    if (current !== session) return
    const voice = pickVoice(lang, tone.voice)
    if (!voice && talking.getVoices().length > 0) {
      silent()
      return
    }
    let index = 0
    const next = () => {
      if (current !== session) return
      if (index >= parts.length) {
        finish()
        return
      }
      const part = parts[index]
      const utterance = new SpeechSynthesisUtterance(speakable(part, lang))
      const sentenceIndex = index
      index += 1
      alive.push(utterance)
      utterance.lang = voice?.lang ?? languageInfo(lang).locales[0]
      if (voice) utterance.voice = voice as SpeechSynthesisVoice
      const want = tone.voice?.gender
      utterance.pitch = want ? pitchFor(tone.pitch, want, voice ? assumedGender(voice) : 'female') : tone.pitch
      utterance.rate = rate
      utterance.onstart = () => {
        if (current === session) emit({ type: 'sentence', text: part, index: sentenceIndex, rate, mood, lang })
      }
      utterance.onboundary = (event) => {
        if (current !== session || event.name === 'sentence') return
        const from = event.charIndex ?? 0
        const word = utterance.text.slice(from, from + (event.charLength || 12)).split(/\s/)[0]
        emit({ type: 'word', text: word, rate, lang })
      }
      let done = false
      const advance = () => {
        if (done) return
        done = true
        alive = alive.filter((item) => item !== utterance)
        next()
      }
      utterance.onend = advance
      utterance.onerror = advance
      talking.speak(utterance)
    }
    // Chrome desktop silently stops long speech after ~15 s unless it is nudged; Android treats pause() as cancel.
    if (!isAndroid()) {
      keepAlive = window.setInterval(() => {
        if (current !== session) return
        if (talking.speaking && !talking.paused) {
          talking.pause()
          talking.resume()
        }
      }, 10000)
    }
    // Speaking right after cancel() is dropped by some Chrome builds; a short gap avoids it.
    startTimer = window.setTimeout(next, 60)
    })
  }

  if (!voiceOn || parts.length === 0 || import.meta.env.VITEST || neuralOff) {
    browser()
    return
  }

  void neuralClip(speakable(text, lang), lang, tone.voice?.gender, rate).then((url) => {
    if (current !== session) {
      if (url) URL.revokeObjectURL(url)
      return
    }
    if (!url) {
      browser()
      return
    }
    const audio = new Audio(url)
    clip = audio
    const arm = () => {
      if (current !== session) return
      const ms = (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : text.length / 14) * 1000
      let at = 0
      parts.forEach((part, index) => {
        const begin = at
        window.setTimeout(() => {
          if (current === session) emit({ type: 'sentence', text: part, index, rate, mood, lang })
        }, begin)
        at += (part.length / Math.max(1, text.length)) * ms
      })
      const words = speakable(text, lang).split(/\s+/).filter(Boolean)
      const step = words.length ? ms / words.length : ms
      words.forEach((word, index) => {
        window.setTimeout(() => {
          if (current === session) emit({ type: 'word', text: word, rate, lang })
        }, step * index)
      })
    }
    audio.onloadedmetadata = arm
    audio.onended = () => {
      if (clip === audio) clip = null
      URL.revokeObjectURL(url)
      finish()
    }
    audio.onerror = () => {
      if (clip === audio) clip = null
      URL.revokeObjectURL(url)
      browser()
    }
    void audio.play().catch(() => {
      if (clip === audio) clip = null
      URL.revokeObjectURL(url)
      browser()
    })
  })
}

async function neuralClip(text: string, lang: Lang, gender: VoiceGender | undefined, rate: number): Promise<string | null> {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 600), lang, gender: gender ?? 'female', rate }),
      signal: AbortSignal.timeout(2200),
    })
    if (!response.ok) throw new Error('tts')
    const blob = await response.blob()
    if (blob.size < 200) throw new Error('tts')
    return URL.createObjectURL(blob)
  } catch {
    neuralOff = true
    return null
  }
}

export function warmVoices() {
  const engine = synth()
  if (!engine) return
  engine.getVoices()
  if (engine.addEventListener) engine.addEventListener('voiceschanged', () => engine.getVoices())
}

let unlocked = false

/** iOS only lets a page speak or play sound after a tap; this primes both on the first one. */
export function unlockAudio() {
  if (unlocked) return
  unlocked = true
  void audio()?.resume().catch(() => undefined)
  try {
    const tick = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=')
    tick.volume = 0
    void Promise.resolve(tick.play()).catch(() => undefined)
  } catch {
    // Some browsers and the test environment do not play media.
  }
  const engine = synth()
  if (!engine || engine.speaking) return
  try {
    const primer = new SpeechSynthesisUtterance(' ')
    primer.volume = 0
    engine.speak(primer)
  } catch {
    return
  }
}

let context: AudioContext | null = null

function audio(): AudioContext | null {
  const Ctx = typeof window !== 'undefined' ? window.AudioContext : undefined
  if (!Ctx) return null
  try {
    context ??= new Ctx()
    return context
  } catch {
    return null
  }
}

type Note = { freq: number; at: number; length: number; type?: OscillatorType; volume?: number }

function play(notes: Note[]) {
  const ctx = audio()
  if (!ctx) return
  try {
    if (ctx.state === 'suspended') void ctx.resume()
    for (const note of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = note.type ?? 'triangle'
      osc.frequency.value = note.freq
      const start = ctx.currentTime + note.at
      const peak = note.volume ?? 0.16
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.length)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + note.length + 0.02)
    }
  } catch {
    return
  }
}

export type Sound = 'stamp' | 'tap' | 'levelup' | 'badge' | 'open' | 'blip'

export function chime(kind: Sound = 'stamp', pitch = 1) {
  const seq: Record<Sound, Note[]> = {
    stamp: [523.25, 659.25, 783.99, 1046.5].map((freq, i) => ({ freq, at: i * 0.11, length: 0.28 })),
    tap: [{ freq: 660, at: 0, length: 0.08, volume: 0.08 }],
    open: [
      { freq: 440, at: 0, length: 0.08, volume: 0.07 },
      { freq: 660, at: 0.06, length: 0.1, volume: 0.07 },
    ],
    levelup: [392, 523.25, 659.25, 783.99, 1046.5, 1318.5].map((freq, i) => ({
      freq,
      at: i * 0.09,
      length: i === 5 ? 0.6 : 0.2,
      type: 'square' as OscillatorType,
      volume: 0.07,
    })),
    badge: [
      { freq: 880, at: 0, length: 0.15 },
      { freq: 1174.7, at: 0.12, length: 0.15 },
      { freq: 1568, at: 0.24, length: 0.45 },
    ],
    blip: [{ freq: 330 * pitch, at: 0, length: 0.05, type: 'square', volume: 0.035 }],
  }
  play(seq[kind])
}
