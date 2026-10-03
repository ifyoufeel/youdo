/* Mirrors useSubmitReview's shape. No cache invalidation needed — nothing
   in the product reads a report back (see contracts/report.ts). */
import { useMutation } from "@tanstack/react-query";
import { useRepository } from "@data/composition-root";
import { newIdempotencyKey } from "@lib/idempotency";

export interface ReportUserInput {
  reporterId: string;
  targetUserId: string;
  reason: string;
}

export function useReportUser() {
  const repository = useRepository();
  return useMutation({
    mutationFn: ({ reporterId, targetUserId, reason }: ReportUserInput) =>
      repository.reportUser(reporterId, targetUserId, reason, { idempotencyKey: newIdempotencyKey() }),
  });
}
