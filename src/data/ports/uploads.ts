/** The seam a profile avatar and a quest's photos both cross — picking
    an image (expo-image-picker) always happens in feature code, never
    here; this port starts only once a picker hands back a local device
    URI, and turns that into a stable public URL the rest of the app can
    store (User.avatarUrl, Quest.photos). One method, two real
    consumers (Settings' avatar upload, the post wizard's photo step) —
    the same "promote once a second consumer needs it" threshold this
    codebase applies everywhere else, just at the port level instead of
    the design-system level. See docs/DECISIONS.md's ADR-018 for why the
    memory adapter's implementation is honest rather than a no-op: a
    local URI *is* a real, directly renderable value with no server to
    round-trip through. */
export type UploadKind = "avatar" | "quest";

export interface UploadsPort {
  uploadPhoto(localUri: string, kind: UploadKind): Promise<string>;
}
