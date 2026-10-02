/* Real as of the photo-upload feature (scaffold — never run against a
   live project, same posture as the rest of M7/M8). The one real
   divergence from Supabase's own docs: an RN File/Blob doesn't upload
   correctly (supabase-js's own upload() doc comment says so explicitly
   — "For React Native, using either Blob, File or FormData does not
   work as intended"), so this reads the local file as a real
   ArrayBuffer via expo-file-system's File class (SDK 57's class-based
   API, which implements the web Blob interface's arrayBuffer() for
   real) rather than fetch()ing the local URI into a Blob. No base64
   round-trip needed — arrayBuffer() already returns raw bytes.

   Path is `${auth.uid()}/${randomUUID()}.ext` — matching
   20261003000000_photos.sql's RLS, which only allows writing under the
   caller's own uid-named folder. getPublicUrl() is synchronous in
   supabase-js (it's pure string construction against the bucket's
   already-public base URL, no request made) — nothing to await. */
import * as Crypto from "expo-crypto";
import { File } from "expo-file-system";
import type { UploadKind, UploadsPort } from "../../ports/uploads";
import { supabase } from "./client";

const BUCKET_FOR: Record<UploadKind, string> = {
  avatar: "avatars",
  quest: "quest-photos",
};

function extensionOf(localUri: string): string {
  const match = /\.([a-zA-Z0-9]+)(?:\?.*)?$/.exec(localUri);
  return match ? match[1].toLowerCase() : "jpg";
}

function contentTypeFor(extension: string): string {
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return "image/jpeg";
}

export function createSupabaseUploadsPort(): UploadsPort {
  return {
    async uploadPhoto(localUri, kind) {
      const { data: userData, error: userError } = await supabase().auth.getUser();
      if (userError) throw userError;
      const userId = userData.user?.id;
      if (!userId) throw new Error("uploadPhoto: not signed in");

      const extension = extensionOf(localUri);
      const path = `${userId}/${Crypto.randomUUID()}.${extension}`;
      const buffer = await new File(localUri).arrayBuffer();

      const bucket = BUCKET_FOR[kind];
      const { error } = await supabase()
        .storage.from(bucket)
        .upload(path, buffer, { contentType: contentTypeFor(extension) });
      if (error) throw error;

      return supabase().storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
  };
}
