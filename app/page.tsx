import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/components/HomePage";
import { authOptions } from "@/lib/auth";
import { getUserProfileOrDefault } from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const profile = await getUserProfileOrDefault(session.user.email);
  if (!profile.onboardingCompleted) {
    redirect("/onboarding/location");
  }

  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
