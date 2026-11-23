// The hero's monogram: a large italic "C" from the Cherié logo, inside a cream
// badge, with a ring of words that turns slowly around it.

export default function HeroMonogram() {
  return (
    <svg className="monogram" viewBox="0 0 400 400" role="img" aria-label="Cherié monogram">
      <defs>
        <path id="monogram-ring" d="M200 200 m-150 0 a150 150 0 1 1 300 0 a150 150 0 1 1 -300 0" />
      </defs>
      <g className="monogram-ring">
        <text className="monogram-ring-text">
          {/* textLength stretches the words to fill the whole circle evenly */}
          <textPath href="#monogram-ring" startOffset="0" textLength="930" lengthAdjust="spacing">
            Soft · Wire-free · Sized with care · S · M · L · XL ·
          </textPath>
        </text>
      </g>
      <circle cx="200" cy="200" r="118" fill="none" stroke="var(--cherry)" strokeWidth="1" opacity="0.5" />
      <text className="monogram-c" x="196" y="258" textAnchor="middle">
        C
      </text>
      <text className="monogram-name" x="200" y="300" textAnchor="middle">
        CHERIÉ
      </text>
    </svg>
  );
}
