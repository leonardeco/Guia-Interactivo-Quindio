import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  title: string
  closeLabel: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

/** Bottom sheet dialog: closes with Escape, the backdrop or the X, and returns focus where it was. */
export function Sheet({ title, closeLabel, onClose, children, wide }: Props) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null
    panel.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      before?.focus?.()
    }
  }, [onClose])

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        ref={panel}
        className={`sheet${wide ? ' sheet--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-head">
          <span className="sheet-grip" aria-hidden="true" />
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={closeLabel}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  )
}
