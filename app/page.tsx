// The Cherié home page. Every claim here is about fit and comfort only:
// no fabric, skin, health or sustainability claims, and no ratings or reviews
// until there are real ones.

import Link from "next/link";
import BraletteSketch from "../components/BraletteSketch";
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

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="hero-band">
       <div className="wrap hero">
        <div className="hero-text fade">
          <span className="label">First drop · The soft wire-free bralette</span>
          <h1>Soft, wire-free, and sized with care.</h1>
          <p className="lead">
            Cherié is lingerie for long, warm days. Our first piece is a soft wire-free bralette, and we&apos;d love it
            to fit you well before it ever reaches you.
          </p>
          <div className="actions">
            <Link href="/size-finder" className="primary">
              Find your size
            </Link>
            <Link href="#bralette" className="secondary">
              Meet the bralette
            </Link>
          </div>
          <p className="small">₹1,499 · Sizes S to XL</p>
        </div>
        <div className="hero-art card fade delay-1">
          <BraletteSketch />
          <p className="small art-note">Illustration</p>
        </div>
       </div>
      </section>

      {/* The bralette */}
      <section id="bralette" className="section">
        <div className="wrap two-col">
          <div className="fade">
            <span className="label">The first piece</span>
            <h2>The soft wire-free bralette</h2>
            <p className="price">₹1,499</p>
            <p className="tagline">Soft. Wire-free. Sized with care.</p>
            <p>
              No wires and no fuss: a gentle, steady hold that&apos;s made to stay comfortable from morning to evening,
              even when it&apos;s hot.
            </p>
            <span className="label">Sizes</span>
            <div className="size-pills" aria-label="Available sizes">
              {SIZE_CHART.map((row) => (
                <span key={row.size} className="size-pill">
                  {row.size}
                </span>
              ))}
            </div>
            <Link href="/size-finder" className="primary">
              Find your size in a minute
            </Link>
          </div>

          <div className="card fade delay-1">
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
      </section>

      {/* How sizing works */}
      <section className="section">
        <div className="wrap">
          <span className="label fade">How the size finder works</span>
          <h2 className="fade">Your size in three calm steps</h2>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`card fade delay-${i + 1}`}>
                <span className="step-number">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <Link href="/size-finder" className="primary fade">
            Start the size finder
          </Link>
        </div>
      </section>

      {/* Promise */}
      <section id="promise" className="section">
        <div className="wrap">
          <span className="label fade">Our promise</span>
          <h2 className="fade">Honest about fit, from the very first piece</h2>
          <div className="promises">
            {PROMISES.map((p, i) => (
              <div key={p.title} className={`promise fade delay-${(i % 2) + 1}`}>
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
          <div className="drop fade">
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
          <span className="label fade">Questions</span>
          <h2 className="fade">Good to know</h2>
          <div className="faq fade">
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
