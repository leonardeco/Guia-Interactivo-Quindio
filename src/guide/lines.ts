import type { Attraction, Lang } from '../data/attractions'
import { regionHistory } from '../data/history'
import { col } from '../i18n/col'
import { isCjk } from '../i18n/languages'
import type { Character } from './characters'

const directions = [
  col(['hacia el norte', 'to the north', 'para o norte', 'vers le nord', 'Richtung Norden', 'verso nord', 'naar het noorden', 'cap al nord', 'mot norr', 'mod nord', 'mot nord', 'na północ', 'na sever', 'spre nord', 'észak felé', 'προς βορρά', 'kuzeye', 'на север', 'на північ', 'شمالاً', 'उत्तर की ओर', 'ke utara', '向北', '北へ', '북쪽으로']),
  col(['hacia el noreste', 'to the northeast', 'para o nordeste', 'vers le nord-est', 'Richtung Nordosten', 'verso nord-est', 'naar het noordoosten', 'cap al nord-est', 'mot nordost', 'mod nordøst', 'mot nordøst', 'na północny wschód', 'na severovýchod', 'spre nord-est', 'északkelet felé', 'προς βορειοανατολικά', 'kuzeydoğuya', 'на северо-восток', 'на північний схід', 'شمالاً شرقياً', 'उत्तर-पूर्व की ओर', 'ke timur laut', '向东北', '北東へ', '북동쪽으로']),
  col(['hacia el este', 'to the east', 'para o leste', 'vers l’est', 'Richtung Osten', 'verso est', 'naar het oosten', 'cap a l’est', 'mot öster', 'mod øst', 'mot øst', 'na wschód', 'na východ', 'spre est', 'kelet felé', 'προς ανατολάς', 'doğuya', 'на восток', 'на схід', 'شرقاً', 'पूर्व की ओर', 'ke timur', '向东', '東へ', '동쪽으로']),
  col(['hacia el sureste', 'to the southeast', 'para o sudeste', 'vers le sud-est', 'Richtung Südosten', 'verso sud-est', 'naar het zuidoosten', 'cap al sud-est', 'mot sydost', 'mod sydøst', 'mot sørøst', 'na południowy wschód', 'na jihovýchod', 'spre sud-est', 'délkelet felé', 'προς νοτιοανατολικά', 'güneydoğuya', 'на юго-восток', 'на південний схід', 'جنوباً شرقياً', 'दक्षिण-पूर्व की ओर', 'ke tenggara', '向东南', '南東へ', '남동쪽으로']),
  col(['hacia el sur', 'to the south', 'para o sul', 'vers le sud', 'Richtung Süden', 'verso sud', 'naar het zuiden', 'cap al sud', 'mot söder', 'mod syd', 'mot sør', 'na południe', 'na jih', 'spre sud', 'dél felé', 'προς νότο', 'güneye', 'на юг', 'на південь', 'جنوباً', 'दक्षिण की ओर', 'ke selatan', '向南', '南へ', '남쪽으로']),
  col(['hacia el suroeste', 'to the southwest', 'para o sudoeste', 'vers le sud-ouest', 'Richtung Südwesten', 'verso sud-ovest', 'naar het zuidwesten', 'cap al sud-oest', 'mot sydväst', 'mod sydvest', 'mot sørvest', 'na południowy zachód', 'na jihozápad', 'spre sud-vest', 'délnyugat felé', 'προς νοτιοδυτικά', 'güneybatıya', 'на юго-запад', 'на південний захід', 'جنوباً غرباً', 'दक्षिण-पश्चिम की ओर', 'ke barat daya', '向西南', '南西へ', '남서쪽으로']),
  col(['hacia el oeste', 'to the west', 'para o oeste', 'vers l’ouest', 'Richtung Westen', 'verso ovest', 'naar het westen', 'cap a l’oest', 'mot väster', 'mod vest', 'mot vest', 'na zachód', 'na západ', 'spre vest', 'nyugat felé', 'προς δυσμάς', 'batıya', 'на запад', 'на захід', 'غرباً', 'पश्चिम की ओर', 'ke barat', '向西', '西へ', '서쪽으로']),
  col(['hacia el noroeste', 'to the northwest', 'para o noroeste', 'vers le nord-ouest', 'Richtung Nordwesten', 'verso nord-ovest', 'naar het noordwesten', 'cap al nord-oest', 'mot nordväst', 'mod nordvest', 'mot nordvest', 'na północny zachód', 'na severozápad', 'spre nord-vest', 'északnyugat felé', 'προς βορειοδυτικά', 'kuzeybatıya', 'на северо-запад', 'на північний захід', 'شمالاً غرباً', 'उत्तर-पश्चिम की ओर', 'ke barat laut', '向西北', '北西へ', '북서쪽으로']),
]

export function direction(lang: Lang, compass: number): string {
  return directions[compass]?.[lang] ?? directions[0][lang]
}

export function roundMeters(d: number): number {
  if (d < 20) return 10
  return Math.round(d / 10) * 10
}

/** "350 m" up close, "12,4 km" farther away. English keeps the dot. */
export function formatDistance(lang: Lang, meters: number): string {
  if (meters < 950) return `${roundMeters(meters)} m`
  const km = meters / 1000
  const text = (km >= 10 ? km.toFixed(0) : km.toFixed(1)).replace('.', lang === 'en' ? '.' : ',')
  return `${text} km`
}

const andWord = col(['y', 'and', 'e', 'et', 'und', 'e', 'en', 'i', 'och', 'og', 'og', 'i', 'a', 'și', 'és', 'και', 've', 'и', 'і', 'و', 'और', 'dan', '、', '、', ', '])

export function list(lang: Lang, items: string[]): string {
  if (items.length <= 1) return items.join('')
  if (isCjk(lang)) return items.join('、')
  if (lang === 'ko') return items.join(', ')
  return `${items.slice(0, -1).join(', ')} ${andWord[lang]} ${items[items.length - 1]}`
}

export function heightNote(_lang: Lang, _place: Attraction): string {
  return ''
}

const welcome = col([
  'Bienvenido al Quindío.',
  'Welcome to Quindío.',
  'Bem-vindo ao Quindío.',
  'Bienvenue dans le Quindío.',
  'Willkommen im Quindío.',
  'Benvenuto nel Quindío.',
  'Welkom in Quindío.',
  'Benvingut al Quindío.',
  'Välkommen till Quindío.',
  'Velkommen til Quindío.',
  'Velkommen til Quindío.',
  'Witaj w Quindío.',
  'Vítej v Quindíu.',
  'Bun venit în Quindío.',
  'Üdvözöl a Quindío.',
  'Καλώς ήρθες στο Κινδίο.',
  'Quindío’ya hoş geldin.',
  'Добро пожаловать в Киндио.',
  'Ласкаво просимо до Кіндіо.',
  'أهلاً بك في كينديو.',
  'क्विंदियो में स्वागत है।',
  'Selamat datang di Quindío.',
  '欢迎来到金迪奥。',
  'キンディオへようこそ。',
  '킨디오에 오신 것을 환영합니다.',
])

