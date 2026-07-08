const CACHE_NAME = "dont-forget-v6";
const PRECACHE_URLS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

let pendingPushBrief = null;

function buildExpandedActions(expanded) {
  if (!expanded) {
    return [];
  }

  return expanded
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((line, index) => ({
      action: `prep-${index}`,
      title: line.length > 50 ? `${line.slice(0, 47)}...` : line,
    }));
}

function buildNotificationBody(summary) {
  return summary;
}

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
    expanded: "",
    fullBrief: "",
    briefDate: "",
    url: "/",
    icon: "/icon-192.png",
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

  const summary = payload.body;
  const expanded = payload.expanded || "";
  const actions = buildExpandedActions(expanded);

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, {
        body: buildNotificationBody(summary),
        icon: payload.icon,
        actions,
        data: {
          url: payload.url ?? "/",
          summary,
          expanded,
          fullBrief: payload.fullBrief || summary,
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
  event.waitUntil(
    clients.openWindow("https://dont-forget-kappa.vercel.app/")
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
