import { attractions, municipalities } from './attractions'
import { arubaSeeds } from './aruba'
import boundary from './boundary.json'
import arubaBoundary from './aruba-boundary.json'
import { neighborSeeds } from './neighbors'
import { seedPlaces } from './place-seed'
import { col } from '../i18n/col'
import type { Lang } from '../i18n/languages'
import type { Attraction } from './attractions'
import type { Point } from '../guide/geo'

export type RegionId = 'quindio' | 'aruba' | 'eje'

export type Region = {
  id: RegionId
  title: Record<Lang, string> | null
  story: Record<Lang, string> | null
  places: Attraction[]
  towns: string[]
  home: string
  outline: [number, number][]
  calendar: boolean
}

const quindioRing = boundary as [number, number][]
const arubaRing = arubaBoundary as [number, number][]

const neighborTowns = ['Pereira', 'Manizales', 'Sevilla', 'Caicedonia', 'Alcalá']

const arubaStory = col([
  'Aruba es un país del Reino de los Países Bajos, en el sur del Caribe. La capital es Oranjestad. El 1 de enero de 1986 pasó al estatus aparte: dejó las Antillas Neerlandesas y sigue en el Reino. El parque nacional Arikok ocupa el noreste de la isla. El aeropuerto Reina Beatriz queda junto a Oranjestad.',
  'Aruba is a country of the Kingdom of the Netherlands, in the southern Caribbean. The capital is Oranjestad. On 1 January 1986 it gained status aparte: it left the Netherlands Antilles and remains in the Kingdom. Arikok National Park covers the northeast of the island. Queen Beatrix Airport sits beside Oranjestad.',
  'Aruba é um país do Reino dos Países Baixos, no sul do Caribe. A capital é Oranjestad. Em 1 de janeiro de 1986 passou ao status aparte: deixou as Antilhas Neerlandesas e segue no Reino. O parque nacional Arikok ocupa o nordeste da ilha. O aeroporto Reina Beatrix fica junto a Oranjestad.',
  'Aruba est un pays du Royaume des Pays-Bas, dans le sud de la Caraïbe. La capitale est Oranjestad. Le 1er janvier 1986, elle a obtenu le statut aparte : elle a quitté les Antilles néerlandaises et reste dans le Royaume. Le parc national Arikok occupe le nord-est de l’île. L’aéroport Reine Beatrix est à côté d’Oranjestad.',
  'Aruba ist ein Land des Königreichs der Niederlande, im Süden der Karibik. Die Hauptstadt ist Oranjestad. Am 1. Januar 1986 erhielt es den Status aparte: es verließ die Niederländischen Antillen und bleibt im Königreich. Der Nationalpark Arikok liegt im Nordosten der Insel. Der Flughafen Königin Beatrix liegt bei Oranjestad.',
  'Aruba è un paese del Regno dei Paesi Bassi, nel sud dei Caraibi. La capitale è Oranjestad. Il 1° gennaio 1986 ha ottenuto lo status aparte: ha lasciato le Antille Olandesi e resta nel Regno. Il parco nazionale Arikok occupa il nord-est dell’isola. L’aeroporto Regina Beatrice è accanto a Oranjestad.',
  'Aruba is een land van het Koninkrijk der Nederlanden, in het zuiden van het Caribisch gebied. De hoofdstad is Oranjestad. Op 1 januari 1986 kreeg het de status aparte: het verliet de Nederlandse Antillen en blijft in het Koninkrijk. Nationaal park Arikok ligt in het noordoosten van het eiland. Luchthaven Koningin Beatrix ligt bij Oranjestad.',
  'Aruba és un país del Regne dels Països Baixos, al sud del Carib. La capital és Oranjestad. L’1 de gener de 1986 va passar a l’estatus aparte: va deixar les Antilles Neerlandeses i segueix al Regne. El parc nacional Arikok ocupa el nord-est de l’illa. L’aeroport Reina Beatriu és al costat d’Oranjestad.',
  'Aruba är ett land i Konungariket Nederländerna, i södra Karibien. Huvudstaden är Oranjestad. Den 1 januari 1986 fick ön status aparte: den lämnade Nederländska Antillerna och finns kvar i kungariket. Arikoks nationalpark täcker öns nordost. Flygplatsen Queen Beatrix ligger vid Oranjestad.',
  'Aruba er et land i Kongeriget Nederlandene, i det sydlige Caribien. Hovedstaden er Oranjestad. Den 1. januar 1986 fik øen status aparte: den forlod De Nederlandske Antiller og blev i riget. Arikok nationalpark dækker øens nordøst. Queen Beatrix-lufthavnen ligger ved Oranjestad.',
  'Aruba er et land i Kongeriket Nederlandene, sør i Karibia. Hovedstaden er Oranjestad. 1. januar 1986 fikk øya status aparte: den forlot De nederlandske Antiller og ble i riket. Arikok nasjonalpark dekker nordøst på øya. Queen Beatrix lufthavn ligger ved Oranjestad.',
  'Aruba to kraj Królestwa Niderlandów, na południu Karaibów. Stolicą jest Oranjestad. 1 stycznia 1986 roku uzyskała status aparte: opuściła Antyle Holenderskie i została w Królestwie. Park narodowy Arikok zajmuje północny wschód wyspy. Lotnisko Królowej Beatrycze leży przy Oranjestad.',
  'Aruba je země Nizozemského království na jihu Karibiku. Hlavním městem je Oranjestad. 1. ledna 1986 získala status aparte: odešla z Nizozemských Antil a zůstává v království. Národní park Arikok leží na severovýchodě ostrova. Letiště královny Beatrix je u Oranjestadu.',
  'Aruba este o țară a Regatului Țărilor de Jos, în sudul Caraibelor. Capitala este Oranjestad. La 1 ianuarie 1986 a primit statutul aparte: a părăsit Antilele Olandeze și a rămas în Regat. Parcul național Arikok ocupă nord-estul insulei. Aeroportul Regina Beatrix este lângă Oranjestad.',
  'Aruba a Holland Királyság országa a Karib-tenger déli részén. A főváros Oranjestad. 1986. január 1-jén status aparte lett: kilépett a Holland Antillákból, és a Királyságban maradt. Az Arikok nemzeti park a sziget északkeleti részén van. Beatrix királynő repülőtere Oranjestad mellett fekszik.',
  'Η Αρούμπα είναι χώρα του Βασιλείου των Κάτω Χωρών, στο νότιο Καραϊβικό. Πρωτεύουσα είναι το Οράνιεστατ. Την 1η Ιανουαρίου 1986 απέκτησε το status aparte: άφησε τις Ολλανδικές Αντίλλες και έμεινε στο Βασίλειο. Το εθνικό πάρκο Αρικόκ καλύπτει τα βορειοανατολικά του νησιού. Το αεροδρόμιο Βασίλισσα Βεατρίκη είναι δίπλα στο Οράνιεστατ.',
  'Aruba, Hollanda Krallığı’na bağlı bir ülkedir, Karayipler’in güneyindedir. Başkenti Oranjestad’dır. 1 Ocak 1986’da status aparte aldı: Hollanda Antilleri’nden ayrıldı ve Krallık’ta kaldı. Arikok Milli Parkı adanın kuzeydoğusunu kaplar. Kraliçe Beatrix Havalimanı Oranjestad’ın yanındadır.',
  'Аруба — страна Королевства Нидерландов на юге Карибского моря. Столица — Ораньестад. 1 января 1986 года она получила status aparte: вышла из Нидерландских Антильских островов и осталась в Королевстве. Национальный парк Арикок занимает северо-восток острова. Аэропорт королевы Беатрикс рядом с Ораньестадом.',
  'Аруба — країна Королівства Нідерландів на півдні Карибського моря. Столиця — Ораньєстад. 1 січня 1986 року вона отримала status aparte: вийшла з Нідерландських Антильських островів і лишилася в Королівстві. Національний парк Арікок займає північний схід острова. Аеропорт королеви Беатрікс поруч з Ораньєстадом.',
  'أروبا بلد في مملكة هولندا، جنوب الكاريبي. العاصمة أورانجيستاد. في 1 يناير 1986 نالت وضع الاستقلال الداخلي: خرجت من جزر الأنتيل الهولندية وبقيت في المملكة. حديقة أريكوك الوطنية تغطي شمال شرق الجزيرة. مطار الملكة بياتريكس بجانب أورانجيستاد.',
  'अरूबा नीदरलैंड साम्राज्य का देश है, कैरिबियन के दक्षिण में। राजधानी ओरान्येस्टाद है। 1 जनवरी 1986 को इसे स्टेटस अपार्टे मिला: यह नीदरलैंड एंटीलीज़ से अलग हुआ और साम्राज्य में रहा। अरिकोक राष्ट्रीय उद्यान द्वीप के उत्तर-पूर्व में है। रानी बेट्रिक्स हवाई अड्डा ओरान्येस्टाद के पास है।',
  'Aruba adalah negara di Kerajaan Belanda, di selatan Karibia. Ibukotanya Oranjestad. Pada 1 Januari 1986 pulau ini memperoleh status aparte: meninggalkan Antillen Belanda dan tetap di Kerajaan. Taman Nasional Arikok ada di timur laut pulau. Bandara Ratu Beatrix berada di samping Oranjestad.',
  '阿鲁巴是荷兰王国的一个国家，位于加勒比海南部。首都是奥拉涅斯塔德。1986年1月1日获得单独地位：离开荷属安的列斯，仍留在王国之内。阿里科克国家公园位于岛的东北部。贝娅特丽克丝女王机场在奥拉涅斯塔德旁边。',
  'アルバはオランダ王国の国で、カリブ海の南部にある。首都はオラニエスタッド。1986年1月1日に分離地位となった。オランダ領アンティルを離れ、王国には残った。アリコック国立公園は島の北東にある。ベアトリクス女王空港はオラニエスタッドのそばだ。',
  '아루바는 네덜란드 왕국의 나라로, 카리브해 남쪽에 있다. 수도는 오라녜스타트다. 1986년 1월 1일 별도 지위를 얻었다. 네덜란드령 안틸레스에서 나왔고 왕국에는 남았다. 아리콕 국립공원은 섬 북동부에 있다. 베아트릭스 여왕 공항은 오라녜스타트 옆에 있다.',
])

