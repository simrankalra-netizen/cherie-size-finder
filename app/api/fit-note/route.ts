// The ONLY place the AI is called (Google Gemini). This runs on the server, so
// the API key (read from .env.local) never reaches the shopper's browser.
//
// The AI is given the size that plain code already chose and the two fit
// answers. It is never given the measurements, and it cannot change the size.

import { ApiError, GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import { z } from "zod";
import type { Size } from "../../../data/size-chart";
import { findNoteProblem } from "../../../lib/copy-guard";

// Reliability settings. When we tested, Google often replied "busy" (within about a
// second) but answered in about 1.5 seconds when it worked, so asking again quickly
// is what makes notes arrive. Gemini 3.5 Flash Lite was the only model that answered
// reliably; the others were mostly busy.
const MODEL = "gemini-3.5-flash-lite";
const AI_TIME_LIMIT_MS = 8000; // total time for all tries; after this the standard tip shows
const TRY_LIMIT_MS = 3500; // one try that hangs longer than this is cut off and retried
const MAX_TRIES = 4;
const PAUSE_BETWEEN_TRIES_MS = 300;

const SIZES: Size[] = ["S", "M", "L", "XL"];
const ANSWERS = ["yes", "sometimes", "no"];

// The exact shape we ask Gemini to reply in, and check again when it arrives.
const NoteSchema = z.object({ explanation: z.string(), tip: z.string() });
const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: { explanation: { type: Type.STRING }, tip: { type: Type.STRING } },
  required: ["explanation", "tip"],
};

const SYSTEM = `You write short fit notes for Cherié, a lingerie brand for women in India.
Voice: warm, calm and reassuring, in plain everyday English, like a kind friend in a fitting room. No exclamation marks, no hype.

You are told which size of the Cherié soft wire-free bralette was chosen from the size chart. That size is final: never change it, question it, or mention any other size.

Write two things:
- explanation: one or two sentences on why this size should suit her, gently referring to her fit answers.
- tip: one or two sentences with a practical fit and comfort tip for wearing a soft wire-free bralette in India's heat, such as how the band and straps should sit, or adjusting the straps.

Rules:
- Talk only about how the bralette fits and how it feels to wear.
- You know nothing about the product's design beyond "soft" and "wire-free": never describe cups, padding, shape, fabric, materials, washing or care.
- Never use numbers or digits, and never mention measurements.
- Never say eco-friendly, biodegradable or carbon neutral, and make no claims about skin or health (for example "nourishes skin").
- Never mention skin in any way, and never suggest talc, powder, creams or any other product.
- Always write the brand name as Cherié, with the accent.`;

type FitNoteResponse =
  | { status: "ai"; explanation: string; tip: string }
  | { status: "failed-check" | "failed-load" };

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readJson(text: string | undefined): unknown {
  try {
    return JSON.parse(text ?? "");
  } catch {
    return null;
  }
}

export async function POST(request: Request): Promise<Response> {
  const reply = (body: FitNoteResponse) => Response.json(body);

  let body: { size?: unknown; bandRidesUp?: unknown; strapsDigIn?: unknown; between?: unknown };
  try {
    body = await request.json();
  } catch {
    return reply({ status: "failed-load" });
  }

  const size = body.size as Size;
  const bandRidesUp = String(body.bandRidesUp);
  const strapsDigIn = String(body.strapsDigIn);
  if (!SIZES.includes(size) || !ANSWERS.includes(bandRidesUp) || !ANSWERS.includes(strapsDigIn)) {
    return reply({ status: "failed-load" });
  }
  const between = body.between as { sizes?: Size[]; went?: string } | null;
  const betweenLine =
    between && Array.isArray(between.sizes) && (between.went === "up" || between.went === "down")
      ? `She was between two sizes, and the size chart went ${between.went === "up" ? "up to the roomier one" : "down to the closer-fitting one"}.`
      : "Her measurements fit this size directly. No size adjustment was made, so don't say anything was adjusted.";

  const key = process.env.GEMINI_API_KEY;
  if (!key || key.startsWith("paste-")) {
    console.warn("[fit-note] No real GEMINI_API_KEY in .env.local, so showing the standard tip.");
    return reply({ status: "failed-load" });
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const deadline = AbortSignal.timeout(AI_TIME_LIMIT_MS);
  let anyRejected = false;

  for (let attempt = 1; attempt <= MAX_TRIES && !deadline.aborted; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Chosen size: ${size}
Does her band ride up at the back? ${bandRidesUp}
Do her straps dig in by evening? ${strapsDigIn}
${betweenLine}`,
        config: {
          systemInstruction: SYSTEM,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          // Stop this try at whichever comes first: the per-try limit or the overall limit.
          abortSignal: AbortSignal.any([deadline, AbortSignal.timeout(TRY_LIMIT_MS)]),
        },
      });

      const parsed = NoteSchema.safeParse(readJson(response.text));
      if (!parsed.success) {
        console.warn(`[fit-note] try ${attempt}: reply wasn't in the expected shape`);
        continue;
      }
      const note = parsed.data;
      const problem = findNoteProblem(note, size);
      if (problem) {
        anyRejected = true;
        console.warn(`[fit-note] try ${attempt}: note rejected (${problem}):`, note);
        continue; // ask again for a note that passes
      }
      if (attempt > 1) console.info(`[fit-note] note arrived on try ${attempt}`);
      return reply({ status: "ai", explanation: note.explanation.trim(), tip: note.tip.trim() });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : undefined;
      console.warn(`[fit-note] try ${attempt} failed:`, status ?? (error instanceof Error ? error.message : error));
      if (status === 429) break; // over the free-tier usage cap: asking again won't help
      if (!deadline.aborted) await pause(PAUSE_BETWEEN_TRIES_MS);
    }
  }

  return reply({ status: anyRejected ? "failed-check" : "failed-load" });
}
