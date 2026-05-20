const GZC_CACHE = 'gz-chat-v1';
const GZC_BASE = '/GAME-ZONE-CHAT';
const GZC_ASSETS = [
    GZC_BASE + '/',
    GZC_BASE + '/index.html',
    GZC_BASE + '/manifest.json',
    GZC_BASE + '/icon-192.png',
    GZC_BASE + '/icon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(GZC_CACHE).then(c => c.addAll(GZC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== GZC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    // Don't cache Firebase, fonts, or CDN requests
    if (url.hostname.includes('firebase') || url.hostname.includes('firestore') ||
        url.hostname.includes('googleapis') || url.hostname.includes('gstatic') ||
        url.hostname.includes('cdnjs') || url.hostname.includes('firebasestorage')) return;
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
            if (res.ok && url.origin === self.location.origin) {
                const clone = res.clone();
                caches.open(GZC_CACHE).then(c => c.put(e.request, clone));
            }
            return res;
        }).catch(() => caches.match(GZC_BASE + '/index.html')))
    );
});
