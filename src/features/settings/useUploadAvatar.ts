/* Settings' "Change photo" button: picks a device photo, uploads it via
   the already-real UploadsPort, then writes the result onto the user's
   own profile — the one real consumer this port needed to justify
   existing at all alongside the post wizard's quest photos.

   Resolving to `null` (permission denied, or the picker was dismissed)
   is a legitimate outcome, not an error — the caller just has nothing
   new to show, the same posture usePushRegistration's own no-ops take
   for a denied permission. */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";
import type { User } from "@data/contracts";

export function useUploadAvatar(userId: string | undefined) {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<User | null> => {
      let permission = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      }
      if (!permission.granted) return null;

      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
      if (result.canceled || !result.assets[0]) return null;

      const url = await repository.uploadPhoto(result.assets[0].uri, "avatar");
      return repository.updateProfile(userId as string, { avatarUrl: url }, { idempotencyKey: newIdempotencyKey() });
    },
    onSuccess: (updated) => {
      if (updated) queryClient.setQueryData(["users", userId], updated);
    },
  });
}
