import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
const faqs = [
  {
    q: "How accurate is the AI admission probability?",
    a: "Our AI models are trained on millions of successful and unsuccessful applications across 10,000+ universities. While no system can guarantee admission, our predictions are consistently 92% accurate in estimating your chances.",
  },
  {
    q: "How does the SOP generator work?",
    a: "The generator uses advanced NLP to analyze your profile, achievements, and the specific program you're applying to. It then drafts a highly personalized, plagiarism-free Statement of Purpose that you can edit and refine.",
  },
  {
    q: "Are the application fees included in the plans?",
    a: "Standard application processing through our partner agents is included. However, direct university application fees (charged by the institutions themselves) are separate and can be paid using your Admify Wallet credits.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Yes! You can upgrade your plan at any time. If you upgrade mid-billing cycle, we'll prorate the cost.",
  },
];
function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <section className="py-24 md:py-36 relative z-10">
      {" "}
      <div className="container mx-auto px-6">
        {" "}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-24">
          {" "}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
          >
            {" "}
            Frequently asked{" "}
            <span className="text-primary-400">questions</span>{" "}
          </motion.h2>{" "}
        </div>{" "}
        <div className="max-w-3xl mx-auto space-y-5">
          {" "}
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`glass rounded-2xl overflow-hidden border transition-all duration-300 ${openIndex === i ? "border-primary-500/50 bg-slate-800/40" : "border-slate-700/50 bg-slate-900 hover:bg-slate-800/40"}`}
            >
              {" "}
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-6 md:px-8 py-5 md:py-6 flex justify-between items-center text-left"
              >
                {" "}
                <span
                  className={`font-bold text-lg md:text-xl transition-colors ${openIndex === i ? "text-white" : "text-slate-200"}`}
                >
                  {faq.q}
                </span>{" "}
                <ChevronDown
                  className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${openIndex === i ? "rotate-180 text-primary-400" : "text-slate-400"}`}
                />{" "}
              </button>{" "}
              <AnimatePresence>
                {" "}
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {" "}
                    <div className="px-6 md:px-8 pb-6 pt-2 text-slate-300 text-base md:text-lg leading-relaxed font-light border-t border-slate-700/50 mt-2">
                      {" "}
                      {faq.a}{" "}
                    </div>{" "}
                  </motion.div>
                )}{" "}
              </AnimatePresence>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default FAQ;
