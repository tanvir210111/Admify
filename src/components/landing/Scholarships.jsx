import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Award, GraduationCap, ArrowRight, Sparkles, Calendar, CheckCircle2 } from "lucide-react";

const scholarships = [
  {
    title: "Global Excellence Graduate Award",
    provider: "Stanford University • USA",
    flag: "🇺🇸",
    coverage: "100% Tuition + Stipend",
    type: "Merit-Based",
    deadline: "Dec 15, 2026",
    eligibility: "CGPA 3.8+ or Equivalent",
  },
  {
    title: "Clarendon Fund Global Scholarship",
    provider: "University of Oxford • UK",
    flag: "🇬🇧",
    coverage: "Full Ride + Living Expenses",
    type: "Academic Merit",
    deadline: "Jan 10, 2027",
    eligibility: "Outstanding Academic Merit",
  },
  {
    title: "International STEM Leadership Fellowship",
    provider: "Admify Global Fund",
    flag: "🌍",
    coverage: "$15,000 / yr",
    type: "Diversity & STEM",
    deadline: "Rolling Intake",
    eligibility: "STEM Major Admits",
  },
];

function Scholarships() {
  return (
    <section className="py-24 md:py-32 relative z-10 bg-[#07142D]/80 border-y border-slate-800/80 backdrop-blur-md">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="lg:w-5/12 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1228] border border-emerald-400/30 text-emerald-300 mb-4 text-xs font-bold tracking-widest uppercase">
              <Award className="w-3.5 h-3.5" />
              Financial Support & Grants
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 tracking-tight text-white leading-tight"
            >
              Fund Your{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Global Education
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-base sm:text-lg font-normal mb-8 leading-relaxed"
            >
              Find scholarship opportunities based on your academic profile and study goals. Our AI matches your CGPA, nationality, and target department against hundreds of active funds.
            </motion.p>

            {/* AI Feature Callout Box */}
            <div className="p-5 rounded-2xl bg-[#0B1228] border border-emerald-500/25 mb-8 text-left shadow-lg">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Scholarship Matching</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Automatically scans eligible awards, deadline calendars, and application requirements tailored specifically to your student profile.
              </p>
            </div>

            <Link to="/student/scholarships">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white font-bold rounded-xl text-base shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Explore Scholarships</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </div>

          {/* Right Column: Scholarship Cards */}
          <div className="lg:w-7/12 grid gap-4 sm:gap-5 w-full">
            {scholarships.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 sm:p-7 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 border border-slate-800 bg-[#0B1228] hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-xl">{s.flag}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#070e22] text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        {s.type}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {s.deadline}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base sm:text-lg mb-1 group-hover:text-emerald-300 transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1.5 font-normal">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{s.provider}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Funding Amount
                  </span>
                  <span className="font-extrabold text-emerald-400 text-base sm:text-lg whitespace-nowrap">
                    {s.coverage}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scholarships;
