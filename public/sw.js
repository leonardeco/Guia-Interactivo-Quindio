/* Offline support: the app shell, its hashed assets and the map tiles the visitor has already seen. */
const VERSION = 'pdc-v2'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const TILES = `${VERSION}-tiles`
const MAX_TILES = 1500
const TILE_HOSTS = ['tiles.openfreemap.org', 'tile.openstreetmap.org', 'fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(['/', '/manifest.webmanifest', '/favicon.svg']))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

async function trim(name, max) {
  const cache = await caches.open(name)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - max; i += 1) await cache.delete(keys[i])
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(SHELL)
    cache.put('/', response.clone())
    return response
  } catch {
    return (await caches.match('/')) || Response.error()
  }
}

async function cacheFirst(request) {
  const hit = await caches.match(request)
  if (hit) return hit
  const response = await fetch(request)
  if (response.ok) (await caches.open(RUNTIME)).put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(TILES)
  const hit = await cache.match(request)
  const update = fetch(request)
    .then((response) => {
      if (response.ok || response.type === 'opaque') {
        cache.put(request, response.clone())
        trim(TILES, MAX_TILES)
      }
      return response
    })
    .catch(() => hit)
  return hit || update
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
    return
  }
  if (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }
  if (TILE_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request))
  }
})
