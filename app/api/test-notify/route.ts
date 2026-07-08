import { NextResponse } from "next/server";

import { sendPushBriefsToAll } from "@/lib/send-push-briefs";

const TEST_NOTIFY_SECRET = "dontforget";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");

  if (secret !== TEST_NOTIFY_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { total, results } = await sendPushBriefsToAll(
      new URL(request.url).origin
    );

    return NextResponse.json({
      success: true,
      total,
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
