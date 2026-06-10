import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/components/HomePage";
import { authOptions } from "@/lib/auth";
import {
  getPostAuthRedirectPath,
  getUserProfileOrDefault,
  needsOnboarding,
} from "@/lib/user-profile";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

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
