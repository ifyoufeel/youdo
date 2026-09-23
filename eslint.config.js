// ADR-004: src/data/adapters/* may only be imported by the composition root.
// ADR-001: src/design and src/data may not be imported by src/features
// (inert until src/features exists — M1 — written now so it's never forgotten).
// eslint-config-expo/flat already registers eslint-plugin-import under the
// "import" key — reuse that registration (re-registering it here would
// throw "Cannot redefine plugin") and just add the extra rule.
const expoConfig = require("eslint-config-expo/flat");
const { defineConfig } = require("eslint/config");

module.exports = defineConfig([
  expoConfig,
  {
    // preview/ and test/ are the existing plain-script prototype and its
    // jsdom test harness (docs/HANDOFF.md) — separate tools with their own
    // conventions, not part of this Expo project. Untouched by M0.
    ignores: ["dist/*", "web-build/*", ".expo/*", "preview/**", "test/**"],
  },
  {
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              // Everywhere allowed to import data/* EXCEPT the adapters
              // folder itself and composition-root.tsx (the one file
              // ADR-004 permits to import adapters directly).
              target: [
                "./src/design",
                "./src/data/contracts",
                "./src/data/ports",
                "./src/data/domain",
                "./app",
              ],
              from: "./src/data/adapters",
              message:
                "src/data/adapters/* may only be imported by src/data/composition-root (ADR-004) — go through the port/composition root instead.",
            },
            {
              target: "./src/design",
              from: "./src/features",
              message:
                "src/design must stay framework-agnostic w.r.t. features (ADR-001) — features may depend on design, never the reverse.",
            },
            {
              target: "./src/data",
              from: "./src/features",
              message:
                "src/data must stay framework-agnostic w.r.t. features (ADR-001) — features may depend on data, never the reverse.",
            },
          ],
        },
      ],
    },
  },
]);
