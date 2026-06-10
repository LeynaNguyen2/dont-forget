import type { UserProfile } from "@/lib/user-profile";

export async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch("/api/profile", { credentials: "include" });

  if (!response.ok) {
    throw new Error("Failed to load profile.");
  }

  return response.json();
}

export async function updateProfile(
  updates: Partial<
    Pick<
      UserProfile,
      "homeCity" | "timezone" | "notificationTime" | "onboardingCompleted"
    >
  >
): Promise<UserProfile> {
  const response = await fetch("/api/profile", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error ?? "Failed to save profile.");
  }

  return response.json();
}
