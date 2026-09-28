/* Chats tab badge count — client-side sum of unreadCountForThread across
   useThreads' own already-fetched summaries. A second N+1 layered on top
   of useThreads' own per-thread messages fetch (its own header comment
   already flags this), fine at fixture scale. */
import { useThreads } from "./useThreads";

export function useUnreadThreadCount(): number {
  const threads = useThreads();
  return threads.summaries.reduce((sum, s) => sum + s.unreadCount, 0);
}
