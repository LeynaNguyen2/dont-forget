import { redirect } from "next/navigation";

import OnboardingTime from "@/components/OnboardingTime";
import { getSession } from "@/lib/session";
import { getUserProfileOrDefault, needsOnboarding } from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export default async function OnboardingTimePage() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const profile = await getUserProfileOrDefault(session.user.email);
  if (!needsOnboarding(profile)) {
    redirect("/");
  }

  if (!profile.homeCity) {
    redirect("/onboarding/location");
  }

  return <OnboardingTime />;
}
