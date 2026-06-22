import React from "react";
import { motion } from "framer-motion";
const steps = [
  {
    step: "01",
    title: "Build Profile",
    desc: "Share your academic history and budget securely.",
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "Our engine analyzes 10M+ data points.",
  },
  {
    step: "03",
    title: "Generate Docs",
    desc: "Use AI to draft personalized statements & resumes.",
  },
  {
    step: "04",
    title: "Track Progress",
    desc: "Submit and track everything in one dashboard.",
  },
];
function HowItWorks() {
  return (
    <section className="py-24 md:py-36 relative z-10 bg-slate-900 border-y border-slate-700/50">
      {" "}
      <div className="container mx-auto px-6">
        {" "}
        <div className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          {" "}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-tight"
          >
            {" "}
            Your roadmap to <span className="text-blue-400">success</span>{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-300 text-lg md:text-xl lg:text-2xl font-light leading-relaxed"
          >
            {" "}
            A streamlined process designed to remove friction and significantly
            boost your admission chances.{" "}
          </motion.p>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative max-w-7xl mx-auto">
          {" "}
          {/* Connecting Line (Desktop only) */}{" "}
          <div className="hidden md:block absolute top-[45px] left-[10%] w-[80%] h-[2px] bg-gradient-to-r from-primary-500/0 via-primary-500/50 to-blue-500/0 z-0" />{" "}
          {steps.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="relative z-10 text-center group"
            >
              {" "}
              <div className="w-24 h-24 mx-auto bg-slate-900 rounded-3xl border-2 border-slate-700/50 flex items-center justify-center mb-8 relative shadow-lg group-hover:border-primary-500 transition-colors duration-300">
                {" "}
                <div className="absolute inset-0 bg-primary-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />{" "}
                <span className="text-3xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent group-hover:from-primary-300 group-hover:to-primary-500 transition-all">
                  {item.step}
                </span>{" "}
              </div>{" "}
              <h3 className="text-2xl font-bold text-white mb-4">
                {item.title}
              </h3>{" "}
              <p className="text-slate-300 text-base md:text-lg font-light leading-relaxed px-2">
                {item.desc}
              </p>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default HowItWorks;
