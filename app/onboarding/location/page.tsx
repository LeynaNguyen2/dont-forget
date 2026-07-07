import { redirect } from "next/navigation";

import OnboardingLocation from "@/components/OnboardingLocation";
import { getSession } from "@/lib/session";
import { getUserProfileOrDefault } from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export default async function OnboardingLocationPage() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const profile = await getUserProfileOrDefault(session.user.email);
  if (profile.onboardingCompleted) {
    redirect("/");
  }

  return <OnboardingLocation />;
}
