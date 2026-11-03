import { col } from '../i18n/col'
import type { Lang } from '../i18n/languages'

export type Gate = { name: string; town: string; lat: number; lng: number; reach: number }

export const gates: Gate[] = [
  { name: 'Aeropuerto Internacional El Edén', town: 'La Tebaida', lat: 4.4505551, lng: -75.7664896, reach: 200 },
  { name: 'Terminal de Transportes de Armenia', town: 'Armenia', lat: 4.5283709, lng: -75.6842461, reach: 80 },
]

export const crowds: Gate[] = [
  { name: 'Plaza de Bolívar de Armenia', town: 'Armenia', lat: 4.5325725, lng: -75.6730412, reach: 80 },
  { name: 'Parque Antonio José de Sucre', town: 'Armenia', lat: 4.5360491, lng: -75.6691458, reach: 70 },
]

export const fiestaTowns = ['Calarcá', 'Armenia', 'Quimbaya'] as const

const gateCopy = {
  'Aeropuerto Internacional El Edén': col([
    'El aeropuerto El Edén queda en La Tebaida, a unos 18 km de Armenia. De aquí se sigue por carretera. Al valle de Cocora se sube en jeep desde la plaza de Salento, no caminando desde la capital.',
    'El Edén airport is in La Tebaida, about 18 km from Armenia. From here you continue by road. The Cocora valley is reached by jeep from Salento’s square, not on foot from the capital.',
    'O aeroporto El Edén fica em La Tebaida, a uns 18 km de Armenia. Daqui se segue de carro. Ao vale do Cocora sobe-se de jipe da praça de Salento, não a pé desde a capital.',
    'L’aéroport El Edén est à La Tebaida, à environ 18 km d’Armenia. On continue par la route. La vallée de Cocora se rejoint en jeep depuis la place de Salento, pas à pied depuis la capitale.',
    'Der Flughafen El Edén liegt in La Tebaida, etwa 18 km von Armenia. Weiter geht es über die Straße. Ins Cocora-Tal fährt ein Jeep vom Platz in Salento, nicht zu Fuß von der Hauptstadt.',
    'L’aeroporto El Edén è a La Tebaida, a circa 18 km da Armenia. Di qui si prosegue in strada. Alla valle del Cocora si sale in jeep dalla piazza di Salento, non a piedi dalla capitale.',
    'Luchthaven El Edén ligt in La Tebaida, zo’n 18 km van Armenia. Verder ga je over de weg. De Cocora-vallei bereik je per jeep vanaf het plein in Salento, niet te voet vanuit de hoofdstad.',
    'L’aeroport El Edén és a La Tebaida, a uns 18 km d’Armenia. D’aquí se segueix per carretera. A la vall del Cocora s’hi puja en jeep des de la plaça de Salento, no a peu des de la capital.',
    'Flygplatsen El Edén ligger i La Tebaida, ungefär 18 km från Armenia. Därifrån fortsätter man på väg. Cocoradalen nås med jeep från torget i Salento, inte till fots från huvudstaden.',
    'Lufthavnen El Edén ligger i La Tebaida, cirka 18 km fra Armenia. Herfra kører man videre. Cocoradalen nås med jeep fra pladsen i Salento, ikke til fods fra hovedstaden.',
    'Flyplassen El Edén ligger i La Tebaida, omtrent 18 km fra Armenia. Videre går veien. Cocoradalen nås med jeep fra torget i Salento, ikke til fots fra hovedstaden.',
    'Lotnisko El Edén jest w La Tebaida, około 18 km od Armenii. Dalej jedzie się drogą. Do doliny Cocora wjeżdża się jeepem z placu w Salento, nie piechotą ze stolicy.',
    'Letiště El Edén je v La Tebaida, asi 18 km od Armenie. Dál se jede po silnici. Do údolí Cocora se vyjíždí jeepem z náměstí v Salentu, ne pěšky z hlavního města.',
    'Aeroportul El Edén este în La Tebaida, la vreo 18 km de Armenia. De aici se continuă pe șosea. Valea Cocora se urcă cu jeepul din piața din Salento, nu pe jos din capitală.',
    'Az El Edén repülőtér La Tebaida területén van, körülbelül 18 km-re Armeniától. Innen úton megy tovább az út. A Cocora-völgybe jeeppel mennek a salentói térről, nem gyalog a fővárosból.',
    'Το αεροδρόμιο El Edén είναι στη La Tebaida, περίπου 18 χλμ από την Αρμενία. Από εκεί συνεχίζεις με δρόμο. Η κοιλάδα Cocora ανεβαίνει με τζιπ από την πλατεία του Salento, όχι με τα πόδια από την πρωτεύουσα.',
    'El Edén havalimanı La Tebaida’da, Armenia’ya yaklaşık 18 km. Buradan yol devam eder. Cocora vadisine Salento meydanından ciple çıkılır, başkentten yürüyerek değil.',
    'Аэропорт Эль-Эден в Ла-Тебаиде, примерно в 18 км от Армении. Дальше едут по дороге. В долину Кокора поднимаются на джипе с площади Саленто, не пешком из столицы.',
    'Аеропорт Ель-Еден у Ла-Тебаїді, приблизно за 18 км від Арменії. Далі їдуть дорогою. У долину Кокора піднімаються джипом з площі Саленто, не пішки зі столиці.',
    'مطار إل إيدين في لا تبيايدا، على نحو 18 كم من أرمينيا. من هنا تكمل بالطريق. وادي كوكورا يُصعد إليه بسيارة جيب من ساحة سالينتو، لا مشياً من العاصمة.',
    'एल एडेन हवाई अड्डा ला तेबाइदा में है, आर्मेनिया से करीब 18 किमी। आगे सड़क से चलते हैं। कोकोरा घाटी सालेंटो के चौक से जीप में जाती है, राजधानी से पैदल नहीं।',
    'Bandara El Edén ada di La Tebaida, sekitar 18 km dari Armenia. Dari sini lanjut lewat jalan. Lembah Cocora dinaiki jip dari alun-alun Salento, bukan berjalan dari ibu kota.',
    '埃尔埃登机场在拉特瓦伊达，离亚美尼亚大约18公里。从这里走公路。科科拉山谷要从萨伦托广场坐吉普上去，不是从省会步行。',
    'エルエデン空港はラ・テバイダにあり、アルメニアから約18km。ここからは道を進む。ココラ渓谷はサレント広場からジープで上る。首都から歩く道ではない。',
    '엘에덴 공항은 라 테바이다에 있고, 아르메니아에서 약 18km입니다. 여기서는 도로로 갑니다. 코코라 계곡은 살렌토 광장에서 지프로 올라가지, 주도에서 걸어서 가지 않습니다.',
  ]),
  'Terminal de Transportes de Armenia': col([
    'La terminal de Armenia reúne los buses hacia los pueblos del Quindío y hacia otras ciudades. Conviene confirmar el horario en la taquilla.',
    'Armenia’s bus terminal gathers coaches to the towns of Quindío and to other cities. Confirm the time at the ticket window.',
    'O terminal de Armenia reúne os ônibus para os povoados do Quindío e para outras cidades. Confirme o horário no guichê.',
    'Le terminal d’Armenia rassemble les bus vers les villages du Quindío et vers d’autres villes. Confirmez l’horaire au guichet.',
    'Der Busbahnhof von Armenia bündelt die Busse in die Orte von Quindío und in andere Städte. Die Uhrzeit am Schalter bestätigen.',
    'Il terminal di Armenia raduna i bus verso i paesi del Quindío e verso altre città. Conferma l’orario in biglietteria.',
    'Het busstation van Armenia bundelt de bussen naar de dorpen van Quindío en naar andere steden. Bevestig de tijd aan het loket.',
    'La terminal d’Armenia aplega els busos cap als pobles del Quindío i cap a altres ciutats. Confirma l’horari a la taquilla.',
    'Armenia bussterminal samlar bussar till orterna i Quindío och till andra städer. Bekräfta tiden i luckan.',
    'Armenia busterminal samler busser til byerne i Quindío og til andre byer. Bekræft tiden i lugen.',
    'Armenia bussterminal samler busser til stedene i Quindío og til andre byer. Bekreft tiden i luken.',
    'Dworzec w Armenii zbiera autobusy do miejscowości Quindío i do innych miast. Potwierdź godzinę w kasie.',
    'Terminál v Armenii sváží autobusy do obcí Quindía a do jiných měst. Čas potvrď na přepážce.',
    'Terminalul din Armenia adună autobuzele spre orașele din Quindío și spre alte orașe. Confirmă ora la ghișeu.',
    'Armenia buszpályaudvara gyűjti a buszokat Quindío településeire és más városokba. Az időt a pénztárnál erősítsd meg.',
    'Ο σταθμός λεωφορείων της Αρμενίας μαζεύει δρομολόγια προς τους οικισμούς του Κινδίο και άλλες πόλεις. Επιβεβαίωσε την ώρα στο ταμείο.',
    'Armenia otogarı Quindío kasabalarına ve başka kentlere giden otobüsleri toplar. Saati gişeden doğrula.',
    'Автовокзал Армении собирает автобусы в города Киндио и в другие города. Время лучше подтвердить в кассе.',
    'Автовокзал Арменії збирає автобуси в містечка Кіндіо та в інші міста. Час краще підтвердити в касі.',
    'محطة حافلات أرمينيا تجمع الحافلات إلى بلدات كينديو ومدن أخرى. أكّد الوقت عند الشباك.',
    'आर्मेनिया का बस टर्मिनल क्विंदियो के कस्बों और दूसरे शहरों की बसें जोड़ता है। समय खिड़की पर पक्का करें।',
    'Terminal bus Armenia mengumpulkan bus ke kota-kota Quindío dan ke kota lain. Konfirmasi jam di loket.',
    '亚美尼亚客运站汇集开往金迪奥各镇和其他城市的班车。发车时间请在售票处确认。',
    'アルメニアのバスターミナルはキンディオの町や他の都市へのバスが集まる。時刻は窓口で確認して。',
    '아르메니아 터미널은 킨디오 마을과 다른 도시로 가는 버스를 모읍니다. 시간은 매표소에서 확인하세요.',
  ]),
}

