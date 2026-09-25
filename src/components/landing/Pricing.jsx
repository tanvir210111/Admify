import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Zap, Sparkles, Coins, ArrowRight } from "lucide-react";
import { CREDIT_PACKAGES, formatBDT } from "../../utils/creditConstants";

const packages = [
  {
    name: CREDIT_PACKAGES.FREE_STARTER.name,
    credits: "20 CR",
    price: "৳0",
    period: "Free Welcome Credits (1 mo)",
    desc: "Every newly registered student receives 20 Welcome Credits (৳2,000 value).",
    features: [
      "1x $0 University Direct Application (20 CR)",
      "Or 2x AI SOP Generations (10 CR ea)",
      "Or 4x Admission Probability Analyses",
      "Global University Database Browsing",
      "Document Check & Cost Estimator"
    ],
    cta: "Claim 20 Free Credits",
    popular: false,
    link: "/register",
  },
  {
    name: CREDIT_PACKAGES.STANDARD.name,
    credits: "500 CR",
    price: formatBDT(CREDIT_PACKAGES.STANDARD.priceBDT),
    period: "Non-expiring Paid Credits",
    desc: "Our most balanced package for complete university application preparation.",
    features: [
      "500 Non-Expiring Paid Credits",
      "Direct Applications (20-40 CR ea)",
      "Full AI SOP & LOR Generators + Rewrites",
      "Comprehensive Document & Probability Reviews",
      "Priority Verification Processing"
    ],
    cta: "Get Standard Credits",
    popular: true,
    link: "/student/credits",
  },
  {
    name: CREDIT_PACKAGES.ULTIMATE.name,
    credits: "2,000 CR",
    price: formatBDT(CREDIT_PACKAGES.ULTIMATE.priceBDT),
    period: "Non-expiring Paid Credits",
    desc: "Complete coverage for Full Agency Managed Service (1,500 CR) & application processing.",
    features: [
      "2,000 Non-Expiring Paid Credits",
      "Eligible for Full Agency Managed Service (1,500 CR)",
      "Dedicated Human Agency Counselor",
      "End-to-End Application Coordination",
      "500 Reserve Credits for All Applications & Tools"
    ],
    cta: "Get Ultimate Credits",
    popular: false,
    link: "/student/credits",
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-purple-500/30 text-purple-300 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase"
          >
            <Coins className="w-3.5 h-3.5 text-purple-400" />
            100% Credit-Based • 1 CR = ৳100 BDT • No Subscriptions
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black mb-5 tracking-tight text-white leading-tight"
          >
            Transparent{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Credit Packages
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            No recurring subscriptions or hidden fees. Use Credits for applications, AI tools, and dedicated agency services.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {packages.map((pkg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className={`relative flex flex-col h-full rounded-3xl p-7 sm:p-8 transition-all duration-300 bg-[#0B1228] ${
                pkg.popular
                  ? "border-2 border-purple-500 shadow-[0_0_35px_rgba(168,85,247,0.25)] lg:-translate-y-3 z-10"
                  : "border border-slate-800 hover:border-slate-700 shadow-xl"
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs rounded-full shadow-lg shadow-purple-900/30 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Most Popular
                </div>
              )}

              <div className="mb-6 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white mb-1">{pkg.name}</h3>
                  <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {pkg.credits}
                  </span>
                </div>
                <p className="text-slate-400 text-xs sm:text-sm font-normal min-h-[38px] mt-1">
                  {pkg.desc}
                </p>

                <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-slate-800">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {pkg.price}
                  </span>
                  <span className="text-slate-400 text-xs font-medium">{pkg.period}</span>
                </div>
              </div>

              <div className="space-y-3.5 mb-8 flex-1">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        pkg.popular ? "bg-purple-500/20 text-purple-300" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-slate-300 leading-relaxed font-normal">{feature}</span>
                  </div>
                ))}
              </div>

              <Link to={pkg.link} className="mt-auto">
                <button
                  className={`w-full py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
                    pkg.popular
                      ? "bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                      : "bg-[#070e22] border border-slate-700 hover:border-purple-400/40 text-white hover:bg-slate-800/60"
                  }`}
                >
                  {pkg.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all 5 packages & detailed service credit costs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Pricing;
