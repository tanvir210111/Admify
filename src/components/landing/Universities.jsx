import React from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
const universities = [
  {
    name: "Stanford University",
    loc: "California, USA",
    rank: "#2 Global",
    img: "https://picsum.photos/seed/stanford/600/400",
    fee: "$55,000/yr",
    match: "High",
  },
  {
    name: "University of Oxford",
    loc: "Oxford, UK",
    rank: "#1 Global",
    img: "https://picsum.photos/seed/oxford/600/400",
    fee: "£35,000/yr",
    match: "High",
  },
  {
    name: "University of Toronto",
    loc: "Ontario, Canada",
    rank: "#21 Global",
    img: "https://picsum.photos/seed/toronto/600/400",
    fee: "$45,000/yr",
    match: "Medium",
  },
  {
    name: "ETH Zurich",
    loc: "Zurich, Switzerland",
    rank: "#7 Global",
    img: "https://picsum.photos/seed/zurich/600/400",
    fee: "CHF 1,500/yr",
    match: "High",
  },
];
function Universities() {
  return (
    <section
      id="universities"
      className="py-24 md:py-36 relative z-10 bg-slate-950"
    >
      {" "}
      <div className="container mx-auto px-6 relative z-10">
        {" "}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          {" "}
          <div className="max-w-3xl">
            {" "}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
            >
              {" "}
              Partner{" "}
              <span className="text-primary-400">Universities</span>{" "}
            </motion.h2>{" "}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 text-lg md:text-xl font-light leading-relaxed"
            >
              {" "}
              Explore top-ranked institutions across the globe and find your
              perfect fit with our predictive AI matching algorithm.{" "}
            </motion.p>{" "}
          </div>{" "}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="px-6 py-4 glass border border-slate-600 hover:bg-slate-800/40 text-white rounded-xl font-bold transition-all flex items-center gap-2 group whitespace-nowrap"
          >
            {" "}
            View All Destinations{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />{" "}
          </motion.button>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {" "}
          {universities.map((uni, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="glass rounded-3xl overflow-hidden group cursor-pointer border border-slate-700/50 hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.25)] transition-all duration-300 bg-slate-900 "
            >
              {" "}
              <div className="h-56 relative overflow-hidden">
                {" "}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent z-10" />{" "}
                <img
                  src={uni.img}
                  alt={uni.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />{" "}
                {/* AI Label */}{" "}
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-primary-600 text-white font-bold border border-primary-400/50 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  {" "}
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{" "}
                  AI Matched{" "}
                </div>{" "}
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-slate-900 backdrop-blur rounded-full text-xs font-bold text-white border border-slate-600 shadow-xl">
                  {" "}
                  {uni.rank}{" "}
                </div>{" "}
              </div>{" "}
              <div className="p-6 md:p-8">
                {" "}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-primary-300 transition-colors">
                  {uni.name}
                </h3>{" "}
                <div className="flex items-center gap-2 text-slate-300 text-sm md:text-base mb-6 font-light">
                  {" "}
                  <MapPin className="w-4 h-4 text-primary-400" /> {uni.loc}{" "}
                </div>{" "}
                <div className="flex justify-between items-center pt-5 border-t border-slate-700/50">
                  {" "}
                  <div>
                    {" "}
                    <span className="block text-[11px] md:text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">
                      Est. Tuition
                    </span>{" "}
                    <span className="font-bold text-white text-sm md:text-base">
                      {uni.fee}
                    </span>{" "}
                  </div>{" "}
                  <div className="text-right">
                    {" "}
                    <span className="block text-[11px] md:text-xs text-slate-400 mb-1 uppercase tracking-wider font-bold">
                      Match Rate
                    </span>{" "}
                    <span
                      className={`font-bold text-sm md:text-base ${uni.match === "High" ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {uni.match}
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default Universities;
