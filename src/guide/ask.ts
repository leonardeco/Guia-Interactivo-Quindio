import { attractions, municipalities, type Attraction, type Taste, type Zone } from '../data/attractions'
import { distanceMeters } from './geo'
import { regionHistory } from '../data/history'
import { col } from '../i18n/col'
import type { Lang } from '../i18n/languages'
import { normalize } from '../ui/PlacesSheet'
import type { Point } from './geo'
import { routeSummary } from './lines'
import { buildRoute } from './route'

const historyWords = [
  'historia',
  'history',
  'histoire',
  'geschichte',
  'storia',
  'geschiedenis',
  'historie',
  'dějiny',
  'istorie',
  'történelem',
  'ιστορία',
  'tarih',
  'история',
  'історія',
  'تاريخ',
  'इतिहास',
  'sejarah',
  '历史',
  '歴史',
  '역사',
]

const recommendWords = ['ruta', 'route', 'qué ver', 'que ver', 'what to see', 'recomiend', 'recommend', 'itinerar', 'plan']

const zoneWords: { zone: Zone; words: string[] }[] = [
  { zone: 'restaurant', words: ['restaurante', 'restaurant', 'comer', 'comida', 'food', 'eat', 'manger', 'essen', 'ristorante', 'eten', 'menjar', 'äta', 'spise', 'jeść', 'jídlo', 'mâncare', 'ennivaló', 'φαγητό', 'yemek', 'еда', 'їжа', 'طعام', 'खाना', 'makan', '餐厅', '食事', '식당'] },
  { zone: 'cafe', words: ['café', 'cafe', 'kaffee', 'caffè', 'koffie', 'kafé', 'kaffe', 'kawa', 'káv', 'cafea', 'kávé', 'καφέ', 'kahve', 'кофе', 'кава', 'قهوة', 'कॉफ', 'kopi', '咖啡馆', 'カフェ', '카페'] },
  { zone: 'nightlife', words: ['rumba', 'disco', 'discoteca', 'nightlife', 'fiesta', 'noche', 'club', 'bar', 'uitgaan', 'nacht', 'gece', 'ноч', 'ніч', 'ليلة', 'रात', 'malam', '夜店', 'ナイト', '밤'] },
  { zone: 'hotel', words: ['hotel', 'dormir', 'hosped', 'airbnb', 'hostal', 'finca', 'apartamento', 'sleep', 'stay', 'hôtel', 'übernacht', 'allogg', 'slapen', 'nocleg', 'ubyt', 'cazare', 'száll', 'διαμον', 'konak', 'отел', 'готел', 'فندق', 'होटल', 'penginap', '酒店', 'ホテル', '호텔', '숙소'] },
  { zone: 'viewpoint', words: ['mirador', 'lookout', 'belvedere', 'uitsicht', 'udsigt', 'utsikt', 'widok', 'vyhlíd', 'belvedere', 'kilát', 'seyir', 'смотров', 'оглядов', 'مطل', 'व्यूपॉइंट', 'pandang', '观景', '展望', '전망'] },
  { zone: 'park', words: ['parque', 'park', 'naturaleza', 'nature', 'natureza', 'parc', 'natur', 'natuur', 'natura', 'przyrod', 'přírod', 'natură', 'természet', 'φύσ', 'doğa', 'природ', 'природ', 'طبيعة', 'प्रकृति', 'alam', '公园', '自然', '공원'] },
  { zone: 'town', words: ['pueblo', 'municipio', 'town', 'village', 'povoado', 'dorf', 'paese', 'dorp', 'poble', 'miastecz', 'měst', 'oraș', 'települ', 'οικισ', 'kasaba', 'городок', 'містеч', 'بلدة', 'कस्बा', '村镇', '町', '마을'] },
]

