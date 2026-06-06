"use client";

import SignInButton from "@/components/SignInButton";

export default function SignInScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#EEF2FF] px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF] text-3xl">
          📅
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Don&apos;t Forget
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          Your smart morning briefing with calendar events and weather for
          every location.
        </p>
        <div className="mt-8">
          <SignInButton />
        </div>
      </div>
    </main>
  );
}
