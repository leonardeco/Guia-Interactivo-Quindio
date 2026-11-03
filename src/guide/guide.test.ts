import { describe, expect, it, vi } from 'vitest'
import { attractions, entrance, findPlace, townPoint } from '../data/attractions'
import { arrivalRadius, findArrival, isInsidePark, nearestPlaces } from './checkpoint'
import { characters, findCharacter } from './characters'
import { chooseVoice, pitchFor, voicesReady } from './speech'
import { bearingDeg, compassIndex, distanceMeters } from './geo'
import { arrival, nextStop, parkStory, routeSummary, whereAmI } from './lines'
import { answerQuestion } from './ask'
import { buildRoute, MAX_STOPS } from './route'
import { languageCodes } from '../i18n/languages'
import { regionHistory } from '../data/history'
import { fiestaText, placePhoto } from '../data/visit'
import { findNamed, placeHref, readShare } from './link'
import { canListen } from './listen'

const salento = findPlace('Salento', 'Salento')!
const door = attractions.find((place) => place.reach < 120)!
const hotelQuimbaya = attractions.find((place) => place.name.es === 'Quimbaya' && place.zone === 'hotel')

describe('geo', () => {
  it('measures about 111 metres per thousandth of a degree of latitude', () => {
    const d = distanceMeters({ lng: -75.77, lat: 4.54 }, { lng: -75.77, lat: 4.541 })
    expect(d).toBeGreaterThan(105)
    expect(d).toBeLessThan(115)
  })

  it('points north and east correctly', () => {
    expect(compassIndex(bearingDeg({ lng: 0, lat: 0 }, { lng: 0, lat: 1 }))).toBe(0)
    expect(compassIndex(bearingDeg({ lng: 0, lat: 0 }, { lng: 1, lat: 0 }))).toBe(2)
  })
})

describe('route', () => {
  it('returns nothing without tastes', () => {
    expect(buildRoute([], entrance)).toEqual([])
  })

  it('only includes matching places and caps the stops', () => {
    const plan = buildRoute(['nature', 'coffee'], entrance)
    expect(plan.length).toBeGreaterThan(0)
    expect(plan.length).toBeLessThanOrEqual(MAX_STOPS)
    expect(plan.every((stop) => stop.tags.some((tag) => tag === 'nature' || tag === 'coffee'))).toBe(true)
  })

  it('keeps a towns route inside one area', () => {
    const plan = buildRoute(['towns'], entrance)
    expect(plan.length).toBeGreaterThan(0)
    expect(plan.length).toBeLessThanOrEqual(MAX_STOPS)
    const clustered = plan.some((candidate) => {
      const hub = townPoint(candidate.town) ?? candidate
      return plan.every((stop) => stop.town === candidate.town || distanceMeters(hub, stop) <= 18000)
    })
    expect(clustered).toBe(true)
  })

  it('starts with the stop closest to the visitor', () => {
    const plan = buildRoute(['towns'], entrance)
    const closest = Math.min(...plan.map((stop) => distanceMeters(entrance, stop)))
    expect(distanceMeters(entrance, plan[0])).toBe(closest)
  })
})

describe('checkpoint', () => {
  it('grows the radius with poor accuracy and gives up on a door above 80 m', () => {
    expect(arrivalRadius(5)).toBe(55)
    expect(arrivalRadius(60)).toBe(60)
    expect(arrivalRadius(120)).toBeNull()
    expect(arrivalRadius(120, 180)).not.toBeNull()
  })

  it('detects arrival at Salento and skips it once stamped', () => {
    const spot = { lng: salento.lng, lat: salento.lat }
    expect(findArrival(spot, 10, [])?.id).toBe(salento.id)
    expect(findArrival(spot, 10, [salento.id])?.id).not.toBe(salento.id)
    expect(findArrival(spot, 10, [], [door])?.id).not.toBe(salento.id)
  })

  it('does not stamp a door with a bad GPS fix', () => {
    expect(findArrival({ lng: door.lng, lat: door.lat }, 150, [])?.id).not.toBe(door.id)
  })

  it('knows the department and its neighbours', () => {
    expect(isInsidePark(entrance)).toBe(true)
    expect(isInsidePark({ lng: -75.68, lat: 4.53 })).toBe(true)
    expect(isInsidePark({ lng: -75.482, lat: 4.6405 })).toBe(true)
    expect(isInsidePark({ lng: -75.7922, lat: 4.2075 })).toBe(true)
    expect(parkStory('es')).toContain('La Tebaida')
    expect(findPlace('Aeropuerto Internacional El Edén', 'La Tebaida')?.town).toBe('La Tebaida')
    expect(findPlace('Terminal de Transportes de Armenia', 'Armenia')?.zone).toBe('gate')
    expect(nearestPlaces(salento, 3)[0].place.id).toBe(salento.id)
  })
})

