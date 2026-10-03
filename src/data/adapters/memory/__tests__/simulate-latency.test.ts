import { simulateLatency } from "../simulate-latency";

describe("simulateLatency", () => {
  it("resolves within the documented 120-400ms jitter window", async () => {
    const start = Date.now();
    await simulateLatency();
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(115); // small slack for timer coarseness
    expect(elapsed).toBeLessThan(500);
  });

  it("jitters — consecutive calls don't all take the same time", async () => {
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await simulateLatency();
      samples.push(Date.now() - start);
    }
    expect(new Set(samples).size).toBeGreaterThan(1);
  });
});
