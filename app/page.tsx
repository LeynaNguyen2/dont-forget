import { redirect } from "next/navigation";

import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/components/HomePage";
import { getSession } from "@/lib/session";
import {
  getPostAuthRedirectPath,
  getUserProfileOrDefault,
  needsOnboarding,
} from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const profile = await getUserProfileOrDefault(session.user.email);
  if (needsOnboarding(profile)) {
    redirect(getPostAuthRedirectPath(profile));
  }

  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
