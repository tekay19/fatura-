/**
 * The texture is baked into an inline SVG so the same paper relief appears in
 * the live preview and in html2canvas's PDF render. Broad, irregular ridges do
 * most of the visual work; a very light grain pass prevents a plastic look.
 */
const crumpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
  <defs>
    <filter id="relief" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.0055 0.0072" numOctaves="4" seed="37" result="noise"/>
      <feGaussianBlur in="noise" stdDeviation="2.4" result="bump"/>
      <feDiffuseLighting in="bump" lighting-color="#fffdf7" surfaceScale="5.5" diffuseConstant="0.92">
        <feDistantLight azimuth="228" elevation="43"/>
      </feDiffuseLighting>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.19" numOctaves="2" seed="11" result="fine"/>
      <feDiffuseLighting in="fine" lighting-color="#fffdf8" surfaceScale="0.9" diffuseConstant="0.9">
        <feDistantLight azimuth="228" elevation="50"/>
      </feDiffuseLighting>
    </filter>
    <filter id="soft-ridge" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="5.5"/>
    </filter>
    <filter id="fine-ridge" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="1.35"/>
    </filter>
    <radialGradient id="edgeShade" cx="46%" cy="43%" r="72%">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.72" stop-color="#8c8372" stop-opacity="0.025"/>
      <stop offset="1" stop-color="#564e43" stop-opacity="0.1"/>
    </radialGradient>
  </defs>

  <rect width="794" height="1123" fill="#faf7ef"/>
  <rect width="794" height="1123" filter="url(#relief)" opacity="0.2"/>

  <!-- Soft pairs of shadow and highlight create uneven raised folds. -->
  <g fill="none" stroke-linecap="round" filter="url(#soft-ridge)">
    <path d="M-55 242 C115 185 245 285 400 235 S668 154 850 232" stroke="#635b50" stroke-width="15" opacity="0.09"/>
    <path d="M-55 234 C115 177 245 277 400 227 S668 146 850 224" stroke="#ffffff" stroke-width="12" opacity="0.3"/>
    <path d="M188 -70 C230 122 194 268 255 420 S343 700 303 1195" stroke="#625a4d" stroke-width="18" opacity="0.075"/>
    <path d="M179 -70 C221 122 185 268 246 420 S334 700 294 1195" stroke="#ffffff" stroke-width="13" opacity="0.26"/>
    <path d="M850 710 C675 665 594 745 477 715 S210 621 -45 716" stroke="#665e52" stroke-width="17" opacity="0.07"/>
    <path d="M850 701 C675 656 594 736 477 706 S210 612 -45 707" stroke="#ffffff" stroke-width="12" opacity="0.24"/>
    <path d="M716 -45 C665 132 700 286 621 390 S489 559 548 780 S682 1038 623 1180" stroke="#655d51" stroke-width="14" opacity="0.06"/>
    <path d="M708 -45 C657 132 692 286 613 390 S481 559 540 780 S674 1038 615 1180" stroke="#ffffff" stroke-width="10" opacity="0.22"/>
  </g>

  <!-- Shorter crease branches keep the pattern from looking geometric. -->
  <g fill="none" stroke-linecap="round" filter="url(#fine-ridge)">
    <path d="M42 468 C145 434 196 465 266 421" stroke="#6a6255" stroke-width="3.5" opacity="0.11"/>
    <path d="M40 464 C143 430 194 461 264 417" stroke="#ffffff" stroke-width="2.5" opacity="0.34"/>
    <path d="M482 112 C511 202 497 270 543 337" stroke="#6a6255" stroke-width="3" opacity="0.1"/>
    <path d="M478 110 C507 200 493 268 539 335" stroke="#ffffff" stroke-width="2.2" opacity="0.31"/>
    <path d="M418 862 C494 817 564 833 641 790" stroke="#6a6255" stroke-width="3.3" opacity="0.1"/>
    <path d="M415 858 C491 813 561 829 638 786" stroke="#ffffff" stroke-width="2.4" opacity="0.3"/>
    <path d="M92 1020 C156 969 204 970 257 923" stroke="#6a6255" stroke-width="3" opacity="0.08"/>
    <path d="M89 1016 C153 965 201 966 254 919" stroke="#ffffff" stroke-width="2.2" opacity="0.27"/>
  </g>

  <rect width="794" height="1123" filter="url(#grain)" opacity="0.026"/>
  <rect width="794" height="1123" fill="url(#edgeShade)"/>
</svg>`;

export const CRUMPLE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(crumpleSvg)}")`;

export default function PaperTexture() {
  return (
    <>
      <div
        className="paper-surface"
        aria-hidden="true"
        style={{ backgroundImage: CRUMPLE_URL }}
      />
      <div className="paper-creases" aria-hidden="true" />
    </>
  );
}
