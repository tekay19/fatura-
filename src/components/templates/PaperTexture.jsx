/**
 * A deterministic, full-page paper relief used by both the live preview and
 * html2canvas. Broad pressure marks, fine fibre noise and irregular branched
 * folds are layered separately so the result reads as handled paper instead
 * of a repeating wave or an angular line drawing.
 */
const crumpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
  <defs>
    <filter id="grain" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency=".014 .031" numOctaves="4" seed="37" result="noise"/>
      <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
      <feComponentTransfer in="mono">
        <feFuncR type="linear" slope=".7" intercept=".2"/>
        <feFuncG type="linear" slope=".65" intercept=".22"/>
        <feFuncB type="linear" slope=".58" intercept=".25"/>
        <feFuncA type="table" tableValues="0 .22"/>
      </feComponentTransfer>
    </filter>
    <filter id="pressure" x="-12%" y="-12%" width="124%" height="124%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
    <filter id="fold" x="-12%" y="-12%" width="124%" height="124%">
      <feGaussianBlur stdDeviation="3.2"/>
    </filter>
    <filter id="hairline" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation=".75"/>
    </filter>
    <radialGradient id="edgeShade" cx="49%" cy="46%" r="73%">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".8" stop-color="#756b5c" stop-opacity=".018"/>
      <stop offset="1" stop-color="#514a40" stop-opacity=".075"/>
    </radialGradient>
  </defs>

  <!-- Paper fibre and small pressure variations cover the complete sheet. -->
  <rect width="794" height="1123" fill="#958b7b" filter="url(#grain)" opacity=".3"/>
  <g filter="url(#pressure)" opacity=".55">
    <ellipse cx="118" cy="130" rx="210" ry="102" fill="#fff" opacity=".13" transform="rotate(14 118 130)"/>
    <ellipse cx="646" cy="270" rx="225" ry="118" fill="#706658" opacity=".055" transform="rotate(-18 646 270)"/>
    <ellipse cx="224" cy="548" rx="272" ry="124" fill="#756b5d" opacity=".045" transform="rotate(10 224 548)"/>
    <ellipse cx="635" cy="742" rx="250" ry="130" fill="#fff" opacity=".11" transform="rotate(17 635 742)"/>
    <ellipse cx="204" cy="1000" rx="260" ry="120" fill="#706658" opacity=".05" transform="rotate(-12 204 1000)"/>
  </g>

  <!-- Offset shadow/highlight pairs form irregular folds with soft shoulders. -->
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#fold)">
    <path d="M-42 225 C60 206 105 256 176 238 C238 222 247 175 314 166 C393 156 404 222 470 235" stroke="#554d43" stroke-width="11" opacity=".09"/>
    <path d="M-44 218 C58 199 103 249 174 231 C236 215 245 168 312 159 C391 149 402 215 468 228" stroke="#fff" stroke-width="8" opacity=".27"/>
    <path d="M312 162 C297 236 330 275 304 338 C279 399 207 401 191 471" stroke="#554d43" stroke-width="9" opacity=".075"/>
    <path d="M307 158 C292 232 325 271 299 334 C274 395 202 397 186 467" stroke="#fff" stroke-width="6" opacity=".23"/>

    <path d="M832 426 C748 408 718 456 657 466 C592 477 561 431 503 458 C445 484 443 548 379 570" stroke="#514a40" stroke-width="12" opacity=".085"/>
    <path d="M834 419 C750 401 720 449 659 459 C594 470 563 424 505 451 C447 477 445 541 381 563" stroke="#fff" stroke-width="8" opacity=".26"/>
    <path d="M657 462 C632 528 658 573 632 623 C602 681 528 675 513 750" stroke="#554d43" stroke-width="9" opacity=".07"/>
    <path d="M652 458 C627 524 653 569 627 619 C597 677 523 671 508 746" stroke="#fff" stroke-width="6" opacity=".21"/>

    <path d="M-38 775 C58 747 107 802 181 787 C247 774 269 718 338 724 C400 730 422 784 488 798" stroke="#534b41" stroke-width="11" opacity=".08"/>
    <path d="M-40 768 C56 740 105 795 179 780 C245 767 267 711 336 717 C398 723 420 777 486 791" stroke="#fff" stroke-width="7" opacity=".24"/>
    <path d="M181 783 C171 848 207 884 181 935 C156 985 88 1009 70 1162" stroke="#554d43" stroke-width="9" opacity=".07"/>
    <path d="M176 779 C166 844 202 880 176 931 C151 981 83 1005 65 1158" stroke="#fff" stroke-width="6" opacity=".2"/>

    <path d="M430 -38 C420 48 475 74 461 136 C450 184 411 196 407 246" stroke="#514a40" stroke-width="9" opacity=".07"/>
    <path d="M425 -42 C415 44 470 70 456 132 C445 180 406 192 402 242" stroke="#fff" stroke-width="6" opacity=".21"/>
    <path d="M830 958 C740 939 690 982 621 964 C557 947 543 893 477 885 C414 878 390 921 328 932" stroke="#514a40" stroke-width="11" opacity=".075"/>
    <path d="M832 951 C742 932 692 975 623 957 C559 940 545 886 479 878 C416 871 392 914 330 925" stroke="#fff" stroke-width="7" opacity=".22"/>
  </g>

  <!-- Fine branches keep each fold imperfect without creating hard polygons. -->
  <g fill="none" stroke-linecap="round" filter="url(#hairline)">
    <path d="M174 232 C132 279 87 281 48 309 M311 160 C352 112 360 72 348 29 M300 334 C337 365 383 366 418 398" stroke="#534b41" stroke-width="2.4" opacity=".11"/>
    <path d="M171 229 C129 276 84 278 45 306 M308 157 C349 109 357 69 345 26 M297 331 C334 362 380 363 415 395" stroke="#fff" stroke-width="1.6" opacity=".33"/>
    <path d="M658 460 C694 510 735 519 779 505 M506 452 C485 406 450 384 408 385 M627 619 C675 643 708 682 719 727" stroke="#534b41" stroke-width="2.5" opacity=".105"/>
    <path d="M655 457 C691 507 732 516 776 502 M503 449 C482 403 447 381 405 382 M624 616 C672 640 705 679 716 724" stroke="#fff" stroke-width="1.7" opacity=".31"/>
    <path d="M179 781 C129 834 80 829 37 859 M336 718 C359 669 401 646 448 653 M480 880 C454 832 419 818 378 826" stroke="#534b41" stroke-width="2.4" opacity=".1"/>
    <path d="M176 778 C126 831 77 826 34 856 M333 715 C356 666 398 643 445 650 M477 877 C451 829 416 815 375 823" stroke="#fff" stroke-width="1.6" opacity=".3"/>
    <path d="M623 958 C600 1021 625 1065 614 1138 M330 926 C299 888 260 879 224 893" stroke="#534b41" stroke-width="2.3" opacity=".095"/>
    <path d="M620 955 C597 1018 622 1062 611 1135 M327 923 C296 885 257 876 221 890" stroke="#fff" stroke-width="1.5" opacity=".29"/>
  </g>

  <rect width="794" height="1123" fill="url(#edgeShade)"/>
