import { synthesize, type TtsRequest } from '../server/tts'

export const config = { runtime: 'edge' }

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405 })
  let body: TtsRequest = {}
  try {
    body = (await request.json()) as TtsRequest
  } catch {
    return new Response(null, { status: 400 })
  }
  const audio = await synthesize(body)
  if (!audio) return new Response(null, { status: 502 })
  return new Response(audio, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
