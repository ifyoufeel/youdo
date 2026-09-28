/* Non-route helper — the leading underscore on this directory tells Expo
   Router to skip it entirely, so this file is never mistaken for a screen.

   ADR-009's actor switcher and clock, and ADR-008's fault-injection
   switch. `now`/`advanceClock` are thin wrappers around the real memory
   adapter's clock (src/data/composition-root's useNow()/advanceClock,
   M5) — DevStrip's +1h/+1d/+3d buttons now actually move quest/offer/
   ledger state, not just this context's own display string. `actorId`
   stays local-only dev state; nothing downstream reads it yet. */
import { createContext, useContext, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { advanceClock as advanceRealClock, useNow } from "@data/composition-root";

export interface PreviewControlsValue {
  actorId: string | null;
  setActorId: (id: string) => void;
  /** ISO instant, derived from the real memory-adapter clock. */
  now: string;
  advanceClock: (deltaMs: number) => void;
}

const PreviewControlsContext = createContext<PreviewControlsValue | null>(null);

export function PreviewControlsProvider({ children }: { children: ReactNode }) {
  const [actorId, setActorId] = useState<string | null>(null);
  const nowMs = useNow();
  const queryClient = useQueryClient();

  const value: PreviewControlsValue = {
    actorId,
    setActorId,
    now: new Date(nowMs).toISOString(),
    advanceClock: (deltaMs) => {
      advanceRealClock(deltaMs);
      queryClient.invalidateQueries();
    },
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
