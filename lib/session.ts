import { cookies } from "next/headers";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}

export function getSessionCookieHeader(): string | null {
  const cookieStore = cookies();
  const entries = cookieStore.getAll();

  if (entries.length === 0) {
    return null;
  }

  return entries.map(({ name, value }) => `${name}=${value}`).join("; ");
}
