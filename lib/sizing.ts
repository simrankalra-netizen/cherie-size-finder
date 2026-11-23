// Plain code only: no AI here. This file checks the inputs and picks the size
// from the size chart. The same inputs always give the same answer.

import { SIZE_CHART, type Range, type Size, type SizeRow } from "../data/size-chart";

export type Unit = "cm" | "in";
export type Answer = "yes" | "sometimes" | "no";

export type FitInput = {
  unit: Unit;
  underbust: string; // exactly what the shopper typed
  bust: string;
  bandRidesUp: Answer | "";
  strapsDigIn: Answer | "";
};

export type ProblemReason =
  | "chart"
  | "missing"
  | "missing-answers"
  | "not-a-number"
  | "impossible"
  | "order"
  | "out-of-range";

// When the two measurements point to neighbouring sizes, we say which way we went.
export type Between = { sizes: [Size, Size]; went: "up" | "down" };

export type SizeResult =
  | { ok: true; size: Size; row: SizeRow; between: Between | null }
  | { ok: false; reason: ProblemReason; message: string };

export const MESSAGES: Record<ProblemReason, string> = {
  chart: "Our size finder is taking a short rest. Please try again soon.",
  missing: "Please add both your underbust and bust measurements, and we'll take it from there.",
  "missing-answers": "Please answer both fit questions. They help us choose between sizes.",
  "not-a-number": "That doesn't look quite like a measurement. Could you check it, using numbers only?",
  impossible:
    "Those numbers don't look quite right for a body measurement. Could you check them, and the cm or inches choice?",
  order: "Your underbust is usually smaller than your bust. Could you check both numbers?",
  "out-of-range":
    "We may not have your size in this first drop yet, and we'd rather tell you honestly than guess.",
};

const CM_PER_INCH = 2.54;
const SMALLEST_REAL_CM = 50; // anything below this can't be a real measurement
const LARGEST_REAL_CM = 200; // anything above this (e.g. 300 cm) can't be either

function problem(reason: ProblemReason): SizeResult {
  return { ok: false, reason, message: MESSAGES[reason] };
}

/** Checks the chart file has no gaps, overlaps or missing numbers. */
export function isChartValid(chart: SizeRow[]): boolean {
  const order: Size[] = ["S", "M", "L", "XL"];
  if (chart.length !== order.length) return false;
  const goodRange = (r: Range) =>
    Number.isFinite(r?.from) && Number.isFinite(r?.to) && r.from > 0 && r.from < r.to;
  return chart.every((row, i) => {
    if (row.size !== order[i] || !goodRange(row.underbust) || !goodRange(row.bust)) return false;
    if (i === 0) return true;
    const prev = chart[i - 1];
    return prev.underbust.to === row.underbust.from && prev.bust.to === row.bust.from;
  });
}

function rowIndexFor(cm: number, pick: (row: SizeRow) => Range, chart: SizeRow[]): number {
  return chart.findIndex((row) => cm >= pick(row).from && cm < pick(row).to);
}

/** The whole sizing rule, step by step. */
export function findSize(input: FitInput, chart: SizeRow[] = SIZE_CHART): SizeResult {
  // 1. Never use a broken chart.
  if (!isChartValid(chart)) return problem("chart");

  // 2. Both measurements and both answers are needed.
  const underbustText = input.underbust.trim();
  const bustText = input.bust.trim();
  if (underbustText === "" || bustText === "") return problem("missing");
  if (input.bandRidesUp === "" || input.strapsDigIn === "") return problem("missing-answers");

  // 3. They must be positive numbers.
  const underbustRaw = Number(underbustText);
  const bustRaw = Number(bustText);
  if (!Number.isFinite(underbustRaw) || !Number.isFinite(bustRaw) || underbustRaw <= 0 || bustRaw <= 0) {
    return problem("not-a-number");
  }

  // 4. Convert to cm, then reject impossible numbers.
  const toCm = input.unit === "in" ? CM_PER_INCH : 1;
  const underbust = underbustRaw * toCm;
  const bust = bustRaw * toCm;
  const real = (cm: number) => cm >= SMALLEST_REAL_CM && cm <= LARGEST_REAL_CM;
  if (!real(underbust) || !real(bust)) return problem("impossible");

  // 5. The underbust is always smaller than the bust.
  if (underbust >= bust) return problem("order");

  // 6. Find the chart row for each measurement.
  const bandIndex = rowIndexFor(underbust, (r) => r.underbust, chart);
  const bustIndex = rowIndexFor(bust, (r) => r.bust, chart);
  if (bandIndex === -1 || bustIndex === -1) return problem("out-of-range");

  // 7. Same row: that's the size.
  if (bandIndex === bustIndex) {
    return { ok: true, size: chart[bandIndex].size, row: chart[bandIndex], between: null };
  }

  // 8. Two or more rows apart: we won't guess.
  if (Math.abs(bandIndex - bustIndex) > 1) return problem("out-of-range");

  // 9. One row apart: the fit answers decide. "Sometimes" counts as yes.
  const strapsDig = input.strapsDigIn !== "no";
  const bandRides = input.bandRidesUp !== "no";
  const smaller = Math.min(bandIndex, bustIndex);
  const larger = Math.max(bandIndex, bustIndex);
  // Band rides up (and straps are fine) → size down. Everything else → size up,
  // because a little looser is more comfortable in the heat.
  const went: "up" | "down" = bandRides && !strapsDig ? "down" : "up";
  const chosen = chart[went === "up" ? larger : smaller];
  return {
    ok: true,
    size: chosen.size,
    row: chosen,
    between: { sizes: [chart[smaller].size, chart[larger].size], went },
  };
}
