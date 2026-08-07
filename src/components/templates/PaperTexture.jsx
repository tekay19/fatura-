/**
 * The texture is baked into an inline SVG so the same paper relief appears in
 * the live preview and in html2canvas's PDF render. Short, angular crease
 * networks imitate crushed paper; there are no long cloth-like waves.
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
      <feGaussianBlur stdDeviation="3.8"/>
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

  <rect width="794" height="1123" fill="#f7f0e2"/>
  <rect width="794" height="1123" filter="url(#relief)" opacity="0.065"/>

  <!-- Angular crease networks radiate from irregular crush points. -->
  <g fill="none" stroke-linecap="round" filter="url(#soft-ridge)">
    <path d="M-35 154 L78 189 L164 148 L266 282 L356 241 L441 307 L560 273 M266 282 L229 397 L307 486 M266 282 L171 344 L76 326" stroke="#62594c" stroke-width="10" opacity="0.085"/>
    <path d="M-35 148 L78 183 L164 142 L266 276 L356 235 L441 301 L560 267 M266 276 L229 391 L307 480 M266 276 L171 338 L76 320" stroke="#ffffff" stroke-width="7" opacity="0.27"/>
    <path d="M825 573 L704 607 L601 692 L517 646 L428 706 L340 674 M601 692 L657 812 L604 919 M601 692 L719 748 L834 714" stroke="#62594c" stroke-width="11" opacity="0.08"/>
    <path d="M825 566 L704 600 L601 685 L517 639 L428 699 L340 667 M601 685 L657 805 L604 912 M601 685 L719 741 L834 707" stroke="#ffffff" stroke-width="8" opacity="0.25"/>
    <path d="M-20 1048 L91 1001 L191 911 L284 954 L378 886 M191 911 L158 795 L225 716 M191 911 L273 1031 L310 1160" stroke="#62594c" stroke-width="9" opacity="0.07"/>
    <path d="M-20 1042 L91 995 L191 905 L284 948 L378 880 M191 905 L158 789 L225 710 M191 905 L273 1025 L310 1154" stroke="#ffffff" stroke-width="7" opacity="0.23"/>
  </g>

  <!-- Short fracture lines add the brittle character of handled paper. -->
  <g fill="none" stroke-linecap="round" filter="url(#fine-ridge)">
    <path d="M266 278 L306 208 L292 135 M266 278 L335 337 L397 345 M229 394 L176 430 L121 418" stroke="#5f5548" stroke-width="3.2" opacity="0.12"/>
    <path d="M263 275 L303 205 L289 132 M263 275 L332 334 L394 342 M226 391 L173 427 L118 415" stroke="#ffffff" stroke-width="2.1" opacity="0.36"/>
    <path d="M601 688 L567 604 L585 538 M517 642 L473 589 L411 574 M656 808 L714 855 L760 847" stroke="#5f5548" stroke-width="3.2" opacity="0.12"/>
    <path d="M598 685 L564 601 L582 535 M514 639 L470 586 L408 571 M653 805 L711 852 L757 844" stroke="#ffffff" stroke-width="2.1" opacity="0.35"/>
    <path d="M191 907 L111 869 L52 885 M284 950 L343 1018 L412 1010 M158 791 L104 742 L38 753" stroke="#5f5548" stroke-width="3" opacity="0.1"/>
    <path d="M188 904 L108 866 L49 882 M281 947 L340 1015 L409 1007 M155 788 L101 739 L35 750" stroke="#ffffff" stroke-width="2" opacity="0.31"/>
  </g>

  <g fill="#786d5d" opacity="0.018">
    <path d="M164 142 L266 276 L229 391 L171 338Z"/><path d="M517 639 L601 685 L657 805 L604 912Z"/><path d="M158 789 L191 905 L273 1025 L225 710Z"/>
  </g>

  <rect width="794" height="1123" filter="url(#grain)" opacity="0.014"/>
  <rect width="794" height="1123" fill="url(#edgeShade)"/>
</svg>`;

export const CRUMPLE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(crumpleSvg)}")`;

// A transparent relief pass sits above the printed content. Offset highlight
// and shadow strokes make the ink feel printed on folded paper instead of on
// top of a flat background image.
const creaseOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
  <defs>
    <filter id="wide" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="3.4"/></filter>
    <filter id="edge" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="1.1"/></filter>
    <radialGradient id="corner" cx="0" cy="0" r="1">
      <stop offset="0" stop-color="#493f32" stop-opacity=".16"/><stop offset=".38" stop-color="#8d806e" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g fill="none" stroke-linecap="round" filter="url(#wide)">
    <path d="M-35 154 L78 189 L164 148 L266 282 L356 241 L441 307 L560 273 M266 282 L229 397 L307 486 M266 282 L171 344 L76 326" stroke="#453d33" stroke-width="9" opacity=".12"/>
    <path d="M-35 148 L78 183 L164 142 L266 276 L356 235 L441 301 L560 267 M266 276 L229 391 L307 480 M266 276 L171 338 L76 320" stroke="#fff" stroke-width="6" opacity=".35"/>
    <path d="M825 573 L704 607 L601 692 L517 646 L428 706 L340 674 M601 692 L657 812 L604 919 M601 692 L719 748 L834 714" stroke="#453d33" stroke-width="10" opacity=".11"/>
    <path d="M825 566 L704 600 L601 685 L517 639 L428 699 L340 667 M601 685 L657 805 L604 912 M601 685 L719 741 L834 707" stroke="#fff" stroke-width="7" opacity=".32"/>
    <path d="M-20 1048 L91 1001 L191 911 L284 954 L378 886 M191 911 L158 795 L225 716 M191 911 L273 1031 L310 1160" stroke="#453d33" stroke-width="8" opacity=".1"/>
    <path d="M-20 1042 L91 995 L191 905 L284 948 L378 880 M191 905 L158 789 L225 710 M191 905 L273 1025 L310 1154" stroke="#fff" stroke-width="6" opacity=".3"/>
  </g>
  <g fill="none" stroke-linecap="round" filter="url(#edge)">
    <path d="M266 278 L306 208 L292 135 M266 278 L335 337 L397 345 M229 394 L176 430 L121 418" stroke="#4e4438" stroke-width="3.4" opacity=".19"/>
    <path d="M263 275 L303 205 L289 132 M263 275 L332 334 L394 342 M226 391 L173 427 L118 415" stroke="#fff" stroke-width="2.2" opacity=".49"/>
    <path d="M601 688 L567 604 L585 538 M517 642 L473 589 L411 574 M656 808 L714 855 L760 847" stroke="#4e4438" stroke-width="3.4" opacity=".18"/>
    <path d="M598 685 L564 601 L582 535 M514 639 L470 586 L408 571 M653 805 L711 852 L757 844" stroke="#fff" stroke-width="2.2" opacity=".47"/>
    <path d="M191 907 L111 869 L52 885 M284 950 L343 1018 L412 1010 M158 791 L104 742 L38 753" stroke="#4e4438" stroke-width="3.2" opacity=".16"/>
    <path d="M188 904 L108 866 L49 882 M281 947 L340 1015 L409 1007 M155 788 L101 739 L35 750" stroke="#fff" stroke-width="2.1" opacity=".43"/>
  </g>
  <ellipse cx="0" cy="0" rx="250" ry="195" fill="url(#corner)" transform="rotate(18)"/>
  <ellipse cx="794" cy="1123" rx="280" ry="220" fill="url(#corner)" transform="rotate(198 794 1123)" opacity=".65"/>
</svg>`;

export const CREASE_OVERLAY_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(creaseOverlaySvg)}")`;

export default function PaperTexture() {
  return (
    <>
      <div
        className="paper-surface"
        aria-hidden="true"
        style={{ backgroundImage: CRUMPLE_URL }}
      />
      <div
        className="paper-creases"
        aria-hidden="true"
        style={{ backgroundImage: CREASE_OVERLAY_URL }}
      />
    </>
  );
}
