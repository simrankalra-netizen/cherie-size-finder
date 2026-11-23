// Plain code that checks every AI-written note before it is shown,
// plus the standard (non-AI) note used when the AI note fails.

import type { Size } from "../data/size-chart";
import type { Between } from "./sizing";

export type Note = { explanation: string; tip: string };

// Phrases Cherié must never say. Lowercase; matched anywhere in the note.
export const BANNED_PHRASES = [
  "eco-friendly",
  "eco friendly",
  "biodegradable",
  "carbon neutral",
  "carbon-neutral",
  "nourish", // covers "nourishes skin", "nourishing"
  "skin", // any mention of skin ("lets your skin breathe") is a skin claim
  "talc", // no suggesting other products
  "powder",
  "cream",
  "lotion",
  "hypoallergenic",
  "antibacterial",
  "dermatolog",
];

const SIZE_WORDS: Record<Size, string> = { S: "small", M: "medium", L: "large", XL: "extra large" };

/** Returns null if the note is fine, or a short reason if it must be rejected. */
export function findNoteProblem(note: Note, size: Size): string | null {
  const text = `${note.explanation} ${note.tip}`;
  const lower = text.toLowerCase();

  if (!note.explanation.trim() || !note.tip.trim()) return "empty note";

  const banned = BANNED_PHRASES.find((p) => lower.includes(p));
  if (banned) return `banned phrase: ${banned}`;

  // The AI is never given measurements, so any number means it made one up.
  if (/\d/.test(text)) return "contains a number";

  // It must not name a different size, as a letter or a word.
  const letters = text.match(/\b(XXS|XS|S|M|L|XL|XXL|XXXL)\b/g) ?? [];
  if (letters.some((l) => l !== size)) return "mentions another size";
  for (const [s, word] of Object.entries(SIZE_WORDS)) {
    if (s !== size && new RegExp(`\\bsize ${word}\\b`, "i").test(text)) return "mentions another size";
  }

  // The brand name always carries its accent.
  if (/\bcherie\b/i.test(text)) return "brand name written without the accent";

  return null;
}

/** The standard note, written by plain code. Used when the AI note fails. */
export function standardNote(size: Size, between: Between | null): Note {
  let explanation = `Your measurements sit in the ${size} row of the Cherié size chart, so ${size} is the size we'd suggest.`;
  if (between) {
    const [a, b] = between.sizes;
    explanation =
      between.went === "up"
        ? `You're between ${a} and ${b}, so we've gone with ${size}. A little more room tends to feel kinder on warm days.`
        : `You're between ${a} and ${b}, and since your band tends to ride up, we've gone with ${size} for a closer, steadier fit.`;
  }
  return {
    explanation,
    tip: "Try it on at home for an hour. The band should feel like a gentle hug: snug enough to stay in place, with room to slip two fingers underneath.",
  };
}
