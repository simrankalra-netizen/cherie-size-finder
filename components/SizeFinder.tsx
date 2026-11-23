"use client";

// The one main screen. Order of events when the shopper taps "Find my size":
//   1. Plain code (lib/sizing.ts) checks the inputs and picks the size: instant.
//   2. If there's a problem, a friendly message shows and the AI is NOT called.
//   3. If there's a size, it shows straight away, then we ask the AI for a note.
//   4. The note is labelled "Written with AI", or "Our standard tip" with the reason.

import { useRef, useState, type FormEvent } from "react";
import type { Range } from "../data/size-chart";
import { standardNote, type Note } from "../lib/copy-guard";
import CherieCharacter from "./CherieCharacter";
import { findSize, type Answer, type FitInput, type SizeResult, type Unit } from "../lib/sizing";

type NoteState =
  | { kind: "waiting" }
  | { kind: "ai"; note: Note }
  | { kind: "standard"; note: Note; why: string };

const BROWSER_TIME_LIMIT_MS = 10000; // a backstop in case the server never answers

const QUESTIONS: { key: "bandRidesUp" | "strapsDigIn"; text: string }[] = [
  { key: "bandRidesUp", text: "Does your band ride up at the back?" },
  { key: "strapsDigIn", text: "Do your straps dig in by evening?" },
];
const ANSWERS: { value: Answer; text: string }[] = [
  { value: "yes", text: "Yes" },
  { value: "sometimes", text: "Sometimes" },
  { value: "no", text: "No" },
];

function showRange(r: Range, unit: Unit) {
  const cm = `${r.from}–${r.to} cm`;
  if (unit === "cm") return cm;
  const inch = (n: number) => (n / 2.54).toFixed(1);
  return `${cm} (${inch(r.from)}–${inch(r.to)} in)`;
}

export default function SizeFinder() {
  const [input, setInput] = useState<FitInput>({
    unit: "cm",
    underbust: "",
    bust: "",
    bandRidesUp: "",
    strapsDigIn: "",
  });
  const [result, setResult] = useState<SizeResult | null>(null);
  const [shownUnit, setShownUnit] = useState<Unit>("cm");
  const [note, setNote] = useState<NoteState | null>(null);
  const [attempt, setAttempt] = useState(0); // restarts the fade-in on each try
  const latest = useRef(0); // ignores AI replies from an older try

  const update = (change: Partial<FitInput>) => setInput((prev) => ({ ...prev, ...change }));

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const run = ++latest.current;
    setAttempt(run);

    // Step 1: plain code picks the size.
    const outcome = findSize(input);
    setResult(outcome);
    setShownUnit(input.unit);
    if (!outcome.ok) {
      setNote(null); // Step 2: problem → no size, no AI.
      return;
    }

    // Step 3: the size is already on screen. Now ask the AI for the note.
    setNote({ kind: "waiting" });
    const fallback = standardNote(outcome.size, outcome.between);
    let next: NoteState;
    try {
      const response = await fetch("/api/fit-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the size and the answers are sent. Never the measurements.
        body: JSON.stringify({
          size: outcome.size,
          bandRidesUp: input.bandRidesUp,
          strapsDigIn: input.strapsDigIn,
          between: outcome.between,
        }),
        signal: AbortSignal.timeout(BROWSER_TIME_LIMIT_MS),
      });
      const data = await response.json();
      if (data.status === "ai") next = { kind: "ai", note: { explanation: data.explanation, tip: data.tip } };
      else if (data.status === "failed-check")
        next = { kind: "standard", note: fallback, why: "the personal note didn't pass our checks" };
      else next = { kind: "standard", note: fallback, why: "the personal note didn't load" };
    } catch {
      next = { kind: "standard", note: fallback, why: "the personal note didn't load" };
    }
    if (run === latest.current) setNote(next);
  }

  return (
    <main className="page">
      <header className="fade">
        <span className="label">The soft wire-free bralette · ₹1,499</span>
        <h1>Find your Cherié size</h1>
        <p className="intro">
          A few quick questions, and we&apos;ll suggest the size that should fit well and stay comfortable, even on the
          warmest days.
        </p>
      </header>

      <p className="privacy fade">Your measurements stay on this screen. We don&apos;t save them.</p>

      <form className="card fade" onSubmit={onSubmit} noValidate>
        <fieldset>
          <legend className="label">Measure in</legend>
          <div className="choices">
            {(["cm", "in"] as Unit[]).map((u) => (
              <label className="choice" key={u}>
                <input
                  type="radio"
                  name="unit"
                  checked={input.unit === u}
                  onChange={() => update({ unit: u })}
                />
                <span>{u === "cm" ? "cm" : "inches"}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="measurements">
          <label>
            <span className="label">Underbust</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={input.unit === "cm" ? "e.g. 76" : "e.g. 30"}
              value={input.underbust}
              onChange={(e) => update({ underbust: e.target.value })}
            />
          </label>
          <label>
            <span className="label">Bust</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={input.unit === "cm" ? "e.g. 90" : "e.g. 35"}
              value={input.bust}
              onChange={(e) => update({ bust: e.target.value })}
            />
          </label>
        </div>

        {QUESTIONS.map((q) => (
          <fieldset key={q.key}>
            <legend className="question">{q.text}</legend>
            <div className="choices">
              {ANSWERS.map((a) => (
                <label className="choice" key={a.value}>
                  <input
                    type="radio"
                    name={q.key}
                    checked={input[q.key] === a.value}
                    onChange={() => update({ [q.key]: a.value })}
                  />
                  <span>{a.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <button className="primary" type="submit">
          Find my size
        </button>
      </form>

      {result && !result.ok && (
        <section className="card message fade" role="alert" key={`problem-${attempt}`}>
          <div className="message-row">
            <CherieCharacter mood="sorry" size={76} className="finder-character char-pop" />
            <p>{result.message}</p>
          </div>
        </section>
      )}

      {result && result.ok && (
        <section className="card fade" aria-live="polite" key={`result-${attempt}`}>
          <div className="size-row">
            <div>
              <span className="label">Your Cherié size</span>
              <h2 className="size">{result.size}</h2>
            </div>
            <CherieCharacter
              mood={note?.kind === "waiting" ? "thinking" : "happy"}
              size={110}
              className="finder-character char-pop"
            />
          </div>

          <span className="label">Based on this row of the Cherié size chart</span>
          <table className="chart-row">
            <thead>
              <tr>
                <th>Size</th>
                <th>Underbust</th>
                <th>Bust</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{result.row.size}</td>
                <td>{showRange(result.row.underbust, shownUnit)}</td>
                <td>{showRange(result.row.bust, shownUnit)}</td>
              </tr>
            </tbody>
          </table>
          <p className="small">Each range includes the first number, up to just below the second.</p>

          <div className="note">
            {note?.kind === "waiting" && <p className="waiting">Writing your fit note…</p>}
            {note && note.kind !== "waiting" && (
              <div className="fade">
                <span className="label note-source">
                  {note.kind === "ai" ? "Written with AI" : `Our standard tip · ${note.why}`}
                </span>
                <p>{note.note.explanation}</p>
                <span className="label">Fit tip</span>
                <p className="tip">{note.note.tip}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
