type Heard = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type HeardCtor = new () => Heard

function recognitionCtor(): HeardCtor | null {
  if (typeof window === 'undefined') return null
  const host = window as Window & { SpeechRecognition?: HeardCtor; webkitSpeechRecognition?: HeardCtor }
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null
}

export function canListen(): boolean {
  if (import.meta.env.VITEST) return false
  return recognitionCtor() !== null
}

export function listenOnce(locale: string, onText: (text: string) => void, onDone: () => void): () => void {
  const Ctor = recognitionCtor()
  if (!Ctor) {
    onDone()
    return () => undefined
  }
  const rec = new Ctor()
  rec.lang = locale
  rec.interimResults = false
  rec.maxAlternatives = 1
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    onDone()
  }
  rec.onresult = (event) => {
    const said = event.results?.[0]?.[0]?.transcript?.trim()
    if (said) onText(said)
  }
  rec.onerror = finish
  rec.onend = finish
  try {
    rec.start()
  } catch {
    finish()
  }
  return () => {
    try {
      rec.stop()
    } catch {
      finish()
    }
  }
}