export function greeting(lang: Lang, guide: Character): string {
  return `${welcome[lang]} ${guide.hello[lang]}`
}

export function parkStory(lang: Lang): string {
  return regionHistory(lang)
}

const emptyRoute = col([
  'Elige al menos un gusto y te preparo una ruta cerca de tu pueblo.',
  'Pick at least one interest and I will plan a route near your town.',
  'Escolha pelo menos um interesse e eu preparo uma rota perto do seu povoado.',
  'Choisissez au moins un goût et je prépare une route près de votre village.',
  'Wähle mindestens ein Interesse, dann plane ich eine Route nahe deinem Ort.',
  'Scegli almeno un interesse e preparo un percorso vicino al tuo paese.',
  'Kies minstens één interesse, dan plan ik een route bij jouw dorp.',
  'Tria almenys un gust i preparo una ruta a prop del teu poble.',
  'Välj minst ett intresse så lägger jag en rutt nära din ort.',
  'Vælg mindst én interesse, så lægger jeg en rute nær din by.',
  'Velg minst én interesse, så legger jeg en rute nær stedet ditt.',
  'Wybierz choć jedno zainteresowanie, a ułożę trasę blisko twojej miejscowości.',
  'Vyber aspoň jeden zájem a sestavím trasu blízko tvého města.',
  'Alege măcar un interes și pregătesc un traseu aproape de orașul tău.',
  'Válassz legalább egy érdeklődést, és a településed közelében tervezek útvonalat.',
  'Διάλεξε τουλάχιστον ένα ενδιαφέρον και ετοιμάζω διαδρομή κοντά στον οικισμό σου.',
  'En az bir ilgi seç, kasabana yakın bir rota kurayım.',
  'Выбери хотя бы один интерес, и я соберу маршрут рядом с твоим городом.',
  'Обери хоча б один інтерес, і я зберу маршрут біля твого міста.',
  'اختر اهتماماً واحداً على الأقل وأرتب مساراً قرب بلدتك.',
  'कम से कम एक पसंद चुनें, मैं आपके कस्बे के पास रास्ता बनाऊँगा।',
  'Pilih setidaknya satu minat, saya susun rute dekat kotamu.',
  '至少选一个兴趣，我就在你的镇子附近安排路线。',
  '好きなものを一つ以上選ぶと、町の近くにルートを作るよ。',
  '관심사를 하나 이상 고르면 마을 가까이에 경로를 짭니다.',
])

const routeLine = col([
  'Armé una ruta corta por {{town}}, con {{n}} paradas: {{list}}. Así no cruzamos todo el Quindío. Si una parada tiene historia, te la cuento al llegar.',
  'I planned a short route around {{town}}, with {{n}} stops: {{list}}. That way we do not cross all of Quindío. If a stop has a history, I will tell it when we arrive.',
  'Montei uma rota curta por {{town}}, com {{n}} paradas: {{list}}. Assim não cruzamos o Quindío inteiro. Se uma parada tem história, eu conto ao chegar.',
  'J’ai préparé une route courte autour de {{town}}, avec {{n}} étapes : {{list}}. Ainsi nous ne traversons pas tout le Quindío. Si une étape a une histoire, je la raconte à l’arrivée.',
  'Ich habe eine kurze Route um {{town}} geplant, mit {{n}} Stationen: {{list}}. So durchqueren wir nicht ganz Quindío. Hat eine Station eine Geschichte, erzähle ich sie bei der Ankunft.',
  'Ho preparato un percorso breve intorno a {{town}}, con {{n}} tappe: {{list}}. Così non attraversiamo tutto il Quindío. Se una tappa ha una storia, la racconto all’arrivo.',
  'Ik plande een korte route rond {{town}}, met {{n}} stops: {{list}}. Zo steken we niet heel Quindío over. Heeft een stop een geschiedenis, dan vertel ik die bij aankomst.',
  'He preparat una ruta curta per {{town}}, amb {{n}} parades: {{list}}. Així no creuem tot el Quindío. Si una parada té història, l’explico en arribar.',
  'Jag lade en kort rutt kring {{town}}, med {{n}} stopp: {{list}}. Så korsar vi inte hela Quindío. Har ett stopp en historia berättar jag den när vi kommer fram.',
  'Jeg lagde en kort rute omkring {{town}} med {{n}} stop: {{list}}. Så krydser vi ikke hele Quindío. Har et stop en historie, fortæller jeg den ved ankomst.',
  'Jeg la en kort rute rundt {{town}}, med {{n}} stopp: {{list}}. Slik krysser vi ikke hele Quindío. Har et stopp en historie, forteller jeg den når vi kommer fram.',
  'Ułożyłem krótką trasę wokół {{town}}, z {{n}} przystankami: {{list}}. Dzięki temu nie przecinamy całego Quindío. Jeśli przystanek ma historię, opowiem ją na miejscu.',
  'Sestavil jsem krátkou trasu kolem {{town}}, s {{n}} zastávkami: {{list}}. Tak nepřejedeme celé Quindío. Má-li zastávka historii, povím ji na místě.',
  'Am pregătit un traseu scurt prin {{town}}, cu {{n}} opriri: {{list}}. Așa nu traversăm tot Quindío. Dacă o oprire are istorie, o spun la sosire.',
  'Rövid útvonalat raktam {{town}} körül, {{n}} állomással: {{list}}. Így nem szeljük át az egész Quindiót. Ha egy állomásnak van története, megérkezéskor elmondom.',
  'Έφτιαξα σύντομη διαδρομή γύρω από {{town}}, με {{n}} στάσεις: {{list}}. Έτσι δεν διασχίζουμε όλο το Κινδίο. Αν μια στάση έχει ιστορία, τη λέω μόλις φτάσουμε.',
  '{{town}} çevresinde kısa bir rota kurdum, {{n}} durak: {{list}}. Böylece tüm Quindío’yu geçmeyiz. Bir durağın tarihi varsa varınca anlatırım.',
  'Я собрал короткий маршрут вокруг {{town}}, {{n}} остановок: {{list}}. Так мы не пересекаем весь Киндио. Если у остановки есть история, расскажу на месте.',
  'Я зібрав короткий маршрут навколо {{town}}, {{n}} зупинок: {{list}}. Так ми не перетинаємо весь Кіндіо. Якщо в зупинки є історія, розкажу на місці.',
  'رتبت مساراً قصيراً حول {{town}}، فيه {{n}} محطات: {{list}}. وهكذا لا نعبر كينديو كلها. إذا كان لمحطة تاريخ أرويه عند الوصول.',
  'मैंने {{town}} के आसपास छोटा रास्ता बनाया, {{n}} पड़ाव: {{list}}। इस तरह हम पूरा क्विंदियो नहीं पार करते। किसी पड़ाव का इतिहास हो तो पहुँचकर सुनाऊँगा।',
  'Saya susun rute pendek di sekitar {{town}}, {{n}} pemberhentian: {{list}}. Jadi kita tidak menyeberangi seluruh Quindío. Jika ada sejarahnya, saya ceritakan saat tiba.',
  '我在{{town}}附近安排了一条短路线，{{n}}站：{{list}}。这样不必穿过整个金迪奥。某一站有历史，到达时我会讲。',
  '{{town}}の周りに短いルートを組んだよ。{{n}}か所：{{list}}。これでキンディオ全体は横断しない。歴史がある場所では着いたときに話すね。',
  '{{town}} 근처에 짧은 경로를 짰습니다. {{n}}곳: {{list}}. 그래서 킨디오 전체를 가로지르지 않습니다. 이야기가 있는 곳은 도착하면 말씀드립니다.',
])

