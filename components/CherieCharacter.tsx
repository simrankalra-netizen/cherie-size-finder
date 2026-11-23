// The Cherié character: the two cherries from the Cherié icon, wearing their
// tiny pink bra, brought to life with faces. They sway gently from their
// stems and blink now and then. Their face changes with the mood:
//   happy    – a smile (a size was found)
//   thinking – looking up, with a small "o" (waiting for the fit note)
//   sorry    – gentle, apologetic brows (we can't offer a size)

export type Mood = "happy" | "thinking" | "sorry";

type Props = {
  mood?: Mood;
  size?: number; // width in px
  disc?: boolean; // draw the cream circle behind them, like the Cherié icon
  label?: string; // describe them for screen readers; leave out when decorative
  className?: string;
};

const INK = "#1e0302";
const PINK = "#E8B7C2";
const CHERRY = "#630805";

function Face({ cx, mood }: { cx: number; mood: Mood }) {
  const eyeY = mood === "thinking" ? 137 : 140;
  const look = mood === "thinking" ? 2 : 0;
  return (
    <g>
      <g className="char-eyes">
        <ellipse cx={cx - 10 + look} cy={eyeY} rx="3.4" ry="4.2" fill={INK} />
        <ellipse cx={cx + 10 + look} cy={eyeY} rx="3.4" ry="4.2" fill={INK} />
        <circle cx={cx - 9 + look} cy={eyeY - 1.6} r="1.1" fill="#fff" />
        <circle cx={cx + 11 + look} cy={eyeY - 1.6} r="1.1" fill="#fff" />
      </g>
      <circle cx={cx - 17} cy="151" r="5" fill={PINK} opacity="0.8" />
      <circle cx={cx + 17} cy="151" r="5" fill={PINK} opacity="0.8" />
      {mood === "happy" && (
        <path d={`M${cx - 6} 149 Q${cx} 156 ${cx + 6} 149`} stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      )}
      {mood === "thinking" && <circle cx={cx + look} cy="151.5" r="2.4" fill={INK} />}
      {mood === "sorry" && (
        <>
          <path d={`M${cx - 15} 134 L${cx - 6} 131`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d={`M${cx + 15} 134 L${cx + 6} 131`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
          <path d={`M${cx - 5} 152 Q${cx} 154.5 ${cx + 5} 152`} stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

function Cherry({ cx }: { cx: number }) {
  return (
    <g>
      <circle cx={cx} cy="148" r="36" fill="#6e0b09" />
      <circle cx={cx - 6} cy="140" r="27" fill="#9a1a14" opacity="0.75" />
      <ellipse cx={cx - 15} cy="127" rx="7" ry="4" fill="#fff" opacity="0.75" transform={`rotate(-30 ${cx - 15} 127)`} />
    </g>
  );
}

export default function CherieCharacter({ mood = "happy", size = 200, disc = false, label, className = "" }: Props) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  return (
    <svg
      className={`character ${className}`}
      viewBox={disc ? "-20 -20 240 240" : "0 0 200 205"}
      width={size}
      height={size * (disc ? 1 : 205 / 200)}
      {...a11y}
    >
      {disc && (
        <>
          <circle cx="100" cy="100" r="118" fill="#EEDCC8" />
          <circle cx="100" cy="100" r="108" fill="none" stroke={CHERRY} strokeWidth="1" />
        </>
      )}
      <g className="char-swing">
        {/* leaf and stems */}
        <path d="M100 20 C 112 6, 134 4, 148 14 C 134 26, 114 28, 100 20 Z" fill={CHERRY} />
        <path d="M100 20 C 96 50, 78 80, 68 114" stroke="#4a1408" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M100 20 C 104 50, 122 80, 132 114" stroke="#4a1408" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        <Cherry cx={66} />
        <Cherry cx={134} />
        <Face cx={66} mood={mood} />
        <g className="char-twin">
          <Face cx={134} mood={mood} />
        </g>

        {/* the tiny pink bra */}
        <path d="M32 162 L38 126" stroke={PINK} strokeWidth="3" strokeLinecap="round" />
        <path d="M168 162 L162 126" stroke={PINK} strokeWidth="3" strokeLinecap="round" />
        <path d="M30 162 Q48 154 66 157 Q84 154 102 162 L99 184 Q66 196 33 184 Z" fill={PINK} stroke={CHERRY} strokeWidth="2" strokeLinejoin="round" />
        <path d="M98 162 Q116 154 134 157 Q152 154 170 162 L167 184 Q134 196 101 184 Z" fill={PINK} stroke={CHERRY} strokeWidth="2" strokeLinejoin="round" />
        <path d="M37 176 Q66 186 95 176" stroke={CHERRY} strokeWidth="1.2" strokeDasharray="2 3" fill="none" />
        <path d="M105 176 Q134 186 163 176" stroke={CHERRY} strokeWidth="1.2" strokeDasharray="2 3" fill="none" />
        <path d="M33 184 Q66 196 99 184 Q134 196 167 184 L167 191 Q134 203 99 191 Q66 203 33 191 Z" fill="#d99aa8" stroke={CHERRY} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/** A four-point gold sparkle, like the ones on the Cherié logo. */
export function Sparkle({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`sparkle ${className}`} viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="#F6E4CE" />
    </svg>
  );
}
