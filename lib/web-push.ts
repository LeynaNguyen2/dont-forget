import webpush from "web-push";

import type { PushSubscriptionPayload } from "@/lib/push-subscriptions";

let vapidConfigured = false;

function configureVapid(): void {
  if (vapidConfigured) {
    return;
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@dont-forget.app";

  if (!publicKey || !privateKey) {
    throw new Error(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set."
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

export async function sendPushNotification(
  subscription: PushSubscriptionPayload,
  payload: {
    title: string;
    body: string;
    expanded?: string;
    fullBrief?: string;
    briefDate?: string;
    url?: string;
  }
): Promise<void> {
  configureVapid();

  await webpush.sendNotification(
    subscription,
    JSON.stringify({
      title: payload.title,
      body: payload.body,
      expanded: payload.expanded,
      fullBrief: payload.fullBrief,
      briefDate: payload.briefDate,
      url: payload.url ?? "/",
      icon: "/icon-192.png",
    })
  );
}
