import { NextResponse } from "next/server";

import { generateMorningBrief } from "@/lib/morning-brief";
import {
  getAllPushSubscriptions,
  removePushSubscription,
} from "@/lib/push-subscriptions";
import { sendPushNotification } from "@/lib/web-push";

function isAuthorizedCron(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const subscriptions = await getAllPushSubscriptions();
    const origin = new URL(request.url).origin;

    const results = await Promise.all(
      subscriptions.map(async (record) => {
        try {
          const brief = await generateMorningBrief({
            origin,
            sessionCookie: record.sessionCookie,
            timezone: record.timezone,
          });

          await sendPushNotification(record.subscription, {
            title: "Don't Forget",
            body: brief,
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

          console.error(`Notify failed for ${record.id}:`, error);
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
    console.error("Notify error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send push notifications.",
      },
      { status: 500 }
    );
  }
}
