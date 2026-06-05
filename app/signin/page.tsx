import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SignInButton from "@/components/SignInButton";
import { authOptions } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-3xl font-bold">Don&apos;t Forget</h1>
        <p className="mt-3 text-gray-600 dark:text-gray-400">
          Connect your Google Calendar to get started.
        </p>
        <div className="mt-8">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
