/* No real product screens exist before M1 — the app's only content today
   is the preview rail (ADR-008), so the root route bounces straight into
   it. Redirects to tokens.tsx specifically (rather than the (preview)
   group path itself) since a route group has no screen of its own to
   land on without an index route, and adding one here would collide with
   this very file at the "/" path. */
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(preview)/tokens" />;
}
