import { getRedis } from "@/lib/redis";

export interface UserProfile {
  email: string;
  homeCity: string;
  timezone: string;
  notificationTime: string;
  onboardingCompleted: boolean;
  updatedAt: number;
}

function profileKey(email: string): string {
  return `user:${email.toLowerCase()}`;
}

export function createDefaultProfile(email: string): UserProfile {
  return {
    email: email.toLowerCase(),
    homeCity: "",
    timezone: "America/Los_Angeles",
    notificationTime: "07:00",
    onboardingCompleted: false,
    updatedAt: Date.now(),
  };
}

export function needsOnboarding(profile: UserProfile): boolean {
  return !profile.onboardingCompleted || !profile.homeCity.trim();
}

export function getPostAuthRedirectPath(
  profile: UserProfile
): "/onboarding/location" | "/" {
  return needsOnboarding(profile) ? "/onboarding/location" : "/";
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const redis = getRedis();
  return redis.get<UserProfile>(profileKey(email));
}

export async function getUserProfileOrDefault(email: string): Promise<UserProfile> {
  const profile = await getUserProfile(email);
  return profile ?? createDefaultProfile(email);
}

export async function saveUserProfile(
  profile: UserProfile
): Promise<UserProfile> {
  const redis = getRedis();
  const normalized: UserProfile = {
    ...profile,
    email: profile.email.toLowerCase(),
    updatedAt: Date.now(),
  };

  await redis.set(profileKey(normalized.email), normalized);
  return normalized;
}
