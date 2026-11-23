// The Cherié home page. Every claim here is about fit and comfort only:
// no fabric, skin, health or sustainability claims, and no ratings or reviews
// until there are real ones.
//
// Design references come from the Cherié pitch deck: the cherry character from
// the icon, the pink Sacramento script, gold sparkles, the arch-shaped product
// card, and soft "rise" and "drape" entrances.

import type { CSSProperties } from "react";
import Link from "next/link";
import BraletteSketch from "../components/BraletteSketch";
import CherieCharacter, { Sparkle } from "../components/CherieCharacter";
import HeroMonogram from "../components/HeroMonogram";
import { SIZE_CHART } from "../data/size-chart";

const STEPS = [
  {
    title: "Measure",
    text: "Measure around your ribcage, just under your bust. Then measure around the fullest part of your bust. Centimetres or inches are both fine.",
  },
  {
    title: "Answer two questions",
    text: "Does your band ride up? Do your straps dig in? Your answers help us choose when you fall between two sizes.",
  },
  {
    title: "See your size",
    text: "You'll see your size and the exact row of our size chart it comes from. If we don't have your size yet, we'll tell you.",
  },
];

const PROMISES = [
  {
    title: "We won't guess",
    text: "If your size isn't in this first drop, we'll say so honestly instead of nudging you towards the closest one.",
  },
  {
    title: "Your measurements stay with you",
    text: "The size finder works on your screen. We don't save your measurements.",
  },
  {
    title: "Made for warm days",
    text: "No wires, and fit tips on how the band and straps should sit, so it stays comfortable from morning to evening.",
  },
  {
    title: "Only what we can stand behind",
    text: "We talk about fit and comfort, and leave out claims we can't prove.",
  },
];

const FAQS = [
  {
    q: "Which sizes are in the first drop?",
    a: "S, M, L and XL. You can see the exact measurements for each size in the size chart above.",
  },
  {
    q: "What if I'm between two sizes?",
    a: "The size finder asks two quick questions about how your bras usually fit, and uses your answers to choose between the two sizes. It always shows you which way it went.",
  },
  { q: "Does the bralette have wires?", a: "No. It's a soft, wire-free bralette." },
  {
    q: "Are my measurements saved?",
    a: "No. Your measurements stay on your screen and are never saved. They aren't sent to the AI that writes your fit note either.",
  },
  {
    q: "What if my size isn't available?",
    a: "We'll tell you honestly. We'd rather do that than recommend a size that won't fit well.",
  },
  {
    q: "When can I buy it?",
    a: "The waitlist opens soon, and we'll share the details of the first drop then. Finding your size now means you'll be ready.",
  },
];

const RIBBON = ["Soft", "Wire-free", "Sized with care", "Made for warm days", "S · M · L · XL", "₹1,499"];

// Positions for the sparkles that twinkle around the hero character.
const HERO_SPARKLES = [
  { left: "6%", top: "14%", size: 26, delay: "0s" },
  { left: "88%", top: "8%", size: 18, delay: "0.8s" },
  { left: "92%", top: "58%", size: 30, delay: "1.6s" },
  { left: "2%", top: "66%", size: 16, delay: "2.3s" },
  { left: "74%", top: "86%", size: 14, delay: "1.1s" },
];