</svg>`;

export const CRUMPLE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(crumpleSvg)}")`;

// A lighter relief pass sits over the ink. It is intentionally sparse: the
// grain stays under the content while only the raised fold edges affect ink.
const creaseOverlaySvg = `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
  <defs>
    <filter id="soft" x="-12%" y="-12%" width="124%" height="124%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="fine" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".65"/></filter>
  </defs>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#soft)">
    <path d="M-42 225 C60 206 105 256 176 238 C238 222 247 175 314 166 C393 156 404 222 470 235 M312 162 C297 236 330 275 304 338 C279 399 207 401 191 471" stroke="#4f473d" stroke-width="8" opacity=".105"/>
    <path d="M-44 218 C58 199 103 249 174 231 C236 215 245 168 312 159 C391 149 402 215 468 228 M307 158 C292 232 325 271 299 334 C274 395 202 397 186 467" stroke="#fff" stroke-width="5" opacity=".3"/>
    <path d="M832 426 C748 408 718 456 657 466 C592 477 561 431 503 458 C445 484 443 548 379 570 M657 462 C632 528 658 573 632 623 C602 681 528 675 513 750" stroke="#4f473d" stroke-width="8" opacity=".1"/>
    <path d="M834 419 C750 401 720 449 659 459 C594 470 563 424 505 451 C447 477 445 541 381 563 M652 458 C627 524 653 569 627 619 C597 677 523 671 508 746" stroke="#fff" stroke-width="5" opacity=".29"/>
    <path d="M-38 775 C58 747 107 802 181 787 C247 774 269 718 338 724 C400 730 422 784 488 798 M181 783 C171 848 207 884 181 935 C156 985 88 1009 70 1162" stroke="#4f473d" stroke-width="8" opacity=".095"/>
    <path d="M-40 768 C56 740 105 795 179 780 C245 767 267 711 336 717 C398 723 420 777 486 791 M176 779 C166 844 202 880 176 931 C151 981 83 1005 65 1158" stroke="#fff" stroke-width="5" opacity=".28"/>
    <path d="M430 -38 C420 48 475 74 461 136 C450 184 411 196 407 246 M830 958 C740 939 690 982 621 964 C557 947 543 893 477 885 C414 878 390 921 328 932" stroke="#4f473d" stroke-width="7" opacity=".09"/>
    <path d="M425 -42 C415 44 470 70 456 132 C445 180 406 192 402 242 M832 951 C742 932 692 975 623 957 C559 940 545 886 479 878 C416 871 392 914 330 925" stroke="#fff" stroke-width="4.5" opacity=".26"/>
  </g>
  <g fill="none" stroke-linecap="round" filter="url(#fine)">
    <path d="M171 229 C129 276 84 278 45 306 M308 157 C349 109 357 69 345 26 M297 331 C334 362 380 363 415 395 M655 457 C691 507 732 516 776 502 M503 449 C482 403 447 381 405 382 M624 616 C672 640 705 679 716 724 M176 778 C126 831 77 826 34 856 M333 715 C356 666 398 643 445 650 M477 877 C451 829 416 815 375 823 M620 955 C597 1018 622 1062 611 1135" stroke="#fff" stroke-width="1.45" opacity=".35"/>
  </g>
</svg>`;

export const CREASE_OVERLAY_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(creaseOverlaySvg)}")`;

export default function PaperTexture({ yellowing = true, crumpled = true }) {
  return (
    <>
      {yellowing && <div className="paper-yellowing" aria-hidden="true" />}
      {crumpled && (
        <>
          <div className="paper-surface" aria-hidden="true" style={{ backgroundImage: CRUMPLE_URL }} />
          <div className="paper-creases" aria-hidden="true" style={{ backgroundImage: CREASE_OVERLAY_URL }} />
        </>
      )}
    </>
  );
}
