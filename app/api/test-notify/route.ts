import { NextResponse } from "next/server";

import { sendPushBriefsToAll } from "@/lib/send-push-briefs";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
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