const ejeStory = col([
  'Este mapa suma Pereira, Manizales y tres pueblos del norte del Valle —Sevilla, Caicedonia y Alcalá— al Quindío. Pereira es la capital de Risaralda y Manizales la de Caldas. La ruta de un día no cruza de una ciudad a otra.',
  'This map adds Pereira, Manizales and three towns of northern Valle —Sevilla, Caicedonia and Alcalá— to Quindío. Pereira is the capital of Risaralda and Manizales the capital of Caldas. A one-day route does not jump from one city to another.',
  'Este mapa soma Pereira, Manizales e três povoados do norte do Valle —Sevilla, Caicedonia e Alcalá— ao Quindío. Pereira é a capital de Risaralda e Manizales a de Caldas. A rota de um dia não cruza de uma cidade a outra.',
  'Cette carte ajoute Pereira, Manizales et trois villages du nord du Valle —Sevilla, Caicedonia et Alcalá— au Quindío. Pereira est la capitale du Risaralda et Manizales celle du Caldas. La route d’une journée ne saute pas d’une ville à l’autre.',
  'Diese Karte fügt Pereira, Manizales und drei Orte im Norden des Valle —Sevilla, Caicedonia und Alcalá— zu Quindío hinzu. Pereira ist die Hauptstadt von Risaralda, Manizales die von Caldas. Eine Tagesroute springt nicht von Stadt zu Stadt.',
  'Questa mappa aggiunge Pereira, Manizales e tre paesi del nord del Valle —Sevilla, Caicedonia e Alcalá— al Quindío. Pereira è il capoluogo di Risaralda e Manizales quello di Caldas. Il percorso di un giorno non salta da una città all’altra.',
  'Deze kaart voegt Pereira, Manizales en drie plaatsen in het noorden van Valle —Sevilla, Caicedonia en Alcalá— toe aan Quindío. Pereira is de hoofdstad van Risaralda en Manizales die van Caldas. Een dagroute springt niet van stad naar stad.',
  'Aquest mapa suma Pereira, Manizales i tres pobles del nord del Valle —Sevilla, Caicedonia i Alcalá— al Quindío. Pereira és la capital de Risaralda i Manizales la de Caldas. La ruta d’un dia no salta d’una ciutat a l’altra.',
  'Den här kartan lägger Pereira, Manizales och tre orter i norra Valle —Sevilla, Caicedonia och Alcalá— till Quindío. Pereira är huvudort i Risaralda och Manizales i Caldas. En dagsrutt hoppar inte från stad till stad.',
  'Dette kort føjer Pereira, Manizales og tre byer i det nordlige Valle —Sevilla, Caicedonia og Alcalá— til Quindío. Pereira er hovedby i Risaralda og Manizales i Caldas. En dagsrute springer ikke fra by til by.',
  'Dette kartet legger Pereira, Manizales og tre steder i nordlige Valle —Sevilla, Caicedonia og Alcalá— til Quindío. Pereira er hovedstad i Risaralda og Manizales i Caldas. En dagsrute hopper ikke fra by til by.',
  'Ta mapa dodaje Pereira, Manizales i trzy miejscowości północnego Valle —Sevilla, Caicedonia i Alcalá— do Quindío. Pereira jest stolicą Risaraldy, a Manizales stolicą Caldas. Trasa jednego dnia nie przeskakuje z miasta do miasta.',
  'Tato mapa přidává Pereira, Manizales a tři obce na severu Valle —Sevilla, Caicedonia a Alcalá— ke Quindíu. Pereira je hlavní město Risaraldy a Manizales Caldasu. Denní trasa nepřeskakuje z města do města.',
  'Această hartă adaugă Pereira, Manizales și trei orașe din nordul Valle —Sevilla, Caicedonia și Alcalá— la Quindío. Pereira este capitala Risaralda, iar Manizales a Caldas. Traseul de o zi nu sare dintr-un oraș în altul.',
  'Ez a térkép Pereira, Manizales és a Valle északi három települése —Sevilla, Caicedonia és Alcalá— kerül Quindío mellé. Pereira Risaralda, Manizales Caldas fővárosa. Az egynapos út nem ugrik városról városra.',
  'Αυτός ο χάρτης προσθέτει την Περέιρα, τη Μανιθάλες και τρεις κωμοπόλεις του βόρειου Βάγιε —Σεβίγια, Καϊσεδονία και Αλκαλά— στο Κινδίο. Η Περέιρα είναι πρωτεύουσα της Ρισαράλδα και η Μανιθάλες της Κάλντας. Η διαδρομή μιας μέρας δεν πηδά από πόλη σε πόλη.',
  'Bu harita Pereira, Manizales ve Valle’nin kuzeyindeki üç kenti —Sevilla, Caicedonia ve Alcalá— Quindío’ya ekler. Pereira Risaralda’nın, Manizales Caldas’ın başkentidir. Bir günlük rota bir kentten diğerine atlamaz.',
  'Эта карта добавляет Перейру, Манисалес и три города севера Валье —Севилью, Кайседонию и Алкалу— к Киндио. Перейра — столица Рисаральды, Манисалес — Кальдаса. Маршрут одного дня не перескакивает из города в город.',
  'Ця карта додає Перейру, Манісалес і три міста півночі Вальє —Севілью, Кайседонію й Алкалу— до Кіндіо. Перейра — столиця Рисаральди, Манісалес — Кальдаса. Маршрут одного дня не перескакує з міста в місто.',
  'تضيف هذه الخريطة بيريرا ومانيزاليس وثلاث بلدات في شمال فالي —سيفييا وكايسيدونيا وألكالا— إلى كينديو. بيريرا عاصمة ريسارالدا ومانيزاليس عاصمة كالداس. مسار اليوم الواحد لا يقفز من مدينة إلى أخرى.',
  'यह नक्शा पेरेरा, मनिज़ालेस और वैले के उत्तर के तीन कस्बे —सेविला, काइसेदोनिया और अल्काला— क्विंदियो में जोड़ता है। पेरेरा रिसाराल्दा की और मनिज़ालेस काल्डास की राजधानी है। एक दिन का रास्ता एक शहर से दूसरे में नहीं कूदता।',
  'Peta ini menambah Pereira, Manizales, dan tiga kota di utara Valle —Sevilla, Caicedonia, dan Alcalá— ke Quindío. Pereira adalah ibu kota Risaralda dan Manizales ibu kota Caldas. Rute satu hari tidak meloncat dari kota ke kota.',
  '这张地图把佩雷拉、马尼萨莱斯和瓦莱北部的三个镇——塞维利亚、凯塞多尼亚和阿尔卡拉——加到金迪奥。佩雷拉是里萨拉尔达的首府，马尼萨莱斯是卡尔达斯的首府。一天的路线不会从一座城跳到另一座。',
  'この地図はペレイラ、マニサレス、バジェ北部の三つの町、セビージャ、カイセドニア、アルカラをキンディオに足す。ペレイラはリサラルダの、マニサレスはカルダスの主都だ。一日の道は町から町へ飛び越えない。',
  '이 지도는 페레이라, 마니살레스, 그리고 바예 북쪽의 세 마을 세비야, 카이세도니아, 알칼라를 킨디오에 더한다. 페레이라는 리사랄다의 주도이고 마니살레스는 칼다스의 주도이다. 하루 경로는 도시에서 도시로 건너뛰지 않는다.',
])