const none = col([
  '{{name}} no tiene una historia registrada. {{blurb}}',
  '{{name}} has no recorded history here. {{blurb}}',
  '{{name}} não tem uma história registrada. {{blurb}}',
  '{{name}} n’a pas d’histoire enregistrée ici. {{blurb}}',
  '{{name}} hat hier keine festgehaltene Geschichte. {{blurb}}',
  '{{name}} non ha una storia registrata. {{blurb}}',
  '{{name}} heeft hier geen opgetekende geschiedenis. {{blurb}}',
  '{{name}} no té una història registrada. {{blurb}}',
  '{{name}} har ingen nedtecknad historia här. {{blurb}}',
  '{{name}} har ingen nedskrevet historie her. {{blurb}}',
  '{{name}} har ingen nedskrevet historie her. {{blurb}}',
  '{{name}} nie ma tu zapisanej historii. {{blurb}}',
  '{{name}} tu nemá zapsanou historii. {{blurb}}',
  '{{name}} nu are o istorie înregistrată. {{blurb}}',
  '{{name}} történetét itt nem jegyeztük. {{blurb}}',
  'Το {{name}} δεν έχει καταγεγραμμένη ιστορία. {{blurb}}',
  '{{name}} için kayıtlı bir tarih yok. {{blurb}}',
  'У {{name}} здесь нет записанной истории. {{blurb}}',
  'У {{name}} тут немає записаної історії. {{blurb}}',
  'ليس لـ {{name}} تاريخ مسجل هنا. {{blurb}}',
  '{{name}} का दर्ज इतिहास यहाँ नहीं है। {{blurb}}',
  '{{name}} tidak punya sejarah yang tercatat. {{blurb}}',
  '{{name}}没有收录的历史。{{blurb}}',
  '{{name}}に残された歴史はないよ。{{blurb}}',
  '{{name}}에는 기록된 역사가 없습니다. {{blurb}}',
])

const help = col([
  'Pregúntame la historia del Quindío, la de un pueblo, dónde comer o una ruta cerca.',
  'Ask me for the history of Quindío, a town’s story, where to eat, or a route nearby.',
  'Pergunte a história do Quindío, a de um povoado, onde comer ou uma rota perto.',
  'Demandez l’histoire du Quindío, celle d’un village, où manger ou une route proche.',
  'Frag nach der Geschichte von Quindío, einem Ort, wo man isst oder einer Route in der Nähe.',
  'Chiedi la storia del Quindío, quella di un paese, dove mangiare o un percorso vicino.',
  'Vraag naar de geschiedenis van Quindío, een dorp, waar je eet of een route in de buurt.',
  'Pregunta la història del Quindío, la d’un poble, on menjar o una ruta a prop.',
  'Fråga om Quindíos historia, en orts historia, var man äter eller en rutt nära.',
  'Spørg om Quindíos historie, en bys historie, hvor man spiser eller en rute i nærheden.',
  'Spør om Quindíos historie, et steds historie, hvor man spiser eller en rute i nærheten.',
  'Zapytaj o historię Quindío, historię miejscowości, gdzie zjeść albo trasę w pobliżu.',
  'Zeptej se na dějiny Quindía, příběh města, kde se najíst nebo trasu poblíž.',
  'Întreabă istoria Quindío, a unui oraș, unde să mănânci sau un traseu aproape.',
  'Kérdezd Quindío történetét, egy települését, hol egyél, vagy egy közeli útvonalat.',
  'Ρώτα την ιστορία του Κινδίο, ενός οικισμού, πού να φας ή μια κοντινή διαδρομή.',
  'Quindío’nun tarihini, bir kasabanınkini, nerede yenir ya da yakın bir rota sor.',
  'Спроси историю Киндио, историю городка, где поесть или маршрут рядом.',
  'Запитай історію Кіндіо, історію містечка, де поїсти чи маршрут поруч.',
  'اسأل عن تاريخ كينديو أو بلدة، أو أين تأكل، أو مسار قريب.',
  'क्विंदियो का इतिहास, किसी कस्बे की कहानी, खाना या पास का रास्ता पूछें।',
  'Tanyakan sejarah Quindío, kisah sebuah kota, tempat makan, atau rute dekat.',
  '可以问金迪奥的历史、某个镇的故事、去哪儿吃，或附近的路线。',
  'キンディオの歴史、町の話、食事、近くのルートを聞いてね。',
  '킨디오의 역사, 마을 이야기, 식사, 가까운 경로를 물어보세요.',
])

const listLine = col([
  'En {{where}} te sugiero: {{list}}.',
  'In {{where}} I suggest: {{list}}.',
  'Em {{where}} sugiro: {{list}}.',
  'À {{where}}, je propose : {{list}}.',
  'In {{where}} schlage ich vor: {{list}}.',
  'A {{where}} ti suggerisco: {{list}}.',
  'In {{where}} stel ik voor: {{list}}.',
  'A {{where}} et suggereixo: {{list}}.',
  'I {{where}} föreslår jag: {{list}}.',
  'I {{where}} foreslår jeg: {{list}}.',
  'I {{where}} foreslår jeg: {{list}}.',
  'W {{where}} proponuję: {{list}}.',
  'V {{where}} navrhuji: {{list}}.',
  'În {{where}} îți sugerez: {{list}}.',
  '{{where}} területén ezt javaslom: {{list}}.',
  'Στην περιοχή {{where}} προτείνω: {{list}}.',
  '{{where}} için şunları öneririm: {{list}}.',
  'В {{where}} предлагаю: {{list}}.',
  'У {{where}} пропоную: {{list}}.',
  'في {{where}} أقترح: {{list}}.',
  '{{where}} में सुझाव: {{list}}।',
  'Di {{where}} saya sarankan: {{list}}.',
  '在{{where}}，我建议：{{list}}。',
  '{{where}}なら、{{list}}がいいよ。',
  '{{where}}에서는 {{list}}을 권합니다.',
])

