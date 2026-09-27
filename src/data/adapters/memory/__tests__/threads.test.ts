import { createMemoryThreadsPort } from "../threads";
import { messages as messageStore, threads as threadStore, quests as questStore, notifications } from "../store";
import { resetIdempotencyForTests } from "../idempotency";
import { setFaultInjectionRate } from "../fault-injection";

function key(): { idempotencyKey: string } {
  return { idempotencyKey: Math.random().toString(36).slice(2) };
}

describe("memory threads adapter", () => {
  const port = createMemoryThreadsPort();

  afterEach(() => {
    resetIdempotencyForTests();
    setFaultInjectionRate(0);
  });

  describe("listThreadsForUser", () => {
    it("returns every thread u0 is a side of, newest activity first", async () => {
      const list = await port.listThreadsForUser("u0");
      expect(list.map((t) => t.id)).toEqual([
        "t-q3-u0",
        "t-q1-u0",
        "t-q6-u2",
        "t-q6-u3",
        "t-q6-u5",
        "t-q7-u5",
        "t-q8-u0",
      ]);
    });

    it("returns an empty list for a user on no threads", async () => {
      expect(await port.listThreadsForUser("u-nobody")).toEqual([]);
    });
  });

  describe("getThread / listMessages", () => {
    it("getThread finds a thread by id", async () => {
      expect((await port.getThread("t-q1-u0"))?.questId).toBe("q1");
    });

    it("getThread returns null for an unknown id", async () => {
      expect(await port.getThread("t-nope")).toBeNull();
    });

    it("listMessages returns every seeded message on a thread, in order", async () => {
      const msgs = await port.listMessages("t-q1-u0");
      expect(msgs.map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4"]);
    });

    it("listMessages returns an empty list for a thread with none yet", async () => {
      expect(await port.listMessages("t-nope")).toEqual([]);
    });
  });

  describe("unreadCountForThread", () => {
    it("counts only the other side's messages sent after the reader's last read", async () => {
      // t-q1-u0: u0 read at 08:35; m3 (08:38) and m4 (08:41) are u1's and later.
      expect(await port.unreadCountForThread("t-q1-u0", "u0")).toBe(2);
    });

    it("counts everything from the other side when the reader has never opened the thread", async () => {
      // t-q6-u5 has no "u0:t-q6-u5" entry in threadReadAt.
      expect(await port.unreadCountForThread("t-q6-u5", "u0")).toBe(1);
    });

    it("returns 0 once the reader has read past every message", async () => {
      expect(await port.unreadCountForThread("t-q8-u0", "u0")).toBe(0);
    });
  });

  describe("sendMessage", () => {
    it("appends a message and bumps the thread's lastMessageAt", async () => {
      const before = messageStore.get("t-q6-u5")?.length ?? 0;
      const sent = await port.sendMessage("t-q6-u5", "u0", "On my way now.", key());
      expect(sent.senderId).toBe("u0");
      expect(sent.body).toBe("On my way now.");
      expect(messageStore.get("t-q6-u5")).toHaveLength(before + 1);
      expect(threadStore.find((t) => t.id === "t-q6-u5")?.lastMessageAt).toBe(sent.at);
    });

    it("notifies the other participant", async () => {
      const before = notifications.length;
      await port.sendMessage("t-q6-u3", "u0", "Sounds good.", key());
      const created = notifications.slice(before);
      expect(created).toHaveLength(1);
      expect(created[0].type).toBe("message");
      expect(created[0].userId).toBe("u3"); // t-q6-u3's doerId, the other side from u0
    });

    it("rejects an empty body", async () => {
      await expect(port.sendMessage("t-q1-u0", "u0", "   ", key())).rejects.toThrow(/Say something/);
    });

    it("rejects sending on a closed quest's thread", async () => {
      // t-q8-u0's quest (q8) is seeded "paid" — isClosed.
      await expect(port.sendMessage("t-q8-u0", "u0", "Thanks!", key())).rejects.toThrow(/read-only/);
    });

    it("replaying the same idempotency key returns the same message, not a duplicate", async () => {
      const k = key();
      const before = messageStore.get("t-q6-u2")?.length ?? 0;
      const first = await port.sendMessage("t-q6-u2", "u0", "Works for me.", k);
      const second = await port.sendMessage("t-q6-u2", "u0", "Works for me.", k);
      expect(second.id).toBe(first.id);
      expect(messageStore.get("t-q6-u2")).toHaveLength(before + 1);
    });

    it("honors the fault-injection switch", async () => {
      setFaultInjectionRate(1);
      await expect(port.sendMessage("t-q1-u0", "u0", "hi", key())).rejects.toThrow(/Injected fault/);
    });
  });

  describe("markThreadRead", () => {
    it("marks a thread as read for real, clearing its unread count", async () => {
      expect(await port.unreadCountForThread("t-q6-u5", "u0")).toBe(1);
      await port.markThreadRead("t-q6-u5", "u0");
      expect(await port.unreadCountForThread("t-q6-u5", "u0")).toBe(0);
    });
  });

  // Sanity that questStore is genuinely the same module-level state
  // sendMessage's closed-thread guard reads from — confirms q8 really is
  // the seeded "paid" quest the test above depends on.
  it("q8 (t-q8-u0's quest) is seeded closed", () => {
    expect(questStore.find((q) => q.id === "q8")?.status).toBe("paid");
  });
});