const ejeTitle = col([
  'Quindío y vecinos',
  'Quindío and neighbors',
  'Quindío e vizinhos',
  'Quindío et voisins',
  'Quindío und Nachbarn',
  'Quindío e vicini',
  'Quindío en buren',
  'Quindío i veïns',
  'Quindío och grannar',
  'Quindío og naboer',
  'Quindío og naboer',
  'Quindío i sąsiedzi',
  'Quindío a sousedé',
  'Quindío și vecinii',
  'Quindío és a szomszédok',
  'Κινδίο και γείτονες',
  'Quindío ve komşular',
  'Киндио и соседи',
  'Кіндіо і сусіди',
  'كينديو والجيران',
  'क्विंदियो और पड़ोसी',
  'Quindío dan tetangga',
  '金迪奥与邻近',
  'キンディオと近隣',
  '킨디오와 이웃',
])

const arubaTitle = col(Array.from({ length: 25 }, () => 'Aruba'))

export const historyWord = col([
  'Historia', 'History', 'História', 'Histoire', 'Geschichte', 'Storia', 'Geschiedenis', 'Història', 'Historia', 'Historie', 'Historie', 'Historia', 'Historie', 'Istorie', 'Történet', 'Ιστορία', 'Tarih', 'История', 'Історія', 'التاريخ', 'इतिहास', 'Sejarah', '历史', '歴史', '역사',
])

