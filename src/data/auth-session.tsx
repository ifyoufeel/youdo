/* The one piece of session state the whole app needs, following the same
   Context shape as RepositoryProvider/PreviewControlsProvider — nothing
   here needs zustand's cross-tree selectors, so it doesn't get any.
   `status` distinguishes "still resolving the initial getSession() call"
   from a real signed-out state; without it, cold-start gating (Phase 6)
   would flash the onboarding screen for the ~120-400ms the memory
   adapter's simulated latency takes before a real session even has a
   chance to resolve. */
import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "./ports/auth";
import { useRepository } from "./composition-root";

export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthSessionValue {
  status: AuthStatus;
  session: Session | null;
  signInWithGoogle: () => Promise<Session>;
  sendOtp: (contact: string, method: "email" | "phone") => Promise<void>;
  verifyOtp: (contact: string, code: string) => Promise<Session>;
  signOut: () => Promise<void>;
}

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const repository = useRepository();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    repository.getSession().then((resolved) => {
      if (cancelled) return;
      setSession(resolved);
      setStatus(resolved ? "signedIn" : "signedOut");
    });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  const signInWithGoogle = useCallback(async () => {
    const resolved = await repository.signInWithGoogle();
    setSession(resolved);
    setStatus("signedIn");
    return resolved;
  }, [repository]);

  const sendOtp = useCallback(
    (contact: string, method: "email" | "phone") => repository.sendOtp(contact, method),
    [repository]
  );

  const verifyOtp = useCallback(
    async (contact: string, code: string) => {
      const resolved = await repository.verifyOtp(contact, code);
      setSession(resolved);
      setStatus("signedIn");
      return resolved;
    },
    [repository]
  );

  const signOut = useCallback(async () => {
    await repository.signOut();
    setSession(null);
    setStatus("signedOut");
  }, [repository]);

  const value: AuthSessionValue = { status, session, signInWithGoogle, sendOtp, verifyOtp, signOut };
  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession(): AuthSessionValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession() called outside <AuthSessionProvider>");
  }
  return ctx;
}
