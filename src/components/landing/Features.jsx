import React from "react";
import { motion } from "framer-motion";
import {
  Globe2,
  GraduationCap,
  ChartNoAxesCombined,
  Award,
  FileText,
  Plane,
} from "lucide-react";

const features = [
  {
    icon: Globe2,
    title: "AI Country Recommendation",
    desc: "Match with ideal study destinations based on post-study work visa rights, budget, language requirements, and living costs.",
    color: "from-cyan-500 to-blue-500",
    badge: "Destination AI",
  },
  {
    icon: GraduationCap,
    title: "AI University Recommendation",
    desc: "Explore tailored university shortlists mapped precisely to your academic scores, career goals, and program specializations.",
    color: "from-blue-500 to-indigo-500",
    badge: "Smart Match",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Admission Probability Predictor",
    desc: "Predict your acceptance odds across dream, target, and safe universities using historical admission trends from thousands of students.",
    color: "from-purple-500 to-violet-500",
    badge: "Predictive Analytics",
  },
  {
    icon: Award,
    title: "Scholarship Matching Engine",
    desc: "Discover merit-based, need-based, and government scholarships that match your nationality, CGPA, and selected department.",
    color: "from-emerald-500 to-teal-400",
    badge: "Funding Finder",
  },
  {
    icon: FileText,
    title: "SOP & LOR Assistance",
    desc: "Generate university-specific Statement of Purpose drafts and structured recommendation letters tailored to committee rubrics.",
    color: "from-amber-500 to-orange-400",
    badge: "Document Prep",
  },
  {
    icon: Plane,
    title: "Profile Strength & Journey Tracking",
    desc: "Evaluate your comprehensive student readiness score and manage application milestones from shortlist to visa clearance.",
    color: "from-sky-500 to-cyan-400",
    badge: "End-to-End",
  },
];

function Features() {
  return (
    <section id="features" className="py-24 md:py-32 relative z-10 bg-[#050B1F]">
      <div className="container mx-auto px-6 relative">
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[400px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-cyan-400/30 text-cyan-300 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Core Capabilities
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black mb-6 tracking-tight leading-tight text-white"
          >
            Everything You Need for Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Global Study Journey
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            From finding the right destination to preparing your application, Admify brings your study-abroad journey into one platform.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6, borderColor: "rgba(34, 211, 238, 0.4)" }}
              className="group relative p-7 md:p-8 rounded-3xl bg-[#0B1228] border border-slate-800/80 transition-all duration-300 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header with Icon and Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} p-[1.5px] shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="w-full h-full rounded-[14px] bg-[#070e22] flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#070e22] border border-slate-800 text-[11px] font-bold text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-slate-400 leading-relaxed font-normal text-sm md:text-base">
                  {feature.desc}
                </p>
              </div>

              {/* Bottom Subtle Indicator */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-cyan-400 transition-colors font-semibold">
                <span>Explore Feature</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