export const fitWord = col([
  'Ver todo', 'See all', 'Ver tudo', 'Tout voir', 'Alles zeigen', 'Vedi tutto', 'Alles zien', 'Veure-ho tot', 'Se allt', 'Se det hele', 'Se alt', 'Zobacz całość', 'Zobrazit vše', 'Vezi tot', 'Egészet', 'Όλα', 'Tümünü gör', 'Показать всё', 'Показати все', 'عرض الكل', 'सब देखें', 'Lihat semua', '看全部', '全体を見る', '전체 보기',
])

export const mapsWord = col([
  'Mapas', 'Maps', 'Mapas', 'Cartes', 'Karten', 'Mappe', 'Kaarten', 'Mapes', 'Kartor', 'Kort', 'Kart', 'Mapy', 'Mapy', 'Hărți', 'Térképek', 'Χάρτες', 'Haritalar', 'Карты', 'Карти', 'خرائط', 'नक्शे', 'Peta', '地图', '地図', '지도',
])

export const wholeMap = col([
  'Mapa completo',
  'Whole map',
  'Mapa completo',
  'Carte complète',
  'Ganze Karte',
  'Mappa intera',
  'Hele kaart',
  'Mapa sencer',
  'Hela kartan',
  'Hele kortet',
  'Hele kartet',
  'Cała mapa',
  'Celá mapa',
  'Harta întreagă',
  'Teljes térkép',
  'Όλος ο χάρτης',
  'Tüm harita',
  'Вся карта',
  'Уся карта',
  'الخريطة كاملة',
  'पूरा नक्शा',
  'Peta utuh',
  '整张地图',
  '地図を踏破',
  '지도 완주',
])

