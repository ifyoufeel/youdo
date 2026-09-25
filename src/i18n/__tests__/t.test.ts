import { t } from "../t";

describe("t()", () => {
  it("returns the string for a known key", () => {
    expect(t("onboarding.welcome.cta")).toBe("Get started");
  });

  it("interpolates {{var}} placeholders", () => {
    expect(t("onboarding.contact.sentToast", { contact: "alex@example.tw" })).toBe(
      "Code sent to alex@example.tw"
    );
  });

  it("leaves an unmatched placeholder untouched rather than throwing", () => {
    expect(t("onboarding.code.body", {})).toBe("We sent a 6-digit code to {{contact}}.");
  });

  it("returns the template unchanged when no vars are needed", () => {
    expect(t("tabs.browse")).toBe("Browse");
  });
});
