/**
 * The banner for a company that has not uploaded a cover.
 *
 * Drawn, not photographed: navy with a quiet field of points and a few lime
 * links between them — the product's own mark (two companies and the line
 * between them), repeated. A stock photograph here would put somebody else's
 * office above this company's name.
 */
export function ProfileCoverArt() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1280 240"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <rect width="1280" height="240" fill="#0e1f1c" />
      <defs>
        <pattern id="profile-cover-dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#f2f5f3" fillOpacity="0.09" />
        </pattern>
        <linearGradient id="profile-cover-fade" x1="0" y1="0" x2="1280" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#cdef84" stopOpacity="0" />
          <stop offset="0.55" stopColor="#cdef84" stopOpacity="0.35" />
          <stop offset="1" stopColor="#cdef84" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="1280" height="240" fill="url(#profile-cover-dots)" />
      <g stroke="url(#profile-cover-fade)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M640 150 L812 86 L968 132 L1104 64 L1226 118" />
        <path d="M812 86 L884 196" />
        <path d="M968 132 L1040 204" />
        <path d="M1104 64 L1160 176" />
      </g>
      <g fill="#0e1f1c" stroke="#cdef84" strokeWidth="1.5">
        <circle cx="812" cy="86" r="5" strokeOpacity="0.55" />
        <circle cx="968" cy="132" r="5" strokeOpacity="0.7" />
        <circle cx="1104" cy="64" r="6" strokeOpacity="0.85" />
        <circle cx="1226" cy="118" r="6" />
        <circle cx="884" cy="196" r="4" strokeOpacity="0.5" />
        <circle cx="1040" cy="204" r="4" strokeOpacity="0.6" />
        <circle cx="1160" cy="176" r="4.5" strokeOpacity="0.75" />
      </g>
    </svg>
  );
}
