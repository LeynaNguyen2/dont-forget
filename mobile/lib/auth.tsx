import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  fetchSession,
  getSignInUrl,
  setSessionCookie,
  SESSION_COOKIE_KEY,
  SECURE_SESSION_COOKIE_KEY,
} from "./api";
import type { Session } from "./types";

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_STORAGE_KEY = "dont-forget-session-cookie";

async function loadStoredCookie(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(COOKIE_STORAGE_KEY);
  } catch {
    return null;
  }
}

async function storeCookie(cookie: string | null): Promise<void> {
  if (cookie) {
    await SecureStore.setItemAsync(COOKIE_STORAGE_KEY, cookie);
  } else {
    await SecureStore.deleteItemAsync(COOKIE_STORAGE_KEY);
  }
  setSessionCookie(cookie);
}

function cookieFromSetCookieHeader(setCookie: string | null): string | null {
  if (!setCookie) {
    return null;
  }

  const parts = setCookie.split(",").map((part) => part.trim());
  const sessionParts: string[] = [];

  for (const part of parts) {
    if (
      part.startsWith(`${SESSION_COOKIE_KEY}=`) ||
      part.startsWith(`${SECURE_SESSION_COOKIE_KEY}=`)
    ) {
      sessionParts.push(part.split(";")[0]);
    }
  }

  return sessionParts.length > 0 ? sessionParts.join("; ") : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<Session | null>(null);

  const refreshSession = useCallback(async () => {
    const storedCookie = await loadStoredCookie();
    if (storedCookie) {
      setSessionCookie(storedCookie);
    }

    const nextSession = await fetchSession();
    if (nextSession?.user) {
      setSession(nextSession);
      setStatus("authenticated");
      return;
    }

    setSession(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    async function bootstrap() {
      const envCookie = process.env.EXPO_PUBLIC_SESSION_COOKIE;
      if (envCookie && !(await loadStoredCookie())) {
        await storeCookie(envCookie);
      }
      await refreshSession();
    }

    void bootstrap();
  }, [refreshSession]);

  const signIn = useCallback(async () => {
    const signInUrl = getSignInUrl();
    const result = await WebBrowser.openAuthSessionAsync(
      signInUrl,
      "dontforget://auth"
    );

    if (result.type === "success" && result.url) {
      const response = await fetch(result.url, { redirect: "manual" });
      const cookie = cookieFromSetCookieHeader(
        response.headers.get("set-cookie")
      );
      if (cookie) {
        await storeCookie(cookie);
      }
    }

    await refreshSession();
  }, [refreshSession]);

  const signOut = useCallback(async () => {
    await storeCookie(null);
    setSession(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({
      status,
      session,
      signIn,
      signOut,
      refreshSession,
    }),
    [status, session, signIn, signOut, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
