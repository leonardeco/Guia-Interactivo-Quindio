const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4'
const AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const voices: Record<string, { locale: string; female: string; male: string }> = {
  es: { locale: 'es-CO', female: 'es-CO-SalomeNeural', male: 'es-CO-GonzaloNeural' },
  en: { locale: 'en-US', female: 'en-US-JennyNeural', male: 'en-US-GuyNeural' },
  pt: { locale: 'pt-BR', female: 'pt-BR-FranciscaNeural', male: 'pt-BR-AntonioNeural' },
  fr: { locale: 'fr-FR', female: 'fr-FR-DeniseNeural', male: 'fr-FR-HenriNeural' },
  de: { locale: 'de-DE', female: 'de-DE-KatjaNeural', male: 'de-DE-ConradNeural' },
  it: { locale: 'it-IT', female: 'it-IT-ElsaNeural', male: 'it-IT-DiegoNeural' },
  nl: { locale: 'nl-NL', female: 'nl-NL-FennaNeural', male: 'nl-NL-MaartenNeural' },
  ca: { locale: 'ca-ES', female: 'ca-ES-JoanaNeural', male: 'ca-ES-EnricNeural' },
  sv: { locale: 'sv-SE', female: 'sv-SE-SofieNeural', male: 'sv-SE-MattiasNeural' },
  da: { locale: 'da-DK', female: 'da-DK-ChristelNeural', male: 'da-DK-JeppeNeural' },
  nb: { locale: 'nb-NO', female: 'nb-NO-PernilleNeural', male: 'nb-NO-FinnNeural' },
  pl: { locale: 'pl-PL', female: 'pl-PL-ZofiaNeural', male: 'pl-PL-MarekNeural' },
  cs: { locale: 'cs-CZ', female: 'cs-CZ-VlastaNeural', male: 'cs-CZ-AntoninNeural' },
  ro: { locale: 'ro-RO', female: 'ro-RO-AlinaNeural', male: 'ro-RO-EmilNeural' },
  hu: { locale: 'hu-HU', female: 'hu-HU-NoemiNeural', male: 'hu-HU-TamasNeural' },
  el: { locale: 'el-GR', female: 'el-GR-AthinaNeural', male: 'el-GR-NestorasNeural' },
  tr: { locale: 'tr-TR', female: 'tr-TR-EmelNeural', male: 'tr-TR-AhmetNeural' },
  ru: { locale: 'ru-RU', female: 'ru-RU-SvetlanaNeural', male: 'ru-RU-DmitryNeural' },
  uk: { locale: 'uk-UA', female: 'uk-UA-PolinaNeural', male: 'uk-UA-OstapNeural' },
  ar: { locale: 'ar-SA', female: 'ar-SA-ZariyahNeural', male: 'ar-SA-HamedNeural' },
  hi: { locale: 'hi-IN', female: 'hi-IN-SwaraNeural', male: 'hi-IN-MadhurNeural' },
  id: { locale: 'id-ID', female: 'id-ID-GadisNeural', male: 'id-ID-ArdiNeural' },
  zh: { locale: 'zh-CN', female: 'zh-CN-XiaoxiaoNeural', male: 'zh-CN-YunxiNeural' },
  ja: { locale: 'ja-JP', female: 'ja-JP-NanamiNeural', male: 'ja-JP-KeitaNeural' },
  ko: { locale: 'ko-KR', female: 'ko-KR-SunHiNeural', male: 'ko-KR-InJoonNeural' },
}

export type TtsRequest = { text?: string; lang?: string; gender?: string; rate?: number }

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function prosody(rate: number | undefined): string {
  const pct = Math.round(Math.min(25, Math.max(-20, ((rate ?? 1) - 1) * 100)))
  return `${pct >= 0 ? '+' : ''}${pct}%`
}

export async function synthesize(input: TtsRequest): Promise<Uint8Array | null> {
  const row = voices[input.lang ?? '']
  const text = escapeXml(String(input.text ?? '').replace(/\s+/g, ' ').trim()).slice(0, 600)
  if (!row || !text) return null
  const voice = input.gender === 'male' ? row.male : row.female
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${row.locale}"><voice name="${voice}"><prosody rate="${prosody(input.rate)}">${text}</prosody></voice></speak>`
  try {
    const tokenResponse = await fetch('https://edge.microsoft.com/translate/auth', {
      headers: { 'User-Agent': AGENT },
      signal: AbortSignal.timeout(4000),
    })
    if (!tokenResponse.ok) return null
    const token = (await tokenResponse.text()).trim()
    if (!token) return null
    const audio = await fetch(
      `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': AGENT,
        },
        body: ssml,
        signal: AbortSignal.timeout(8000),
      },
    )
    if (!audio.ok) return null
    const bytes = new Uint8Array(await audio.arrayBuffer())
    return bytes.byteLength > 200 ? bytes : null
  } catch {
    return null
  }
}