export function gateText(name: string, lang: Lang): string | null {
  const row = (gateCopy as Record<string, Record<Lang, string>>)[name]
  return row?.[lang] ?? null
}

const fiestaCopy = {
  Calarcá: col([
    'En junio, Calarcá hace la Fiesta Nacional del Café. En 2026 fue del 19 al 29 y esa edición no tuvo cabalgata. Confirme la fecha en la alcaldía.',
    'In June, Calarcá holds the National Coffee Festival. In 2026 it ran from the 19th to the 29th, and that edition had no horseback parade. Confirm the date with the town hall.',
    'Em junho, Calarcá faz a Festa Nacional do Café. Em 2026 foi de 19 a 29 e essa edição não teve cavalgada. Confirme a data na prefeitura.',
    'En juin, Calarcá fête la Fête nationale du café. En 2026 elle a eu lieu du 19 au 29, sans cavalcade. Confirmez la date à la mairie.',
    'Im Juni feiert Calarcá das Nationale Kaffeefest. 2026 war es vom 19. bis 29., ohne Reiterumzug. Das Datum im Rathaus bestätigen.',
    'A giugno Calarcá fa la Festa nazionale del caffè. Nel 2026 è stata dal 19 al 29, senza cavalcata. Conferma la data in municipio.',
    'In juni viert Calarcá het Nationale Koffiefeest. In 2026 was het van 19 tot 29, zonder ruiteroptocht. Bevestig de datum bij het gemeentehuis.',
    'Al juny, Calarcá fa la Festa Nacional del Cafè. El 2026 va ser del 19 al 29 i no hi va haver cavalcada. Confirma la data a l’ajuntament.',
    'I juni har Calarcá den nationella kaffefesten. 2026 var den 19–29 och utan ryttartåg. Bekräfta datumet i kommunhuset.',
    'I juni holder Calarcá den nationale kaffefest. I 2026 var den 19.–29. og uden rytteroptog. Bekræft datoen på rådhuset.',
    'I juni har Calarcá den nasjonale kaffefesten. I 2026 var den 19.–29. og uten ryttertog. Bekreft datoen på rådhuset.',
    'W czerwcu Calarcá obchodzi Narodowe Święto Kawy. W 2026 było od 19 do 29 i bez kawalkady. Potwierdź datę w urzędzie.',
    'V červnu má Calarcá Národní slavnost kávy. V roce 2026 byla od 19. do 29. a bez jízdy na koních. Datum ověř na úřadě.',
    'În iunie, Calarcá ține Sărbătoarea națională a cafelei. În 2026 a fost între 19 și 29, fără cavalcadă. Confirmă data la primărie.',
    'Júniusban Calarcá a nemzeti kávéünnepet tartja. 2026-ban 19. és 29. között volt, lovas felvonulás nélkül. A dátumot a hivatalban erősítsd meg.',
    'Τον Ιούνιο η Calarcá κάνει την Εθνική Γιορτή του Καφέ. Το 2026 ήταν 19–29, χωρίς παρέλαση αλόγων. Επιβεβαίωσε την ημερομηνία στο δημαρχείο.',
    'Haziranda Calarcá Ulusal Kahve Şenliği’ni yapar. 2026’da 19–29 arasındaydı ve atlı geçit yoktu. Tarihi belediyeden doğrula.',
    'В июне в Каларке Национальный праздник кофе. В 2026 году он был с 19 по 29 и без конного парада. Дату подтвердите в мэрии.',
    'У червні в Каларці Національне свято кави. У 2026 році воно було з 19 по 29 і без кінної ходи. Дату підтвердьте в мерії.',
    'في يونيو تقيم كالاركا عيد البن الوطني. في 2026 كان من 19 إلى 29 ومن دون موكب خيول. أكّد التاريخ في البلدية.',
    'जून में कालार्का राष्ट्रीय कॉफ़ी उत्सव करता है। 2026 में यह 19 से 29 तक था और घुड़सवारी नहीं हुई। तारीख नगरपालिका से पक्की करें।',
    'Pada Juni, Calarcá menggelar Fiesta Nasional Kopi. Tahun 2026 tanggal 19–29 dan tanpa arak-arakan kuda. Konfirmasi tanggal di balai kota.',
    '六月卡拉尔卡举办全国咖啡节。2026年是19日至29日，那一届没有马队游行。日期请向市政府确认。',
    '6月にカラルカで全国コーヒー祭。2026年は19日から29日で、騎馬行列はなかった。日付は役場で確認して。',
    '6월에 칼라르카에서 전국 커피 축제가 열립니다. 2026년에는 19일부터 29일까지였고 기마 행진은 없었습니다. 날짜는 시청에서 확인하세요.',
  ]),
  Armenia: col([
    'Alrededor del 14 de octubre, aniversario de la ciudad, Armenia arma sus fiestas. El programa exacto cambia cada año. Confirme la fecha en la alcaldía.',
    'Around 14 October, the city’s anniversary, Armenia holds its festival. The exact program changes each year. Confirm the date with the town hall.',
    'Por volta de 14 de outubro, aniversário da cidade, Armenia faz suas festas. O programa muda a cada ano. Confirme a data na prefeitura.',
    'Autour du 14 octobre, anniversaire de la ville, Armenia fête. Le programme change chaque année. Confirmez la date à la mairie.',
    'Um den 14. Oktober, den Stadtgeburtstag, feiert Armenia. Das Programm wechselt jedes Jahr. Das Datum im Rathaus bestätigen.',
    'Intorno al 14 ottobre, anniversario della città, Armenia fa festa. Il programma cambia ogni anno. Conferma la data in municipio.',
    'Rond 14 oktober, de verjaardag van de stad, viert Armenia feest. Het programma wisselt elk jaar. Bevestig de datum bij het gemeentehuis.',
    'Cap al 14 d’octubre, aniversari de la ciutat, Armenia fa festa. El programa canvia cada any. Confirma la data a l’ajuntament.',
    'Omkring 14 oktober, stadens årsdag, firar Armenia. Programmet ändras varje år. Bekräfta datumet i kommunhuset.',
    'Omkring 14. oktober, byens årsdag, fejrer Armenia. Programmet skifter hvert år. Bekræft datoen på rådhuset.',
    'Rundt 14. oktober, byens årsdag, feirer Armenia. Programmet endres hvert år. Bekreft datoen på rådhuset.',
    'Około 14 października, w rocznicę miasta, Armenia świętuje. Program co roku inny. Potwierdź datę w urzędzie.',
    'Kolem 14. října, ve výročí města, Armenia slaví. Program se každý rok mění. Datum ověř na úřadě.',
    'În jurul datei de 14 octombrie, aniversarea orașului, Armenia sărbătorește. Programul se schimbă în fiecare an. Confirmă data la primărie.',
    'Október 14. körül, a város évfordulóján, Armenia ünnepel. A program évente változik. A dátumot a hivatalban erősítsd meg.',
    'Γύρω στις 14 Οκτωβρίου, επέτειος της πόλης, η Αρμενία γιορτάζει. Το πρόγραμμα αλλάζει κάθε χρόνο. Επιβεβαίωσε την ημερομηνία στο δημαρχείο.',
    '14 Ekim civarı, kentin yıldönümünde, Armenia şenlik yapar. Program her yıl değişir. Tarihi belediyeden doğrula.',
    'Около 14 октября, в годовщину города, Армения празднует. Программа каждый год другая. Дату подтвердите в мэрии.',
    'Близько 14 жовтня, у річницю міста, Арменія святкує. Програма щороку інша. Дату підтвердьте в мерії.',
    'حوالي 14 أكتوبر، ذكرى المدينة، تحتفل أرمينيا. البرنامج يتبدل كل عام. أكّد التاريخ في البلدية.',
    '14 अक्टूबर के आसपास, शहर की वर्षगाँठ पर, आर्मेनिया उत्सव करता है। कार्यक्रम हर साल बदलता है। तारीख नगरपालिका से पक्की करें।',
    'Sekitar 14 Oktober, hari jadi kota, Armenia berpesta. Programnya berubah tiap tahun. Konfirmasi tanggal di balai kota.',
    '10月14日前后是城市纪念日，亚美尼亚过节。节目每年不同。日期请向市政府确认。',
    '10月14日前後は市の記念日で、アルメニアが祝う。内容は年ごとに変わる。日付は役場で確認して。',
    '10월 14일 전후는 도시 기념일이고 아르메니아가 축제를 엽니다. 일정은 해마다 달라집니다. 날짜는 시청에서 확인하세요.',
  ]),
  Quimbaya: col([
    'El 7 y 8 de diciembre, Quimbaya enciende el Festival de Velas y Faroles. Las calles se llenan y conviene llegar temprano. Confirme la fecha en la alcaldía.',
    'On 7 and 8 December, Quimbaya lights the Candle and Lantern Festival. The streets fill up, so arrive early. Confirm the date with the town hall.',
    'Em 7 e 8 de dezembro, Quimbaya acende o Festival de Velas e Lanternas. As ruas enchem e convém chegar cedo. Confirme a data na prefeitura.',
    'Les 7 et 8 décembre, Quimbaya allume le festival des bougies et des lanternes. Les rues se remplissent : arrivez tôt. Confirmez la date à la mairie.',
    'Am 7. und 8. Dezember zündet Quimbaya das Kerzen- und Laternenfest. Die Straßen werden voll, besser früh da sein. Das Datum im Rathaus bestätigen.',
    'Il 7 e 8 dicembre Quimbaya accende il festival di candele e lanterne. Le strade si riempiono: meglio arrivare presto. Conferma la data in municipio.',
    'Op 7 en 8 december steekt Quimbaya het kaarsen- en lantaarnfeest aan. De straten lopen vol, kom vroeg. Bevestig de datum bij het gemeentehuis.',
    'El 7 i 8 de desembre, Quimbaya encén el Festival de Espelmes i Fanals. Els carrers s’omplen: val més arribar d’hora. Confirma la data a l’ajuntament.',
    'Den 7 och 8 december tänder Quimbaya ljus- och lyktfestivalen. Gatorna fylls, kom tidigt. Bekräfta datumet i kommunhuset.',
    'Den 7. og 8. december tænder Quimbaya lys- og lanternefesten. Gaderne fyldes, kom tidligt. Bekræft datoen på rådhuset.',
    'Den 7. og 8. desember tenner Quimbaya lys- og lyktefesten. Gatene fylles, kom tidlig. Bekreft datoen på rådhuset.',
    '7 i 8 grudnia Quimbaya zapala Festiwal Świec i Lampionów. Ulice się zapełniają, lepiej przyjść wcześnie. Potwierdź datę w urzędzie.',
    '7. a 8. prosince Quimbaya rozsvítí Festival svící a luceren. Ulice se zaplní, přijď brzy. Datum ověř na úřadě.',
    'Pe 7 și 8 decembrie, Quimbaya aprinde Festivalul lumânărilor și felinarelor. Străzile se umplu: vino devreme. Confirmă data la primărie.',
    'December 7-én és 8-án Quimbaya meggyújtja a gyertya- és lámpásfesztivált. Az utcák megtelnek, érkezz korán. A dátumot a hivatalban erősítsd meg.',
    'Στις 7 και 8 Δεκεμβρίου η Quimbaya ανάβει το φεστιβάλ κεριών και φαναριών. Οι δρόμοι γεμίζουν: έλα νωρίς. Επιβεβαίωσε την ημερομηνία στο δημαρχείο.',
    '7 ve 8 Aralık’ta Quimbaya Mum ve Fener Festivali’ni yakar. Sokaklar dolar, erken var. Tarihi belediyeden doğrula.',
    '7 и 8 декабря Кимбайя зажигает фестиваль свечей и фонарей. Улицы заполняются, лучше приехать рано. Дату подтвердите в мэрии.',
    '7 і 8 грудня Кімбая запалює фестиваль свічок і ліхтарів. Вулиці заповнюються, краще приїхати рано. Дату підтвердьте в мерії.',
    'في 7 و8 ديسمبر تضيء كيمبايا مهرجان الشموع والفوانيس. الشوارع تمتلئ، والأفضل الوصول مبكراً. أكّد التاريخ في البلدية.',
    '7 और 8 दिसंबर को क्विम्बाया मोमबत्ती और लालटेन उत्सव जलाता है। सड़कें भर जाती हैं, जल्दी पहुँचें। तारीख नगरपालिका से पक्की करें।',
    'Pada 7 dan 8 Desember, Quimbaya menyalakan Festival Lilin dan Lentera. Jalanan penuh, datanglah lebih awal. Konfirmasi tanggal di balai kota.',
    '12月7日和8日，金巴亚点亮蜡烛与灯笼节。街道会很挤，最好早到。日期请向市政府确认。',
    '12月7日と8日、キンバヤはろうそくと提灯の祭りを灯す。道が混むので早めに。日付は役場で確認して。',
    '12월 7일과 8일, 킴바야는 초와 등불 축제를 켭니다. 거리가 붐비니 일찍 가세요. 날짜는 시청에서 확인하세요.',
  ]),
}

export function fiestaText(town: string, lang: Lang): string | null {
  const row = (fiestaCopy as Record<string, Record<Lang, string>>)[town]
  return row?.[lang] ?? null
}

const photos: Record<string, { src: string; credit: string }> = {
  Salento: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Callerealsalento.JPG/800px-Callerealsalento.JPG',
    credit: 'Wikimedia Commons',
  },
  Filandia: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Filandia.jpg',
    credit: 'Wikimedia Commons',
  },
  'Valle de Cocora': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Cocora_valley.JPG/800px-Cocora_valley.JPG',
    credit: 'Wikimedia Commons',
  },
  'Parque Nacional del Café': {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Parque_del_caf%C3%A9%2C_panor%C3%A1mica_parque_ecoturistico.jpg/800px-Parque_del_caf%C3%A9%2C_panor%C3%A1mica_parque_ecoturistico.jpg',
    credit: 'Wikimedia Commons',
  },
}

export function placePhoto(name: string): { src: string; credit: string } | null {
  return photos[name] ?? null
}
