/* Non-route helper — the leading underscore on this directory tells Expo
   Router to skip it entirely, so this file is never mistaken for a screen.

   ADR-009's actor switcher and clock, and ADR-008's fault-injection
   switch. Deliberately scoped: no M0 screen reads `actorId` or `now` yet
   (tokens.tsx/components.tsx are pure design-system specimens, not
   actor- or time-dependent), so this context exists as real, working
   state with nothing downstream consuming it yet — exactly ADR-009's
   "time is a value in the store, never Date.now()" built ahead of the
   screens that will actually need it, not simulated. */
import { createContext, useContext, useState, type ReactNode } from "react";

export interface PreviewControlsValue {
  actorId: string | null;
  setActorId: (id: string) => void;
  /** ISO instant. Advances only via advanceClock — never read from the
      real system clock once set. */
  now: string;
  advanceClock: (deltaMs: number) => void;
}

const PreviewControlsContext = createContext<PreviewControlsValue | null>(null);

export function PreviewControlsProvider({ children }: { children: ReactNode }) {
  const [actorId, setActorId] = useState<string | null>(null);
  const [now, setNow] = useState<string>(() => new Date().toISOString());

  const value: PreviewControlsValue = {
    actorId,
    setActorId,
    now,
    advanceClock: (deltaMs) => setNow((prev) => new Date(new Date(prev).getTime() + deltaMs).toISOString()),
  };

  return <PreviewControlsContext.Provider value={value}>{children}</PreviewControlsContext.Provider>;
}

export function usePreviewControls(): PreviewControlsValue {
  const ctx = useContext(PreviewControlsContext);
  if (!ctx) {
    throw new Error("usePreviewControls() called outside <PreviewControlsProvider>");
  }
  return ctx;
}
