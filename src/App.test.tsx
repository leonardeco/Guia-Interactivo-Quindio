import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'
import { essentials, findPlace } from './data/attractions'
import i18n from './i18n'

function phoneLanguages(list: string[]) {
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(list)
}

const salento = findPlace('Salento', 'Salento')!
const botanico = findPlace('Jardín Botánico del Quindío')!

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeEach(async () => {
  localStorage.clear()
  phoneLanguages(['es-CO', 'es'])
  document.documentElement.lang = 'es'
  document.documentElement.dir = 'ltr'
  await i18n.changeLanguage('es')
})

describe('shell', () => {
  it('shows the department name by default', async () => {
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Quindío' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tu guía por el Quindío' })).toBeInTheDocument()
  })

  it('switches the whole interface between languages from the globe button and stores the choice', async () => {
    const user = userEvent.setup()
    localStorage.setItem('qui.guide', 'camila')
    render(<App />)
    await user.click(await screen.findByRole('button', { name: 'Idioma' }))
    await user.click(screen.getByRole('radio', { name: /English/ }))
    expect(screen.getByRole('button', { name: 'Places' })).toBeInTheDocument()
    expect(localStorage.getItem('pdc.lang')).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    await user.click(screen.getByRole('button', { name: 'Language' }))
    await user.click(screen.getByRole('radio', { name: /日本語/ }))
    expect(screen.getByRole('heading', { name: 'キンディオ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '場所' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '言語' }))
    await user.click(screen.getByRole('radio', { name: /Deutsch/ }))
    expect(screen.getByRole('button', { name: 'Einstellungen' })).toBeInTheDocument()
    expect(localStorage.getItem('pdc.lang')).toBe('de')
  })

  it('greets a first-time visitor in their phone language', async () => {
    phoneLanguages(['ko-KR', 'en-US'])
    render(<App />)
    expect(await screen.findByRole('heading', { name: '킨디오' })).toBeInTheDocument()
    expect(localStorage.getItem('pdc.lang')).toBe('ko')
  })

  it('uses Spanish when the phone language is not available', async () => {
    phoneLanguages(['fi-FI'])
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Tu guía por el Quindío' })).toBeInTheDocument()
  })

  it('restores a stored language', async () => {
    localStorage.setItem('pdc.lang', 'pt')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Seu guia pelo Quindío' })).toBeInTheDocument()
  })

  it('falls back to Spanish when the stored language is unknown', async () => {
    localStorage.setItem('pdc.lang', 'xx')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Tu guía por el Quindío' })).toBeInTheDocument()
    expect(localStorage.getItem('pdc.lang')).toBe('es')
  })

  it('sets the page direction for Arabic', async () => {
    localStorage.setItem('pdc.lang', 'ar')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'كينديو' })).toBeInTheDocument()
    expect(document.documentElement.dir).toBe('rtl')
  })
})

describe('static shell files', () => {
  it('publishes a standalone manifest in the department colors', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as {
      name: string
      display: string
      theme_color: string
      background_color: string
    }
    expect(manifest.name).toBe('Mapa del Quindío')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#0E6B56')
    expect(manifest.background_color).toBe('#E7F2EC')
  })

  it('sends Vite and Vercel to the same dist folder', () => {
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8')) as { outputDirectory: string }
    const vite = readFileSync('vite.config.ts', 'utf8')
    expect(vercel.outputDirectory).toBe('dist')
    expect(vite).toContain("outDir: 'dist'")
  })

  it('keeps the frame from scrolling sideways and uses the coffee type', () => {
    const css = readFileSync('src/styles.css', 'utf8')
    expect(css).toContain('MapLibre positions markers with transform')
    expect(css).toContain('overflow-x: hidden')
    expect(css).toContain('#e7f2ec')
    expect(css).toContain('Public Sans')
    expect(css).toContain('font-size: 16px')
    expect(css).toContain('min-height: 48px')
  })

  it('points MapLibre at its bundled worker file', () => {
    const map = readFileSync('src/map/ParkMap.tsx', 'utf8')
    expect(map).toContain("from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'")
    expect(map).toContain('setWorkerUrl(workerUrl)')
  })
})

describe('guide', () => {
  it('walks a first-time visitor through language, guide and tastes', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: /English/ }))
    expect(localStorage.getItem('pdc.lang')).toBe('en')
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('radio', { name: /Camila/ }))
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    const start = screen.getByRole('button', { name: 'Plan my route!' })
    expect(start).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /Nature/ }))
    await user.click(start)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(localStorage.getItem('qui.guide')).toBe('camila')
    expect(JSON.parse(localStorage.getItem('qui.tastes') ?? '[]')).toEqual(['nature'])
    expect(localStorage.getItem('qui.base')).toBe('Armenia')
    expect(screen.getAllByText(/Welcome to Quindío\. I am Camila/).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Next stop' })).toBeInTheDocument()
  })

  it('skips the welcome for a returning visitor and keeps their stamps', () => {
    localStorage.setItem('qui.guide', 'santiago')
    localStorage.setItem('qui.visited', JSON.stringify([salento.id, 999, 'x']))
    render(<App />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Santiago' })).toBeInTheDocument()
    expect(screen.getByLabelText(`Sellos: 1/${essentials.length}`)).toBeInTheDocument()
  })

  it('opens the passport with level, badges and stamps', async () => {
    const user = userEvent.setup()
    localStorage.setItem('qui.guide', 'lucia')
    localStorage.setItem('qui.visited', JSON.stringify([salento.id]))
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Pasaporte' }))
    const passport = screen.getByRole('dialog', { name: 'Pasaporte' })
    expect(passport).toHaveTextContent('Caminante')
    expect(passport).toHaveTextContent('150 XP')
    expect(passport).toHaveTextContent('Primer sello')
    expect(screen.getByRole('button', { name: `${salento.id}. Salento · Visitado` })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Pasaporte' })).not.toBeInTheDocument()
  })

  it('finds places without accents and shows them in the guide', async () => {
    const user = userEvent.setup()
    localStorage.setItem('qui.guide', 'valentina')
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Lugares' }))
    await user.type(screen.getByRole('searchbox', { name: 'Buscar lugar…' }), 'jardin botanico')
    const row = screen.getByRole('button', { name: /Jardín Botánico del Quindío/ })
    await user.click(row)
    expect(screen.queryByRole('dialog', { name: 'Lugares' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: botanico.name.es })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir allí' })).toBeInTheDocument()
  })
})
