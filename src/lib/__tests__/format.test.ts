import { formatDistance, formatDuration, formatWhenAt, formatRemaining } from "../format";

describe("formatDistance", () => {
  it("shows metres, rounded to the nearest 100, under 1km", () => {
    expect(formatDistance(240)).toBe("200 m");
    expect(formatDistance(999)).toBe("1000 m");
  });

  it("shows one decimal of km at and above 1km", () => {
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(4250)).toBe("4.3 km");
  });
});

describe("formatDuration", () => {
  it("shows minutes under 2 hours", () => {
    expect(formatDuration(40)).toBe("~40 min");
  });

  it("shows rounded hours at and above 120 minutes", () => {
    expect(formatDuration(180)).toBe("~3 hr");
  });
});

describe("formatWhenAt", () => {
  const TPE_9AM = "2026-09-16T09:00:00+08:00"; // matches seed.ts's `now`
  const now = Date.parse(TPE_9AM);

  it("returns empty string for a falsy iso", () => {
    expect(formatWhenAt("", now)).toBe("");
  });

  it("labels same-Taipei-day as Today", () => {
    expect(formatWhenAt("2026-09-16T18:00:00+08:00", now)).toBe("Today, 6pm");
  });

  it("labels the next Taipei day as Tomorrow", () => {
    expect(formatWhenAt("2026-09-17T10:00:00+08:00", now)).toBe("Tomorrow, 10am");
  });

  it("labels the previous Taipei day as Yesterday", () => {
    expect(formatWhenAt("2026-09-15T09:00:00+08:00", now)).toBe("Yesterday, 9am");
  });

  it("labels a weekday name within the coming week", () => {
    expect(formatWhenAt("2026-09-19T11:00:00+08:00", now)).toBe("Sat, 11am");
  });

  it("falls back to a date for anything further out", () => {
    expect(formatWhenAt("2026-10-01T11:00:00+08:00", now)).toBe("1 Oct, 11am");
  });
});

describe("formatRemaining", () => {
  const now = Date.parse("2026-09-16T09:00:00+08:00");

  it("returns null once the deadline has passed", () => {
    expect(formatRemaining("2026-09-16T08:00:00+08:00", now)).toBeNull();
  });

  it("shows minutes under an hour", () => {
    expect(formatRemaining("2026-09-16T09:30:00+08:00", now)).toBe("30 min");
  });

  it("shows hours under 48 hours", () => {
    expect(formatRemaining("2026-09-17T09:00:00+08:00", now)).toBe("24 hr");
  });

  it("shows days at and above 48 hours", () => {
    expect(formatRemaining("2026-09-20T09:00:00+08:00", now)).toBe("4 days");
  });
});