const roadNote = col([
  'La línea sigue las vías principales cuando hay conexión. Si no responde el mapa de vías, es solo una guía recta.',
  'The line follows main roads when there is a connection. If the road map does not answer, it is only a straight guide.',
  'A linha segue as vias principais quando há conexão. Se o mapa de vias não responder, é só um guia reto.',
  'La ligne suit les routes principales s’il y a du réseau. Sinon, ce n’est qu’un guide droit.',
  'Die Linie folgt den Hauptstraßen, wenn Verbindung da ist. Sonst ist sie nur eine gerade Orientierung.',
  'La linea segue le strade principali se c’è connessione. Se la mappa stradale non risponde, è solo una guida dritta.',
  'De lijn volgt de hoofdwegen als er verbinding is. Anders is het alleen een rechte gids.',
  'La línia segueix les vies principals si hi ha connexió. Si no, és només una guia recta.',
  'Linjen följer huvudvägarna när det finns uppkoppling. Annars är den bara en rak hjälp.',
  'Linjen følger hovedvejene, når der er forbindelse. Ellers er den kun en lige guide.',
  'Linjen følger hovedveiene når det er tilkobling. Ellers er den bare en rett hjelp.',
  'Linia idzie głównymi drogami, gdy jest połączenie. Inaczej to tylko prosta wskazówka.',
  'Čára sleduje hlavní silnice, když je spojení. Jinak je to jen přímá nápověda.',
  'Linia urmează drumurile principale când există conexiune. Altfel este doar un ghid drept.',
  'A vonal a főutakat követi, ha van kapcsolat. Különben csak egy egyenes irány.',
  'Η γραμμή ακολουθεί τους κύριους δρόμους όταν υπάρχει σύνδεση. Αλλιώς είναι μόνο ένας ίσιος οδηγός.',
  'Çizgi, bağlantı varken ana yolları izler. Yol haritası cevap vermezse sadece düz bir yön gösterir.',
  'Линия идёт по главным дорогам, когда есть связь. Если карта дорог не отвечает, это только прямая подсказка.',
  'Лінія йде головними дорогами, коли є зв’язок. Якщо карта доріг не відповідає, це лише пряма підказка.',
  'الخط يتبع الطرق الرئيسية عند وجود اتصال. وإلا فهو مجرد دليل مستقيم.',
  'कनेक्शन हो तो रेखा मुख्य सड़कों पर चलती है। नहीं तो वह सीधी दिशा है।',
  'Garis mengikuti jalan utama saat ada koneksi. Jika tidak, itu hanya panduan lurus.',
  '有网络时，线沿着主要公路。如果路网没有回应，它只是一条直线提示。',
  '通信があれば線は主な道をたどる。道路地図が返ってこなければ、まっすぐな目安だよ。',
  '연결이 있으면 선은 주요 도로를 따릅니다. 도로 지도가 응답하지 않으면 직선 안내입니다.',
])

export function routeSummary(lang: Lang, stops: Attraction[]): string {
  if (stops.length === 0) return emptyRoute[lang]
  const town = stops[0]?.town ?? ''
  return routeLine[lang]
    .replace('{{town}}', town)
    .replace('{{n}}', String(stops.length))
    .replace('{{list}}', list(lang, stops.map((stop) => stop.name[lang])))
    + ' ' + roadNote[lang]
}

const nextLine = col([
  'La siguiente parada es {{name}}, a unos {{dist}} {{dir}}.',
  'The next stop is {{name}}, about {{dist}} {{dir}}.',
  'A próxima parada é {{name}}, a uns {{dist}} {{dir}}.',
  'La prochaine étape est {{name}}, à environ {{dist}} {{dir}}.',
  'Der nächste Halt ist {{name}}, etwa {{dist}} {{dir}}.',
  'La prossima tappa è {{name}}, a circa {{dist}} {{dir}}.',
  'De volgende stop is {{name}}, ongeveer {{dist}} {{dir}}.',
  'La següent parada és {{name}}, a uns {{dist}} {{dir}}.',
  'Nästa stopp är {{name}}, ungefär {{dist}} {{dir}}.',
  'Næste stop er {{name}}, omkring {{dist}} {{dir}}.',
  'Neste stopp er {{name}}, omtrent {{dist}} {{dir}}.',
  'Następny przystanek to {{name}}, około {{dist}} {{dir}}.',
  'Další zastávka je {{name}}, asi {{dist}} {{dir}}.',
  'Următoarea oprire este {{name}}, cam {{dist}} {{dir}}.',
  'A következő állomás {{name}}, körülbelül {{dist}} {{dir}}.',
  'Η επόμενη στάση είναι {{name}}, περίπου {{dist}} {{dir}}.',
  'Sonraki durak {{name}}, yaklaşık {{dist}} {{dir}}.',
  'Следующая остановка — {{name}}, примерно {{dist}} {{dir}}.',
  'Наступна зупинка — {{name}}, приблизно {{dist}} {{dir}}.',
  'المحطة التالية {{name}}، على نحو {{dist}} {{dir}}.',
  'अगला पड़ाव {{name}} है, लगभग {{dist}} {{dir}}।',
  'Pemberhentian berikut {{name}}, sekitar {{dist}} {{dir}}.',
  '下一站是{{name}}，大约{{dist}}{{dir}}。',
  '次は{{name}}。およそ{{dist}}、{{dir}}。',
  '다음 장소는 {{name}}입니다. 약 {{dist}} {{dir}}.',
])

export function nextStop(lang: Lang, stop: Attraction, distance: number, compass: number): string {
  return nextLine[lang]
    .replace('{{name}}', stop.name[lang])
    .replace('{{dist}}', formatDistance(lang, distance))
    .replace('{{dir}}', direction(lang, compass))
}

