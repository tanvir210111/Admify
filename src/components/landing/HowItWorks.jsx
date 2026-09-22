import React from "react";
import { motion } from "framer-motion";
import { UserCheck, Cpu, Compass, Route, Plane } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Build Profile",
    desc: "Share your academic history, test scores, target subjects, and study budget.",
    icon: UserCheck,
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "Our neural matching engine evaluates your admission odds across thousands of global programs.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Get Recommendations",
    desc: "Receive customized university tiers, eligible scholarships, and cost projections.",
    icon: Compass,
  },
  {
    step: "04",
    title: "Track Your Journey",
    desc: "Generate documents, submit applications, and monitor visa milestones in one place.",
    icon: Route,
  },
];

function HowItWorks() {
  return (
    <section className="py-24 md:py-32 relative z-10 bg-[#07142D]/80 border-y border-slate-800/80 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-blue-400/30 text-blue-300 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase"
          >
            <Plane className="w-3.5 h-3.5 text-blue-400" />
            Clear 4-Step Pathway
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black mb-6 tracking-tight leading-tight text-white"
          >
            How Admify Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            A connected, transparent process designed to eliminate guesswork and guide you from initial inquiry to campus arrival.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 relative max-w-7xl mx-auto">
          {/* Animated Connecting Flight Route Line (Desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[12%] w-[76%] h-[2px] z-0">
            <div className="w-full h-full border-t-2 border-dashed border-cyan-500/30" />
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            />
          </div>

          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="relative z-10 text-center group flex flex-col items-center"
            >
              {/* Node Badge with Step number */}
              <div className="w-24 h-24 rounded-3xl bg-[#0B1228] border-2 border-slate-700/80 flex flex-col items-center justify-center mb-6 relative shadow-xl group-hover:border-cyan-400/70 group-hover:shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all duration-300">
                <item.icon className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-xs font-black tracking-wider text-slate-400 group-hover:text-white transition-colors">
                  {item.step}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>

              <p className="text-slate-400 text-sm font-normal leading-relaxed max-w-xs">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
