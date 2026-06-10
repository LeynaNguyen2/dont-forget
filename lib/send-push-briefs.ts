import { generateMorningBriefFromSessionCookie } from "@/lib/morning-brief";
import {
  getAllPushSubscriptions,
  removePushSubscription,
} from "@/lib/push-subscriptions";
import { sendPushNotification } from "@/lib/web-push";

export interface PushBriefResult {
  id: string;
  status: "sent" | "removed" | "failed";
  error?: string;
}

export async function sendPushBriefsToAll(
  origin: string
): Promise<{ total: number; results: PushBriefResult[] }> {
  const subscriptions = await getAllPushSubscriptions();

  const results = await Promise.all(
    subscriptions.map(async (record): Promise<PushBriefResult> => {
      try {
        const brief = await generateMorningBriefFromSessionCookie({
          origin,
          sessionCookie: record.sessionCookie,
          timezone: record.timezone,
        });

        await sendPushNotification(record.subscription, {
          title: "Don't Forget",
          body: brief,
          url: "/",
        });

        return { id: record.id, status: "sent" };
      } catch (error) {
        const statusCode =
          error instanceof Error &&
          "statusCode" in error &&
          typeof error.statusCode === "number"
            ? error.statusCode
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await removePushSubscription(record.id);
          return { id: record.id, status: "removed" };
        }

        console.error(`Push brief failed for ${record.id}:`, error);
        return {
          id: record.id,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    })
  );

  return { total: subscriptions.length, results };
}