const arrived = col([
  '¡Llegaste a {{name}}! Este es tu sello número {{n}}.',
  'You have arrived at {{name}}. This is stamp number {{n}}.',
  'Você chegou a {{name}}. Este é o seu selo número {{n}}.',
  'Vous êtes arrivé à {{name}}. Voici le tampon numéro {{n}}.',
  'Du bist bei {{name}} angekommen. Das ist Stempel Nummer {{n}}.',
  'Sei arrivato a {{name}}. Questo è il timbro numero {{n}}.',
  'Je bent bij {{name}}. Dit is stempel nummer {{n}}.',
  'Has arribat a {{name}}. Aquest és el segell número {{n}}.',
  'Du har kommit till {{name}}. Det här är stämpel nummer {{n}}.',
  'Du er nået til {{name}}. Det er stempel nummer {{n}}.',
  'Du er kommet til {{name}}. Dette er stempel nummer {{n}}.',
  'Dotarłeś do {{name}}. To pieczątka numer {{n}}.',
  'Dorazil jsi do {{name}}. Tohle je razítko číslo {{n}}.',
  'Ai ajuns la {{name}}. Aceasta este ștampila numărul {{n}}.',
  'Megérkeztél ide: {{name}}. Ez a {{n}}. pecsét.',
  'Έφτασες στο {{name}}. Αυτή είναι η σφραγίδα αριθμός {{n}}.',
  '{{name}} noktasına vardın. Bu {{n}} numaralı mühür.',
  'Ты прибыл в {{name}}. Это печать номер {{n}}.',
  'Ти прибув до {{name}}. Це печатка номер {{n}}.',
  'وصلت إلى {{name}}. هذا الختم رقم {{n}}.',
  'आप {{name}} पहुँच गए। यह मुहर संख्या {{n}} है।',
  'Anda sampai di {{name}}. Ini stempel nomor {{n}}.',
  '你到了{{name}}。这是第{{n}}枚印章。',
  '{{name}}に着いたよ。{{n}}個目のスタンプだ。',
  '{{name}}에 도착했습니다. {{n}}번째 도장입니다.',
])

export function arrival(lang: Lang, place: Attraction, stamp: number): string {
  const head = arrived[lang].replace('{{name}}', place.name[lang]).replace('{{n}}', String(stamp))
  return `${head} ${place.info[lang]}`
}

export function aboutPlace(lang: Lang, place: Attraction): string {
  const stop = isCjk(lang) ? '。' : '. '
  return `${place.name[lang]}${stop}${place.info[lang]}`
}

const hereLine = col([
  'Estás cerca de {{name}}, en {{town}}, a unos {{dist}}.',
  'You are near {{name}}, in {{town}}, about {{dist}} away.',
  'Você está perto de {{name}}, em {{town}}, a uns {{dist}}.',
  'Vous êtes près de {{name}}, à {{town}}, à environ {{dist}}.',
  'Du bist nahe bei {{name}}, in {{town}}, etwa {{dist}} entfernt.',
  'Sei vicino a {{name}}, a {{town}}, a circa {{dist}}.',
  'Je bent bij {{name}}, in {{town}}, ongeveer {{dist}} hiervandaan.',
  'Ets a prop de {{name}}, a {{town}}, a uns {{dist}}.',
  'Du är nära {{name}} i {{town}}, ungefär {{dist}} bort.',
  'Du er tæt på {{name}} i {{town}}, omkring {{dist}} væk.',
  'Du er nær {{name}} i {{town}}, omtrent {{dist}} unna.',
  'Jesteś blisko {{name}}, w {{town}}, około {{dist}} stąd.',
  'Jsi blízko {{name}} ve městě {{town}}, asi {{dist}} odtud.',
  'Ești aproape de {{name}}, în {{town}}, cam la {{dist}}.',
  '{{name}} közelében vagy, {{town}} településen, körülbelül {{dist}}.',
  'Είσαι κοντά στο {{name}}, στην περιοχή {{town}}, περίπου {{dist}}.',
  '{{town}} içindeki {{name}} yakınındasın, yaklaşık {{dist}}.',
  'Ты рядом с {{name}}, в {{town}}, примерно в {{dist}}.',
  'Ти біля {{name}}, у {{town}}, приблизно за {{dist}}.',
  'أنت قرب {{name}} في {{town}}، على نحو {{dist}}.',
  'आप {{town}} में {{name}} के पास हैं, लगभग {{dist}}।',
  'Anda dekat {{name}} di {{town}}, sekitar {{dist}}.',
  '你在{{town}}的{{name}}附近，大约{{dist}}。',
  '{{town}}の{{name}}の近く、およそ{{dist}}だよ。',
  '{{town}}의 {{name}} 근처입니다. 약 {{dist}}.',
])

const alsoLine = col([
  'Muy cerca también tienes {{list}}.',
  'Also close by: {{list}}.',
  'Bem perto também estão {{list}}.',
  'Tout près, il y a aussi {{list}}.',
  'Ganz in der Nähe sind auch {{list}}.',
  'Molto vicino ci sono anche {{list}}.',
  'Dichtbij zijn ook {{list}}.',
  'Molt a prop també tens {{list}}.',
  'Alldeles nära finns också {{list}}.',
  'Lige i nærheden er der også {{list}}.',
  'Like ved er det også {{list}}.',
  'Tuż obok są też {{list}}.',
  'Hned vedle jsou i {{list}}.',
  'Foarte aproape sunt și {{list}}.',
  'Egészen közel van még: {{list}}.',
  'Πολύ κοντά είναι και {{list}}.',
  'Hemen yanında bir de {{list}} var.',
  'Совсем рядом ещё {{list}}.',
  'Зовсім поруч ще {{list}}.',
  'وبالقرب أيضاً {{list}}.',
  'बिल्कुल पास में {{list}} भी है।',
  'Di dekatnya juga ada {{list}}.',
  '附近还有{{list}}。',
  'すぐ近くに{{list}}もあるよ。',
  '바로 옆에 {{list}}도 있습니다.',
])

export function whereAmI(lang: Lang, near: { place: Attraction; distance: number }[]): string {
  const [first, ...rest] = near
  if (!first) return ''
  const main = hereLine[lang]
    .replace('{{name}}', first.place.name[lang])
    .replace('{{town}}', first.place.town)
    .replace('{{dist}}', formatDistance(lang, first.distance))
  if (rest.length === 0) return main
  return `${main} ${alsoLine[lang].replace('{{list}}', list(lang, rest.map((item) => item.place.name[lang])))}`
}

