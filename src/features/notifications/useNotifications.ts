/* Fires markAllRead once on mount — mirrors app.js's own
   useEffect(readAllNotifications, []) — so the bell badge clears
   everywhere it's rendered off the shared query cache the moment the
   inbox is actually opened, not just its own list. */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { useAuthSession } from "@data/auth-session";
import { newIdempotencyKey } from "@lib/idempotency";

export function useNotifications() {
  const repository = useRepository();
  const queryClient = useQueryClient();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const listQuery = useQuery({
    queryKey: ["notifications", "list", userId],
    queryFn: () => repository.listForUser(userId as string),
    enabled: !!userId,
  });

  const markAllRead = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("Not signed in");
      return repository.markAllRead(userId, { idempotencyKey: newIdempotencyKey() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "list", userId] });
    },
  });

  useEffect(() => {
    if (userId) markAllRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const notifications = listQuery.data ?? [];

  return {
    notifications,
    unreadCount: notifications.filter((n) => !n.readAt).length,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
  };
}

/** A lighter read for bell-badge wiring elsewhere (MyQuestsScreen,
    ChatsScreen) — same query cache, but doesn't fire markAllRead just
    for showing a count. */
export function useUnreadNotificationCount(): number {
  const repository = useRepository();
  const { session } = useAuthSession();
  const userId = session?.userId;

  const listQuery = useQuery({
    queryKey: ["notifications", "list", userId],
    queryFn: () => repository.listForUser(userId as string),
    enabled: !!userId,
  });

  return (listQuery.data ?? []).filter((n) => !n.readAt).length;
}
