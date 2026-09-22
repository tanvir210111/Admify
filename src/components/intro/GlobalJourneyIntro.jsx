import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import {
  ORIGIN,
  DESTINATIONS,
  WORLD_LAND_PATH,
  BANGLADESH_BORDER_PATH,
  CITY_LIGHTS,
  DESTINATION_COUNTRY_PATHS,
  getFlightArc,
} from "./worldMapData";
import CountryFlagPatterns from "./CountryFlagPatterns";

// Realistic commercial airplane silhouette (fuselage, swept wings, engines, tail)
function AirplaneSilhouette({ size = 20, className = "", style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={{
        filter:
          "drop-shadow(0 0 6px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 14px rgba(255, 255, 255, 0.8))",
        ...style,
      }}
    >
      <path d="M12 1.5 C12.6 1.5 13.2 2.2 13.2 4.2 L13.2 9.2 L22.5 14.2 L22.5 16.2 L13.2 13.6 L13.2 18.2 L16.5 20.8 L16.5 22.4 L12 21.4 L7.5 22.4 L7.5 20.8 L10.8 18.2 L10.8 13.6 L1.5 16.2 L1.5 14.2 L10.8 9.2 L10.8 4.2 C10.8 2.2 11.4 1.5 12 1.5 Z" />
    </svg>
  );
}

// Distance-based flight durations for simultaneous launch (all take off together at t = 4.0s)
// Total intro time target: 18 - 24 seconds
const FLIGHT_DURATIONS = {
  // East Asia (Quickest arrival: ~8.6s - 9.0s -> lands at ~12.6s - 13.0s)
  kr: 8600,
  jp: 9000,

  // Europe (Medium arrival: ~10.2s - 12.0s -> lands at ~14.2s - 16.0s)
  fi: 10200,
  at: 10400,
  se: 10600,
  de: 10800,
  it: 10800,
  ch: 11000,
  dk: 11000,
  no: 11200,
  nl: 11300,
  be: 11300,
  fr: 11500,
  es: 11600,
  uk: 11800,
  ie: 12000,

  // Oceania (Longer arrival: ~12.2s - 12.6s -> lands at ~16.2s - 16.6s)
  au: 12200,
  nz: 12600,

  // North America (Longest arrival: ~12.8s - 13.0s -> lands at ~16.8s - 17.0s)
  ca: 12800,
  us: 13000,
};