export const stampsNote = col([
  'Cada mapa guarda sus propios sellos.',
  'Each map keeps its own stamps.',
  'Cada mapa guarda os próprios selos.',
  'Chaque carte garde ses propres tampons.',
  'Jede Karte behält ihre eigenen Stempel.',
  'Ogni mappa tiene i propri timbri.',
  'Elke kaart houdt de eigen stempels.',
  'Cada mapa guarda els seus segells.',
  'Varje karta behåller sina egna stämplar.',
  'Hvert kort gemmer sine egne stempler.',
  'Hvert kart beholder sine egne stempler.',
  'Każda mapa trzyma własne pieczątki.',
  'Každá mapa si drží vlastní razítka.',
  'Fiecare hartă își păstrează ștampilele.',
  'Minden térkép a saját pecsétjeit őrzi.',
  'Κάθε χάρτης κρατά τις δικές του σφραγίδες.',
  'Her harita kendi damgalarını saklar.',
  'У каждой карты свои штампы.',
  'Кожна карта зберігає свої печатки.',
  'كل خريطة تحتفظ بأختامها.',
  'हर नक्शा अपनी मुहरें रखता है।',
  'Setiap peta menyimpan stempelnya sendiri.',
  '每张地图各自保存印章。',
  '各地図は自分のスタンプを残す。',
  '지도마다 자기 도장을 따로 둡니다.',
])

