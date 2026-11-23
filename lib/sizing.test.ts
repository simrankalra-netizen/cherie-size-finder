// Automatic checks. Run them with:  npm test
import { describe, expect, it } from "vitest";
import { SIZE_CHART, type SizeRow } from "../data/size-chart";
import { findNoteProblem } from "./copy-guard";
import { findSize, isChartValid, type FitInput } from "./sizing";

const base: FitInput = { unit: "cm", underbust: "", bust: "", bandRidesUp: "no", strapsDigIn: "no" };
const size = (change: Partial<FitInput>) => findSize({ ...base, ...change });

describe("the size chart file", () => {
  it("has no gaps, overlaps or missing numbers", () => {
    expect(isChartValid(SIZE_CHART)).toBe(true);
  });

  it("a broken chart gives the 'short rest' message, never a size", () => {
    const broken: SizeRow[] = SIZE_CHART.map((r) => ({ ...r, underbust: { ...r.underbust } }));
    broken[1].underbust.from = 75; // gap between S and M
    const result = findSize({ ...base, underbust: "76", bust: "90" }, broken);
    expect(result).toMatchObject({ ok: false, reason: "chart" });
  });
});

describe("Test 1: the right size from the chart", () => {
  it.each([
    ["70", "83", "S"],
    ["76", "90", "M"],
    ["82", "97", "L"],
    ["88", "104", "XL"],
  ])("cm: underbust %s, bust %s → %s", (underbust, bust, expected) => {
    expect(size({ underbust, bust })).toMatchObject({ ok: true, size: expected, between: null });
  });

  it("inches are converted: 30 in / 35.5 in → M", () => {
    expect(size({ unit: "in", underbust: "30", bust: "35.5" })).toMatchObject({ ok: true, size: "M" });
  });

  it("a row's first number belongs to that row (74 cm underbust is M)", () => {
    expect(size({ underbust: "74", bust: "88" })).toMatchObject({ ok: true, size: "M" });
    expect(size({ underbust: "73.9", bust: "86" })).toMatchObject({ ok: true, size: "S" });
  });

  describe("between two sizes (S band, M bust), the fit answers decide", () => {
    const between = { underbust: "72", bust: "89" };
    it("straps dig in → size up to M", () => {
      expect(size({ ...between, strapsDigIn: "yes", bandRidesUp: "no" })).toMatchObject({ size: "M" });
    });
    it("band rides up → size down to S", () => {
      expect(size({ ...between, strapsDigIn: "no", bandRidesUp: "yes" })).toMatchObject({ size: "S" });
    });
    it("both → size up to M", () => {
      expect(size({ ...between, strapsDigIn: "sometimes", bandRidesUp: "yes" })).toMatchObject({ size: "M" });
    });
    it("neither → size up to M", () => {
      expect(size({ ...between, strapsDigIn: "no", bandRidesUp: "no" })).toMatchObject({ size: "M" });
    });
  });
});

describe("Test 3: bad input gives a friendly message and no size", () => {
  it.each([
    ["empty underbust", { underbust: "", bust: "90" }, "missing"],
    ["empty bust", { underbust: "76", bust: "   " }, "missing"],
    ["fit question not answered", { underbust: "76", bust: "90", strapsDigIn: "" }, "missing-answers"],
    ["letters", { underbust: "abc", bust: "90" }, "not-a-number"],
    ["zero", { underbust: "0", bust: "90" }, "not-a-number"],
    ["negative", { underbust: "-76", bust: "90" }, "not-a-number"],
    ["300 cm", { underbust: "76", bust: "300" }, "impossible"],
    ["cm typed with inches chosen", { unit: "in", underbust: "76", bust: "90" }, "impossible"],
    ["underbust bigger than bust", { underbust: "95", bust: "85" }, "order"],
    ["underbust equals bust", { underbust: "85", bust: "85" }, "order"],
    ["smaller than S", { underbust: "60", bust: "75" }, "out-of-range"],
    ["larger than XL", { underbust: "95", bust: "115" }, "out-of-range"],
    ["sizes two apart (S band, L bust)", { underbust: "70", bust: "96" }, "out-of-range"],
  ] as [string, Partial<FitInput>, string][])("%s", (_name, change, reason) => {
    const result = size(change);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ reason });
    expect(result).not.toHaveProperty("size");
  });

  it("outside the range uses the honest first-drop message", () => {
    const result = size({ underbust: "60", bust: "75" });
    expect(!result.ok && result.message).toContain("we'd rather tell you honestly");
  });
});

describe("Test 2: checks on the AI note", () => {
  const good = {
    explanation: "M should sit softly and stay put, since your straps tend to dig in.",
    tip: "On hot days, check that the band lies flat without pressing. Cherié bralettes are made to feel easy.",
  };
  it("a good note passes", () => expect(findNoteProblem(good, "M")).toBeNull());
  it("a banned phrase is caught", () =>
    expect(findNoteProblem({ ...good, tip: "It's eco-friendly too." }, "M")).toMatch(/banned/));
  it("a skin claim is caught", () =>
    expect(findNoteProblem({ ...good, tip: "It nourishes skin." }, "M")).toMatch(/banned/));
  it("any skin mention is caught (seen from the real AI)", () =>
    expect(findNoteProblem({ ...good, tip: "It lets your skin breathe as temperatures rise." }, "M")).toMatch(/banned/));
  it("suggesting talc is caught (seen from the real AI)", () =>
    expect(findNoteProblem({ ...good, tip: "A light dusting of talc keeps you fresh." }, "M")).toMatch(/banned/));
  it("a made-up number is caught", () =>
    expect(findNoteProblem({ ...good, tip: "Your 76 cm band is perfect." }, "M")).toMatch(/number/));
  it("another size is caught", () =>
    expect(findNoteProblem({ ...good, tip: "You could also try L." }, "M")).toMatch(/another size/));
  it("the brand name without its accent is caught", () =>
    expect(findNoteProblem({ ...good, tip: "Cherie fits gently." }, "M")).toMatch(/accent/));
});
