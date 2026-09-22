import React from "react";
import { DESTINATION_COUNTRY_PATHS, BANGLADESH_BORDER_PATH, ORIGIN } from "./worldMapData";

/**
 * CountryFlagPatterns
 * Renders authentic national flag designs clipped strictly inside each country's
 * exact geographic polygon boundary.
 *
 * Progressive Reveal:
 * - 0% progress: destination country remains dark/neutral
 * - 20% progress: country border starts glowing
 * - 50% progress: country shape becomes visible, subtle flag color emerges
 * - 85% progress: country border reaches MAXIMUM intensity, flag pattern clearer
 * - 100% progress / Landed: airplane touches down inside country, border settles into soft cyan glow,
 *   flag pattern reaches completed subtle brightness (0.88).
 *
 * Bangladesh:
 * - Permanent Origin with deep green field, proportional red circular disc, subtle dark overlay,
 *   and glowing geographic border.
 */
export default function CountryFlagPatterns({
  flightsProgress = {},
  landedDestinations = {},
  phase = 1,
}) {
  // Calculate progressive flag reveal opacity for each country
  const getFlagOpacity = (code) => {
    if (phase < 3) return 0;
    const isLanded = landedDestinations[code];
    if (isLanded) return 0.88;
    const progress = flightsProgress[code] || 0;
    if (progress < 0.18) return 0;
    if (progress < 0.50) {
      // 18% to 50%: subtle emergence
      return ((progress - 0.18) / 0.32) * 0.35;
    }
    if (progress < 0.85) {
      // 50% to 85%: clear flag colors
      return 0.35 + ((progress - 0.50) / 0.35) * 0.43;
    }
    // 85% to 100%: approaches full brightness
    return 0.78 + ((progress - 0.85) / 0.15) * 0.10;
  };

  // Calculate dynamic border styling for each country based on airplane distance
  const getBorderProps = (code) => {
    if (phase < 3) {
      return {
        stroke: "rgba(148, 163, 184, 0.16)",
        strokeWidth: 0.65,
        filter: "none",
        opacity: 0.7,
      };
    }
    const isLanded = landedDestinations[code];
    const progress = flightsProgress[code] || 0;

    if (isLanded) {
      // Soft, completed elegant cyan border after landing
      return {
        stroke: "rgba(56, 189, 248, 0.85)",
        strokeWidth: 1.15,
        filter: "drop-shadow(0 0 4px rgba(56, 189, 248, 0.75))",
        opacity: 1,
      };
    }

    if (progress >= 0.85) {
      // MAXIMUM GLOW when airplane is close and entering the country!
      return {
        stroke: "#E0F2FE",
        strokeWidth: 1.6,
        filter: "drop-shadow(0 0 5px #38BDF8) drop-shadow(0 0 10px #06B6D4)",
        opacity: 1,
      };
    }

    if (progress >= 0.50) {
      // Stronger glow as airplane covers midway distance
      const f = (progress - 0.50) / 0.35;
      return {
        stroke: `rgba(56, 189, 248, ${0.5 + f * 0.35})`,
        strokeWidth: 0.85 + f * 0.45,
        filter: "drop-shadow(0 0 3px rgba(6, 182, 212, 0.6))",
        opacity: 0.9,
      };
    }

    if (progress >= 0.18) {
      // Subtle glow starting
      const f = (progress - 0.18) / 0.32;
      return {
        stroke: `rgba(56, 189, 248, ${0.2 + f * 0.3})`,
        strokeWidth: 0.65 + f * 0.2,
        filter: "none",
        opacity: 0.75,
      };
    }

    // Default before flight approaches
    return {
      stroke: "rgba(148, 163, 184, 0.2)",
      strokeWidth: 0.65,
      filter: "none",
      opacity: 0.6,
    };
  };

  return (
    <g id="destination-flag-layers">
      <defs>
        {/* =========================================================================
            SVG CLIPPATH DEFINITIONS FOR ALL DESTINATION COUNTRIES + BANGLADESH
            ========================================================================= */}
        {Object.entries(DESTINATION_COUNTRY_PATHS).map(([code, pathD]) => (
          <clipPath key={`clip-${code}`} id={`clip-${code}`}>
            <path d={pathD} />
          </clipPath>
        ))}

        {/* Bangladesh Geographic ClipPath */}
        <clipPath id="clip-bd">
          <path d={BANGLADESH_BORDER_PATH} />
        </clipPath>
      </defs>

      {/* =========================================================================
          1. UNITED KINGDOM (Union Jack pattern inside UK boundaries)
          ========================================================================= */}
      <g
        clipPath="url(#clip-uk)"
        style={{
          opacity: getFlagOpacity("uk"),
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Navy base */}
        <rect x="475" y="85" width="32" height="30" fill="#012169" />
        {/* White diagonals */}
        <line x1="475" y1="85" x2="507" y2="115" stroke="#FFFFFF" strokeWidth="4.5" />
        <line x1="507" y1="85" x2="475" y2="115" stroke="#FFFFFF" strokeWidth="4.5" />
        {/* Red diagonal saltires */}
        <line x1="475" y1="85" x2="507" y2="115" stroke="#C8102E" strokeWidth="2.2" />
        <line x1="507" y1="85" x2="475" y2="115" stroke="#C8102E" strokeWidth="2.2" />
        {/* St. George's cross white backing */}
        <line x1="492" y1="85" x2="492" y2="115" stroke="#FFFFFF" strokeWidth="6" />
        <line x1="475" y1="99" x2="507" y2="99" stroke="#FFFFFF" strokeWidth="6" />
        {/* St. George's red cross */}
        <line x1="492" y1="85" x2="492" y2="115" stroke="#C8102E" strokeWidth="3.6" />
        <line x1="475" y1="99" x2="507" y2="99" stroke="#C8102E" strokeWidth="3.6" />
      </g>

      {/* =========================================================================
          2. CANADA (Red side fields, white central pale, red maple leaf center)
          ========================================================================= */}
      <g
        clipPath="url(#clip-ca)"
        style={{
          opacity: getFlagOpacity("ca"),
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Red side fields */}
        <rect x="100" y="15" width="260" height="125" fill="#D80621" />
        {/* White central field */}
        <rect x="180" y="20" width="80" height="115" fill="#FFFFFF" />
        {/* Red Maple Leaf in Central Canada (aligned with interior landing coordinate x=220, y=88) */}
        <g transform="translate(220, 88) scale(0.85)">
          <path
            d="M0,-18 L3,-11 L10,-13 L6,-6 L13,-3 L10,3 L15,5 L9,10 L9,15 L1,12 L1,18 L-1,18 L-1,12 L-9,15 L-9,10 L-15,5 L-10,3 L-13,-3 L-6,-6 L-10,-13 L-3,-11 Z"
            fill="#D80621"
          />
        </g>
      </g>

      {/* =========================================================================
          3. UNITED STATES (Red & white stripes, dark blue canton with stars)
          ========================================================================= */}
      <g
        clipPath="url(#clip-us)"
        style={{
          opacity: getFlagOpacity("us"),
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Alternating Red and White horizontal stripes */}
        <rect x="20" y="50" width="300" height="150" fill="#FFFFFF" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="20" y={110 + i * 10} width="300" height="5" fill="#B22234" />
        ))}
        {/* Blue canton */}
        <rect x="155" y="110" width="62" height="35" fill="#1E3A8A" />
        {/* Star pattern inside blue canton */}
        {[
          [165, 116], [177, 116], [189, 116], [201, 116],
          [171, 122], [183, 122], [195, 122], [207, 122],
          [165, 128], [177, 128], [189, 128], [201, 128],
          [171, 134], [183, 134], [195, 134], [207, 134],
          [165, 140], [177, 140], [189, 140], [201, 140],
        ].map(([sx, sy], idx) => (
          <circle key={idx} cx={sx} cy={sy} r="1.1" fill="#FFFFFF" />
        ))}
      </g>

      {/* =========================================================================
          4. GERMANY (Black, Red, Gold horizontal flag bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-de)"
        style={{
          opacity: getFlagOpacity("de"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="510" y="96" width="35" height="7.5" fill="#000000" />
        <rect x="510" y="103.5" width="35" height="7.5" fill="#DD0000" />
        <rect x="510" y="111" width="35" height="10" fill="#FFCC00" />
      </g>

      {/* =========================================================================
          5. FRANCE (Blue, White, Red vertical tricolor bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-fr)"
        style={{
          opacity: getFlagOpacity("fr"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="475" y="100" width="16" height="38" fill="#0055A4" />
        <rect x="491" y="100" width="15" height="38" fill="#FFFFFF" />
        <rect x="506" y="100" width="25" height="38" fill="#EF4135" />
      </g>

      {/* =========================================================================
          6. ITALY (Green, White, Red vertical tricolor bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-it)"
        style={{
          opacity: getFlagOpacity("it"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="515" y="118" width="11" height="35" fill="#009246" />
        <rect x="526" y="118" width="11" height="35" fill="#F1F2F1" />
        <rect x="537" y="118" width="18" height="35" fill="#CE2B37" />
      </g>

      {/* =========================================================================
          7. IRELAND (Green, White, Orange vertical tricolor bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-ie)"
        style={{
          opacity: getFlagOpacity("ie"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="470" y="95" width="4.5" height="14" fill="#169B62" />
        <rect x="474.5" y="95" width="4.5" height="14" fill="#FFFFFF" />
        <rect x="479" y="95" width="6" height="14" fill="#FF883E" />
      </g>

      {/* =========================================================================
          8. NETHERLANDS (Red, White, Blue horizontal tricolor bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-nl)"
        style={{
          opacity: getFlagOpacity("nl"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="507" y="100" width="15" height="3" fill="#AE1C28" />
        <rect x="507" y="103" width="15" height="3" fill="#FFFFFF" />
        <rect x="507" y="106" width="15" height="4" fill="#21468B" />
      </g>

      {/* =========================================================================
          9. BELGIUM (Black, Yellow, Red vertical tricolor bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-be)"
        style={{
          opacity: getFlagOpacity("be"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="506" y="106" width="4" height="9" fill="#000000" />
        <rect x="510" y="106" width="4" height="9" fill="#FDDA24" />
        <rect x="514" y="106" width="6" height="9" fill="#EF3340" />
      </g>

      {/* =========================================================================
          10. SPAIN (Red, Gold, Red horizontal bands with wider gold band)
          ========================================================================= */}
      <g
        clipPath="url(#clip-es)"
        style={{
          opacity: getFlagOpacity("es"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="470" y="127" width="42" height="6" fill="#AA151B" />
        <rect x="470" y="133" width="42" height="11" fill="#F1BF00" />
        <rect x="470" y="144" width="42" height="8" fill="#AA151B" />
      </g>

      {/* =========================================================================
          11. AUSTRIA (Red, White, Red horizontal bands)
          ========================================================================= */}
      <g
        clipPath="url(#clip-at)"
        style={{
          opacity: getFlagOpacity("at"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="525" y="112" width="25" height="3" fill="#ED2939" />
        <rect x="525" y="115" width="25" height="3" fill="#FFFFFF" />
        <rect x="525" y="118" width="25" height="4" fill="#ED2939" />
      </g>

      {/* =========================================================================
          12. SWITZERLAND (Red base with white Swiss cross)
          ========================================================================= */}
      <g
        clipPath="url(#clip-ch)"
        style={{
          opacity: getFlagOpacity("ch"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="515" y="116" width="16" height="9" fill="#D52B1E" />
        {/* White Swiss Cross */}
        <rect x="519.5" y="119.2" width="6.8" height="1.8" fill="#FFFFFF" />
        <rect x="522" y="117.8" width="1.8" height="4.6" fill="#FFFFFF" />
      </g>

      {/* =========================================================================
          13. SWEDEN (Swedish Blue base with Yellow Nordic cross)
          ========================================================================= */}
      <g
        clipPath="url(#clip-se)"
        style={{
          opacity: getFlagOpacity("se"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="528" y="56" width="42" height="43" fill="#006AA7" />
        <rect x="541" y="56" width="3.5" height="43" fill="#FECC00" />
        <rect x="528" y="78" width="42" height="3.5" fill="#FECC00" />
      </g>

      {/* =========================================================================
          14. FINLAND (White base with Blue Nordic cross)
          ========================================================================= */}
      <g
        clipPath="url(#clip-fi)"
        style={{
          opacity: getFlagOpacity("fi"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="555" y="54" width="35" height="32" fill="#FFFFFF" />
        <rect x="566" y="54" width="3.8" height="32" fill="#003580" />
        <rect x="555" y="69" width="35" height="3.8" fill="#003580" />
      </g>

      {/* =========================================================================
          15. NORWAY (Red base, white cross, blue inner Nordic cross)
          ========================================================================= */}
      <g
        clipPath="url(#clip-no)"
        style={{
          opacity: getFlagOpacity("no"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="510" y="24" width="80" height="70" fill="#BA0C2F" />
        {/* White cross backing */}
        <rect x="532" y="24" width="4.5" height="70" fill="#FFFFFF" />
        <rect x="510" y="69.5" width="80" height="4.5" fill="#FFFFFF" />
        {/* Blue inner cross */}
        <rect x="533" y="24" width="2.5" height="70" fill="#00205B" />
        <rect x="510" y="70.5" width="80" height="2.5" fill="#00205B" />
      </g>

      {/* =========================================================================
          16. DENMARK (Red base with white Nordic cross)
          ========================================================================= */}
      <g
        clipPath="url(#clip-dk)"
        style={{
          opacity: getFlagOpacity("dk"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="520" y="88" width="18" height="12" fill="#C60C30" />
        <rect x="526.5" y="88" width="1.8" height="12" fill="#FFFFFF" />
        <rect x="520" y="93.5" width="18" height="1.8" fill="#FFFFFF" />
      </g>

      {/* =========================================================================
          17. JAPAN (White base with red circular sun symbol Hinomaru)
          ========================================================================= */}
      <g
        clipPath="url(#clip-jp)"
        style={{
          opacity: getFlagOpacity("jp"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="855" y="120" width="55" height="48" fill="#FFFFFF" />
        {/* Red Sun Hinomaru circle (aligned with interior landing coordinate x=885, y=148.5) */}
        <circle cx="885" cy="148.5" r="7.5" fill="#BC002D" />
      </g>

      {/* =========================================================================
          18. SOUTH KOREA (White base with Taegeuk symbol & trigrams)
          ========================================================================= */}
      <g
        clipPath="url(#clip-kr)"
        style={{
          opacity: getFlagOpacity("kr"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="848" y="140" width="14" height="16" fill="#FFFFFF" />
        {/* Taegeuk red & blue halves */}
        <g transform="translate(855, 148.6)">
          <path d="M-3.5,0 A3.5,3.5 0 0,1 3.5,0 A1.75,1.75 0 0,1 0,0 A1.75,1.75 0 0,0 -3.5,0 Z" fill="#CD2E3A" />
          <path d="M3.5,0 A3.5,3.5 0 0,1 -3.5,0 A1.75,1.75 0 0,1 0,0 A1.75,1.75 0 0,0 3.5,0 Z" fill="#0047A0" />
          {/* Subtle trigram dashes */}
          <line x1="-5" y1="-3" x2="-3.5" y2="-4.5" stroke="#000000" strokeWidth="0.6" />
          <line x1="3.5" y1="-4.5" x2="5" y2="-3" stroke="#000000" strokeWidth="0.6" />
          <line x1="-5" y1="3" x2="-3.5" y2="4.5" stroke="#000000" strokeWidth="0.6" />
          <line x1="3.5" y1="4.5" x2="5" y2="3" stroke="#000000" strokeWidth="0.6" />
        </g>
      </g>

      {/* =========================================================================
          19. AUSTRALIA (Deep blue base with Commonwealth star & Southern Cross)
          ========================================================================= */}
      <g
        clipPath="url(#clip-au)"
        style={{
          opacity: getFlagOpacity("au"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="810" y="275" width="120" height="100" fill="#00008B" />
        {/* Union Jack canton detail in northwest Australia */}
        <g opacity="0.8">
          <rect x="818" y="282" width="34" height="20" fill="#012169" />
          <line x1="818" y1="282" x2="852" y2="302" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="852" y1="282" x2="818" y2="302" stroke="#FFFFFF" strokeWidth="2.5" />
          <line x1="818" y1="282" x2="852" y2="302" stroke="#C8102E" strokeWidth="1.2" />
          <line x1="852" y1="282" x2="818" y2="302" stroke="#C8102E" strokeWidth="1.2" />
          <line x1="835" y1="282" x2="835" y2="302" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="818" y1="292" x2="852" y2="292" stroke="#FFFFFF" strokeWidth="4" />
          <line x1="835" y1="282" x2="835" y2="302" stroke="#C8102E" strokeWidth="2.2" />
          <line x1="818" y1="292" x2="852" y2="292" stroke="#C8102E" strokeWidth="2.2" />
        </g>
        {/* Commonwealth large 7-point star */}
        <circle cx="836" cy="336" r="3.5" fill="#FFFFFF" />
        {/* Southern Cross constellation */}
        <circle cx="895" cy="305" r="1.8" fill="#FFFFFF" />
        <circle cx="908" cy="318" r="1.8" fill="#FFFFFF" />
        <circle cx="895" cy="342" r="1.8" fill="#FFFFFF" />
        <circle cx="884" cy="325" r="1.8" fill="#FFFFFF" />
        <circle cx="899" cy="328" r="1.2" fill="#FFFFFF" />
      </g>

      {/* =========================================================================
          20. NEW ZEALAND (Deep blue base with 4 red stars outlined in white)
          ========================================================================= */}
      <g
        clipPath="url(#clip-nz)"
        style={{
          opacity: getFlagOpacity("nz"),
          transition: "opacity 0.4s ease",
        }}
      >
        <rect x="960" y="342" width="38" height="40" fill="#00247D" />
        {/* Red stars with white borders */}
        {[
          [982, 354],
          [990, 362],
          [980, 372],
          [973, 363],
        ].map(([nx, ny], nidx) => (
          <g key={nidx}>
            <circle cx={nx} cy={ny} r="1.8" fill="#FFFFFF" />
            <circle cx={nx} cy={ny} r="1.1" fill="#CC142B" />
          </g>
        ))}
      </g>

      {/* =========================================================================
          21. BANGLADESH (The Origin: Deep green base + proportional red circular disc + dark overlay)
          ========================================================================= */}
      <g
        clipPath="url(#clip-bd)"
        style={{
          opacity: phase >= 2 ? 0.95 : 0,
          transition: "opacity 1.2s ease-in-out",
        }}
      >
        {/* Deep Bangladesh Bottle Green Field */}
        <rect x="742" y="174" width="18" height="20" fill="#006A4E" />

        {/* Proportional Red Circular Disc (authentic Bangladesh flag proportion, shifted slightly toward hoist) */}
        <circle
          cx={ORIGIN.x - 0.5}
          cy={ORIGIN.y}
          r="3.4"
          fill="#F42A41"
          style={{ filter: "drop-shadow(0 0 3px rgba(244, 42, 65, 0.8))" }}
        />

        {/* Subtle Dark Overlay for visual consistency with map tones */}
        <rect x="742" y="174" width="18" height="20" fill="#020617" opacity="0.12" />
      </g>

      {/* =========================================================================
          DYNAMIC BORDER OUTLINES & GLOWS FOR DESTINATION COUNTRIES
          Progressively lights up country boundary as the airplane approaches,
          reaching maximum brilliance upon arrival, then settling into a soft completed glow.
          ========================================================================= */}
      <g id="destination-borders">
        {Object.entries(DESTINATION_COUNTRY_PATHS).map(([code, pathD]) => {
          const borderProps = getBorderProps(code);
          return (
            <path
              key={`border-${code}`}
              d={pathD}
              fill="none"
              stroke={borderProps.stroke}
              strokeWidth={borderProps.strokeWidth}
              style={{
                filter: borderProps.filter,
                opacity: borderProps.opacity,
                transition: "all 0.35s ease",
              }}
            />
          );
        })}
      </g>
    </g>
  );
}
