import { isFirstUse, resetIdempotencyForTests } from "../idempotency";

describe("idempotency", () => {
  afterEach(() => {
    resetIdempotencyForTests();
  });

  it("returns true the first time a (method, key) pair is seen", () => {
    expect(isFirstUse("saveQuest", "k1")).toBe(true);
  });

  it("returns false on every replay of the same (method, key) pair", () => {
    expect(isFirstUse("saveQuest", "k1")).toBe(true);
    expect(isFirstUse("saveQuest", "k1")).toBe(false);
    expect(isFirstUse("saveQuest", "k1")).toBe(false);
  });

  it("tracks keys independently per method", () => {
    expect(isFirstUse("saveQuest", "k1")).toBe(true);
    expect(isFirstUse("unsaveQuest", "k1")).toBe(true);
  });

  it("tracks distinct keys independently within one method", () => {
    expect(isFirstUse("saveQuest", "k1")).toBe(true);
    expect(isFirstUse("saveQuest", "k2")).toBe(true);
  });

  it("resetIdempotencyForTests clears all tracked keys", () => {
    expect(isFirstUse("saveQuest", "k1")).toBe(true);
    resetIdempotencyForTests();
    expect(isFirstUse("saveQuest", "k1")).toBe(true);
  });
});
