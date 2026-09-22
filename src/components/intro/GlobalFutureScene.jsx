import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CircularFlagBadges from "./CircularFlagBadges";

export default function GlobalFutureScene({ onEnter }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 h-screen h-[100dvh] w-screen flex flex-col justify-between overflow-hidden select-none bg-[#020614] z-[9999]"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif",
      }}
    >
      {/* ── 1. Cinematic Background: Earth Orbit Sunrise + Deep Space Shroud ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Photorealistic Earth Sunrise from Orbit */}
        <motion.img
          src="/earth_sunrise_horizon.jpg"
          alt="Earth Sunrise Horizon"
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1.0, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-full h-full object-cover object-[center_35%] sm:object-[center_30%]"
        />

        {/* Deep Space Dark Scrim: Keeps upper half deep dark so Logo, ADMIFY & Tagline have maximum contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#01040d]/95 via-[#01040d]/80 to-transparent h-[65%]" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#01040d]/40 to-[#01040d]/90" />

        {/* Soft Contrast Shroud directly behind upper hero text */}
        <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[22rem] bg-[#01040d]/85 rounded-full blur-[60px] pointer-events-none" />

        {/* Soft Bottom Atmosphere Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#01040d] via-[#01040d]/60 to-transparent" />
      </div>

      {/* ── 2. Top Bar ── */}
      <header className="relative z-20 w-full px-5 sm:px-8 pt-4 sm:pt-6 flex items-center justify-between">
        {/* Official Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#070b1a] border border-cyan-500/40 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] overflow-hidden">
            <img
              src="/logo-mark.png"
              alt="Admify Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Admify
          </span>
        </div>

        {/* Top-Right Elegance Tagline */}
        <motion.span
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
        >
          Your Dream Has No Borders
        </motion.span>
      </header>

      {/* ── 3. Center Hero: Official Logo, ADMIFY, Tagline, Headline, Flags, and CTA Button ── */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 my-auto">
        {/* Official Admify Glowing Logo Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-3 sm:mb-4 flex items-center justify-center"
        >
          {/* Intense Outer Neon Cyan/Blue/Violet Glow */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-600/60 via-cyan-500/50 to-indigo-600/60 blur-2xl opacity-95 animate-pulse" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#080e24] via-[#040714] to-slate-950 border border-cyan-400/40 p-2 sm:p-2.5 flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.6)] backdrop-blur-xl overflow-hidden">
            <img
              src="/logo-mark.png"
              alt="Admify Official Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            />
          </div>
        </motion.div>

        {/* Brand Title: ADMIFY */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl font-black tracking-[0.25em] text-white uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,1)] mb-1.5"
        >
          ADMIFY
        </motion.h2>

        {/* Ultra High-Contrast Tagline Pill: AI-POWERED GLOBAL STUDY GUIDANCE (100% crystal clear legibility against any background) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center px-4 sm:px-5 py-1 sm:py-1.5 rounded-full bg-slate-950/95 border border-cyan-400/50 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.95),0_0_12px_rgba(6,182,212,0.25)] mb-3 sm:mb-4"
        >
          <span className="text-[10px] sm:text-xs md:text-[13px] font-black tracking-[0.28em] uppercase text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            AI-Powered Global Study Guidance
          </span>
        </motion.div>

        {/* Main Headline: A Global Future Awaits You */}
        <motion.h1
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight leading-tight mb-1.5 sm:mb-2.5 drop-shadow-[0_4px_24px_rgba(0,0,0,1)]"
        >
          <span className="text-white">A Global Future </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400">
            Awaits You
          </span>
        </motion.h1>

        {/* Subtitle: Explore. Learn. Grow. Go Beyond. */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs sm:text-sm md:text-base font-medium tracking-wide text-slate-200/95 mb-4 sm:mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,1)]"
        >
          Explore. Learn. Grow. Go Beyond.
        </motion.p>

        {/* ── Floating Circular Flag Badges (Curved above Earth Horizon) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl px-2 mb-4 sm:mb-5"
        >
          <CircularFlagBadges size={34} className="sm:scale-110" />
        </motion.div>

        {/* ── Centered Enter / Get Started Button (Takes user to homepage) ── */}
        <motion.button
          onClick={onEnter}
          initial={{ opacity: 0, y: 15, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 32px rgba(6,182,212,0.7)" }}
          whileTap={{ scale: 0.96 }}
          className="group flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-bold text-xs sm:text-sm md:text-base tracking-wide shadow-[0_0_24px_rgba(6,182,212,0.45)] border border-white/30 cursor-pointer transition-all duration-300"
        >
          <span>Explore Your Journey</span>
          <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-1" />
        </motion.button>
      </main>

      {/* ── 4. Bottom Bar: Centered Global Education • Brighter Future ── */}
      <footer className="relative z-20 w-full px-5 sm:px-8 pb-4 sm:pb-6 pt-2 flex items-center justify-center">
        <span className="text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase text-slate-400/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          GLOBAL EDUCATION &nbsp;•&nbsp; BRIGHTER FUTURE
        </span>
      </footer>
    </motion.div>
  );
}
