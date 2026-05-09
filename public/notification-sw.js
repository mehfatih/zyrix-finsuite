// ================================================================
// notification-sw.js — Sprint D-4 Web Push service worker.
// Separate from public/sw.js (which handles offline caching) so the
// two scopes don't fight; this SW only registers push + click
// listeners.
// ================================================================

const TONE_TO_COLOR = {
  cyan:    '#00D9FF',
  violet:  '#9D4EDD',
  mint:    '#06FFA5',
  amber:   '#FFB800',
  crimson: '#FF3D5A'
};

self.addEventListener('install', (event) => {
  // Skip waiting so updated SW takes control immediately.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Zyrix FinSuite', body: '' };
  try {
    if (event.data) payload = event.data.json();
  } catch (err) {
    if (event.data) payload.body = event.data.text();
  }

  const tone     = TONE_TO_COLOR[payload.iconTone] || TONE_TO_COLOR.cyan;
  const title    = payload.title || 'Zyrix FinSuite';
  const options  = {
    body:     payload.body || '',
    icon:     '/icon-192.png',
    badge:    '/badge-72.png',
    tag:      payload.tag || 'zyrix-default',
    data: {
      ctaRoute:       payload.ctaRoute || '/notifications',
      notificationId: payload.notificationId || null,
      severity:       payload.severity || null
    },
    requireInteraction: payload.severity === 'CRITICAL',
    silent:             false,
    // Some browsers honour color hints in actions.
    actions: [
      { action: 'open', title: 'Aç' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const route = event.notification?.data?.ctaRoute || '/notifications';
  const urlBase = self.location.origin;
  const target = urlBase + (route.startsWith('/') ? route : '/' + route);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      // If an existing tab is already on Zyrix, focus it + navigate.
      for (const win of wins) {
        if (win.url.startsWith(urlBase) && 'focus' in win) {
          return win.focus().then(() => win.navigate(target));
        }
      }
      return clients.openWindow(target);
    })
  );
});
