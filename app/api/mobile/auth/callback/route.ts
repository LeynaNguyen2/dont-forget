import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";

const SESSION_COOKIE_KEY = "next-auth.session-token";
const SECURE_SESSION_COOKIE_KEY = "__Secure-next-auth.session-token";

function redirectToApp(params: Record<string, string>): NextResponse {
  const url = new URL("dontforget://auth");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET() {
  const session = await getSession();

  if (!session?.user) {
    return redirectToApp({ error: "unauthorized" });
  }

  const cookieStore = cookies();
  const secureCookie = cookieStore.get(SECURE_SESSION_COOKIE_KEY);
  const sessionCookie = cookieStore.get(SESSION_COOKIE_KEY);
  const cookieName = secureCookie
    ? SECURE_SESSION_COOKIE_KEY
    : SESSION_COOKIE_KEY;
  const cookieValue = secureCookie?.value ?? sessionCookie?.value;

  if (!cookieValue) {
    return redirectToApp({ error: "no_session" });
  }

  return redirectToApp({
    cookie: `${cookieName}=${cookieValue}`,
  });
}