function sameName(place: Attraction, zone: Zone, pool: Attraction[]): Attraction | null {
  const name = normalize(place.name.es)
  return pool.find((item) => item.zone === zone && normalize(item.name.es) === name) ?? null
}

function tokenLength(question: string, place: Attraction): number {
  const name = normalize(place.name.es)
  return question.split(/\s+/).reduce((best, token) => {
    return token.length >= 5 && name.includes(token) ? Math.max(best, token.length) : best
  }, 0)
}

function matchPlace(question: string, pool: Attraction[]): Attraction | null {
  const ranked = pool
    .map((place) => {
      const name = normalize(place.name.es)
      let score = 0
      if (name.length >= 4 && question.includes(name)) score = 100 + name.length
      else {
        const hit = question.split(/\s+/).some((token) => token.length >= 5 && name.includes(token))
        if (hit) score = 40
      }
      if (score === 0) return null
      if (place.featured) score += 30
      if (question.includes(normalize(place.town))) score += 20
      return { place, score }
    })
    .filter((row): row is { place: Attraction; score: number } => row !== null)
    .sort((a, b) => b.score - a.score || a.place.name.es.length - b.place.name.es.length)
  return ranked[0]?.place ?? null
}

function matchZone(question: string): Zone | null {
  for (const row of zoneWords) {
    if (row.words.some((word) => question.includes(normalize(word)))) return row.zone
  }
  return null
}

export function answerQuestion(
  question: string,
  lang: Lang,
  here: Point,
  tastes: Taste[],
  scope?: { places: Attraction[]; towns: string[]; story?: string | null },
): { text: string; place: Attraction | null } {
  const pool = scope?.places ?? attractions
  const towns = scope?.towns ?? municipalities
  const q = normalize(question)
  if (!q) return { text: help[lang], place: null }
  const place = matchPlace(q, pool)
  const wantsHistory = historyWords.some((word) => q.includes(normalize(word)))
  if (wantsHistory && place) {
    if (place.historic) return { text: place.info[lang], place }
    const blurb = place.info[lang]
    return { text: none[lang].replace('{{name}}', place.name[lang]).replace('{{blurb}}', blurb), place }
  }
  if (wantsHistory) return { text: scope?.story || regionHistory(lang), place: null }

  const zone = matchZone(q)
  const named = place && normalize(place.name.es).length >= 4 && q.includes(normalize(place.name.es))
  const picked = named && zone && place.zone !== zone ? (sameName(place, zone, pool) ?? place) : place
  if (named && picked) return { text: picked.info[lang], place: picked }

  const town = towns.find((name) => q.includes(normalize(name)))
  const token = place ? tokenLength(q, place) : 0
  const tokenIsTown = Boolean(town && token === normalize(town).length)
  if (zone && (token < 6 || tokenIsTown)) {
    const ranked = pool
      .filter((item) => item.zone === zone && (!town || item.town === town))
      .map((item) => ({ item, distance: distanceMeters(here, item) }))
      .sort((a, b) => a.distance - b.distance)
    if (ranked.length === 0) return { text: help[lang], place: null }
    const nearTown = town ?? ranked[0].item.town
    const found = ranked
      .filter((row) => row.item.town === nearTown)
      .slice(0, 3)
      .map((row) => row.item)
    const names = found.map((item) => item.name[lang]).join(', ')
    return {
      text: listLine[lang].replace('{{where}}', town ?? found[0].town).replace('{{list}}', names),
      place: found[0],
    }
  }

  if (recommendWords.some((word) => q.includes(normalize(word)))) {
    const plan = buildRoute(tastes.length > 0 ? tastes : ['towns', 'nature', 'coffee', 'food'], here, pool)
    return { text: routeSummary(lang, plan), place: plan[0] ?? null }
  }

  if (place) return { text: place.info[lang], place }
  return { text: help[lang], place: null }
}
