import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What is Admify and how does it help international students?",
    a: "Admify is an AI-powered global study guidance platform. We help students evaluate international destinations, discover best-fit universities based on academic profile and budget, match with scholarships, generate personalized application documents, and track admissions all in one unified portal.",
  },
  {
    q: "How does the AI recommendation engine match universities?",
    a: "Our neural matching model analyzes your GPA, standardized test scores (IELTS, TOEFL, GRE, GMAT), desired field of study, tuition budget, and post-study work preferences against thousands of university entry requirements and historical acceptance patterns.",
  },
  {
    q: "How does scholarship matching work?",
    a: "Admify's database continuously indexes university merit grants, government fellowships, and private diversity scholarships. Our engine evaluates your academic metrics, degree level, and home country eligibility to highlight funded programs you can realistically qualify for.",
  },
  {
    q: "How does the SOP & LOR assistant work?",
    a: "The document assistant uses tailored language models trained on successful admissions statements. It guides you through outlining your research intent, academic achievements, and career roadmap, generating structured, plagiarism-free drafts ready for committee review.",
  },
  {
    q: "Can I compare university tuition and living costs?",
    a: "Yes. Every university profile includes comprehensive breakdowns of tuition fees, estimated living expenses, health insurance, and regional living costs converted into your preferred currency.",
  },
  {
    q: "How does the credit system work?",
    a: "Credits allow flexible access to on-demand AI tools such as advanced probability recalculations, document revisions, and expedited application checks. You can top up credits anytime through your student wallet without recurring subscription pressure.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 md:py-32 relative z-10 bg-[#07142D]/80 border-t border-slate-800/80 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1228] border border-cyan-500/30 text-cyan-300 mb-4 text-xs font-bold tracking-widest uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            Clear Answers
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight text-white leading-tight"
          >
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Questions
            </span>
          </motion.h2>

          <p className="text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            Everything you need to know about our AI guidance, matching algorithms, and application process.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                openIndex === i
                  ? "border-cyan-500/50 bg-[#0B1228] shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                  : "border-slate-800 bg-[#0B1228]/80 hover:border-slate-700"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full px-6 py-5 flex justify-between items-center text-left cursor-pointer"
              >
                <span
                  className={`font-bold text-base sm:text-lg transition-colors pr-4 ${
                    openIndex === i ? "text-cyan-300" : "text-white"
                  }`}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180 text-cyan-400" : "text-slate-400"
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-5 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed font-normal border-t border-slate-800/80 mt-1">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
