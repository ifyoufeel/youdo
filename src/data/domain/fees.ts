/* PRD §14.1's platform fee, ported verbatim from preview/app.js:286-295.
   FEE_BPS is explicitly provisional — PRD §14.1 hasn't settled the real
   rate — so it's a named constant callers read through feeRateLabel()
   rather than a number sprinkled through copy. */
const FEE_BPS = 1000; // 10.0%

export function feeRateLabel(): string {
  return (FEE_BPS / 100).toFixed(FEE_BPS % 100 === 0 ? 0 : 1) + "%";
}

export function feeOn(minor: number): number {
  return Math.floor((minor * FEE_BPS) / 10000);
}

export function netOn(minor: number): number {
  return minor - feeOn(minor);
}
