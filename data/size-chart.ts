/*
 * =====================================================================
 *   CHERIÉ SIZE CHART: soft wire-free bralette (₹1,499)
 * =====================================================================
 *
 *   ⚠️  THESE ARE PLACEHOLDER NUMBERS. Replace them with your real chart.
 *
 *   How to edit:
 *   - All numbers are in CENTIMETRES (cm).
 *   - "from" is included, "to" is NOT included.
 *       Example: underbust from 74 to 80 means 74, 75 ... 79.9 cm.
 *   - Each row's "to" must be the SAME number as the next row's "from",
 *     so there are no gaps between sizes.
 *   - Keep the sizes in order: S, M, L, XL.
 *
 *   If you make a mistake (a gap, an overlap, a missing number), the app
 *   will NOT guess. It shows "Our size finder is taking a short rest"
 *   instead of a size, and `npm test` will fail to warn you.
 * =====================================================================
 */

export type Size = "S" | "M" | "L" | "XL";

export type Range = { from: number; to: number };

export type SizeRow = {
  size: Size;
  underbust: Range; // cm
  bust: Range; // cm
};

export const SIZE_CHART: SizeRow[] = [
  { size: "S", underbust: { from: 68, to: 74 }, bust: { from: 80, to: 87 } },
  { size: "M", underbust: { from: 74, to: 80 }, bust: { from: 87, to: 94 } },
  { size: "L", underbust: { from: 80, to: 86 }, bust: { from: 94, to: 101 } },
  { size: "XL", underbust: { from: 86, to: 92 }, bust: { from: 101, to: 108 } },
];
