import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Zap, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Explorer",
    price: "$0",
    period: "Free forever",
    desc: "Essential exploration tools to begin your international study research.",
    features: [
      "Global University Database Search",
      "Basic AI Program Matching (5 searches)",
      "Tuition & Cost Comparison Tool",
      "Community Discussion Board Access",
      "1 Initial Document Checklist",
    ],
    cta: "Start Exploring Free",
    popular: false,
    link: "/register",
  },
  {
    name: "Scholar Pro",
    price: "$49",
    period: "One-time / cycle",
    desc: "Comprehensive AI tools and guidance to prepare competitive applications.",
    features: [
      "Unlimited AI Matching & Eligibility Scores",
      "Admission Probability Analytics Engine",
      "SOP & LOR AI Generator (5 draft runs)",
      "Scholarship Matching & Deadline Alerts",
      "Direct Application Tracking for 5 Universities",
      "24/7 AI Admissions Assistant",
    ],
    cta: "Get Scholar Pro",
    popular: true,
    link: "/register",
  },
  {
    name: "Global Concierge",
    price: "$149",
    period: "Full support cycle",
    desc: "End-to-end expert review combined with highest-tier AI processing.",
    features: [
      "Everything in Scholar Pro",
      "Unlimited University Applications Support",
      "Human Admissions Counselor SOP Review",
      "Visa Interview AI Simulator & Rubric Feedback",
      "Priority Scholarship Application Support",
      "Expedited Document Verification",
    ],
    cta: "Enroll in Concierge",
    popular: false,
    link: "/register",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 relative z-10 bg-[#050B1F]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-cyan-500/30 text-cyan-300 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Study Journey Plans
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black mb-5 tracking-tight text-white leading-tight"
          >
            Power Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Study Journey
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            Simple, transparent access to AI matching tools and application assistance.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative flex flex-col h-full rounded-3xl p-7 sm:p-8 transition-all duration-300 bg-[#0B1228] ${
                plan.popular
                  ? "border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.25)] lg:-translate-y-3 z-10"
                  : "border border-slate-800 hover:border-slate-700 shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-xs rounded-full shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Recommended
                </div>
              )}

              <div className="mb-6 pt-2">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-400 text-xs sm:text-sm font-normal min-h-[38px]">
                  {plan.desc}
                </p>

                <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-slate-800">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        plan.popular ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-slate-300 leading-relaxed font-normal">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to={plan.link} className="mt-auto">
                <button
                  className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
                    plan.popular
                      ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)]"
                      : "bg-[#070e22] border border-slate-700 hover:border-cyan-400/40 text-white hover:bg-slate-800/60"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
