import React from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "M.S. Data Science, NYU",
    quote:
      "Admify's AI perfectly matched me with NYU. The SOP generator helped me articulate my goals clearly.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    name: "David Chen",
    role: "MBA, Oxford",
    quote:
      "I thought Oxford was a long shot, but the probability predictor gave me confidence. I got accepted with a 50% scholarship!",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
  },
  {
    name: "Priya Patel",
    role: "B.S. Comp Sci, Waterloo",
    quote:
      "The dashboard made tracking 8 different applications incredibly easy. The chatbot answered all my visa questions instantly.",
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
];
function Testimonials() {
  return (
    <section className="py-24 md:py-36 relative z-10 bg-slate-900 ">
      {" "}
      <div className="container mx-auto px-6">
        {" "}
        <div className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full bg-orange-900/40 border border-orange-500/30 text-orange-300 mb-8 text-sm md:text-base font-bold tracking-widest uppercase"
          >
            {" "}
            Success Stories{" "}
          </motion.div>{" "}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight"
          >
            {" "}
            Loved by{" "}
            <span className="text-primary-400">students worldwide</span>{" "}
          </motion.h2>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {" "}
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="glass p-8 md:p-10 rounded-[2rem] relative bg-slate-900 border border-slate-700/50 hover:border-primary-500/40 hover:shadow-2xl hover:shadow-primary-500/10 hover:bg-slate-800/40 transition-all duration-300 group flex flex-col h-full"
            >
              {" "}
              <Quote className="absolute top-8 right-8 w-12 h-12 text-slate-300 group-hover:text-primary-900/40 transition-colors" />{" "}
              <div className="flex gap-1.5 mb-8 relative z-10">
                {" "}
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}{" "}
              </div>{" "}
              <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed font-light relative z-10 flex-1">
                {" "}
                "{t.quote}"{" "}
              </p>{" "}
              <div className="flex items-center gap-5 mt-auto pt-8 border-t border-slate-700/50 relative z-10">
                {" "}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-blue-500 p-[2px] shadow-lg shadow-primary-500/20">
                  {" "}
                  <div className="w-full h-full rounded-full bg-slate-900 p-1">
                    {" "}
                    <img
                      src={t.img}
                      alt={t.name}
                      className="w-full h-full rounded-full bg-slate-800/40"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <h4 className="text-white font-bold text-lg md:text-xl">
                    {t.name}
                  </h4>{" "}
                  <p className="text-primary-400 text-sm md:text-base font-medium">
                    {t.role}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default Testimonials;
