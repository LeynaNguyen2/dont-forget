import { cookies, headers } from "next/headers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

function normalizeAuthCookies(
  entries: { name: string; value: string }[]
): Record<string, string> {
  return Object.fromEntries(
    entries.map(({ name, value }) => {
      if (!name.includes("callback-url") || !/%[0-9A-Fa-f]{2}/.test(value)) {
        return [name, value];
      }

      try {
        const decoded = decodeURIComponent(value);
        if (decoded.startsWith("/") || decoded.startsWith("http")) {
          return [name, decoded];
        }
      } catch {
        // fall through
      }

      return [name, "/"];
    })
  );
}

const authResponseStub = {
  getHeader() {
    return undefined;
  },
  setCookie() {},
  setHeader() {},
};

export function getSession() {
  const req = {
    cookies: normalizeAuthCookies(cookies().getAll()),
    headers: Object.fromEntries(headers().entries()),
  } as unknown as NextApiRequest;

  return getServerSession(
    req,
    authResponseStub as unknown as NextApiResponse,
    authOptions
  );
}

export function getSessionCookieHeader(): string | null {
  const entries = Object.entries(
    normalizeAuthCookies(cookies().getAll())
  );

  if (entries.length === 0) {
    return null;
  }

  return entries.map(([name, value]) => `${name}=${value}`).join("; ");
}
