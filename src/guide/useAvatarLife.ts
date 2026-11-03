import { useEffect, type RefObject } from 'react'
import { gestureFor, sentenceFrames, wordFrames, type Frame } from './lipsync'
import { subscribeSpeech } from './speech'

type Options = {
  talking: boolean
  walking: boolean
  /** Small avatars on the map skip the eye movements nobody can see. */
  detail: boolean
}

function random(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/**
 * Brings an avatar to life without re-rendering React: blinks, glances around,
 * moves its mouth with each word the voice says and changes hand gestures per sentence.
 */
export function useAvatarLife(ref: RefObject<SVGSVGElement | null>, { talking, walking, detail }: Options) {
  // Blinking: irregular, sometimes double, like a person.
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    let timer = 0
    let open = 0
    const blink = () => {
      svg.classList.add('is-blink')
      open = window.setTimeout(() => svg.classList.remove('is-blink'), 120)
      const twice = Math.random() < 0.18
      timer = window.setTimeout(blink, twice ? 260 : random(2200, 5600))
    }
    timer = window.setTimeout(blink, random(800, 3000))
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(open)
      svg.classList.remove('is-blink')
    }
  }, [ref])

  // Gaze: wander when idle, look at the visitor while talking, look ahead while walking.
  useEffect(() => {
    const svg = ref.current
    if (!svg || !detail || reducedMotion()) return
    let timer = 0
    const look = (x: number, y: number) => {
      svg.style.setProperty('--gx', `${x.toFixed(2)}px`)
      svg.style.setProperty('--gy', `${y.toFixed(2)}px`)
    }
    const move = () => {
      if (walking) look(2.4, 0.4)
      else if (talking) look(Math.random() < 0.7 ? random(-0.6, 0.6) : random(-2, 2), random(-0.8, 0.6))
      else look(random(-2.6, 2.6), random(-1.6, 1.2))
      timer = window.setTimeout(move, talking ? random(900, 2200) : random(1300, 3800))
    }
    move()
    return () => window.clearTimeout(timer)
  }, [ref, talking, walking, detail])

  // Lip-sync and gestures, driven by the speech engine.
  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    const setShape = (shape: string) => {
      svg.dataset.viseme = shape
    }
    if (!talking) {
      setShape('rest')
      delete svg.dataset.gesture
      svg.classList.remove('is-brows-up')
      return
    }
    let queue: Frame[] = []
    let timer = 0
    let byWord = false
    let brows = 0
    const run = () => {
      const frame = queue.shift()
      if (!frame) {
        setShape('rest')
        return
      }
      setShape(frame.shape)
      timer = window.setTimeout(run, frame.ms)
    }
    const playFrames = (frames: Frame[]) => {
      window.clearTimeout(timer)
      queue = frames
      run()
    }
    const unsubscribe = subscribeSpeech((event) => {
      if (event.type === 'end') {
        window.clearTimeout(timer)
        queue = []
        setShape('rest')
        return
      }
      if (event.type === 'word') {
        byWord = true
        playFrames(wordFrames(event.text, event.lang, event.rate))
        return
      }
      if (!reducedMotion()) svg.dataset.gesture = gestureFor(event.text, event.index, event.mood)
      if (/[!！?？]\s*$/.test(event.text)) {
        svg.classList.add('is-brows-up')
        window.clearTimeout(brows)
        brows = window.setTimeout(() => svg.classList.remove('is-brows-up'), 900)
      }
      if (!byWord) playFrames(sentenceFrames(event.text, event.lang, event.rate))
    })
    return () => {
      unsubscribe()
      window.clearTimeout(timer)
      window.clearTimeout(brows)
      setShape('rest')
    }
  }, [ref, talking])
}
