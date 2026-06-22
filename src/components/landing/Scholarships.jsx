import React from "react";
import { motion } from "framer-motion";
import { Banknote, GraduationCap, ArrowRight } from "lucide-react";
const scholarships = [
  {
    title: "Global Excellence Award",
    provider: "Stanford University",
    coverage: "100%",
    type: "Merit-based",
  },
  {
    title: "Women in Tech Grant",
    provider: "Admify Partners",
    coverage: "$10,000",
    type: "Diversity",
  },
  {
    title: "Commonwealth Scholarship",
    provider: "UK Government",
    coverage: "Full Ride",
    type: "Need-based",
  },
];
function Scholarships() {
  return (
    <section className="py-24 md:py-36 relative z-10 bg-slate-900 ">
      {" "}
      <div className="container mx-auto px-6">
        {" "}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          {" "}
          <div className="lg:w-1/3 text-center lg:text-left">
            {" "}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
            >
              {" "}
              Fund your <br className="hidden lg:block" />
              <span className="text-primary-400">future</span>{" "}
            </motion.h2>{" "}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-lg md:text-xl font-light mb-10 leading-relaxed"
            >
              {" "}
              Don't let finances hold you back. Our AI scans millions of funding
              opportunities to find grants and scholarships you're eligible
              for.{" "}
            </motion.p>{" "}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white font-bold rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] flex items-center justify-center gap-2"
            >
              {" "}
              Find Scholarships <ArrowRight className="w-5 h-5" />{" "}
            </motion.button>{" "}
          </div>{" "}
          <div className="lg:w-2/3 grid gap-5 md:gap-6 w-full">
            {" "}
            {scholarships.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border border-slate-700/50 hover:border-primary-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group shadow-lg bg-slate-900 "
              >
                {" "}
                <div className="flex gap-5 md:gap-6 items-center">
                  {" "}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">
                    {" "}
                    <Banknote className="w-7 h-7 md:w-8 md:h-8 text-primary-400 group-hover:scale-110 transition-transform" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h3 className="font-bold text-white text-lg md:text-xl mb-1 group-hover:text-primary-300 transition-colors">
                      {s.title}
                    </h3>{" "}
                    <p className="text-slate-300 text-sm md:text-base flex items-center gap-2 font-light">
                      {" "}
                      <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />{" "}
                      {s.provider}{" "}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-700/50 pt-5 sm:pt-0">
                  {" "}
                  <span className="px-4 py-1.5 bg-slate-800/40 rounded-lg text-xs md:text-sm font-medium text-slate-300 border border-slate-600 ">
                    {" "}
                    {s.type}{" "}
                  </span>{" "}
                  <div className="text-right">
                    {" "}
                    <p className="text-xs md:text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">
                      Coverage
                    </p>{" "}
                    <p className="font-bold text-green-400 text-lg md:text-xl">
                      {s.coverage}
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default Scholarships;
