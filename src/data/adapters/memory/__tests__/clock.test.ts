import { nowMs, nowIso, moveClock, subscribeClock, resetClockForTests } from "../clock";
import { seed } from "../seed";

describe("clock", () => {
  afterEach(() => {
    resetClockForTests();
  });

  it("starts at seed.now, not the device clock", () => {
    expect(nowMs()).toBe(Date.parse(seed.now));
    expect(nowIso()).toBe(new Date(Date.parse(seed.now)).toISOString());
  });

  it("moveClock advances by the given delta", () => {
    const before = nowMs();
    moveClock(60 * 60 * 1000);
    expect(nowMs()).toBe(before + 60 * 60 * 1000);
  });

  it("rejects a non-positive or non-finite delta", () => {
    expect(() => moveClock(0)).toThrow();
    expect(() => moveClock(-1)).toThrow();
    expect(() => moveClock(NaN)).toThrow();
    expect(() => moveClock(Infinity)).toThrow();
  });

  it("notifies subscribers on every move, and unsubscribe stops further notifications", () => {
    const fn = jest.fn();
    const unsubscribe = subscribeClock(fn);
    moveClock(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    unsubscribe();
    moveClock(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resetClockForTests restores the seed anchor by default", () => {
    moveClock(1000 * 60 * 60 * 24 * 5);
    resetClockForTests();
    expect(nowMs()).toBe(Date.parse(seed.now));
  });

  it("resetClockForTests accepts an explicit timestamp", () => {
    resetClockForTests(12345);
    expect(nowMs()).toBe(12345);
  });
});
