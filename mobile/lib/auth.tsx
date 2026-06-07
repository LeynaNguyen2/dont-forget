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
  AUTH_REDIRECT_SCHEME,
  fetchSession,
  getSignInUrl,
  parseAuthCallbackUrl,
  setSessionCookie,
} from "./api";
import type { Session } from "./types";

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthCallbackParams {
  cookie?: string | string[];
  error?: string | string[];
}

interface AuthContextValue {
  status: AuthStatus;
  session: Session | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  completeAuthCallback: (
    params: AuthCallbackParams | string
  ) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_STORAGE_KEY = "dont-forget-session-cookie";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

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

  const completeAuthCallback = useCallback(
    async (params: AuthCallbackParams | string): Promise<boolean> => {
      const parsed =
        typeof params === "string"
          ? parseAuthCallbackUrl(params)
          : {
              cookie: firstParam(params.cookie) ?? null,
              error: firstParam(params.error) ?? null,
            };

      if (parsed.error) {
        console.error("Mobile auth callback error:", parsed.error);
        return false;
      }

      if (!parsed.cookie) {
        return false;
      }

      await storeCookie(parsed.cookie);
      return true;
    },
    []
  );

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
      AUTH_REDIRECT_SCHEME
    );

    if (result.type === "success" && result.url) {
      await completeAuthCallback(result.url);
    }

    await refreshSession();
  }, [completeAuthCallback, refreshSession]);

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
      completeAuthCallback,
    }),
    [status, session, signIn, signOut, refreshSession, completeAuthCallback]
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
