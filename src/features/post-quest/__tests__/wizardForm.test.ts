import {
  emptyForm,
  durationOption,
  expiryOption,
  dateOptions,
  timeOptions,
  tpeISO,
  expiryISO,
  draftHasContent,
  computeErrors,
  isStepValid,
  budgetMinorOf,
  POST_STEPS,
  type PostQuestForm,
} from "../wizardForm";

const NOW = Date.parse("2026-09-16T09:00:00+08:00");

describe("emptyForm", () => {
  it("seeds the given default area and a default duration", () => {
    const form = emptyForm("Da'an");
    expect(form.area).toBe("Da'an");
    expect(form.minutes).toBe("60");
    expect(form.title).toBe("");
  });
});

describe("durationOption / expiryOption", () => {
  it("finds a known duration by value, including open-ended ones", () => {
    expect(durationOption("360plus")).toEqual({ value: "360plus", label: "6+ hr", minutes: 360, open: true });
  });

  it("falls back to the 1hr default for an unknown duration value", () => {
    expect(durationOption("nope").value).toBe("60");
  });

  it("finds a known expiry option", () => {
    expect(expiryOption("24h").label).toBe("In 24 hours");
  });

  it("falls back to the first expiry option for an unknown value", () => {
    expect(expiryOption("nope").value).toBe("before");
  });
});

describe("dateOptions", () => {
  it("gives 14 days starting today, labelled Today/Tomorrow then weekday+date", () => {
    const options = dateOptions(NOW);
    expect(options).toHaveLength(14);
    expect(options[0].label).toBe("Today");
    expect(options[0].value).toBe("2026-09-16");
    expect(options[1].label).toBe("Tomorrow");
    expect(options[1].value).toBe("2026-09-17");
    expect(options[2].label).toBe("Fri, 18 Sep");
  });
});

describe("timeOptions", () => {
  it("gives 30-minute increments across the day, 12h-formatted labels", () => {
    const options = timeOptions();
    expect(options[0]).toEqual({ value: "07:00", label: "7:00 AM" });
    expect(options.find((o) => o.value === "18:00")).toEqual({ value: "18:00", label: "6:00 PM" });
    expect(options.find((o) => o.value === "12:30")).toEqual({ value: "12:30", label: "12:30 PM" });
    expect(options[options.length - 1]).toEqual({ value: "22:00", label: "10:00 PM" });
  });
});

describe("tpeISO / expiryISO", () => {
  it("combines a date and time into a Taipei-offset ISO instant", () => {
    expect(tpeISO("2026-09-20", "14:00")).toBe("2026-09-20T14:00:00+08:00");
  });

  it("expiry 'start' returns the scheduled instant unchanged", () => {
    const scheduled = "2026-09-20T14:00:00+08:00";
    expect(expiryISO(scheduled, "start", NOW)).toBe(scheduled);
  });

  it("expiry '24h' returns now + 24 hours", () => {
    const iso = expiryISO("2026-09-20T14:00:00+08:00", "24h", NOW);
    expect(Date.parse(iso)).toBe(NOW + 24 * 60 * 60 * 1000);
  });

  it("expiry 'before' returns one hour before the scheduled instant", () => {
    const iso = expiryISO("2026-09-20T14:00:00+08:00", "before", NOW);
    expect(iso).toBe("2026-09-20T05:00:00.000Z"); // 13:00 +08:00
  });
});

describe("draftHasContent", () => {
  it("is false for a freshly emptied form", () => {
    expect(draftHasContent(emptyForm("Da'an"))).toBe(false);
  });

  it("is true once any meaningful field has content", () => {
    expect(draftHasContent({ ...emptyForm("Da'an"), title: "Walk my dog" })).toBe(true);
    expect(draftHasContent({ ...emptyForm("Da'an"), date: "2026-09-20" })).toBe(true);
  });
});

describe("computeErrors / isStepValid", () => {
  const VALID: PostQuestForm = {
    title: "Walk my dog for an hour",
    details: "",
    categoryId: "dog-walking",
    address: "14B, Lane 31, Yongkang St",
    area: "Da'an",
    date: "2026-09-20",
    time: "14:00",
    minutes: "60",
    expiry: "before",
    budget: "400",
  };

  it("a fully valid form has no errors and every step is valid", () => {
    const errors = computeErrors(VALID);
    expect(errors).toEqual({ title: null, address: null, when: null, budget: null });
    for (let i = 0; i < POST_STEPS.length; i++) {
      expect(isStepValid(i, errors)).toBe(true);
    }
  });

  it("blocks the 'what' step on a too-short title", () => {
    const errors = computeErrors({ ...VALID, title: "Walk" });
    expect(errors.title).toBeTruthy();
    expect(isStepValid(0, errors)).toBe(false);
  });

  it("blocks the 'where' step on a missing address or missing date/time", () => {
    expect(isStepValid(1, computeErrors({ ...VALID, address: "" }))).toBe(false);
    expect(isStepValid(1, computeErrors({ ...VALID, date: "" }))).toBe(false);
    expect(isStepValid(1, computeErrors({ ...VALID, time: "" }))).toBe(false);
  });

  it("blocks the 'budget' step on a zero or empty budget", () => {
    expect(isStepValid(2, computeErrors({ ...VALID, budget: "" }))).toBe(false);
    expect(isStepValid(2, computeErrors({ ...VALID, budget: "0" }))).toBe(false);
  });

  it("the 'review' step has no fields of its own to block on", () => {
    expect(isStepValid(3, computeErrors({ ...VALID, title: "", address: "", budget: "" }))).toBe(true);
  });
});

describe("budgetMinorOf", () => {
  it("parses a decimal NTD string into minor units", () => {
    expect(budgetMinorOf({ ...emptyForm("Da'an"), budget: "400" })).toBe(40000);
    expect(budgetMinorOf({ ...emptyForm("Da'an"), budget: "400.5" })).toBe(40050);
  });

  it("is zero for an empty or unparsable budget", () => {
    expect(budgetMinorOf(emptyForm("Da'an"))).toBe(0);
  });
});
