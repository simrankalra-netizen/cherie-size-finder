// A simple line drawing of a soft wire-free bralette. It's an illustration, not a
// product photo, so it shouldn't be read as showing the real piece.
export default function BraletteSketch() {
  return (
    <svg className="sketch" viewBox="0 0 320 240" role="img" aria-label="Line drawing of a soft wire-free bralette">
      <circle cx="160" cy="124" r="104" fill="var(--cream)" />
      <circle cx="160" cy="124" r="104" fill="none" stroke="var(--beige)" />
      {/* straps */}
      <path d="M112 34 C114 60 116 80 118 98" fill="none" stroke="var(--cherry)" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M208 34 C206 60 204 80 202 98" fill="none" stroke="var(--cherry)" strokeWidth="1.6" strokeLinecap="round" />
      {/* cups */}
      <path
        d="M72 152 C80 118 98 98 118 98 C136 104 152 124 160 152 Z"
        fill="var(--paper)"
        stroke="var(--cherry)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M160 152 C168 124 184 104 202 98 C222 98 240 118 248 152 Z"
        fill="var(--paper)"
        stroke="var(--cherry)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* soft seam lines */}
      <path d="M96 140 C104 124 114 114 124 110" fill="none" stroke="var(--rose)" strokeWidth="1" strokeLinecap="round" />
      <path d="M224 140 C216 124 206 114 196 110" fill="none" stroke="var(--rose)" strokeWidth="1" strokeLinecap="round" />
      {/* band */}
      <path
        d="M64 152 L256 152 C259 164 259 178 256 190 L64 190 C61 178 61 164 64 152 Z"
        fill="var(--beige)"
        stroke="var(--cherry)"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M68 171 L252 171" fill="none" stroke="var(--cherry)" strokeWidth="0.8" strokeDasharray="2 4" />
    </svg>
  );
}
