import { getServerSession } from "next-auth";
import SignOutButton from "@/components/SignOutButton";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Don&apos;t Forget</h1>
      {session?.user && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Signed in as {session.user.email}
          </p>
          <SignOutButton />
        </div>
      )}
    </main>
  );
}