const hintOn = col([
  'Toca «Siguiente parada» y te llevo, o «Ubícame» si ya estás en el Quindío. También puedes tocar un lugar del mapa.',
  'Tap “Next stop” and I will lead you, or “Find me” if you are already in Quindío. You can also tap a place on the map.',
  'Toque em «Próxima parada» e eu te levo, ou em «Me localizar» se já estiver no Quindío. Você também pode tocar um lugar no mapa.',
  'Touchez « Étape suivante » et je vous guide, ou « Me localiser » si vous êtes déjà dans le Quindío. Vous pouvez aussi toucher un lieu sur la carte.',
  'Tippe auf „Nächster Halt“ und ich führe dich, oder auf „Orte mich“, wenn du schon im Quindío bist. Du kannst auch einen Ort auf der Karte antippen.',
  'Tocca «Prossima tappa» e ti accompagno, oppure «Trovami» se sei già nel Quindío. Puoi anche toccare un luogo sulla mappa.',
  'Tik op „Volgende stop” en ik leid je, of op „Vind mij” als je al in Quindío bent. Je kunt ook een plek op de kaart tikken.',
  'Toca «Parada següent» i t’acompanyo, o «Ubica’m» si ja ets al Quindío. També pots tocar un lloc del mapa.',
  'Tryck på „Nästa stopp” så leder jag dig, eller „Hitta mig” om du redan är i Quindío. Du kan också trycka på en plats på kartan.',
  'Tryk på „Næste stop”, så fører jeg dig, eller „Find mig”, hvis du allerede er i Quindío. Du kan også trykke på et sted på kortet.',
  'Trykk på „Neste stopp”, så leder jeg deg, eller „Finn meg” hvis du allerede er i Quindío. Du kan også trykke på et sted på kartet.',
  'Dotknij „Następny przystanek”, a poprowadzę cię, albo „Znajdź mnie”, jeśli już jesteś w Quindío. Możesz też dotknąć miejsca na mapie.',
  'Klepni na „Další zastávka” a provedu tě, nebo na „Najdi mě”, pokud už jsi v Quindíu. Můžeš také klepnout na místo na mapě.',
  'Atinge „Următoarea oprire” și te conduc, sau „Găsește-mă” dacă ești deja în Quindío. Poți atinge și un loc de pe hartă.',
  'Koppints a „Következő állomás” gombra, és vezetlek, vagy a „Találj meg” gombra, ha már Quindióban vagy. A térképen is érinthetsz egy helyet.',
  'Πάτα «Επόμενη στάση» και σε οδηγώ, ή «Βρες με» αν είσαι ήδη στο Κινδίο. Μπορείς και να πατήσεις ένα μέρος στον χάρτη.',
  '“Sonraki durak”a dokun, götüreyim; Quindío’daysan “Beni bul”. Haritadaki bir yere de dokunabilirsin.',
  'Нажми «Следующая остановка», и я поведу, или «Найди меня», если ты уже в Киндио. Можно и нажать место на карте.',
  'Натисни «Наступна зупинка», і я поведу, або «Знайди мене», якщо ти вже в Кіндіо. Можна й натиснути місце на карті.',
  'المس «المحطة التالية» أقودك، أو «حدّد موقعي» إن كنت في كينديو. يمكنك أيضاً لمس مكان على الخريطة.',
  '«अगला पड़ाव» छुएँ, मैं ले चलूँगा, या क्विंदियो में हों तो «मुझे ढूँढें»। नक्शे पर जगह भी छू सकते हैं।',
  'Ketuk “Pemberhentian berikut” dan saya antar, atau “Temukan saya” jika sudah di Quindío. Anda juga bisa mengetuk tempat di peta.',
  '点“下一站”，我来带路；如果已经在金迪奥，点“定位我”。也可以点地图上的地点。',
  '「次の目的地」をタップすると案内するよ。もうキンディオにいるなら「現在地」。地図の場所をタップしてもいい。',
  '“다음 장소”를 누르면 안내합니다. 이미 킨디오에 있으면 “내 위치”를 누르세요. 지도의 장소도 누를 수 있습니다.',
])

const hintOff = col([
  'Toca un lugar del mapa y te cuento qué hay allí. Si ya estás en el Quindío, toca «Ubícame».',
  'Tap a place on the map and I will tell you what is there. If you are already in Quindío, tap “Find me”.',
  'Toque um lugar no mapa e eu conto o que há lá. Se já estiver no Quindío, toque em «Me localizar».',
  'Touchez un lieu sur la carte et je vous raconte ce qu’il y a. Si vous êtes déjà dans le Quindío, touchez « Me localiser ».',
  'Tippe auf einen Ort auf der Karte und ich erzähle, was dort ist. Wenn du schon im Quindío bist, tippe auf „Orte mich“.',
  'Tocca un luogo sulla mappa e ti racconto cosa c’è. Se sei già nel Quindío, tocca «Trovami».',
  'Tik een plek op de kaart aan en ik vertel wat er is. Ben je al in Quindío, tik op „Vind mij”.',
  'Toca un lloc del mapa i t’explico què hi ha. Si ja ets al Quindío, toca «Ubica’m».',
  'Tryck på en plats på kartan så berättar jag vad som finns där. Är du redan i Quindío, tryck på „Hitta mig”.',
  'Tryk på et sted på kortet, så fortæller jeg, hvad der er. Er du allerede i Quindío, tryk på „Find mig”.',
  'Trykk på et sted på kartet, så forteller jeg hva som er der. Er du allerede i Quindío, trykk på „Finn meg”.',
  'Dotknij miejsca na mapie, a opowiem, co tam jest. Jeśli już jesteś w Quindío, dotknij „Znajdź mnie”.',
  'Klepni na místo na mapě a povím, co tam je. Pokud už jsi v Quindíu, klepni na „Najdi mě”.',
  'Atinge un loc de pe hartă și îți spun ce este acolo. Dacă ești deja în Quindío, atinge „Găsește-mă”.',
  'Érints meg egy helyet a térképen, és elmondom, mi van ott. Ha már Quindióban vagy, koppints a „Találj meg” gombra.',
  'Πάτα ένα μέρος στον χάρτη και λέω τι υπάρχει. Αν είσαι ήδη στο Κινδίο, πάτα «Βρες με».',
  'Haritada bir yere dokun, orada ne var anlatayım. Quindío’daysan “Beni bul”a dokun.',
  'Нажми место на карте, и я расскажу, что там. Если ты уже в Киндио, нажми «Найди меня».',
  'Натисни місце на карті, і я розкажу, що там. Якщо ти вже в Кіндіо, натисни «Знайди мене».',
  'المس مكاناً على الخريطة أروي ما فيه. إن كنت في كينديو فالمس «حدّد موقعي».',
  'नक्शे पर जगह छुएँ, मैं बताऊँगा वहाँ क्या है। क्विंदियो में हों तो «मुझे ढूँढें» छुएँ।',
  'Ketuk tempat di peta dan saya ceritakan isinya. Jika sudah di Quindío, ketuk “Temukan saya”.',
  '点地图上的地点，我来讲那里有什么。如果已经在金迪奥，点“定位我”。',
  '地図の場所をタップすると、そこにあるものを話すよ。もうキンディオにいるなら「現在地」。',
  '지도의 장소를 누르면 거기 무엇이 있는지 말씀드립니다. 이미 킨디오에 있으면 “내 위치”를 누르세요.',
])

export function startHint(lang: Lang, hasRoute: boolean): string {
  return hasRoute ? hintOn[lang] : hintOff[lang]
}

