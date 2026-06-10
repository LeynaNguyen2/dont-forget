import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import OnboardingLocation from "@/components/OnboardingLocation";
import { authOptions } from "@/lib/auth";
import { getUserProfileOrDefault, needsOnboarding } from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export default async function OnboardingLocationPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const profile = await getUserProfileOrDefault(session.user.email);
  if (!needsOnboarding(profile)) {
    redirect("/");
  }

  return <OnboardingLocation />;
}
