import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Globe } from "lucide-react";
import { ORIGIN, DESTINATIONS, CONTINENT_PATHS, getFlightArc } from "./worldMapData";

export default function GlobalJourneyIntro({ onComplete }) {
  const [phase, setPhase] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [completedRoutes, setCompletedRoutes] = useState({});

  // Detect mobile viewport and handle resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter destinations for responsive density
  const visibleDestinations = useMemo(() => {
    return isMobile ? DESTINATIONS.filter((d) => d.isMajor) : DESTINATIONS;
  }, [isMobile]);

  // Timed progression through the 6 cinematic phases
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const quickTimer = setTimeout(() => {
        handleSkip();
      }, 1500);
      return () => clearTimeout(quickTimer);
    }

    const timers = [
      // Phase 2: Highlight Dhaka, Bangladesh (1.6s)
      setTimeout(() => setPhase(2), 1600),

      // Phase 3: Launch flight paths from Bangladesh (2.8s)
      setTimeout(() => setPhase(3), 2800),

      // Phase 4: Global Network & Inspiring Quote (6.5s)
      setTimeout(() => setPhase(4), 6500),

      // Phase 5: Admify Brand Reveal (8.0s)
      setTimeout(() => setPhase(5), 8000),

      // Phase 6: Dissolve to Homepage (9.6s)
      setTimeout(() => {
        setPhase(6);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 700);
      }, 9600),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const handleSkip = () => {
    setPhase(6);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 400);
  };

  const handleRouteComplete = (id) => {
    setCompletedRoutes((prev) => ({ ...prev, [id]: true }));
  };

  // Generate deterministic stars for performance without canvas overhead
  const stars = useMemo(() => {
    const count = isMobile ? 18 : 36;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        top: `${(i * 17) % 94 + 3}%`,
        left: `${(i * 29) % 96 + 2}%`,
        size: (i % 3) + 1.2,
        delay: (i % 5) * 0.4,
        duration: 2.5 + (i % 3),
      });
    }
    return items;
  }, [isMobile]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 6 ? 0 : 1, scale: phase === 6 ? 1.04 : 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at 50% 45%, #0a112e 0%, #050b1f 65%, #020612 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Ambient Background Starfield ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 0.75, 0.15], scale: [0.85, 1.2, 0.85] }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-cyan-200"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              boxShadow: "0 0 6px rgba(103, 232, 249, 0.5)",
            }}
          />
        ))}

        {/* Ambient colored lighting blooms */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-cyan-500/5 rounded-full blur-[160px]" />
      </div>

      {/* ── SVG World Map & Global Flight Network ── */}
      <div className="relative w-full max-w-[1300px] h-[75vh] max-h-[640px] px-2 md:px-6 flex items-center justify-center">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-contain overflow-visible"
          style={{ filter: "drop-shadow(0 0 25px rgba(5, 11, 31, 0.9))" }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.95" />
            </linearGradient>

            <linearGradient id="planeTrail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0" />
              <stop offset="80%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
            </linearGradient>

            <radialGradient id="originPulseGlow">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="destinationPulseGlow">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>

            {/* Subtle glow filter */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── Background Coordinate Grid ── */}
          <g opacity="0.18">
            {/* Latitude parallels */}
            <line x1="50" y1="125" x2="950" y2="125" stroke="rgba(148, 163, 184, 0.4)" strokeDasharray="3 6" />
            <line x1="50" y1="250" x2="950" y2="250" stroke="rgba(99, 102, 241, 0.6)" strokeDasharray="4 8" strokeWidth="1" />
            <line x1="50" y1="375" x2="950" y2="375" stroke="rgba(148, 163, 184, 0.4)" strokeDasharray="3 6" />
            {/* Longitude meridians */}
            <line x1="250" y1="50" x2="250" y2="450" stroke="rgba(148, 163, 184, 0.35)" strokeDasharray="3 6" />
            <line x1="500" y1="50" x2="500" y2="450" stroke="rgba(99, 102, 241, 0.5)" strokeDasharray="4 8" strokeWidth="1" />
            <line x1="750" y1="50" x2="750" y2="450" stroke="rgba(148, 163, 184, 0.35)" strokeDasharray="3 6" />
          </g>

          {/* ── Continent Shapes ── */}
          <motion.g
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{
              opacity: phase >= 5 ? 0.22 : phase >= 4 ? 0.75 : 0.65,
              scale: 1,
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            {CONTINENT_PATHS.map((continent) => (
              <path
                key={continent.id}
                d={continent.d}
                fill="rgba(15, 23, 42, 0.55)"
                stroke="rgba(124, 58, 237, 0.28)"
                strokeWidth="1.25"
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(124, 58, 237, 0.12))",
                }}
              />
            ))}
          </motion.g>

          {/* ── Flight Paths (Phase 3+) ── */}
          {phase >= 3 && (
            <g>
              {visibleDestinations.map((dest) => {
                const arcPath = getFlightArc(ORIGIN.x, ORIGIN.y, dest.x, dest.y, dest.id);
                // Wave staggered timing
                const delay = 0.1 + (dest.wave - 1) * 0.55;
                const duration = 1.35;

                return (
                  <g key={dest.id}>
                    {/* Background subtle trail guide */}
                    <path
                      d={arcPath}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                      strokeDasharray="2 4"
                    />

                    {/* Animated glowing route */}
                    <motion.path
                      d={arcPath}
                      fill="none"
                      stroke="url(#routeGradient)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: phase >= 5 ? 0.35 : 0.95 }}
                      transition={{
                        duration: duration,
                        delay: delay,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                      onAnimationComplete={() => handleRouteComplete(dest.id)}
                      filter="url(#softGlow)"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Destination Points (Phase 3+) ── */}
          {phase >= 3 && (
            <g>
              {visibleDestinations.map((dest) => {
                const isArrived = completedRoutes[dest.id] || phase >= 4;
                const delay = 0.1 + (dest.wave - 1) * 0.55 + 1.1;

                return (
                  <g key={dest.id} transform={`translate(${dest.x}, ${dest.y})`}>
                    {/* Landing ping wave animation */}
                    {isArrived && (
                      <motion.circle
                        r="3"
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="1.5"
                        initial={{ r: 2, opacity: 0.95 }}
                        animate={{ r: [2, 14], opacity: [0.95, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                      />
                    )}

                    {/* Destination dot */}
                    <motion.circle
                      r={dest.isMajor ? "3.5" : "2.5"}
                      fill={isArrived ? "#38BDF8" : "rgba(148, 163, 184, 0.4)"}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: isArrived ? [1, 1.25, 1] : 1,
                        opacity: isArrived ? (phase >= 5 ? 0.4 : 1) : 0.4,
                      }}
                      transition={{
                        delay: delay,
                        duration: 0.5,
                      }}
                      style={{
                        filter: isArrived ? "drop-shadow(0 0 6px #38BDF8)" : "none",
                      }}
                    />

                    {/* Small elegant country tag (Desktop only or major destinations) */}
                    {(!isMobile || dest.isMajor) && isArrived && (
                      <motion.text
                        x={dest.x > ORIGIN.x ? 8 : -8}
                        y={dest.y > 250 ? 12 : -7}
                        textAnchor={dest.x > ORIGIN.x ? "start" : "end"}
                        fill={phase >= 5 ? "rgba(148, 163, 184, 0.35)" : "rgba(226, 232, 240, 0.85)"}
                        fontSize={isMobile ? "8px" : "9.5px"}
                        fontWeight="600"
                        letterSpacing="0.04em"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: phase >= 5 ? 0.3 : 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                          pointerEvents: "none",
                        }}
                      >
                        {dest.name}
                      </motion.text>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* ── Origin Point: Dhaka, Bangladesh (Phase 2+) ── */}
          {phase >= 2 && (
            <g transform={`translate(${ORIGIN.x}, ${ORIGIN.y})`}>
              {/* Concentric pulsing radar waves */}
              <motion.circle
                r="4"
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                initial={{ r: 3, opacity: 1 }}
                animate={{ r: [3, 26], opacity: [0.9, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.circle
                r="4"
                fill="none"
                stroke="#06B6D4"
                strokeWidth="1.2"
                initial={{ r: 3, opacity: 1 }}
                animate={{ r: [3, 18], opacity: [0.75, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
              />

              {/* Glowing center beacon */}
              <circle r="4.5" fill="#10B981" style={{ filter: "drop-shadow(0 0 8px #10B981)" }} />
              <circle r="2" fill="#FFFFFF" />

              {/* Origin Badge */}
              <motion.g
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{
                  opacity: phase >= 5 ? 0.35 : 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <rect
                  x="-70"
                  y="-34"
                  width="140"
                  height="22"
                  rx="11"
                  fill="rgba(5, 11, 31, 0.88)"
                  stroke="rgba(16, 185, 129, 0.45)"
                  strokeWidth="1"
                  style={{ backdropFilter: "blur(8px)" }}
                />
                <circle cx="-56" cy="-23" r="2.5" fill="#10B981" />
                <text
                  x="-48"
                  y="-20"
                  fill="#F8FAFC"
                  fontSize="9px"
                  fontWeight="700"
                  letterSpacing="0.05em"
                >
                  Dhaka, Bangladesh
                </text>
              </motion.g>
            </g>
          )}
        </svg>

        {/* ── Phase 4: Inspiring Network Message ── */}
        <AnimatePresence>
          {phase === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center w-full px-4 pointer-events-none"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/25 bg-violet-950/40 backdrop-blur-md mb-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
                <span className="text-[11px] font-bold text-violet-300 uppercase tracking-widest">
                  From Bangladesh → To The World
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-violet-200">
                Your Journey. Your University. Your Future.
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Phase 5: Admify Brand Reveal ── */}
        <AnimatePresence>
          {phase === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none z-20"
            >
              {/* Admify Brand Icon */}
              <motion.div
                initial={{ scale: 0.7, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.5)] border border-violet-400/30 mb-4"
              >
                <span className="text-white font-black text-3xl md:text-4xl tracking-tight">A</span>
              </motion.div>

              {/* Brand Name */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                Admify
              </h1>

              {/* Tagline */}
              <div className="flex items-center gap-2 mt-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <p className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-widest">
                  AI-Powered Global Study Guidance
                </p>
                <Sparkles className="w-4 h-4 text-violet-400" />
              </div>

              {/* Accent subtle glowing beam */}
              <div className="mt-4 w-40 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-80" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Subtle Skip Intro Button ── */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: phase < 6 ? 1 : 0, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        onClick={handleSkip}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-50 flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md text-slate-400 hover:text-white hover:border-violet-500/40 text-xs font-semibold tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 group cursor-pointer"
        aria-label="Skip introduction"
      >
        <span>Skip Intro</span>
        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
      </motion.button>
    </motion.div>
  );
}
