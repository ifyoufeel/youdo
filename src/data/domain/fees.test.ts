import { feeOn, feeRateLabel, netOn } from "./fees";

describe("fees", () => {
  it("feeRateLabel reads the provisional 10% rate", () => {
    expect(feeRateLabel()).toBe("10%");
  });

  it("feeOn takes 10% of the gross, rounded down", () => {
    expect(feeOn(60000)).toBe(6000);
    expect(feeOn(10001)).toBe(1000); // floor, not round
  });

  it("netOn and feeOn always sum back to the gross amount", () => {
    for (const gross of [0, 1, 999, 40000, 105000, 1234567]) {
      expect(netOn(gross) + feeOn(gross)).toBe(gross);
    }
  });
});