const doneLine = col([
  '¡Completaste la ruta! Llevas {{n}} sellos en el pasaporte del Quindío. Puedes armar otra o explorar el mapa.',
  'You finished the route! You have {{n}} stamps in the Quindío passport. You can plan another or explore the map.',
  'Você completou a rota! Tem {{n}} selos no passaporte do Quindío. Pode montar outra ou explorar o mapa.',
  'Itinéraire terminé ! Vous avez {{n}} tampons dans le passeport du Quindío. Vous pouvez en préparer un autre ou explorer la carte.',
  'Du hast die Route geschafft! Du hast {{n}} Stempel im Quindío-Pass. Du kannst eine neue planen oder die Karte erkunden.',
  'Hai completato il percorso! Hai {{n}} timbri nel passaporto del Quindío. Puoi prepararne un altro o esplorare la mappa.',
  'Je hebt de route af! Je hebt {{n}} stempels in het Quindío-paspoort. Je kunt een nieuwe plannen of de kaart verkennen.',
  'Has completat la ruta! Tens {{n}} segells al passaport del Quindío. Pots preparar-ne una altra o explorar el mapa.',
  'Du klarade rutten! Du har {{n}} stämplar i Quindíopasset. Du kan lägga en ny eller utforska kartan.',
  'Du klarede ruten! Du har {{n}} stempler i Quindío-passet. Du kan lave en ny eller udforske kortet.',
  'Du fullførte ruten! Du har {{n}} stempler i Quindío-passet. Du kan lage en ny eller utforske kartet.',
  'Ukończyłeś trasę! Masz {{n}} pieczątek w paszporcie Quindío. Możesz ułożyć następną albo zwiedzać mapę.',
  'Dokončil jsi trasu! Máš {{n}} razítek v pasu Quindía. Můžeš sestavit další nebo prozkoumat mapu.',
  'Ai terminat traseul! Ai {{n}} ștampile în pașaportul Quindío. Poți face altul sau explora harta.',
  'Végigjártad az útvonalat! {{n}} pecséted van a Quindío-útlevélben. Készíthetsz másikat, vagy nézheted a térképet.',
  'Ολοκλήρωσες τη διαδρομή! Έχεις {{n}} σφραγίδες στο διαβατήριο του Κινδίο. Μπορείς να φτιάξεις άλλη ή να εξερευνήσεις τον χάρτη.',
  'Rotayı bitirdin! Quindío pasaportunda {{n}} mühür var. Yenisini kurabilir ya da haritayı gezebilirsin.',
  'Ты закончил маршрут! В паспорте Киндио {{n}} печатей. Можно собрать другой или смотреть карту.',
  'Ти завершив маршрут! У паспорті Кіндіо {{n}} печаток. Можна зібрати інший або дивитися карту.',
  'أنهيت المسار! معك {{n}} أختام في جواز كينديو. يمكنك ترتيب آخر أو استكشاف الخريطة.',
  'रास्ता पूरा हुआ! क्विंदियो पासपोर्ट में {{n}} मुहरें हैं। दूसरा बना सकते हैं या नक्शा देख सकते हैं।',
  'Rute selesai! Anda punya {{n}} stempel di paspor Quindío. Bisa menyusun yang lain atau menjelajah peta.',
  '路线走完了！金迪奥护照上有{{n}}枚印章。可以再安排一条，或自己看地图。',
  'ルートを歩き終えたよ。キンディオのパスポートにスタンプが{{n}}個。もう一つ作るか、地図を見て回ってね。',
  '경로를 마쳤습니다. 킨디오 여권에 도장이 {{n}}개 있습니다. 다른 경로를 짜거나 지도를 둘러보세요.',
])

export function routeDone(lang: Lang, stamps: number): string {
  return doneLine[lang].replace('{{n}}', String(stamps))
}

const levelLine = col([
  '¡Subiste al nivel {{level}}! Ahora eres {{title}}.',
  'You reached level {{level}}. You are now {{title}}.',
  'Você subiu para o nível {{level}}. Agora você é {{title}}.',
  'Vous passez au niveau {{level}}. Vous êtes maintenant {{title}}.',
  'Du hast Level {{level}} erreicht. Du bist jetzt {{title}}.',
  'Sei salito al livello {{level}}. Ora sei {{title}}.',
  'Je bent niveau {{level}}. Je bent nu {{title}}.',
  'Has pujat al nivell {{level}}. Ara ets {{title}}.',
  'Du nådde nivå {{level}}. Nu är du {{title}}.',
  'Du nåede niveau {{level}}. Nu er du {{title}}.',
  'Du nådde nivå {{level}}. Nå er du {{title}}.',
  'Wszedłeś na poziom {{level}}. Teraz jesteś {{title}}.',
  'Postoupil jsi na úroveň {{level}}. Teď jsi {{title}}.',
  'Ai urcat la nivelul {{level}}. Acum ești {{title}}.',
  'Elérted a {{level}}. szintet. Most {{title}} vagy.',
  'Ανέβηκες στο επίπεδο {{level}}. Τώρα είσαι {{title}}.',
  '{{level}}. seviyeye çıktın. Artık {{title}}sin.',
  'Ты достиг уровня {{level}}. Теперь ты {{title}}.',
  'Ти досяг рівня {{level}}. Тепер ти {{title}}.',
  'صعدت إلى المستوى {{level}}. أنت الآن {{title}}.',
  'आप स्तर {{level}} पर पहुँचे। अब आप {{title}} हैं।',
  'Anda naik ke tingkat {{level}}. Sekarang Anda {{title}}.',
  '你升到了{{level}}级。现在你是{{title}}。',
  'レベル{{level}}になったよ。今のあなたは{{title}}。',
  '레벨 {{level}}이 되었습니다. 이제 {{title}}입니다.',
])

export function levelUpLine(lang: Lang, level: number, title: string): string {
  return levelLine[lang].replace('{{level}}', String(level)).replace('{{title}}', title)
}

const badge = col([
  '¡Ganaste la medalla {{name}}!',
  'You earned the {{name}} badge.',
  'Você ganhou a medalha {{name}}.',
  'Vous gagnez la médaille {{name}}.',
  'Du hast das Abzeichen {{name}} bekommen.',
  'Hai vinto la medaglia {{name}}.',
  'Je hebt de medaille {{name}} verdiend.',
  'Has guanyat la medalla {{name}}.',
  'Du fick medaljen {{name}}.',
  'Du fik medaljen {{name}}.',
  'Du fikk medaljen {{name}}.',
  'Zdobyłeś medal {{name}}.',
  'Získal jsi medaili {{name}}.',
  'Ai câștigat medalia {{name}}.',
  'Megkaptad a(z) {{name}} érmet.',
  'Κέρδισες το μετάλλιο {{name}}.',
  '{{name}} madalyasını kazandın.',
  'Ты получил медаль {{name}}.',
  'Ти отримав медаль {{name}}.',
  'حصلت على وسام {{name}}.',
  'आपको पदक {{name}} मिला।',
  'Anda mendapat medali {{name}}.',
  '你获得了“{{name}}”奖章。',
  'メダル「{{name}}」を手に入れたよ。',
  '‘{{name}}’ 메달을 받았습니다.',
])

export function badgeLine(lang: Lang, name: string): string {
  return badge[lang].replace('{{name}}', name)
}

