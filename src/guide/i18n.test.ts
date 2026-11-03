import { describe, expect, it } from 'vitest'
import { attractions, findPlace } from '../data/attractions'
import { languageCodes, toLang } from '../i18n/languages'
import { messages } from '../i18n/resources'
import { earnedBadges, levelFor, xpFor } from '../game/progress'
import { normalize } from '../ui/PlacesSheet'
import { insidePolygon, isInsidePark } from './checkpoint'
import { gestureFor, sentenceFrames, visemesFor } from './lipsync'
import * as lines from './lines'
import { chooseVoice, genderOf, quality, sentences, silentDuration, speakable } from './speech'

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.length
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)]))
  }
  return typeof value
}

const square: [number, number][] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
]

describe('languages', () => {
  it('has twenty-five languages with the same interface keys as Spanish', () => {
    expect(languageCodes).toHaveLength(25)
    for (const code of languageCodes) {
      expect(shape(messages[code])).toEqual(shape(messages.es))
    }
  })

  it('keeps every interpolation placeholder in every translation', () => {
    const placeholders = (text: string) => (text.match(/{{\w+}}/g) ?? []).sort()
    for (const code of languageCodes) {
      for (const [key, value] of Object.entries(messages.es)) {
        if (typeof value !== 'string') continue
        const translated = (messages[code] as unknown as Record<string, string>)[key]
        expect(placeholders(translated), `${code}.${key}`).toEqual(placeholders(value))
      }
    }
  })

  it('names and describes every attraction in every language', () => {
    for (const place of attractions) {
      for (const code of languageCodes) {
        expect(place.name[code], `${place.id} ${code}`).toBeTruthy()
        expect(place.info[code].length, `${place.id} ${code}`).toBeGreaterThan(4)
      }
      expect(place.info.de).not.toBe(place.info.en)
      expect(place.info.ko).not.toBe(place.info.en)
    }
    const salento = findPlace('Salento', 'Salento')!
    expect(salento.info.es).toMatch(/1842/)
    expect(salento.name.ja).toBe('Salento')
  })

  it('reads language tags from phones', () => {
    expect(toLang('de-AT')).toBe('de')
    expect(toLang('zh_TW')).toBe('zh')
    expect(toLang('sv-SE')).toBe('sv')
    expect(toLang('fi-FI')).toBe('es')
    expect(toLang(null)).toBe('es')
  })

  it('writes every guide line in every language without gaps', () => {
    const place = findPlace('Salento', 'Salento')!
    const other = findPlace('Filandia', 'Filandia')!
    const near = [
      { place, distance: 42 },
      { place: other, distance: 80 },
      { place: findPlace('Armenia', 'Armenia')!, distance: 95 },
    ]
    for (const code of languageCodes) {
      const all = [
        lines.arrival(code, place, 2),
        lines.aboutPlace(code, place),
        lines.nextStop(code, place, 120, 3),
        lines.whereAmI(code, near),
        lines.routeSummary(code, [place, other]),
        lines.routeDone(code, 4),
        lines.parkStory(code),
        lines.startHint(code, true),
        lines.levelUpLine(code, 2, 'X'),
        lines.badgeLine(code, 'Y'),
        lines.gpsLine(code, 'denied'),
      ]
      expect(lines.heightNote(code, place)).toBe('')
      for (const line of all) {
        expect(line, code).toBeTruthy()
        expect(line).not.toContain('undefined')
      }
      expect(lines.arrival(code, place, 2)).toContain(place.name[code])
    }
  })

  it('joins lists the way each language does', () => {
    expect(lines.list('de', ['A', 'B', 'C'])).toBe('A, B und C')
    expect(lines.list('ja', ['A', 'B'])).toBe('A、B')
    expect(lines.list('ko', ['A', 'B'])).toBe('A, B')
  })
})

