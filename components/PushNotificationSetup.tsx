"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

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

export default function PushNotificationSetup() {
  const { status } = useSession();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || hasRequested.current) {
      return;
    }

    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    hasRequested.current = true;

    async function registerPushNotifications() {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            vapidPublicKey
          ) as BufferSource,
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
        console.error(
          "Failed to save push subscription:",
          data.error ?? response.status
        );
      }
    }

    registerPushNotifications().catch((error) => {
      console.error("Push notification setup failed:", error);
    });
  }, [status]);

  return null;
}
