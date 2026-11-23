# Cherié Size Finder

A small Cherié brand website (`/`) with a size finder (`/size-finder`) that recommends a size (S, M, L or XL) for the **Cherié soft wire-free bralette (₹1,499)** from two measurements and two fit questions, explained in Cherié's warm, calm voice.

The home page introduces the bralette, shows the size chart (read from the same file the size finder uses), explains the three sizing steps, Cherié's promise and an FAQ. It makes no fabric, skin or sustainability claims and shows no ratings or reviews until there are real ones.

Built as a hackathon MVP with Next.js, plain TypeScript for the sizing, and Google Gemini for the short written fit note.

> ⚠️ The size chart in [`data/size-chart.ts`](data/size-chart.ts) uses **placeholder numbers**. Replace them with Cherié's real measurements before launch.

---

## Job to be done

> When I'm about to buy a bra online and can't try it on, I want to answer a few quick questions about my measurements and fit, and get a recommended Cherié size, so I can join the waitlist confident the piece will fit and stay comfortable in India's heat.

**User:** an urban woman aged 22–40 in an Indian Tier 1 city (Mumbai, Delhi NCR, Bengaluru, etc.) who already shops from D2C brands online and has never bought from Cherié.

### The 3 tests the MVP must pass

1. **Size in under 10 seconds.** I enter my underbust and bust (cm or inches), answer 2 fit questions ("Does your band ride up?", "Do straps dig in?"), and see a recommended size: S, M, L or XL.
2. **Explained honestly.** Under the size, I see the exact row of the Cherié size chart it's based on, plus a short explanation and one fit tip in Cherié's warm, calm tone.
3. **No guessing.** If my measurements are missing, impossible (e.g. underbust bigger than bust, or 300 cm) or outside the S–XL range, I see a clear, friendly message and **no size**.

---

## Current workflow → future workflow

| | Today (no size finder) | With the Cherié Size Finder |
|---|---|---|
| 1 | Shopper finds a generic size chart, if there is one | Opens one calm screen |
| 2 | Measures, then tries to match two numbers to a table alone | Types two numbers in cm or inches |
| 3 | Lands between two sizes and guesses | Answers two fit questions, and code settles "between sizes" with a clear rule |
| 4 | Not sure it'll be comfortable in the heat | Gets a fit tip for hot days |
| 5 | Hesitates, orders the wrong size, or doesn't order | Sees the exact chart row behind the size, so she can trust it |
| 6 | If her size isn't made, she finds out after ordering | Is told honestly, up front, if her size isn't in the first drop |

---

## Architecture: Input → AI → Logic → Action → Output

On the real screen, **Logic runs before AI**. The size is picked first, instantly, and the AI only writes about a size that already exists.

```
INPUT ──► LOGIC (plain code) ──► problem? ──► OUTPUT: friendly message, no size, no AI call
                │
                └─ size found ──► OUTPUT: size + chart row (instant)
                                   │
                                   └──► AI (writes note) ──► ACTION (checks note) ──► OUTPUT: note
```

| Step | What happens | File |
|---|---|---|
| **1. Input** | Unit (cm / inches), underbust, bust, "Does your band ride up at the back?" and "Do your straps dig in by evening?" (Yes / Sometimes / No) | [`components/SizeFinder.tsx`](components/SizeFinder.tsx) |
| **2. Logic** (plain code) | Checks the chart file is valid, converts inches to cm, rejects bad input, finds the chart row for each measurement, and applies the sizing rule | [`lib/sizing.ts`](lib/sizing.ts), [`data/size-chart.ts`](data/size-chart.ts) |
| **3. AI** | Gemini writes a 1–2 sentence explanation and one fit tip. It is sent **only** the chosen size and the two answers, never the measurements | [`app/api/fit-note/route.ts`](app/api/fit-note/route.ts) |
| **4. Action** (plain code) | Rejects any note with a banned phrase, a skin or product mention, any number, another size, or "Cherie" without the accent. Asks again if it's busy or rejected | [`lib/copy-guard.ts`](lib/copy-guard.ts), [`app/api/fit-note/route.ts`](app/api/fit-note/route.ts) |
| **5. Output** | Size, exact chart row, and the note labelled **Written with AI**, or **Our standard tip** with the reason | [`components/SizeFinder.tsx`](components/SizeFinder.tsx) |

### The sizing rule (plain code)

- Both measurements fall in the same row: that size.
- They fall in neighbouring rows:
  - Straps dig in: size up.
  - Band rides up: size down.
  - Both or neither: size up, because a little looser is more comfortable in the heat.
- They fall two or more rows apart, or outside S–XL: the honest "not in this first drop" message.

"Sometimes" counts as yes.

---

## Where AI is used, and why

