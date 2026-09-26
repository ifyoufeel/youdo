import { setFaultInjectionRate, getFaultInjectionRate, maybeInjectFault } from "../fault-injection";

describe("fault injection", () => {
  afterEach(() => {
    setFaultInjectionRate(0);
  });

  it("defaults to 0 — never injects", () => {
    expect(getFaultInjectionRate()).toBe(0);
    for (let i = 0; i < 50; i++) expect(() => maybeInjectFault("op")).not.toThrow();
  });

  it("rate 1 always injects", () => {
    setFaultInjectionRate(1);
    expect(() => maybeInjectFault("getQuest")).toThrow(/Injected fault: getQuest failed/);
  });

  it("rejects an out-of-range rate", () => {
    expect(() => setFaultInjectionRate(1.5)).toThrow();
    expect(() => setFaultInjectionRate(-0.1)).toThrow();
  });

  it("getFaultInjectionRate reflects the last set value", () => {
    setFaultInjectionRate(0.5);
    expect(getFaultInjectionRate()).toBe(0.5);
  });
});
