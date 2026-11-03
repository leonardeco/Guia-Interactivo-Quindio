import { useCallback, useEffect, useRef, useState } from 'react'
import { distanceMeters, lerpPoint, type Point } from './geo'

type WalkOptions = {
  speed?: number
  onArrive?: () => void
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

function ease(k: number): number {
  return k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2
}

export function useWalker(start: Point) {
  const [pos, setPos] = useState<Point>(start)
  const [walking, setWalking] = useState(false)
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const current = useRef<Point>(start)
  const frame = useRef(0)

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current)
    setWalking(false)
  }, [])

  const face = useCallback((target: Point) => {
    if (Math.abs(target.lng - current.current.lng) > 1e-7) {
      setFacing(target.lng > current.current.lng ? 'right' : 'left')
    }
  }, [])

  const teleport = useCallback((target: Point) => {
    cancelAnimationFrame(frame.current)
    current.current = target
    setPos(target)
    setWalking(false)
  }, [])

  const walkTo = useCallback(
    (target: Point, options: WalkOptions = {}) => {
      cancelAnimationFrame(frame.current)
      const from = current.current
      const meters = distanceMeters(from, target)
      if (meters < 1 || reducedMotion()) {
        face(target)
        teleport(target)
        options.onArrive?.()
        return
      }
      const duration = Math.min(8000, Math.max(2200, (meters / (options.speed ?? 30)) * 1000))
      face(target)
      setWalking(true)
      const began = performance.now()
      const step = (now: number) => {
        const k = Math.min(1, (now - began) / duration)
        const next = lerpPoint(from, target, ease(k))
        current.current = next
        setPos(next)
        if (k < 1) {
          frame.current = requestAnimationFrame(step)
        } else {
          setWalking(false)
          options.onArrive?.()
        }
      }
      frame.current = requestAnimationFrame(step)
    },
    [face, teleport],
  )

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return { pos, walking, facing, current, walkTo, stop, face, teleport }
}
