/* Hand-written barrel — the stable import surface over the three generated
   modules (ADR-002). Consumers import from "@design/tokens", never reach
   into raw.ts/semantic.ts/type.ts directly, so regenerating those three
   files never changes an import path anywhere else in the app. */
export * as raw from "./raw";
export * as semantic from "./semantic";
export * as type from "./type";
