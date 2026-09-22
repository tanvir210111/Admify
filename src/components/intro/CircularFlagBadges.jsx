import React from "react";

export const FLAG_BADGES = [
  { id: "uk", name: "United Kingdom" },
  { id: "ca", name: "Canada" },
  { id: "us", name: "United States" },
  { id: "de", name: "Germany" },
  { id: "nl", name: "Netherlands" },
  { id: "se", name: "Sweden" },
  { id: "jp", name: "Japan" },
  { id: "au", name: "Australia" },
];

export function CircularFlag({ id, size = 36, className = "" }) {
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 shadow-[0_4px_14px_rgba(0,0,0,0.6)] border border-white/30 backdrop-blur-sm transition-transform duration-300 hover:scale-110 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="w-full h-full block"
      >
        <defs>
          <clipPath id={`circleClip-${id}`}>
            <circle cx="50" cy="50" r="50" />
          </clipPath>
        </defs>

        <g clipPath={`url(#circleClip-${id})`}>
          {/* United Kingdom */}
          {id === "uk" && (
            <g>
              <rect width="100" height="100" fill="#012169" />
              {/* White diagonal saltire */}
              <line x1="0" y1="0" x2="100" y2="100" stroke="#FFFFFF" strokeWidth="20" />
              <line x1="0" y1="100" x2="100" y2="0" stroke="#FFFFFF" strokeWidth="20" />
              {/* Red diagonal saltire */}
              <line x1="0" y1="0" x2="100" y2="100" stroke="#C8102E" strokeWidth="10" />
              <line x1="0" y1="100" x2="100" y2="0" stroke="#C8102E" strokeWidth="10" />
              {/* White cross */}
              <rect x="40" y="0" width="20" height="100" fill="#FFFFFF" />
              <rect x="0" y="40" width="100" height="20" fill="#FFFFFF" />
              {/* Red cross */}
              <rect x="44" y="0" width="12" height="100" fill="#C8102E" />
              <rect x="0" y="44" width="100" height="12" fill="#C8102E" />
            </g>
          )}

          {/* Canada */}
          {id === "ca" && (
            <g>
              <rect width="25" height="100" fill="#D80621" />
              <rect x="25" width="50" height="100" fill="#FFFFFF" />
              <rect x="75" width="25" height="100" fill="#D80621" />
              {/* Stylized Maple Leaf */}
              <path
                d="M50 18 L53 32 L58 28 L56 36 L66 38 L62 44 L70 48 L65 52 L67 58 L58 56 L55 68 L53 68 L51 76 L49 76 L47 68 L45 68 L42 56 L33 58 L35 52 L30 48 L38 44 L34 38 L44 36 L42 28 L47 32 Z"
                fill="#D80621"
              />
            </g>
          )}

          {/* United States */}
          {id === "us" && (
            <g>
              {/* 13 Stripes */}
              {[...Array(13)].map((_, i) => (
                <rect
                  key={i}
                  y={(i * 100) / 13}
                  width="100"
                  height={100 / 13}
                  fill={i % 2 === 0 ? "#B22234" : "#FFFFFF"}
                />
              ))}
              {/* Blue Canton */}
              <rect x="0" y="0" width="46" height="53.8" fill="#3C3B6E" />
              {/* Simplified Stars (clean dots) */}
              {[
                [10, 10], [23, 10], [36, 10],
                [16, 19], [30, 19],
                [10, 28], [23, 28], [36, 28],
                [16, 37], [30, 37],
                [10, 46], [23, 46], [36, 46],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="2.2" fill="#FFFFFF" />
              ))}
            </g>
          )}

          {/* Germany */}
          {id === "de" && (
            <g>
              <rect x="0" y="0" width="100" height="33.3" fill="#000000" />
              <rect x="0" y="33.3" width="100" height="33.4" fill="#DD0000" />
              <rect x="0" y="66.7" width="100" height="33.3" fill="#FFCE00" />
            </g>
          )}

          {/* Netherlands */}
          {id === "nl" && (
            <g>
              <rect x="0" y="0" width="100" height="33.3" fill="#AE1C28" />
              <rect x="0" y="33.3" width="100" height="33.4" fill="#FFFFFF" />
              <rect x="0" y="66.7" width="100" height="33.3" fill="#21468B" />
            </g>
          )}

          {/* Sweden */}
          {id === "se" && (
            <g>
              <rect width="100" height="100" fill="#006AA7" />
              <rect x="30" y="0" width="16" height="100" fill="#FECC00" />
              <rect x="0" y="42" width="100" height="16" fill="#FECC00" />
            </g>
          )}

          {/* Japan */}
          {id === "jp" && (
            <g>
              <rect width="100" height="100" fill="#FFFFFF" />
              <circle cx="50" cy="50" r="28" fill="#BC002D" />
            </g>
          )}

          {/* Australia */}
          {id === "au" && (
            <g>
              <rect width="100" height="100" fill="#00008B" />
              {/* Canton Union Jack mini */}
              <g>
                <rect width="50" height="50" fill="#012169" />
                <line x1="0" y1="0" x2="50" y2="50" stroke="#FFFFFF" strokeWidth="8" />
                <line x1="0" y1="50" x2="50" y2="0" stroke="#FFFFFF" strokeWidth="8" />
                <line x1="0" y1="0" x2="50" y2="50" stroke="#C8102E" strokeWidth="4" />
                <line x1="0" y1="50" x2="50" y2="0" stroke="#C8102E" strokeWidth="4" />
                <rect x="21" y="0" width="8" height="50" fill="#FFFFFF" />
                <rect x="0" y="21" width="50" height="8" fill="#FFFFFF" />
                <rect x="23" y="0" width="4" height="50" fill="#C8102E" />
                <rect x="0" y="23" width="50" height="4" fill="#C8102E" />
              </g>
              {/* Commonwealth Star */}
              <circle cx="25" cy="75" r="7" fill="#FFFFFF" />
              {/* Southern Cross */}
              <circle cx="76" cy="20" r="3.2" fill="#FFFFFF" />
              <circle cx="88" cy="38" r="3.2" fill="#FFFFFF" />
              <circle cx="76" cy="74" r="4.0" fill="#FFFFFF" />
              <circle cx="64" cy="44" r="3.2" fill="#FFFFFF" />
              <circle cx="82" cy="54" r="2.2" fill="#FFFFFF" />
            </g>
          )}
        </g>

        {/* Glossy overlay rim */}
        <circle
          cx="50"
          cy="50"
          r="48.5"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="3"
        />
        {/* Top inner glass shine highlight */}
        <path
          d="M15 35 Q50 15 85 35 A50 50 0 0 0 15 35 Z"
          fill="rgba(255,255,255,0.18)"
        />
      </svg>
    </div>
  );
}

export default function CircularFlagBadges({ size = 38, className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 flex-wrap ${className}`}>
      {FLAG_BADGES.map((flag) => (
        <CircularFlag key={flag.id} id={flag.id} size={size} />
      ))}
    </div>
  );
}
