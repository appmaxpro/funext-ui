function Mask() {
  return (
    <svg
      width="480"
      height="480"
      viewBox="0 0 480 480"
      fill="none"
      className="text-border-secondary pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <mask
        id="mask0_4933_393068"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="480"
        height="480"
        style={{
          "maskType": "alpha"
        }}
      >
        <rect
          width="480"
          height="480"
          fill="url(#paint0_radial_4933_393068)"
        ></rect>
      </mask>
      <g mask="url(#mask0_4933_393068)">
        <circle cx="240" cy="240" r="47.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="79.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="111.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="143.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="143.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="175.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="207.5" stroke="currentColor"></circle>
        <circle cx="240" cy="240" r="239.5" stroke="currentColor"></circle>
      </g>
      <defs>
        <radialGradient
          id="paint0_radial_4933_393068"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(240 240) rotate(90) scale(240 240)"
        >
          <stop></stop>
          <stop offset="1" stopOpacity="0"></stop>
        </radialGradient>
      </defs>
    </svg>
  );
}

export default Mask;