export default function GlobalJourneyIntro({ onComplete }) {
  // Timeline:
  // Phase 1: World Map Fade-in (0 - 2.0s)
  // Phase 2: Bangladesh Flag & Border Illuminate, Dhaka Origin Activates (2.0 - 4.0s)
  // Phase 3: ALL 20 AIRPLANES LAUNCH SIMULTANEOUSLY & Travel to Destinations (4.0 - 17.0s)
  //          Country borders progressively glow & flag patterns gradually reveal
  // Phase 4: All Flights Landed + Flag Colors Illuminated + Admify Branding Prominent (17.0 - 21.2s, 3.8s hold)
  // Phase 5: Cinematic Dissolve Transition into Homepage (21.2 - 22.3s)
  const [phase, setPhase] = useState(1);
  const [flightsProgress, setFlightsProgress] = useState({}); // { [destId]: progress 0 to 1 }
  const [landedDestinations, setLandedDestinations] = useState({}); // { [destId]: boolean }
  const [isMobile, setIsMobile] = useState(false);

  const pathRefs = useRef({});
  const pathLengthsRef = useRef({});
  const animationFrameRef = useRef(null);
  const flightStartTimeRef = useRef(null);

  // Responsive check
  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 768);
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Display destinations (all 20 on desktop, top 10 on mobile)
  const displayDestinations = useMemo(() => {
    return isMobile ? DESTINATIONS.filter((d) => d.isMajor) : DESTINATIONS;
  }, [isMobile]);

  // Handle Skip Intro
  const handleSkip = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    try {
      sessionStorage.setItem("admify_intro_seen", "true");
      window.dispatchEvent(new Event("admify_intro_finished"));
    } catch (e) {}
    setPhase(5);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  };

  // Phase Orchestration
  useEffect(() => {
    // Accessibility check: prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const timer = setTimeout(handleSkip, 800);
      return () => clearTimeout(timer);
    }

    // Phase 1 -> 2: Map fades in, then Bangladesh illuminates & Dhaka activates (2.0s)
    const t1 = setTimeout(() => {
      setPhase(2);
    }, 2000);

    // Phase 2 -> 3: Bangladesh flag & border ready, ALL 20 FLIGHTS LAUNCH AT ONCE (4.0s)
    const t2 = setTimeout(() => {
      setPhase(3);
      flightStartTimeRef.current = performance.now();
    }, 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // SIMULTANEOUS FLIGHT ANIMATION LOOP (All 20 planes move concurrently)
  useEffect(() => {
    if (phase !== 3) return;

    let isCancelled = false;

    const animateSimultaneousFlights = (now) => {
      if (isCancelled) return;

      if (!flightStartTimeRef.current) {
        flightStartTimeRef.current = now;
      }

      const elapsed = now - flightStartTimeRef.current;
      const newProgress = {};
      const newLanded = {};
      let allLanded = true;

      DESTINATIONS.forEach((dest) => {
        const duration = FLIGHT_DURATIONS[dest.id] || 11000;
        const rawProgress = Math.min(1, elapsed / duration);

        // Smooth cubic ease: takeoff acceleration, steady cruise, gentle landing slowdown
        const eased =
          rawProgress < 0.5
            ? 4 * rawProgress * rawProgress * rawProgress
            : 1 - Math.pow(-2 * rawProgress + 2, 3) / 2;

        newProgress[dest.id] = eased;

        if (rawProgress >= 1) {
          newLanded[dest.id] = true;
        } else {
          allLanded = false;
        }
      });

      setFlightsProgress(newProgress);
      setLandedDestinations(newLanded);

      if (allLanded) {
        // All airplanes have reached their destination countries!
        // Move to Phase 4: Full visualization, branding and 3.5s hold
        setTimeout(() => {
          setPhase(4);
        }, 500);
        return;
      }

      animationFrameRef.current = requestAnimationFrame(animateSimultaneousFlights);
    };

    animationFrameRef.current = requestAnimationFrame(animateSimultaneousFlights);

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [phase]);

  // Phase 4: Hold for 3.5 seconds after animation completes, then smoothly redirect to homepage
  useEffect(() => {
    if (phase !== 4) return;

    const holdTimer = setTimeout(() => {
      try {
        sessionStorage.setItem("admify_intro_seen", "true");
        window.dispatchEvent(new Event("admify_intro_finished"));
      } catch (e) {}
      setPhase(5);

      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 950);

      return () => clearTimeout(completeTimer);
    }, 3500);

    return () => clearTimeout(holdTimer);
  }, [phase, onComplete]);

  // Compute position and rotation for ALL 20 airplanes
  const airplaneTransforms = useMemo(() => {
    if (phase !== 3) return [];

    const planes = [];

    DESTINATIONS.forEach((dest) => {
      const progress = flightsProgress[dest.id] || 0;
      if (progress <= 0) return;

      const path = pathRefs.current[dest.id];
      if (!path) return;

      try {
        let totalLen = pathLengthsRef.current[dest.id];
        if (!totalLen) {
          totalLen = path.getTotalLength();
          pathLengthsRef.current[dest.id] = totalLen;
        }

        const curDist = Math.max(0, Math.min(totalLen, progress * totalLen));
        const p1 = path.getPointAtLength(curDist);
        const p2 = path.getPointAtLength(Math.min(totalLen, curDist + 2));
        // +90 degrees aligns aircraft nose with tangent path
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI) + 90;

        planes.push({
          id: dest.id,
          name: dest.name,
          x: p1.x,
          y: p1.y,
          angle: angle,
          scale:
            progress < 0.08
              ? 0.7 + progress * 3.75
              : progress > 0.90
              ? 1.0 - (progress - 0.90) * 1.5 // gentle touch-down slowdown
              : 1.0,
          opacity: progress < 0.04 ? progress * 25 : 1, // Plane stays visible all the way to destination!
          isLanded: progress >= 1,
        });
      } catch (e) {}
    });

    return planes;
  }, [phase, flightsProgress]);

  return (
    <motion.div
      initial={{ opacity: 1, filter: "blur(0px)" }}
      animate={{
        opacity: phase === 5 ? 0 : 1,
        scale: phase === 5 ? 1.025 : 1,
        filter: phase === 5 ? "blur(8px)" : "blur(0px)",
      }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 h-screen h-[100dvh] w-screen flex flex-col md:flex-row items-stretch justify-between overflow-hidden select-none bg-[#020614] z-[9999]"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
      }}
    >
      {/* ── Realistic Space & Atmospheric Background ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Ocean & Space Radial Gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 60% 48%, #08132D 0%, #03081A 55%, #01030D 100%)",
          }}
        />

        {/* Atmospheric Cyan Glow behind World Map */}
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[65rem] h-[36rem] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

        {/* Starfield */}
        {[...Array(isMobile ? 14 : 28)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-100/30"
            style={{
              top: `${(i * 19) % 94 + 3}%`,
              left: `${(i * 31) % 96 + 2}%`,
              width: i % 4 === 0 ? 2 : 1,
              height: i % 4 === 0 ? 2 : 1,
              opacity: (i % 3) * 0.25 + 0.2,
            }}
          />
        ))}
      </div>

      {/* =========================================================================
          1. LEFT-SIDE FLIGHT LIST — EXACT FORMAT: Dhaka → ✈ → Destination
          ========================================================================= */}
      <aside className="relative z-30 w-full md:w-64 lg:w-72 md:h-full p-3 md:py-5 md:pl-6 md:pr-3 flex flex-col justify-between shrink-0 bg-slate-950/50 md:bg-slate-950/30 md:border-r border-slate-800/50 backdrop-blur-md">
        <div>
          {/* Top Brand Header on Left Side */}
          <div className="mb-2.5 pb-2 border-b border-slate-800/70">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.6)] border border-white/25 shrink-0">
                <span className="text-white font-black text-xs md:text-sm leading-none">A</span>
              </div>
              <span className="text-sm md:text-base font-extrabold tracking-wider text-white leading-tight">
                ADMIFY
              </span>
            </div>
            <p className="text-[9px] md:text-[9.5px] font-bold tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
              AI-Powered Global Study Guidance
            </p>
          </div>

          {/* Header */}
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/60">
            <AirplaneSilhouette size={13} className="text-cyan-400" style={{ transform: "rotate(90deg)" }} />
            <span className="text-[10px] md:text-[11px] font-bold text-cyan-300 uppercase tracking-widest">
              Global Study Journey
            </span>
          </div>

          {/* Destination Tracker Rows (Dhaka → ✈ → Destination) */}
          <div className="flex flex-col space-y-0.5 max-h-[220px] md:max-h-[calc(100vh-80px)] overflow-y-auto pr-1">
            {displayDestinations.map((dest) => {
              const isLanded = landedDestinations[dest.id];
              const isFlying = phase === 3 && !isLanded;

              return (
                <div
                  key={dest.id}
                  className={`flex items-center justify-between px-2 py-0.5 md:py-1 rounded text-[11px] font-medium transition-all duration-300 border-b border-slate-850/40 ${
                    isLanded
                      ? "text-white bg-blue-500/10 border-blue-500/20"
                      : isFlying
                      ? "text-cyan-200 bg-cyan-950/25"
                      : "text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-semibold text-cyan-400/90 shrink-0">
                      Dhaka
                    </span>
                    <span className="text-[9px] text-slate-500 shrink-0">→</span>
                    <AirplaneSilhouette
                      size={11}
                      className={`shrink-0 transition-colors duration-300 ${
                        isLanded
                          ? "text-cyan-400"
                          : isFlying
                          ? "text-cyan-300 animate-pulse"
                          : "text-slate-500"
                      }`}
                      style={{
                        transform: "rotate(90deg)",
                        filter: isLanded ? "drop-shadow(0 0 4px #06B6D4)" : "none",
                      }}
                    />
                    <span className="text-[9px] text-slate-500 shrink-0">→</span>
                    <span className="truncate text-[11px] font-medium text-slate-200">
                      {dest.name}
                    </span>
                  </div>

                  {/* Status Indicator (✓ on landing, pulse while in flight) */}
                  <div className="shrink-0 ml-1.5">
                    {isLanded ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-400">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    ) : isFlying ? (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700/60 inline-block" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile-only Skip button placement */}
        <div className="md:hidden mt-2 pt-2 border-t border-slate-800/40 flex justify-end">
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-slate-900/80 text-xs font-semibold text-slate-300"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          CENTER / RIGHT: REALISTIC WORLD MAP + NATIONAL FLAG-COLORED COUNTRIES
          ========================================================================= */}
      <main className="relative flex-1 h-full flex flex-col items-center justify-center p-2 md:p-6 overflow-hidden">
        {/* Large SVG Map Container */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full max-h-[560px] md:max-h-[640px] object-contain overflow-visible"
        >
          <defs>
            {/* Active Flight Trail Gradient */}
            <linearGradient id="activeFlightTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </linearGradient>

            {/* Completed Landed Trail Gradient */}
            <linearGradient id="completedFlightTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.22" />
            </linearGradient>

            {/* Neon Route Glow Filter */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Bangladesh Border Glow Filter */}
            <filter id="bangladeshGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Smooth Camera Movement: Starts slightly focused around Bangladesh, smoothly zooms out */}
          <motion.g
            initial={{ scale: 1.15, x: -75, y: -20 }}
            animate={{
              scale: phase >= 3 ? 1.0 : 1.15,
              x: phase >= 3 ? 0 : -75,
              y: phase >= 3 ? 0 : -20,
            }}
            transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* 1. Subtle Global Latitude & Longitude Grid */}
            <g opacity="0.08">
              <line x1="20" y1="125" x2="980" y2="125" stroke="#93C5FD" strokeDasharray="3 6" />
              <line x1="20" y1="250" x2="980" y2="250" stroke="#60A5FA" strokeDasharray="4 6" strokeWidth="1" />
              <line x1="20" y1="375" x2="980" y2="375" stroke="#93C5FD" strokeDasharray="3 6" />
              <line x1="250" y1="30" x2="250" y2="470" stroke="#93C5FD" strokeDasharray="3 6" />
              <line x1="500" y1="30" x2="500" y2="470" stroke="#60A5FA" strokeDasharray="4 6" strokeWidth="1" />
              <line x1="750" y1="30" x2="750" y2="470" stroke="#93C5FD" strokeDasharray="3 6" />
            </g>

            {/* 2. REALISTIC WORLD MAP BASE (Natural Earth landmass in dark night earth tone) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            >
              <path
                d={WORLD_LAND_PATH}
                fill="#0C1938"
                stroke="rgba(59, 130, 246, 0.3)"
                strokeWidth="0.85"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 2px 14px rgba(4, 10, 28, 0.95))",
                }}
              />
            </motion.g>

            {/* 3. AUTHENTIC NATIONAL FLAG PATTERNS CLIPPED TO DESTINATION COUNTRY BOUNDARIES */}
            {/* Progressive reveal synchronized with airplane progress + dynamic glowing boundary */}
            <CountryFlagPatterns
              flightsProgress={flightsProgress}
              landedDestinations={landedDestinations}
              phase={phase}
            />

            {/* 4. Global Night City Lights */}
            <g opacity="0.75">
              {CITY_LIGHTS.map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={i % 3 === 0 ? "1.4" : "1.0"}
                  fill={i % 2 === 0 ? "#FDE68A" : "#67E8F9"}
                  opacity={0.6 + (i % 4) * 0.1}
                />
              ))}
            </g>

            {/* 5. BANGLADESH GEOGRAPHIC BORDER & NATIONAL FLAG ACCENT (Green + Red Sun + Cyan Glow) */}
            {phase >= 2 && (
              <g>
                {/* Bangladesh Drawing Border with Cyan Luminous Glow */}
                <motion.path
                  d={BANGLADESH_BORDER_PATH}
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="2.0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#bangladeshGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                />

                {/* Inner White/Cyan Contour */}
                <motion.path
                  d={BANGLADESH_BORDER_PATH}
                  fill="none"
                  stroke="#E0F2FE"
                  strokeWidth="0.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.95 }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                />
              </g>
            )}

            {/* 6. ALL 20 FLIGHT ROUTE ARCS RADIATING FROM DHAKA */}
            {phase >= 3 && (
              <g>
                {DESTINATIONS.map((dest) => {
                  const arcD = getFlightArc(ORIGIN.x, ORIGIN.y, dest.x, dest.y, dest.id);
                  const progress = flightsProgress[dest.id] || 0;
                  const isLanded = landedDestinations[dest.id];

                  return (
                    <g key={dest.id}>
                      {/* Invisible SVG path used for exact position tracking */}
                      <path
                        ref={(el) => {
                          if (el) pathRefs.current[dest.id] = el;
                        }}
                        d={arcD}
                        fill="none"
                        stroke="none"
                      />

                      {/* Completed subtle glowing route */}
                      {isLanded && (
                        <path
                          d={arcD}
                          fill="none"
                          stroke="url(#completedFlightTrail)"
                          strokeWidth="1.2"
                          strokeDasharray="4 4"
                        />
                      )}

                      {/* Active animating flight trail trailing behind moving airplane */}
                      {!isLanded && progress > 0 && (
                        <path
                          d={arcD}
                          fill="none"
                          stroke="url(#activeFlightTrail)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeDasharray={pathLengthsRef.current[dest.id] || 1000}
                          strokeDashoffset={
                            (pathLengthsRef.current[dest.id] || 1000) * (1 - progress)
                          }
                          filter="url(#routeGlow)"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* 7. ALL 20 PHYSICAL AIRPLANES MOVING SIMULTANEOUSLY ACROSS THE GLOBE (NO TEXT OVER AIRPLANES) */}
            {phase === 3 &&
              airplaneTransforms.map((plane) => (
                <g
                  key={`plane-${plane.id}`}
                  transform={`translate(${plane.x}, ${plane.y}) rotate(${plane.angle}) scale(${plane.scale})`}
                  opacity={plane.opacity}
                  style={{ pointerEvents: "none" }}
                >
                  {/* Glowing Aircraft Body (Centered around 0,0 - NO TEXT OVER AIRPLANE) */}
                  <g transform="translate(-10, -10)">
                    <AirplaneSilhouette size={20} className="text-white" />
                  </g>

                  {/* Jet Contrail Beacon */}
                  <circle
                    cx="0"
                    cy="7.5"
                    r="1.6"
                    fill="#38BDF8"
                    style={{ filter: "drop-shadow(0 0 4px #38BDF8)" }}
                  />
                </g>
              ))}

            {/* 8. DESTINATION MARKERS (Landing ripples, touchdown glows, and glowing nodes inside country) */}
            {phase >= 3 && (
              <g>
                {DESTINATIONS.map((dest) => {
                  const isLanded = landedDestinations[dest.id];
                  const progress = flightsProgress[dest.id] || 0;

                  if (!isLanded && progress < 0.75) return null;

                  return (
                    <g key={`dest-${dest.id}`} transform={`translate(${dest.x}, ${dest.y})`}>
                      {/* Approaching Beacon Pulse */}
                      {!isLanded && progress >= 0.75 && (
                        <motion.circle
                          r="2.5"
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="1.2"
                          initial={{ r: 2.5, opacity: 0.8 }}
                          animate={{ r: [2.5, 12], opacity: [0.8, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}

                      {/* Landed Touchdown Pulse Waves */}
                      {isLanded && (
                        <>
                          <motion.circle
                            r="3"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1.6"
                            animate={{ r: [3, 16], opacity: [0.95, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                          />
                          <motion.circle
                            r="3"
                            fill="none"
                            stroke="#E0F2FE"
                            strokeWidth="1.0"
                            animate={{ r: [3, 10], opacity: [0.75, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4, ease: "easeOut" }}
                          />
                        </>
                      )}

                      {/* Destination Glowing Node (Located strictly inside the destination country) */}
                      <circle
                        r={dest.isMajor ? "3" : "2.2"}
                        fill={isLanded ? "#38BDF8" : "#94A3B8"}
                        style={{
                          filter: isLanded
                            ? "drop-shadow(0 0 6px rgba(56, 189, 248, 0.95)) drop-shadow(0 0 12px rgba(6, 182, 212, 0.8))"
                            : "none",
                        }}
                      />
                      {isLanded && <circle r="1.2" fill="#FFFFFF" />}
                    </g>
                  );
                })}
              </g>
            )}

            {/* 9. BANGLADESH ORIGIN POINT (Dhaka) */}
            {phase >= 2 && (
              <g transform={`translate(${ORIGIN.x}, ${ORIGIN.y})`}>
                {/* Expanding Radar Pulses */}
                <motion.circle
                  r="3"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="1.4"
                  animate={{ r: [3, 22], opacity: [0.85, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.circle
                  r="3"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="1"
                  animate={{ r: [3, 14], opacity: [0.65, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
                />

                {/* Dhaka Origin Pin */}
                <circle
                  r="4"
                  fill="#06B6D4"
                  style={{ filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.95))" }}
                />
                <circle r="1.6" fill="#FFFFFF" />

                {/* Clean, Non-Clunky Origin Label */}
                <motion.g
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <text
                    x="9"
                    y="-5"
                    fill="#F8FAFC"
                    fontSize="8.5px"
                    fontWeight="800"
                    letterSpacing="0.05em"
                    style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.9))" }}
                  >
                    Dhaka
                  </text>
                  <text
                    x="9"
                    y="4"
                    fill="#38BDF8"
                    fontSize="7px"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    style={{ filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.9))" }}
                  >
                    Bangladesh
                  </text>
                </motion.g>
              </g>
            )}
          </motion.g>
        </svg>

        {/* =========================================================================
            CENTRAL HIERARCHY (Positioned in lower-middle at bottom: 15-18% of viewport):
              [ADMIFY LOGO]
                  ADMIFY
              AI-Powered Global Study Guidance
              ↓
              Your Journey. Your University. Your Future.
            ========================================================================= */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-[15%] sm:bottom-[17%] md:bottom-[18%] inset-x-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-30"
            >
              {/* 1. Central Admify Logo Mark + ADMIFY Title */}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5 mb-1.5"
              >
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-[0_0_22px_rgba(99,102,241,0.75)] border border-white/30">
                  <span className="text-white font-black text-sm md:text-base leading-none">A</span>
                </div>
                <span className="text-lg md:text-xl font-extrabold tracking-wider text-white leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  ADMIFY
                </span>
              </motion.div>

              {/* 2. AI-Powered Global Study Guidance Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-[11px] md:text-xs font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 mb-2.5 drop-shadow-[0_2px_8px_rgba(6,182,212,0.5)]"
              >
                AI-Powered Global Study Guidance
              </motion.p>

              {/* 3. Main Headline: Your Journey. Your University. Your Future. strictly in ONE line */}
              <motion.h1
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="whitespace-nowrap text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-[34px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-none px-4 leading-normal"
              >
                Your Journey. Your University. Your Future.
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Skip Intro Button (Bottom Right - chat widget is hidden during intro) */}
        <div className="hidden md:block absolute bottom-8 right-8 z-40">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-slate-900/75 hover:bg-slate-800/90 backdrop-blur-md text-slate-300 hover:text-white hover:border-cyan-500/50 text-xs font-semibold tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Skip introduction"
          >
            <span>Skip Intro</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </main>
    </motion.div>
  );
}
