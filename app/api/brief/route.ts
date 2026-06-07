import { NextResponse } from "next/server";

import { getTimezoneFromRequest } from "@/lib/datetime";
import { generateMorningBrief } from "@/lib/morning-brief";

export async function GET(request: Request) {
  try {
    const timezone = getTimezoneFromRequest(request);
    if (!timezone) {
      return NextResponse.json(
        {
          error:
            "Missing timezone. Pass ?timezone=America/Los_Angeles or an x-timezone header.",
        },
        { status: 400 }
      );
    }

    const sessionCookie = request.headers.get("cookie");
    if (!sessionCookie) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const brief = await generateMorningBrief({
      origin: new URL(request.url).origin,
      sessionCookie,
      timezone,
    });

    return new Response(brief, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Brief API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate morning brief.",
      },
      { status: 500 }
    );
  }
}