export const regionOrder: RegionId[] = ['quindio', 'aruba', 'eje']

export function regionById(id: RegionId): Region {
  if (id === 'aruba') {
    return {
      id,
      title: arubaTitle,
      story: arubaStory,
      places: seedPlaces(arubaSeeds, 1),
      towns: ['Oranjestad', 'Noord', 'Santa Cruz', 'Paradera', 'Savaneta', 'San Nicolaas'],
      home: 'Oranjestad',
      outline: arubaRing,
      calendar: false,
    }
  }
  if (id === 'eje') {
    return {
      id,
      title: ejeTitle,
      story: ejeStory,
      places: [...attractions, ...seedPlaces(neighborSeeds, attractions.length + 1)],
      towns: [...municipalities, ...neighborTowns],
      home: 'Armenia',
      outline: quindioRing,
      calendar: true,
    }
  }
  return {
    id: 'quindio',
    title: null,
    story: null,
    places: attractions,
    towns: [...municipalities],
    home: 'Armenia',
    outline: quindioRing,
    calendar: true,
  }
}

export function townIn(region: Region, name: string): Point | null {
  const place = region.places.find((item) => item.zone === 'town' && item.town === name)
  return place ? { lng: place.lng, lat: place.lat } : null
}

export function homePoint(region: Region, base: string): Point {
  return townIn(region, base) ?? townIn(region, region.home) ?? { lng: region.places[0].lng, lat: region.places[0].lat }
}
