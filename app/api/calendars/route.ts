import { NextResponse } from "next/server";

import { fetchCalendarList } from "@/lib/google-calendar";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.accessToken || session.error === "RefreshAccessTokenError") {
      return NextResponse.json(
        {
          error:
            session?.error === "RefreshAccessTokenError"
              ? "Session expired. Please sign in again."
              : "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    const calendars = await fetchCalendarList(session.accessToken);
    return NextResponse.json({ calendars });
  } catch (error) {
    if (error instanceof Error && error.message === "TOKEN_EXPIRED") {
      return NextResponse.json(
        { error: "Access token expired. Please sign in again." },
        { status: 401 }
      );
    }

    console.error("Calendars API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch calendars." },
      { status: 500 }
    );
  }
}
