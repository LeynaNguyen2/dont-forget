import { NextResponse } from "next/server";

import {
  getSubscriptionId,
  savePushSubscription,
  type PushSubscriptionPayload,
} from "@/lib/push-subscriptions";
import { getSession, getSessionCookieHeader } from "@/lib/session";

interface SaveTokenBody {
  subscription?: PushSubscriptionPayload;
  timezone?: string;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as SaveTokenBody;
    const subscription = body.subscription;
    const timezone = body.timezone?.trim();

    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { error: "A valid push subscription is required." },
        { status: 400 }
      );
    }

    if (!timezone) {
      return NextResponse.json(
        { error: "Missing timezone." },
        { status: 400 }
      );
    }

    const sessionCookie = getSessionCookieHeader();
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Missing session cookie." },
        { status: 400 }
      );
    }

    const id = getSubscriptionId(subscription.endpoint);

    await savePushSubscription({
      id,
      userEmail: session.user.email,
      subscription,
      sessionCookie,
      timezone,
      savedAt: Date.now(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Save push token error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save push subscription.",
      },
      { status: 500 }
    );
  }
}
