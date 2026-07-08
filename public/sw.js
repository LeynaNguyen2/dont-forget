const CACHE_NAME = "dont-forget-v4";
const PRECACHE_URLS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

let pendingPushBrief = null;

function isHttpOrHttps(url) {
  return url.protocol === "http:" || url.protocol === "https:";
}

function isPrecacheUrl(pathname) {
  return PRECACHE_URLS.includes(pathname);
}

function isNavigationRequest(request) {
  return request.mode === "navigate" || request.destination === "document";
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.map((name) => caches.delete(name)))
      )
      .then(() => caches.open(CACHE_NAME))
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "☀️ Good morning!",
    body: "Your morning brief is ready.",
    fullBrief: "",
    briefDate: "",
    url: "/",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch {
      payload.body = event.data.text();
    }
  }

  const generatedAt = new Date().toISOString();
  const briefPayload = {
    text: payload.fullBrief || payload.body,
    date: payload.briefDate || generatedAt.slice(0, 10),
    generatedAt,
  };

  pendingPushBrief = briefPayload;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        requireInteraction: false,
        data: {
          url: payload.url ?? "/",
          fullBrief: payload.fullBrief || payload.body,
          summary: payload.body,
          briefDate: briefPayload.date,
          generatedAt,
        },
      }),
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) =>
          Promise.all(
            windowClients.map((client) =>
              client.postMessage({
                type: "PUSH_BRIEF",
                brief: briefPayload,
              })
            )
          )
        ),
    ])
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "GET_PENDING_BRIEF" && pendingPushBrief) {
    event.source.postMessage({
      type: "PENDING_BRIEF",
      brief: pendingPushBrief,
    });
    pendingPushBrief = null;
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url ?? "/";
  const briefPayload = event.notification.data?.fullBrief
    ? {
        text: event.notification.data.fullBrief,
        date:
          event.notification.data.briefDate ||
          new Date().toISOString().slice(0, 10),
        generatedAt:
          event.notification.data.generatedAt || new Date().toISOString(),
      }
    : pendingPushBrief;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windowClients) => {
        for (const client of windowClients) {
          if (briefPayload) {
            client.postMessage({ type: "PUSH_BRIEF", brief: briefPayload });
          }

          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            if (briefPayload) {
              client.postMessage({ type: "PUSH_BRIEF", brief: briefPayload });
            }
            return client.focus();
          }
        }

        const newClient = await clients.openWindow(targetUrl);
        if (newClient && briefPayload) {
          newClient.postMessage({ type: "PUSH_BRIEF", brief: briefPayload });
        }
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (!isHttpOrHttps(requestUrl)) {
    return;
  }

  if (
    requestUrl.pathname.startsWith("/api/") ||
    requestUrl.pathname.startsWith("/_next/") ||
    requestUrl.pathname === "/sw.js"
  ) {
    return;
  }

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  if (!isPrecacheUrl(requestUrl.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });

      return cachedResponse ?? networkFetch;
    })
  );
});
