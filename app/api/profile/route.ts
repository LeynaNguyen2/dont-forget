import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import {
  createDefaultProfile,
  getUserProfileOrDefault,
  saveUserProfile,
  type UserProfile,
} from "@/lib/user-profile";

interface ProfileUpdateBody {
  homeCity?: string;
  timezone?: string;
  notificationTime?: string;
  onboardingCompleted?: boolean;
}

const TIMEZONE_PATTERN = /^[A-Za-z_]+\/[A-Za-z_]+$/;
const NOTIFICATION_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession(request);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const profile = await getUserProfileOrDefault(session.user.email);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getSession(request);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: ProfileUpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.timezone && !TIMEZONE_PATTERN.test(body.timezone)) {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  if (
    body.notificationTime &&
    !NOTIFICATION_TIME_PATTERN.test(body.notificationTime)
  ) {
    return NextResponse.json(
      { error: "Invalid notification time." },
      { status: 400 }
    );
  }

  try {
    const current = await getUserProfileOrDefault(session.user.email);
    const updated: UserProfile = {
      ...current,
      homeCity:
        body.homeCity !== undefined
          ? body.homeCity.trim()
          : current.homeCity,
      timezone: body.timezone ?? current.timezone,
      notificationTime: body.notificationTime ?? current.notificationTime,
      onboardingCompleted:
        body.onboardingCompleted ?? current.onboardingCompleted,
    };

    const saved = await saveUserProfile(updated);
    return NextResponse.json(saved);
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save profile." },
      { status: 500 }
    );
  }
}
