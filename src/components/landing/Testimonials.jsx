import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, Award } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Jenkins",
    origin: "Dhaka, Bangladesh",
    dest: "New York, USA",
    flag: "🇺🇸",
    role: "M.S. Data Science • NYU",
    quote:
      "Admify's AI matching identified NYU's Data Science program when my previous advisor had said it was out of reach. The SOP generator helped me articulate my research ambitions with precision.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    award: "Admitted with Dean's Fellowship",
  },
  {
    name: "David Chen",
    origin: "Taipei, Taiwan",
    dest: "Oxford, UK",
    flag: "🇬🇧",
    role: "MSc Computer Science • Oxford",
    quote:
      "The admission probability engine gave me genuine confidence. Instead of applying blindly to 15 colleges, I focused on 4 high-probability matches and earned a 50% merit scholarship.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    award: "50% Merit Scholarship Recipient",
  },
  {
    name: "Priya Patel",
    origin: "Mumbai, India",
    dest: "Waterloo, Canada",
    flag: "🇨🇦",
    role: "B.S. Software Engineering • Waterloo",
    quote:
      "Tracking multiple university deadlines across different time zones was terrifying until I used Admify. The milestone checklists kept my visa and financial documents completely on schedule.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    award: "Fast-Track Visa Clearance",
  },
];

function Testimonials() {
  return (
    <section className="py-24 md:py-32 relative z-10 bg-[#07142D]/80 border-y border-slate-800/80 backdrop-blur-md">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-cyan-500/30 text-cyan-300 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Sample Student Journeys
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black mb-6 tracking-tight text-white leading-tight"
          >
            Loved by{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Students Worldwide
            </span>
          </motion.h2>

          <p className="text-slate-400 text-sm font-medium">
            Verified study abroad milestones achieved through AI matching and application support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, borderColor: "rgba(34, 211, 238, 0.4)" }}
              className="p-7 sm:p-8 rounded-3xl relative bg-[#0B1228] border border-slate-800/80 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  {/* Star Rating */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                    <span>{t.flag}</span>
                    <span>{t.dest}</span>
                  </span>
                </div>

                <Quote className="w-8 h-8 text-cyan-500/30 mb-3" />

                <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed font-normal">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-5 border-t border-slate-800/80">
                <div className="flex items-center gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
                    <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">{t.name}</h4>
                    <p className="text-cyan-400 text-xs font-medium">{t.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.award}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
