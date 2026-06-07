import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/components/HomePage";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/signin");
  }

  return (
    <ErrorBoundary>
      <HomePage />
    </ErrorBoundary>
  );
}
