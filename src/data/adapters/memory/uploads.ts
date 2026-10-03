import type { UploadsPort } from "../../ports/uploads";
import { simulateLatency } from "./simulate-latency";
import { maybeInjectFault } from "./fault-injection";

/** Honest, not a stub: a locally-picked photo's device URI is already a
    value `<Image source={{uri}}>` can render directly, with no server
    to round-trip through in this adapter — so "uploading" it here is
    returning the same URI back once the fault/latency simulation has
    run, matching every other memory-adapter method's shape. The real
    limitation this doesn't paper over: a `file://`/content URI only
    resolves on the device that picked it, so the photo won't survive a
    reinstall or show up on a second device — named in ADR-018, not
    hidden. `kind` is unused here (nothing to route by without a real
    storage target) but kept on the signature since the Supabase adapter
    needs it to pick a bucket. */
export function createMemoryUploadsPort(): UploadsPort {
  return {
    async uploadPhoto(localUri, _kind) {
      await simulateLatency();
      maybeInjectFault("uploadPhoto");
      return localUri;
    },
  };
}
