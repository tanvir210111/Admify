import React from "react";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  Award,
  FileText,
  Wallet,
  MessageSquare,
} from "lucide-react";
const features = [
  {
    icon: Target,
    title: "AI Recommendation",
    desc: "Discover perfectly matched universities based on your academic profile, budget, and career goals.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    icon: TrendingUp,
    title: "Admission Probability",
    desc: "Get real-time insights into your chances of acceptance using historical data from thousands of applicants.",
    color: "from-primary-500 to-purple-500",
  },
  {
    icon: Award,
    title: "Scholarship Suggestions",
    desc: "Automatically match with eligible scholarships and financial aid programs globally.",
    color: "from-green-500 to-emerald-400",
  },
  {
    icon: FileText,
    title: "SOP & LOR Generator",
    desc: "Generate highly personalized, professional drafts for your statements and recommendations.",
    color: "from-orange-500 to-yellow-400",
  },
  {
    icon: Wallet,
    title: "Credit System",
    desc: "Flexible pay-as-you-go credits for application fees, premium reviews, and expedited processing.",
    color: "from-pink-500 to-rose-400",
  },
  {
    icon: MessageSquare,
    title: "AI Chatbot Assistant",
    desc: "24/7 instant answers to your visa, university, and process-related queries.",
    color: "from-indigo-500 to-blue-500",
  },
];
function Features() {
  return (
    <section id="features" className="py-24 md:py-36 relative z-10">
      {" "}
      <div className="container mx-auto px-6 relative">
        {" "}
        {/* Background glow */}{" "}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[500px] bg-primary-900/10 rounded-full blur-[150px] pointer-events-none" />{" "}
        <div className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full bg-primary-900/40 border border-primary-500/30 text-primary-300 mb-8 text-sm md:text-base font-bold tracking-widest uppercase"
          >
            {" "}
            Core Features{" "}
          </motion.div>{" "}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-tight"
          >
            {" "}
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              succeed
            </span>{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl lg:text-2xl font-light leading-relaxed"
          >
            {" "}
            Our comprehensive suite of AI tools simplifies every step of your
            study abroad journey, from research to landing on campus.{" "}
          </motion.p>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 relative z-10">
          {" "}
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative glass p-8 md:p-10 rounded-[2rem] bg-slate-900 border border-slate-700/50 hover:bg-slate-800/40 hover:border-slate-600 transition-all duration-300 shadow-lg"
            >
              {" "}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />{" "}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-[1px] mb-8 shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
              >
                {" "}
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                  {" "}
                  <feature.icon className="w-7 h-7 text-white" />{" "}
                </div>{" "}
              </div>{" "}
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-primary-300 transition-colors">
                {feature.title}
              </h3>{" "}
              <p className="text-slate-300 leading-relaxed font-light text-base md:text-lg">
                {" "}
                {feature.desc}{" "}
              </p>{" "}
            </motion.div>
          ))}{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
export default Features;