const gpsSearching = col([
  'Estoy buscando tu ubicación. Si el navegador te lo pide, permite el acceso.',
  'I am looking for your location. If the browser asks, allow access.',
  'Estou procurando sua localização. Se o navegador pedir, permita o acesso.',
  'Je cherche votre position. Si le navigateur le demande, autorisez l’accès.',
  'Ich suche deinen Standort. Wenn der Browser fragt, erlaube den Zugriff.',
  'Sto cercando la tua posizione. Se il browser lo chiede, consenti l’accesso.',
  'Ik zoek je locatie. Als de browser het vraagt, sta toegang toe.',
  'Estic buscant la teva ubicació. Si el navegador ho demana, permet l’accés.',
  'Jag letar efter din plats. Om webbläsaren frågar, tillåt åtkomst.',
  'Jeg leder efter din placering. Hvis browseren spørger, så tillad adgang.',
  'Jeg leter etter posisjonen din. Hvis nettleseren spør, tillat tilgang.',
  'Szukam twojej lokalizacji. Jeśli przeglądarka pyta, zezwól na dostęp.',
  'Hledám tvou polohu. Pokud se prohlížeč zeptá, povol přístup.',
  'Îți caut locația. Dacă browserul întreabă, permite accesul.',
  'Keresem a helyzetedet. Ha a böngésző kéri, engedélyezd.',
  'Ψάχνω τη θέση σου. Αν ο browser ρωτήσει, επίτρεψε την πρόσβαση.',
  'Konumunu arıyorum. Tarayıcı sorarsa erişime izin ver.',
  'Ищу твоё местоположение. Если браузер спросит, разреши доступ.',
  'Шукаю твоє місце. Якщо браузер запитає, дозволь доступ.',
  'أبحث عن موقعك. إذا طلب المتصفح، اسمح بالوصول.',
  'आपका स्थान ढूँढ रहा हूँ। ब्राउज़र पूछे तो अनुमति दें।',
  'Saya mencari lokasi Anda. Jika peramban bertanya, izinkan akses.',
  '我在找你的位置。如果浏览器询问，请允许。',
  '現在地を探しているよ。ブラウザに聞かれたら許可してね。',
  '위치를 찾고 있습니다. 브라우저가 물으면 허용해 주세요.',
])

const gpsOn = col([
  '¡Te encontré! Camino contigo. Cuando llegues a un lugar, marco el sello si el GPS alcanza.',
  'Found you. I walk with you. When you reach a place, I stamp it if the GPS is close enough.',
  'Te encontrei. Caminho com você. Quando chegar a um lugar, marco o selo se o GPS alcançar.',
  'Je vous ai trouvé. Je marche avec vous. À l’arrivée, je pose le tampon si le GPS est assez précis.',
  'Ich habe dich gefunden. Ich gehe mit. Am Ort setze ich den Stempel, wenn das GPS genau genug ist.',
  'Ti ho trovato. Cammino con te. All’arrivo metto il timbro se il GPS è abbastanza preciso.',
  'Gevonden. Ik loop met je mee. Bij aankomst zet ik de stempel als de GPS nauwkeurig genoeg is.',
  'T’he trobat. Camino amb tu. En arribar marco el segell si el GPS és prou precís.',
  'Jag hittade dig. Jag går med dig. När du kommer fram stämplar jag om GPS:en räcker.',
  'Jeg fandt dig. Jeg går med dig. Når du ankommer, stempler jeg, hvis GPS’en er tæt nok på.',
  'Jeg fant deg. Jeg går med deg. Når du kommer fram, stempler jeg hvis GPS-en er nær nok.',
  'Znalazłem cię. Idę z tobą. Na miejscu postawię pieczątkę, jeśli GPS jest dość dokładny.',
  'Našel jsem tě. Jdu s tebou. Na místě dám razítko, pokud GPS stačí.',
  'Te-am găsit. Merg cu tine. La sosire pun ștampila dacă GPS-ul este destul de precis.',
  'Megtaláltalak. Veled megyek. Érkezéskor pecsételek, ha a GPS elég pontos.',
  'Σε βρήκα. Περπατώ μαζί σου. Μόλις φτάσεις, βάζω σφραγίδα αν το GPS φτάνει.',
  'Seni buldum. Seninle yürürüm. Vardığında, GPS yeterse mühürlerim.',
  'Я тебя нашёл. Иду с тобой. На месте поставлю печать, если GPS достаточно точен.',
  'Я тебе знайшов. Іду з тобою. На місці поставлю печатку, якщо GPS досить точний.',
  'وجدتك. أمشي معك. عند الوصول أضع الختم إذا كان نظام الموقع دقيقاً بما يكفي.',
  'आप मिल गए। मैं साथ चलता हूँ। पहुँचने पर, अगर जीपीएस पास हो तो मुहर लगाऊँगा।',
  'Saya menemukan Anda. Saya berjalan bersama. Saat tiba, saya stempel jika GPS cukup dekat.',
  '找到你了。我和你一起走。到达时，如果定位够近，我就盖章。',
  '見つけたよ。一緒に歩くね。着いたとき、GPSが近ければスタンプを押す。',
  '찾았습니다. 함께 걷습니다. 도착했을 때 GPS가 가까우면 도장을 찍습니다.',
])

const gpsDenied = col([
  'No pude usar el GPS: el permiso está bloqueado. Puedes explorar el mapa y marcar «Llegué» a mano.',
  'I could not use GPS: permission is blocked. You can explore the map and tap “I arrived” yourself.',
  'Não consegui usar o GPS: a permissão está bloqueada. Você pode explorar o mapa e marcar «Cheguei» à mão.',
  'Je n’ai pas pu utiliser le GPS : l’autorisation est bloquée. Vous pouvez explorer la carte et toucher « Je suis arrivé ».',
  'Ich konnte das GPS nicht nutzen: die Erlaubnis ist blockiert. Du kannst die Karte erkunden und „Angekommen“ selbst tippen.',
  'Non ho potuto usare il GPS: il permesso è bloccato. Puoi esplorare la mappa e toccare «Sono arrivato».',
  'Ik kon GPS niet gebruiken: toestemming is geblokkeerd. Je kunt de kaart verkennen en zelf op „Aangekomen” tikken.',
  'No he pogut usar el GPS: el permís està bloquejat. Pots explorar el mapa i tocar «He arribat».',
  'Jag kunde inte använda GPS: tillståndet är blockerat. Du kan utforska kartan och trycka på „Jag är framme”.',
  'Jeg kunne ikke bruge GPS: tilladelsen er blokeret. Du kan udforske kortet og trykke på „Jeg er ankommet”.',
  'Jeg kunne ikke bruke GPS: tillatelsen er blokkert. Du kan utforske kartet og trykke på „Jeg er fremme”.',
  'Nie mogłem użyć GPS: zgoda jest zablokowana. Możesz zwiedzać mapę i sam dotknąć „Dotarłem”.',
  'Nemohl jsem použít GPS: oprávnění je zablokované. Můžeš prozkoumat mapu a klepnout na „Jsem tu”.',
  'Nu am putut folosi GPS: permisiunea este blocată. Poți explora harta și apăsa „Am ajuns”.',
  'Nem tudtam GPS-t használni: az engedély le van tiltva. Nézheted a térképet, és megnyomhatod: „Megérkeztem”.',
  'Δεν μπόρεσα να χρησιμοποιήσω GPS: η άδεια είναι μπλοκαρισμένη. Μπορείς να εξερευνήσεις τον χάρτη και να πατήσεις «Έφτασα».',
  'GPS kullanamadım: izin kapalı. Haritayı gezip “Vardım”a kendin dokunabilirsin.',
  'Не удалось включить GPS: разрешение закрыто. Можно смотреть карту и нажать «Я на месте».',
  'Не вдалося ввімкнути GPS: дозвіл закритий. Можна дивитися карту й натиснути «Я на місці».',
  'لم أستطع استخدام الموقع: الإذن محظور. يمكنك استكشاف الخريطة ولمس «وصلت».',
  'जीपीएस नहीं चल सका: अनुमति बंद है। नक्शा देख सकते हैं और «पहुँच गया» खुद छू सकते हैं।',
  'Saya tidak bisa memakai GPS: izin diblokir. Anda bisa menjelajah peta dan mengetuk “Saya sampai”.',
  '用不了定位：权限被关掉了。你可以看地图，自己点“我到了”。',
  'GPSが使えないよ。許可が止まっている。地図を見て、自分で「着いた」をタップしてね。',
  'GPS를 쓸 수 없습니다. 권한이 막혀 있습니다. 지도를 보고 “도착했어요”를 직접 누르세요.',
])

