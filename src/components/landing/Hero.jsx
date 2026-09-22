import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Globe2,
  GraduationCap,
  Building2,
  CheckCircle2,
  Plane,
  Compass,
} from "lucide-react";
import AnimatedCounter from "../ui/AnimatedCounter";

function Hero() {
  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden z-10">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* ── Left Column: Headline, Value Proposition, CTAs, and Stats ── */}
            <div className="flex-1 text-center lg:text-left">
              {/* Badge: AI-POWERED GLOBAL STUDY GUIDANCE */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#0B1228]/90 border border-cyan-400/35 shadow-[0_0_20px_rgba(6,182,212,0.18)] mb-6 text-xs sm:text-sm font-bold backdrop-blur-md"
              >
                <span className="flex relative h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                </span>
                <span className="tracking-[0.2em] uppercase text-cyan-300 text-[11px] sm:text-xs">
                  AI-Powered Global Study Guidance
                </span>
              </motion.div>

              {/* Main Headline: Your Global Education Journey Starts Here. */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.12] mb-6 text-white"
              >
                <span>Your Global Education </span>
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent block sm:inline">
                  Journey Starts Here.
                </span>
              </motion.h1>

              {/* Supporting Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mb-8 mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Discover the right country, university, scholarship, and admission path with AI-powered guidance built around your profile.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-5"
              >
                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-bold text-base md:text-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all cursor-pointer">
                    <span>Get AI Recommendations</span>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                </Link>
                <Link to="/university-search" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-[#0B1228]/80 border border-slate-700/70 hover:border-cyan-400/40 text-white hover:bg-slate-800/60 font-semibold text-base md:text-lg transition-all hover:-translate-y-0.5 cursor-pointer backdrop-blur-md">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    <span>Explore Universities</span>
                  </button>
                </Link>
              </motion.div>

              {/* Supporting Micro-Line */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="text-xs sm:text-sm font-semibold tracking-wider text-slate-400/90 flex items-center justify-center lg:justify-start gap-2 mb-10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                <span>Profile-based</span>
                <span className="text-slate-600">•</span>
                <span>AI-powered</span>
                <span className="text-slate-600">•</span>
                <span>Global</span>
              </motion.p>

              {/* Statistics Counter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.4 }}
                className="pt-8 border-t border-slate-800/80 flex flex-wrap gap-6 sm:gap-10 md:gap-12 justify-center lg:justify-start"
              >
                <div className="flex items-center gap-3.5 group cursor-default">
                  <div className="p-3 bg-[#0B1228] rounded-xl border border-cyan-500/25 group-hover:border-cyan-400/60 transition-colors shadow-lg">
                    <GraduationCap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                      <AnimatedCounter to={50} suffix="K+" />
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Students Guided</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 group cursor-default">
                  <div className="p-3 bg-[#0B1228] rounded-xl border border-blue-500/25 group-hover:border-blue-400/60 transition-colors shadow-lg">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                      <AnimatedCounter to={10} suffix="K+" />
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Universities Cataloged</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 group cursor-default">
                  <div className="p-3 bg-[#0B1228] rounded-xl border border-purple-500/25 group-hover:border-purple-400/60 transition-colors shadow-lg">
                    <Globe2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                      <AnimatedCounter to={45} suffix="+" />
                    </h4>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">Study Destinations</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Right Column: Authentic Admify AI Study Match Preview ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 w-full max-w-lg relative mt-6 lg:mt-0"
            >
              {/* Radial Glow behind Card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-purple-600/20 blur-3xl rounded-3xl opacity-75 pointer-events-none" />

              {/* Card Container */}
              <div className="relative rounded-3xl p-6 sm:p-7 bg-[#0B1228]/95 border border-cyan-500/30 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
                {/* Header: AI Study Match & Live Pulse */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center p-0.5 shadow-md shadow-cyan-500/30">
                      <div className="w-full h-full rounded-[10px] bg-[#070b1a] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-black text-base tracking-wide uppercase">AI Study Match</h3>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-bold text-cyan-300">
                          LIVE
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span>Analyzing student profile...</span>
                      </p>
                    </div>
                  </div>

                  {/* Top Match Rate */}
                  <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-sm tracking-wide shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    92% Match
                  </div>
                </div>

                {/* Profile Data Snapshot Chips */}
                <div className="mb-5">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold">
                    <span className="uppercase tracking-wider">Candidate Profile</span>
                    <span className="text-[11px] text-cyan-400 font-medium">Verified Parameters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Target Field</span>
                      <span className="text-white font-bold">Comp Science</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">CGPA Score</span>
                      <span className="text-cyan-300 font-bold">3.42 / 4.0</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">IELTS Band</span>
                      <span className="text-white font-bold">7.0 Overall</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#070e22] border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">Max Budget</span>
                      <span className="text-emerald-400 font-bold">$25,000 / yr</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Destinations */}
                <div className="mb-5 p-4 rounded-2xl bg-[#070e22] border border-cyan-500/20">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                    Recommended Destinations & Programs
                  </span>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇬🇧</span>
                        <div>
                          <p className="text-white font-bold">United Kingdom</p>
                          <p className="text-[10px] text-slate-400">University of Manchester • MSc AI</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold">94% Fit</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇩🇪</span>
                        <div>
                          <p className="text-white font-bold">Germany</p>
                          <p className="text-[10px] text-slate-400">TU Munich • Informatics (Tuition-free)</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold">91% Fit</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🇨🇦</span>
                        <div>
                          <p className="text-white font-bold">Canada</p>
                          <p className="text-[10px] text-slate-400">University of Waterloo • Co-op CS</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold">89% Fit</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA inside Preview */}
                <Link to="/register" className="block">
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Plane className="w-4 h-4" />
                    <span>Generate Personalized Admission Roadmap</span>
                  </button>
                </Link>

                <p className="text-center text-[10px] text-slate-500 mt-3 font-medium">
                  Sample Live Profile Analysis • Powered by Admify Engine
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust / University Discovery Strip ── */}
      <section className="py-10 border-y border-slate-800/70 bg-[#07142D]/70 relative z-10 backdrop-blur-md">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs font-extrabold text-cyan-400/90 mb-8 uppercase tracking-[0.25em]">
            Explore Universities Around the World
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 md:gap-20 text-slate-300">
            <div className="flex items-center gap-2.5 font-serif font-bold text-lg sm:text-xl tracking-wide opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-default">
              <span className="text-sm">🇺🇸</span> Stanford University
            </div>
            <div className="flex items-center gap-2.5 font-serif font-bold text-lg sm:text-xl tracking-wide opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-default">
              <span className="text-sm">🇬🇧</span> University of Oxford
            </div>
            <div className="flex items-center gap-2.5 font-sans font-bold text-lg sm:text-xl tracking-wide opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-default">
              <span className="text-sm">🇨🇭</span> ETH Zürich
            </div>
            <div className="flex items-center gap-2.5 font-sans font-bold text-lg sm:text-xl tracking-wide opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-default">
              <span className="text-sm">🇨🇦</span> University of Toronto
            </div>
            <div className="flex items-center gap-2.5 font-sans font-black text-lg sm:text-xl tracking-tight opacity-80 hover:opacity-100 hover:text-white transition-opacity cursor-default">
              <span className="text-sm">🇺🇸</span> MIT
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
