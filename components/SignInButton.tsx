"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full rounded-2xl bg-[#5B8DEF] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A7AD9]"
    >
      Connect with Google Calendar
    </button>
  );
}