describe('questions', () => {
  it('answers about Barbas Bremen instead of treating “bar” as nightlife', () => {
    const answer = answerQuestion('Reserva Natural Barbas Bremen', 'es', entrance, [])
    expect(answer.place?.name.es).toBe('Reserva Natural Barbas Bremen')
    expect(answer.text).not.toMatch(/rumba|disco/i)
  })

  it('suggests restaurants near the visitor, not the first ones in the catalog', () => {
    const answer = answerQuestion('dónde comer', 'es', entrance, [])
    expect(answer.place?.zone).toBe('restaurant')
    expect(answer.place && distanceMeters(entrance, answer.place)).toBeLessThan(8000)
    expect(answer.text.startsWith(`En ${answer.place?.town}`)).toBe(true)
  })
})

describe('places', () => {
  it('keeps the town of Quimbaya historic and the hotel of the same name ordinary', () => {
    const town = attractions.find((place) => place.town === 'Quimbaya' && place.zone === 'town')!
    expect(town.zone).toBe('town')
    expect(town.historic).toBe(true)
    expect(hotelQuimbaya?.historic).toBe(false)
    expect(findPlace('Museo del Oro Quimbaya')?.town).toBe('Armenia')
    expect(findPlace('RECUCA, Recorrido de la Cultura Cafetera.')?.town).toBe('Calarcá')
  })
})

describe('guide lines', () => {
  it('announces Salento with its history in every language', () => {
    expect(arrival('es', salento, 1)).toMatch(/^¡Llegaste a Salento! Este es tu sello número 1\./)
    for (const lang of ['es', 'en', 'pt', 'fr'] as const) {
      const line = arrival(lang, salento, 3)
      expect(line).toContain('Salento')
      expect(line).toContain('3')
      expect(line).toMatch(/1842/)
    }
  })

  it('gives directions and distances', () => {
    expect(nextStop('es', salento, 234, 2)).toBe(
      'La siguiente parada es Salento, a unos 230 m hacia el este.',
    )
    expect(nextStop('en', salento, 8, 0)).toBe('The next stop is Salento, about 10 m to the north.')
  })

  it('lists route stops and nearby places', () => {
    const stops = attractions.slice(0, 3)
    expect(routeSummary('es', stops)).toContain(`${stops[1].name.es} y ${stops[2].name.es}`)
    expect(whereAmI('fr', nearestPlaces(salento, 3))).toContain(salento.name.fr)
  })
})

const installed = [
  { name: 'Microsoft Raul - Spanish (Mexico)', lang: 'es-MX', localService: true },
  { name: 'Microsoft Sabina - Spanish (Mexico)', lang: 'es-MX', localService: true },
  { name: 'Google español', lang: 'es-ES', localService: false },
  { name: 'Google español de Estados Unidos', lang: 'es-US', localService: false },
  { name: 'Google US English', lang: 'en-US', localService: false },
  { name: 'Google UK English Female', lang: 'en-GB', localService: false },
  { name: 'Google UK English Male', lang: 'en-GB', localService: false },
]

