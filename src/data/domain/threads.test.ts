import { threadFor, threadsFor, otherSideOf, unreadIn } from "./threads";
import type { Thread, Message } from "../contracts";

const THREADS: Thread[] = [
  { id: "t1", questId: "q1", posterId: "p1", doerId: "d1", lastMessageAt: "2026-09-16T08:00:00+08:00" },
  { id: "t2", questId: "q1", posterId: "p1", doerId: "d2", lastMessageAt: "2026-09-16T09:00:00+08:00" },
  { id: "t3", questId: "q2", posterId: "p2", doerId: "d1", lastMessageAt: "2026-09-16T07:00:00+08:00" },
];

describe("threadFor", () => {
  it("finds the one thread for a (quest, doer) pair", () => {
    expect(threadFor(THREADS, "q1", "d2")?.id).toBe("t2");
  });

  it("returns null when that doer never offered on the quest", () => {
    expect(threadFor(THREADS, "q1", "d-nobody")).toBeNull();
  });

  it("a second offer's thread is never confused with the first's, even on the same quest", () => {
    expect(threadFor(THREADS, "q1", "d1")?.id).toBe("t1");
    expect(threadFor(THREADS, "q1", "d2")?.id).toBe("t2");
  });
});

describe("threadsFor", () => {
  it("returns every thread a user is a side of, newest activity first", () => {
    expect(threadsFor(THREADS, "p1").map((t) => t.id)).toEqual(["t2", "t1"]);
  });

  it("matches on either posterId or doerId", () => {
    expect(threadsFor(THREADS, "d1").map((t) => t.id).sort()).toEqual(["t1", "t3"]);
  });

  it("returns an empty list for a user on no threads", () => {
    expect(threadsFor(THREADS, "nobody")).toEqual([]);
  });
});

describe("otherSideOf", () => {
  it("returns the doer's id when asked from the poster's side", () => {
    expect(otherSideOf(THREADS[0], "p1")).toBe("d1");
  });

  it("returns the poster's id when asked from the doer's side", () => {
    expect(otherSideOf(THREADS[0], "d1")).toBe("p1");
  });
});

describe("unreadIn", () => {
  const MESSAGES: Message[] = [
    { id: "m1", senderId: "them", body: "hi", at: "2026-09-16T08:00:00+08:00" },
    { id: "m2", senderId: "me", body: "hey", at: "2026-09-16T08:10:00+08:00" },
    { id: "m3", senderId: "them", body: "see you at six", at: "2026-09-16T08:20:00+08:00" },
  ];

  it("counts only messages from the other side, sent after the reader's own last-read timestamp", () => {
    expect(unreadIn(MESSAGES, "me", "2026-09-16T08:05:00+08:00")).toBe(1); // only m3 qualifies
  });

  it("counts everything from the other side when the reader has never opened the thread", () => {
    expect(unreadIn(MESSAGES, "me", null)).toBe(2); // m1 and m3
  });

  it("never counts a message the reader sent to themselves", () => {
    expect(unreadIn([MESSAGES[1]], "me", null)).toBe(0);
  });

  it("returns 0 once every message from the other side is at or before readAt", () => {
    expect(unreadIn(MESSAGES, "me", "2026-09-16T08:20:00+08:00")).toBe(0);
  });
});
