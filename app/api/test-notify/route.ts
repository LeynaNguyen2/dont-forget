import { NextResponse } from "next/server";

import {
  getAllPushSubscriptions,
  removePushSubscription,
} from "@/lib/push-subscriptions";
import { sendPushNotification } from "@/lib/web-push";

const TEST_NOTIFY_SECRET = "dontforget2026";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");

  if (secret !== TEST_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const subscriptions = await getAllPushSubscriptions();

    const results = await Promise.all(
      subscriptions.map(async (record) => {
        try {
          await sendPushNotification(record.subscription, {
            title: "Don't Forget",
            body: "Test notification — push is working!",
            url: "/",
          });

          return { id: record.id, status: "sent" as const };
        } catch (error) {
          const statusCode =
            error instanceof Error &&
            "statusCode" in error &&
            typeof error.statusCode === "number"
              ? error.statusCode
              : null;

          if (statusCode === 404 || statusCode === 410) {
            await removePushSubscription(record.id);
            return { id: record.id, status: "removed" as const };
          }

          console.error(`Test notify failed for ${record.id}:`, error);
          return {
            id: record.id,
            status: "failed" as const,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      total: subscriptions.length,
      results,
    });
  } catch (error) {
    console.error("Test notify error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send test push notifications.",
      },
      { status: 500 }
    );
  }
}
