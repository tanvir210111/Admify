import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Compass, Globe2 } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-32 relative z-10 overflow-hidden bg-[#050B1F] border-t border-slate-800/80">
      {/* Background Horizon Glow & Earth Curvature Silhouette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80rem] h-[22rem] bg-gradient-to-t from-cyan-500/10 via-blue-600/5 to-transparent rounded-t-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[16rem] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-cyan-400/35 text-cyan-300 mb-6 text-xs font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Your Dream Has No Borders</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-white leading-tight"
        >
          Your Global Future{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400 bg-clip-text text-transparent">
            Starts Here.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Explore your options, find your best-fit universities, and build your path to studying abroad with AI-driven clarity.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-bold text-base md:text-lg shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all cursor-pointer">
              <span>Get AI Recommendations</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>

          <Link to="/university-search" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#0B1228] border border-slate-700/80 hover:border-cyan-400/40 text-white hover:bg-slate-800/60 font-semibold text-base md:text-lg transition-all hover:-translate-y-0.5 cursor-pointer backdrop-blur-md">
              <Compass className="w-5 h-5 text-cyan-400" />
              <span>Explore Universities</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
