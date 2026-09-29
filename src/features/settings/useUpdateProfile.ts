/* Wraps the already-real UsersPort.updateProfile — Settings' first real
   consumer (phone/email/area, the last one always paired with `home` so
   the point every distance is measured from actually moves too). */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";
import type { UpdateProfileInput } from "@data/ports/users";

export function useUpdateProfile(userId: string | undefined) {
  const repository = useRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UpdateProfileInput) =>
      repository.updateProfile(userId as string, patch, { idempotencyKey: newIdempotencyKey() }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["users", userId], updated);
    },
  });
}
