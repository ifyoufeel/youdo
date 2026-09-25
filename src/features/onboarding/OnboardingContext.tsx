/* The in-flight contact/code draft shared across onboarding's contact ->
   code steps only — scoped to app/(onboarding)/_layout.tsx's subtree,
   mirroring PreviewControlsProvider's own placement pattern (a context
   that wraps only its subtree, not the whole app). Everything else
   onboarding needs (session, sign-in/verify) comes from
   AuthSessionProvider at the root — this context is purely the draft
   form state a multi-step flow needs to survive across route pushes. */
import { createContext, useContext, useState, type ReactNode } from "react";

export type ContactMethod = "email" | "phone";

export interface OnboardingDraft {
  mode: ContactMethod;
  setMode: (mode: ContactMethod) => void;
  contact: string;
  setContact: (contact: string) => void;
  contactError: string | null;
  setContactError: (error: string | null) => void;
  code: string;
  setCode: (code: string) => void;
  codeError: string | null;
  setCodeError: (error: string | null) => void;
}

const OnboardingContext = createContext<OnboardingDraft | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ContactMethod>("email");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const value: OnboardingDraft = {
    mode,
    setMode,
    contact,
    setContact,
    contactError,
    setContactError,
    code,
    setCode,
    codeError,
    setCodeError,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboardingDraft(): OnboardingDraft {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboardingDraft() called outside <OnboardingProvider>");
  }
  return ctx;
}
