const CACHE_NAME = 'clavey-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
]

// Rutas que NUNCA deben cachearse ni interceptarse
const SKIP_PATTERNS = [
  '/dashboard',     // páginas autenticadas — siempre fresh
  '/auth',          // flujo de autenticación
  '/api',           // API routes
  '_next/data',     // datos de Next.js
  'supabase.co',    // Supabase — auth, storage, DB
]

function shouldSkip(url) {
  return SKIP_PATTERNS.some(pattern => url.includes(pattern))
}

// Instalación — solo cachea assets públicos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activación — limpia caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — solo intercepta GET de assets estáticos públicos
self.addEventListener('fetch', (event) => {
  const url = event.request.url

  // Ignora todo excepto GET
  if (event.request.method !== 'GET') return

  // Ignora rutas dinámicas, auth, dashboard y Supabase
  if (shouldSkip(url)) return

  // Solo intercepta mismo origen
  if (!url.startsWith(self.location.origin)) return

  // Solo cachea assets estáticos (_next/static, iconos, manifest, fonts)
  const isStaticAsset = (
    url.includes('/_next/static/') ||
    url.includes('/icons/') ||
    url.endsWith('/manifest.json') ||
    url.endsWith('/favicon.svg') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com')
  )

  if (!isStaticAsset) return

  // Cache-first para assets estáticos (tienen hash en el nombre)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
    })
  )
})
