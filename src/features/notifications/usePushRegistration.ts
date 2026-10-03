/* Registers this device's Expo push token once signed in, and clears it
   on sign-out — the client half of push delivery (PRD §7.9), the piece
   named "no push pipeline exists yet" on the ROADMAP since M6. Never
   runs on web (expo-notifications' web push is a separate, unbuilt
   flow) and never fabricates `extra.eas.projectId` — ADR-016 already
   decided that value only exists after a real `eas init`, so until one
   runs, `getExpoPushTokenAsync` is never even called; this hook asks
   for permission and stops there, honestly, rather than inventing a
   project id to make the call succeed.

   Every native call below is wrapped in one try/catch: permission
   prompts and token fetches are real device/network boundaries that can
   throw (no physical device, a denied permission, no connectivity), and
   losing push registration silently is correct there — nothing about
   using the app should ever fail because a push token couldn't be
   obtained. */
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";

export function usePushRegistration() {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  useEffect(() => {
    if (!userId || Platform.OS === "web") return;
    let cancelled = false;

    (async () => {
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        if (!projectId) return;

        let permissions = await Notifications.getPermissionsAsync();
        if (!permissions.granted) {
          permissions = await Notifications.requestPermissionsAsync();
        }
        if (!permissions.granted || cancelled) return;

        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        if (!cancelled) await repository.registerPushToken(userId, token.data);
      } catch {
        // See header comment — a real device/network boundary, never a
        // reason to fail sign-in.
      }
    })();

    return () => {
      cancelled = true;
      // Fire-and-forget: clears the token this same effect instance
      // registered the moment userId stops being defined (a real
      // sign-out) or the app unmounts. Swallow errors for the same
      // reason the registration path does.
      repository.registerPushToken(userId, null).catch(() => {});
    };
  }, [userId, repository]);
}