const gpsOutside = col([
  'Parece que no estás en el Quindío. El mapa sigue disponible para planear el viaje.',
  'It looks like you are not in Quindío. The map is still here so you can plan the trip.',
  'Parece que você não está no Quindío. O mapa continua disponível para planejar a viagem.',
  'Il semble que vous n’êtes pas dans le Quindío. La carte reste là pour préparer le voyage.',
  'Du scheinst nicht im Quindío zu sein. Die Karte bleibt da, damit du die Reise planen kannst.',
  'Sembra che tu non sia nel Quindío. La mappa resta disponibile per pianificare il viaggio.',
  'Het lijkt erop dat je niet in Quindío bent. De kaart blijft beschikbaar om de reis te plannen.',
  'Sembla que no ets al Quindío. El mapa continua disponible per planejar el viatge.',
  'Det verkar som att du inte är i Quindío. Kartan finns kvar så att du kan planera resan.',
  'Det ser ud til, at du ikke er i Quindío. Kortet er der stadig, så du kan planlægge rejsen.',
  'Det ser ut til at du ikke er i Quindío. Kartet er fortsatt der, så du kan planlegge turen.',
  'Wygląda na to, że nie jesteś w Quindío. Mapa zostaje, żeby zaplanować podróż.',
  'Vypadá to, že nejsi v Quindíu. Mapa zůstává, abys mohl naplánovat cestu.',
  'Se pare că nu ești în Quindío. Harta rămâne ca să planifici călătoria.',
  'Úgy tűnik, nem vagy Quindióban. A térkép megmarad, hogy megtervezd az utat.',
  'Φαίνεται πως δεν είσαι στο Κινδίο. Ο χάρτης μένει για να σχεδιάσεις το ταξίδι.',
  'Quindío’da değilsin gibi. Harita duruyor, yolculuğu planlayabilirsin.',
  'Похоже, ты не в Киндио. Карта остаётся, чтобы спланировать поездку.',
  'Схоже, ти не в Кіндіо. Карта лишається, щоб спланувати поїздку.',
  'يبدو أنك لست في كينديو. الخريطة تبقى لتخطيط الرحلة.',
  'लगता है आप क्विंदियो में नहीं हैं। नक्शा यात्रा की योजना के लिए यहीं है।',
  'Sepertinya Anda tidak di Quindío. Peta tetap ada untuk merencanakan perjalanan.',
  '你好像不在金迪奥。地图还在，可以用来计划行程。',
  'キンディオの外にいるみたい。地図はそのままだから、旅の計画はできるよ。',
  '킨디오 밖에 있는 것 같습니다. 지도는 그대로라 여행을 계획할 수 있습니다.',
])

const gpsUnavailable = col([
  'Este teléfono no me deja leer la ubicación. El mapa y la ruta siguen funcionando.',
  'This phone will not share location. The map and the route still work.',
  'Este telefone não deixa ler a localização. O mapa e a rota continuam funcionando.',
  'Ce téléphone ne donne pas la position. La carte et l’itinéraire marchent quand même.',
  'Dieses Telefon gibt den Standort nicht frei. Karte und Route funktionieren trotzdem.',
  'Questo telefono non condivide la posizione. Mappa e percorso funzionano lo stesso.',
  'Deze telefoon deelt de locatie niet. Kaart en route werken nog steeds.',
  'Aquest telèfon no deixa llegir la ubicació. El mapa i la ruta segueixen funcionant.',
  'Den här telefonen delar inte platsen. Kartan och rutten fungerar ändå.',
  'Denne telefon deler ikke placeringen. Kortet og ruten virker stadig.',
  'Denne telefonen deler ikke posisjonen. Kartet og ruten virker likevel.',
  'Ten telefon nie podaje lokalizacji. Mapa i trasa nadal działają.',
  'Tenhle telefon neprozradí polohu. Mapa a trasa pořád fungují.',
  'Telefonul acesta nu dă locația. Harta și traseul merg în continuare.',
  'Ez a telefon nem adja a helyzetet. A térkép és az útvonal így is működik.',
  'Αυτό το τηλέφωνο δεν δίνει τη θέση. Ο χάρτης και η διαδρομή δουλεύουν ακόμα.',
  'Bu telefon konumu vermiyor. Harita ve rota yine çalışır.',
  'Этот телефон не отдаёт местоположение. Карта и маршрут всё равно работают.',
  'Цей телефон не віддає місце. Карта і маршрут усе одно працюють.',
  'هذا الهاتف لا يعطي الموقع. الخريطة والمسار يعملان مع ذلك.',
  'यह फ़ोन स्थान नहीं देता। नक्शा और रास्ता फिर भी चलते हैं।',
  'Ponsel ini tidak memberi lokasi. Peta dan rute tetap jalan.',
  '这部手机不给位置。地图和路线仍然能用。',
  'この電話は位置を渡してくれない。地図とルートはそのまま使えるよ。',
  '이 전화는 위치를 주지 않습니다. 지도와 경로는 그대로 됩니다.',
])

const gpsTable = {
  searching: gpsSearching,
  on: gpsOn,
  denied: gpsDenied,
  outside: gpsOutside,
  unavailable: gpsUnavailable,
}

export function gpsLine(lang: Lang, kind: 'searching' | 'denied' | 'outside' | 'on' | 'unavailable'): string {
  return gpsTable[kind][lang]
}
