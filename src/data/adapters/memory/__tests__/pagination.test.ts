import { paginate } from "../pagination";

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i);

  it("defaults to a 20-item page starting at cursor 0", () => {
    const page = paginate(items, {});
    expect(page.items).toEqual(items.slice(0, 20));
    expect(page.nextCursor).toBe("20");
  });

  it("honors an explicit limit", () => {
    const page = paginate(items, { limit: 5 });
    expect(page.items).toEqual([0, 1, 2, 3, 4]);
    expect(page.nextCursor).toBe("5");
  });

  it("follows a cursor to the next page", () => {
    const first = paginate(items, { limit: 10 });
    const second = paginate(items, { limit: 10, cursor: first.nextCursor });
    expect(second.items).toEqual(items.slice(10, 20));
    expect(second.nextCursor).toBe("20");
  });

  it("returns null nextCursor once exhausted", () => {
    const page = paginate(items, { limit: 100 });
    expect(page.items).toEqual(items);
    expect(page.nextCursor).toBeNull();
  });

  it("handles an empty collection", () => {
    const page = paginate([], {});
    expect(page.items).toEqual([]);
    expect(page.nextCursor).toBeNull();
  });
});
