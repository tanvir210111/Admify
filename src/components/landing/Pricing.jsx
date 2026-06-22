import React from "react";
import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
const plans = [
  {
    name: "Free",
    price: "$0",
    desc: "Perfect for exploring options",
    features: [
      "Basic University Search",
      "Admission Probability (3 attempts)",
      "Community Support",
      "1 Standard Application",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Standard",
    price: "$49",
    desc: "Everything you need to apply",
    features: [
      "Advanced AI Matching",
      "Unlimited Probability Checks",
      "SOP & LOR Generator",
      "5 Premium Applications",
      "Priority Support",
    ],
    cta: "Get Standard",
    popular: true,
  },
  {
    name: "Premium",
    price: "$149",
    desc: "End-to-end expert guidance",
    features: [
      "Everything in Standard",
      "Unlimited Premium Applications",
      "Visa Interview Prep AI",
      "1-on-1 Human Expert Review",
      "Scholarship Guarantee Program",
    ],
    cta: "Go Premium",
    popular: false,
  },
];
function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 relative z-10">
      {" "}
      <div className="container mx-auto px-4 sm:px-6">
        {" "}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-green-900/40 border border-green-500/30 text-green-400 mb-6 text-xs sm:text-sm font-semibold tracking-wide uppercase"
          >
            {" "}
            Flexible Pricing{" "}
          </motion.div>{" "}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight"
          >
            {" "}
            Invest in your <span className="text-primary-400">future</span>{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg md:text-xl font-light px-4"
          >
            {" "}
            Simple, transparent pricing designed for every stage of your study
            abroad journey.{" "}
          </motion.p>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto lg:items-stretch">
          {" "}
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`relative flex flex-col h-full rounded-[2rem] p-6 sm:p-8 md:p-10 transition-all duration-300 ${plan.popular ? "border-2 border-primary-500 shadow-[0_0_40px_rgba(124,58,237,0.2)] lg:-translate-y-4 bg-slate-900 backdrop-blur-2xl z-10" : "border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/40 bg-slate-900 hover:shadow-xl hover:shadow-black/20"}`}
            >
              {" "}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary-600 text-white font-bold text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-primary-500/40 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap">
                  {" "}
                  <Zap className="w-3.5 h-3.5 fill-current" /> Most Popular{" "}
                </div>
              )}{" "}
              <div className="mb-6 sm:mb-8 text-center lg:text-left pt-4 lg:pt-0">
                {" "}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>{" "}
                <p className="text-slate-400 text-sm font-light h-auto lg:h-10 mb-6">
                  {plan.desc}
                </p>{" "}
                <div className="flex items-baseline justify-center lg:justify-start gap-1">
                  {" "}
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {plan.price}
                  </span>{" "}
                  <span className="text-slate-500 font-medium">/mo</span>{" "}
                </div>{" "}
              </div>{" "}
              <div className="space-y-4 sm:space-y-5 mb-8 flex-1">
                {" "}
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {" "}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.popular ? "bg-primary-500/20 text-primary-400" : "bg-slate-800/40 text-slate-400"}`}
                    >
                      {" "}
                      <Check className="w-3 h-3" />{" "}
                    </div>{" "}
                    <span className="text-slate-300 text-sm leading-relaxed">
                      {feature}
                    </span>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              <div className="mt-auto pt-6">
                {" "}
                <button
                  className={`w-full py-3.5 sm:py-4 rounded-xl font-bold transition-all duration-300 ${plan.popular ? "bg-primary-600 text-white font-bold shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:-translate-y-1" : "glass border border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600 text-slate-200 hover:-translate-y-1"}`}
                >
                  {" "}
                  {plan.cta}{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default Pricing;
