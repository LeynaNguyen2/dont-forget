function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export type PushRegistrationResult =
  | { success: true; permission: NotificationPermission }
  | { success: false; permission?: NotificationPermission; error: string };

export async function registerPushNotifications(): Promise<PushRegistrationResult> {
  if (typeof window === "undefined") {
    return { success: false, error: "Notifications are only available in the browser." };
  }

  if (!("Notification" in window)) {
    return { success: false, error: "This browser does not support notifications." };
  }

  if (!("serviceWorker" in navigator)) {
    return { success: false, error: "Service workers are not available in this browser." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return {
      success: false,
      permission,
      error:
        permission === "denied"
          ? "Notifications were blocked. Enable them in your browser settings."
          : "Notification permission was not granted.",
    };
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    return { success: false, permission, error: "Push notifications are not configured." };
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();

  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    }));

  const response = await fetch("/api/save-token", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return {
      success: false,
      permission,
      error:
        typeof data.error === "string"
          ? data.error
          : "Failed to save push subscription.",
    };
  }

  return { success: true, permission };
}

export function getNotificationPermission(): NotificationPermission | null {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  return Notification.permission;
}
