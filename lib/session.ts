import { cookies, headers } from "next/headers";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separator = part.indexOf("=");
        if (separator === -1) {
          return [part, ""];
        }

        return [part.slice(0, separator), part.slice(separator + 1)];
      })
  );
}

function buildAuthRequest(request?: Request) {
  const cookieStore = cookies();
  const headerStore = headers();
  const cookieRecord = Object.fromEntries(
    cookieStore.getAll().map(({ name, value }) => [name, value])
  );

  if (request) {
    Object.assign(cookieRecord, parseCookieHeader(request.headers.get("cookie")));
  }

  return {
    cookies: cookieRecord,
    headers: request
      ? Object.fromEntries(request.headers.entries())
      : Object.fromEntries(headerStore.entries()),
  };
}

const authResponseStub = {
  getHeader() {
    return undefined;
  },
  setCookie() {},
  setHeader() {},
};

export function getSessionCookieHeader(request?: Request): string | null {
  const { cookies: cookieRecord } = buildAuthRequest(request);
  const entries = Object.entries(cookieRecord);

  if (entries.length === 0) {
    return null;
  }

  return entries.map(([name, value]) => `${name}=${value}`).join("; ");
}

export function getSession(request?: Request) {
  const req = buildAuthRequest(request) as unknown as NextApiRequest;
  const res = authResponseStub as unknown as NextApiResponse;

  return getServerSession(req, res, authOptions);
}