describe('speech text', () => {
  it('splits sentences in Latin and East Asian scripts', () => {
    expect(sentences('Hola. ¿Cómo estás? Bien!')).toEqual(['Hola.', '¿Cómo estás?', 'Bien!'])
    expect(sentences('你好！欢迎来到公园。跟我来！')).toEqual(['你好！', '欢迎来到公园。', '跟我来！'])
    expect(sentences('1.200 metros de sendero.')).toEqual(['1.200 metros de sendero.'])
  })

  it('reads speeds and g-forces as words', () => {
    expect(speakable('Llega a 83 km/h y 4 g.', 'es')).toBe('Llega a 83 kilómetros por hora y 4 G.')
    expect(speakable('Tippe auf „Nächster Halt“', 'de')).toBe('Tippe auf Nächster Halt')
  })

  it('ranks natural voices above robotic ones', () => {
    expect(quality({ name: 'Microsoft Salome Online (Natural) - Spanish (Colombia)' })).toBeGreaterThan(
      quality({ name: 'Google español' }),
    )
    expect(quality({ name: 'eSpeak Spanish' })).toBeLessThan(0)
  })

  it('prefers a Colombian natural voice and knows voice genders in new languages', () => {
    const voices = [
      { name: 'Microsoft Helena - Spanish (Spain)', lang: 'es-ES', localService: true },
      { name: 'Microsoft Salome Online (Natural) - Spanish (Colombia)', lang: 'es-CO', localService: false },
      { name: 'Microsoft Gonzalo Online (Natural) - Spanish (Colombia)', lang: 'es-CO', localService: false },
    ]
    expect(chooseVoice(voices, 'es', { gender: 'female', variant: 0 })?.name).toContain('Salome')
    expect(chooseVoice(voices, 'es', { gender: 'male', variant: 0 })?.name).toContain('Gonzalo')
    expect(genderOf('Microsoft Nanami Online (Natural) - Japanese (Japan)')).toBe('female')
    expect(genderOf('Microsoft Conrad Online (Natural) - German (Germany)')).toBe('male')
    expect(genderOf('Microsoft InJoon Online (Natural) - Korean (Korea)')).toBe('male')
    expect(chooseVoice(voices, 'ko')).toBeNull()
  })

  it('gives silent reading enough time in every script', () => {
    expect(silentDuration('Hola', 'es')).toBeGreaterThanOrEqual(1400)
    expect(silentDuration('你好欢迎来到咖啡公园', 'zh')).toBeGreaterThan(silentDuration('Hola amigos', 'es'))
  })
})

describe('lip-sync', () => {
  it('maps vowels and lip consonants to mouth shapes', () => {
    expect(visemesFor('mamá', 'es')).toEqual(['M', 'A', 'M', 'A'])
    expect(visemesFor('hola', 'es')).toEqual(['O', 'A'])
    expect(visemesFor('tú', 'es')).toEqual(['U'])
    expect(visemesFor('—', 'es')).toEqual([])
    expect(visemesFor('你好', 'zh')).toHaveLength(2)
  })

  it('pauses the mouth at commas and builds a timeline for a sentence', () => {
    const frames = sentenceFrames('Hola, amigo.', 'es', 1)
    expect(frames.some((frame) => frame.shape === 'rest')).toBe(true)
    expect(frames.every((frame) => frame.ms > 0)).toBe(true)
  })

  it('waves when greeting, points when leading and celebrates arrivals', () => {
    expect(gestureFor('¡Hola!', 0, 'greet')).toBe('wave')
    expect(gestureFor('Sígueme', 0, 'point')).toBe('point')
    expect(gestureFor('¡Llegaste!', 0, 'celebrate')).toBe('celebrate')
    expect(gestureFor('¿Dónde?', 2)).toBe('think')
  })
})

describe('game progress', () => {
  it('turns stamps into XP, levels and badges', () => {
    expect(levelFor(0).level).toBe(1)
    expect(levelFor(100).level).toBe(2)
    expect(levelFor(99999).ceiling).toBeNull()
    const salento = findPlace('Salento', 'Salento')!
    const first = { visited: [salento.id], routesDone: 0 }
    expect(earnedBadges(first)).toEqual(['first'])
    expect(xpFor(first)).toBe(100 + 50)
    expect(earnedBadges({ visited: attractions.filter((place) => place.featured).map((place) => place.id), routesDone: 1 })).toContain('legend')
  })
})

describe('department area', () => {
  it('uses the department outline instead of a circle', () => {
    expect(isInsidePark({ lng: -75.68, lat: 4.53 })).toBe(true)
    expect(isInsidePark({ lng: -75.696, lat: 4.813 })).toBe(false)
    expect(insidePolygon({ lng: 0.5, lat: 0.5 }, square)).toBe(true)
    expect(insidePolygon({ lng: 1.5, lat: 0.5 }, square)).toBe(false)
  })

  it('searches places without caring about accents', () => {
    expect(normalize('Jardín')).toBe('jardin')
  })
})