describe('voices', () => {
  it('gives Santiago a male voice and Camila a female one', () => {
    expect(chooseVoice(installed, 'es', findCharacter('santiago').voice)?.name).toContain('Raul')
    expect(chooseVoice(installed, 'es', findCharacter('camila').voice)?.name).toContain('Sabina')
    expect(findCharacter('santiago').pitch).toBeLessThan(findCharacter('camila').pitch)
  })

  it('deepens an adult man when the only Spanish voice is female', () => {
    const google = [{ name: 'Google español de Estados Unidos', lang: 'es-US', localService: false }]
    const voice = chooseVoice(google, 'es', { gender: 'male', variant: 0 })
    expect(voice?.name).toContain('Google')
    expect(pitchFor(0.42, 'male', 'female')).toBeLessThanOrEqual(0.5)
    expect(pitchFor(0.9, 'male', 'female')).toBe(0.5)
    expect(pitchFor(1.7, 'male', 'female')).toBe(1.7)
  })

  it('only nudges the pitch when the voice already has the right gender', () => {
    expect(pitchFor(0.26, 'male', 'male')).toBeGreaterThan(0.6)
    expect(pitchFor(0.26, 'male', 'male')).toBeLessThan(1)
    expect(pitchFor(1.35, 'female', 'female')).toBeGreaterThan(1)
    expect(pitchFor(1.35, 'female', 'female')).toBeLessThan(1.35)
  })

  it('uses an English male voice for the men and a female voice for the women', () => {
    expect(chooseVoice(installed, 'en', { gender: 'male', variant: 0 })?.name).toContain('Male')
    expect(chooseVoice(installed, 'en', { gender: 'female', variant: 0 })?.name).toContain('Female')
  })

  it('waits for browser voices and also releases on timeout', async () => {
    vi.useFakeTimers()
    let voices: SpeechSynthesisVoice[] = []
    let listener: (() => void) | undefined
    const engine = {
      getVoices: () => voices,
      addEventListener: (_type: 'voiceschanged', callback: EventListenerOrEventListenerObject) => {
        listener = typeof callback === 'function' ? () => callback(new Event('voiceschanged')) : () => callback.handleEvent(new Event('voiceschanged'))
      },
      removeEventListener: () => undefined,
    }

    const loaded = voicesReady(engine as Pick<SpeechSynthesis, 'getVoices' | 'addEventListener' | 'removeEventListener'>)
    voices = [installed[0] as SpeechSynthesisVoice]
    listener?.()
    await loaded

    voices = []
    const timedOut = voicesReady(engine as Pick<SpeechSynthesis, 'getVoices' | 'addEventListener' | 'removeEventListener'>, 25)
    await vi.advanceTimersByTimeAsync(25)
    await timedOut
    vi.useRealTimers()
  })
})

describe('characters', () => {
  it('offers six guides with greetings and roles in every language', () => {
    expect(characters).toHaveLength(6)
    for (const item of characters) {
      expect(Object.keys(item.hello).sort()).toEqual([...languageCodes].sort())
      for (const code of languageCodes) {
        expect(item.hello[code].length).toBeGreaterThan(10)
        expect(item.role[code].length).toBeGreaterThan(1)
      }
    }
    expect(findCharacter('nope').id).toBe('camila')
    expect(characters.every((item) => item.look.oneLeg === false)).toBe(true)
  })
})

describe('visit notes', () => {
  it('keeps La Tebaida outside the UNESCO list and puts the airport there', () => {
    expect(regionHistory('es')).toContain('La Tebaida')
    expect(findPlace('Aeropuerto Internacional El Edén')?.town).toBe('La Tebaida')
  })

  it('keeps the busy squares of Armenia as crowded places', () => {
    expect(findPlace('Plaza de Bolívar de Armenia')?.zone).toBe('popular')
    expect(findPlace('Parque Antonio José de Sucre')?.zone).toBe('popular')
  })

  it('names the December lights in Quimbaya and stays quiet without a microphone', () => {
    expect(fiestaText('Quimbaya', 'es')).toMatch(/diciembre/i)
    expect(canListen()).toBe(false)
  })

  it('shares a place by name and keeps the newer photo credit', () => {
    expect(readShare('?lugar=Salento&gustos=coffee,nope').tastes).toEqual(['coffee'])
    expect(findNamed('quimbaya')?.zone).toBe('town')
    expect(placeHref('https://guia.example/app', 'Salento')).toBe('https://guia.example/app?lugar=Salento')
    expect(placePhoto('Filandia')?.credit).toContain('2025')
    expect(placePhoto('Salento')?.credit).toContain('2020')
    expect(placePhoto('Circasia')?.credit).toContain('2024')
    expect(fiestaText('Filandia', 'es')).toMatch(/suspendieron/i)
  })
})