| Step | AI or plain code | Why |
|---|---|---|
| Convert inches to cm | Plain code | One multiplication |
| Check the inputs | Plain code | Fixed rules |
| Pick the size | Plain code | A table lookup must give the same answer every time; AI might not |
| Show the chart row | Plain code | Copied from the chart file, so it can't be wrong |
| Write the explanation and fit tip | **AI** | The only step where AI beats a rule: it writes a short, warm note that speaks to *her* answers instead of one fixed sentence |
| Check the AI note | Plain code | Banned words and rules must be enforced exactly |

The AI is a nice-to-have. If it fails, the plain-code standard note alone still passes test 2.

## What stays human

- **The shopper** measures herself (the app can't check that she measured correctly), answers honestly, and decides whether to trust the size and join the waitlist.
- **The Cherié team** owns the real size-chart numbers, the "between sizes" rule, the wording of the honest messages and the standard tip, the banned-phrase list, and the API key.

## Why these tools

| Tool | Why |
|---|---|
| **Next.js** (TypeScript) | One app holds the screen and the server-side AI call, and deploys to Vercel as is |
| **Plain TypeScript** for sizing | Predictable, testable, and easy to read and change |
| **Google Gemini 3.5 Flash Lite** | Fast (about 1.5 s per note) and on a free tier. When tested, it was the only Gemini model answering reliably; the others were mostly "busy". (The original plan used the Claude API; it was switched to Gemini because a Google AI Studio key was available.) |
| **Zod** | Checks the AI's reply has exactly the shape we asked for |
| **Vitest** | Runs the automatic checks for the sizing rules and the note checks |
| **Plain CSS** | Brand colours as named variables in one file, [`app/globals.css`](app/globals.css) |

## Failure cases, and what the screen shows

| Failure | What the shopper sees | Size? | AI called? |
|---|---|---|---|
| A measurement is empty | "Please add both your underbust and bust measurements…" | No | No |
| A fit question isn't answered | "Please answer both fit questions…" | No | No |
| Letters, 0 or negative | "That doesn't look quite like a measurement…" | No | No |
| Impossible number (under 50 cm or over 200 cm, e.g. 300 cm) | "Those numbers don't look quite right…" | No | No |
| Underbust same as or bigger than bust | "Your underbust is usually smaller than your bust…" | No | No |
| Outside S–XL, or sizes two or more apart | "We may not have your size in this first drop yet, and we'd rather tell you honestly than guess." | No | No |
| Size-chart file has a gap, overlap or typo | "Our size finder is taking a short rest…" | No | No |
| Gemini is busy, slow or errors, after up to 4 tries in 8 s | Size and row, plus **Our standard tip · the personal note didn't load** | Yes | Tried |
| Gemini's note breaks a rule (banned claim, skin, product, number, other size, missing accent) | Size and row, plus **Our standard tip · the personal note didn't pass our checks** | Yes | Tried |
| Free-tier usage cap reached | Same as "didn't load"; it stops asking at once | Yes | Tried |
| No API key in `.env.local` | Same as "didn't load" | Yes | No |

Nothing is swapped silently: every note says whether it came from the AI or is the standard tip, and why.

**Privacy:** measurements stay in the browser. They are never sent to the AI and never saved.

---

## Run it locally

You need **Node.js (LTS)** and **git**.

1. **Get the code and install packages**

   ```powershell
   git clone https://github.com/<your-username>/cherie-size-finder.git
   ```

   ```powershell
   cd cherie-size-finder
   ```

   ```powershell
   npm install
   ```

2. **Add your Gemini key.** Create a file called `.env.local` in the project folder containing this one line, with your key from [Google AI Studio](https://aistudio.google.com/apikey):

   ```
   GEMINI_API_KEY=your-key-here
   ```

   `.env.local` is listed in `.gitignore`, so it's never committed. Without a key, the app still works and shows the standard tip.

3. **Start the app**, then open http://localhost:3000

   ```powershell
   npm run dev
   ```

4. **Run the automatic checks** (sizing rules, bad inputs, and note checks)

   ```powershell
   npm test
   ```

### Deploy to Vercel

Import the GitHub repo in Vercel, add `GEMINI_API_KEY` under **Settings → Environment Variables**, and deploy.

### Change the size chart

Edit the numbers in [`data/size-chart.ts`](data/size-chart.ts), following the instructions at the top of the file, then run `npm test`. A gap or overlap fails the tests, and the app refuses to guess.

---

## Project files

```
app/
  api/fit-note/route.ts   The only AI call (Gemini), with retries and checks
  globals.css             Brand colours, fonts, fade-ins
  layout.tsx              Fonts, plus the site header and footer on every page
  page.tsx                The home page
  size-finder/page.tsx    The size finder page
components/SizeFinder.tsx The form and the result card
components/BraletteSketch.tsx  Line-drawing illustration (not a product photo)
data/size-chart.ts        ⚠️ The size chart: replace the placeholder numbers
lib/sizing.ts             Plain-code input checks and size rule
lib/copy-guard.ts         Banned phrases, note checks, the standard tip
lib/sizing.test.ts        Automatic checks (npm test)
```
