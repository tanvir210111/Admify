import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Award, BookOpen, GraduationCap } from "lucide-react";

const universities = [
  {
    name: "Stanford University",
    country: "United States",
    flag: "🇺🇸",
    loc: "Stanford, California",
    rank: "#2 Global",
    img: "/stanford-university.png",
    fee: "$58,000 / yr",
    program: "M.S. Computer Science • AI",
    scholarship: "Merit Fellowships Available",
    match: "94% AI Match",
  },
  {
    name: "University of Oxford",
    country: "United Kingdom",
    flag: "🇬🇧",
    loc: "Oxford, England",
    rank: "#1 Global",
    img: "/university-of-oxford.webp",
    fee: "£36,500 / yr",
    program: "MSc Advanced Computer Science",
    scholarship: "Clarendon Fund Eligible",
    match: "91% AI Match",
  },
  {
    name: "University of Toronto",
    country: "Canada",
    flag: "🇨🇦",
    loc: "Toronto, Ontario",
    rank: "#21 Global",
    img: "/university-of-toronto.jpg",
    fee: "$48,000 CAD / yr",
    program: "Master of Science in Applied Computing",
    scholarship: "Dean's Merit Scholarship",
    match: "95% AI Match",
  },
  {
    name: "ETH Zürich",
    country: "Switzerland",
    flag: "🇨🇭",
    loc: "Zürich, Switzerland",
    rank: "#7 Global",
    img: "/eth-zurich.jpg",
    fee: "CHF 1,460 / yr",
    program: "Master in Computer Science",
    scholarship: "Excellence Scholarship (ESOP)",
    match: "89% AI Match",
  },
];

function Universities() {
  return (
    <section id="universities" className="py-24 md:py-32 relative z-10 bg-[#050B1F]">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B1228] border border-cyan-500/30 text-cyan-300 mb-4 text-xs font-bold tracking-widest uppercase">
              <GraduationCap className="w-3.5 h-3.5" />
              Institutions Network
            </div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight text-white leading-tight"
            >
              Discover Universities{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Around the World
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-base md:text-lg font-normal leading-relaxed"
            >
              Explore programs, compare universities, understand costs, and find options that match your goals.
            </motion.p>
          </div>

          <Link to="/university-search">
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="px-6 py-3.5 rounded-xl bg-[#0B1228] border border-slate-700 hover:border-cyan-400/50 text-white font-semibold transition-all flex items-center gap-2 group whitespace-nowrap shadow-lg cursor-pointer"
            >
              <span>Explore All Universities</span>
              <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
          {universities.map((uni, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, borderColor: "rgba(34, 211, 238, 0.4)" }}
              className="rounded-3xl overflow-hidden group cursor-pointer border border-slate-800/80 bg-[#0B1228] shadow-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* University Image with Rank & AI Match badge */}
                <div className="h-52 relative overflow-hidden bg-[#070e22]">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1228] via-transparent to-transparent z-10" />
                  <img
                    src={uni.img}
                    alt={uni.name}
                    className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${
                      uni.name === "Stanford University"
                        ? "object-contain bg-white/95 p-6"
                        : "object-cover"
                    }`}
                  />
                  {/* AI Match Badge */}
                  <div className="absolute top-3.5 left-3.5 z-20 px-3 py-1 bg-[#050B1F]/90 backdrop-blur-md text-cyan-300 text-[11px] font-bold rounded-full border border-cyan-400/40 shadow-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {uni.match}
                  </div>
                  {/* Rank Badge */}
                  <div className="absolute top-3.5 right-3.5 z-20 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-full text-[11px] font-bold text-white border border-slate-700">
                    {uni.rank}
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
                    <span>{uni.flag}</span>
                    <span>{uni.country}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {uni.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{uni.loc}</span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="line-clamp-1">{uni.program}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{uni.scholarship}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer with Tuition & Action */}
              <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    Est. Tuition
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {uni.fee}
                  </span>
                </div>

                <Link to="/university-search">
                  <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
                    View <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Universities;