const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero-band">
        <div className="wrap hero">
          <div className="hero-text">
            <span className="label blur-in" style={stagger(0)}>
              First drop · The soft wire-free bralette
            </span>
            <h1>
              <span className="blur-in" style={{ display: "block", ...stagger(1) }}>
                Soft, wire-free,
              </span>
              <span className="blur-in" style={{ display: "block", ...stagger(2) }}>
                and sized with care.
              </span>
            </h1>
            <p className="lead blur-in" style={stagger(4)}>
              Cherié is lingerie for long, warm days. Our first piece is a soft wire-free bralette, and we&apos;d love it
              to fit you well before it ever reaches you.
            </p>
            <div className="actions blur-in" style={stagger(5)}>
              <Link href="/size-finder" className="primary">
                Find your size
              </Link>
              <Link href="#bralette" className="secondary">
                Meet the bralette
              </Link>
            </div>
            <p className="small blur-in" style={stagger(6)}>
              ₹1,499 · Sizes S to XL
            </p>
          </div>

          <div className="hero-stage">
            {HERO_SPARKLES.map((s, i) => (
              <Sparkle
                key={i}
                size={s.size}
                style={{ left: s.left, top: s.top, "--delay": s.delay } as CSSProperties}
              />
            ))}
            <div className="badge char-pop" style={{ "--delay": "300ms" } as CSSProperties}>
              <HeroMonogram />
            </div>
            <p className="script hero-script write-on" style={{ "--delay": "1100ms" } as CSSProperties}>
              made for warm days
            </p>
          </div>
        </div>
      </section>

      {/* Ribbon */}
      <div className="ribbon" aria-hidden>
        <div className="ribbon-track">
          {[...RIBBON, ...RIBBON, ...RIBBON, ...RIBBON].map((word, i) => (
            <span key={i} style={{ display: "contents" }}>
              <span className="ribbon-word">{word}</span>
              <Sparkle size={16} style={{ "--delay": `${(i % 4) * 0.7}s` } as CSSProperties} />
            </span>
          ))}
        </div>
      </div>

      {/* The bralette */}
      <section id="bralette" className="section">
        <div className="wrap two-col">
          <div className="arch reveal drape">
            <div className="arch-art">
              <BraletteSketch />
            </div>
            <p className="script">the first piece</p>
            <h2>The soft wire-free bralette</h2>
            <p className="price">₹1,499</p>
            <div className="size-pills" aria-label="Available sizes">
              {SIZE_CHART.map((row) => (
                <span key={row.size} className="size-pill">
                  {row.size}
                </span>
              ))}
            </div>
            <Link href="/size-finder" className="primary card-button">
              Find your size in a minute
            </Link>
          </div>

          <div>
            <span className="label reveal" style={stagger(0)}>
              Soft. Wire-free. Sized with care.
            </span>
            <p className="lead reveal" style={stagger(1)}>
              No wires and no fuss: a gentle, steady hold that&apos;s made to stay comfortable from morning to evening,
              even when it&apos;s hot.
            </p>
            <div className="card reveal" style={stagger(2)}>
              <span className="label">The Cherié size chart</span>
              <table className="chart">
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Underbust</th>
                    <th>Bust</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row.size}>
                      <td className="chart-size">{row.size}</td>
                      <td>
                        {row.underbust.from}–{row.underbust.to} cm
                      </td>
                      <td>
                        {row.bust.from}–{row.bust.to} cm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="small">
                Each range includes the first number, up to just below the second. Between two sizes? The size finder
                helps you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How sizing works */}
      <section className="section">
        <div className="wrap">
          <span className="label reveal">How the size finder works</span>
          <h2 className="reveal" style={stagger(1)}>
            Your size in three calm steps
          </h2>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="card reveal drape" style={stagger(i + 1)}>
                <span className="step-number">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/size-finder" className="primary reveal" style={stagger(2)}>
            Start the size finder
          </Link>
        </div>
      </section>

      {/* Promise */}
      <section id="promise" className="section">
        <div className="wrap">
          <span className="label reveal">Our promise</span>
          <h2 className="reveal" style={stagger(1)}>
            Honest about fit, from the very first piece
          </h2>
          <p className="script promise-script reveal" style={stagger(2)}>
            only Cherié
          </p>
          <div className="promises">
            {PROMISES.map((p, i) => (
              <div key={p.title} className="promise reveal" style={stagger(i)}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* First drop */}
      <section className="section">
        <div className="wrap">
          <div className="drop reveal">
            <div className="drop-character">
              <Sparkle size={22} style={{ "--delay": "0s" } as CSSProperties} />
              <Sparkle size={14} style={{ "--delay": "1s" } as CSSProperties} />
              <Sparkle size={18} style={{ "--delay": "2s" } as CSSProperties} />
              <CherieCharacter mood="happy" size={150} disc />
            </div>
            <span className="label">The first drop</span>
            <h2>A small first drop. Waitlist opening soon.</h2>
            <p>
              We&apos;re making a small first batch so we can get the fit right. Find your size now, and you&apos;ll be
              ready when the waitlist opens.
            </p>
            <Link href="/size-finder" className="primary">
              Find your size
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="wrap narrow">
          <span className="label reveal">Questions</span>
          <h2 className="reveal" style={stagger(1)}>
            Good to know
          </h2>
          <div className="faq reveal" style={stagger(2)}>
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
