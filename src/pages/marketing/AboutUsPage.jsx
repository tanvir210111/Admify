import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Target, Compass, Eye, ShieldAlert, Award, Star, Quote } from "lucide-react";

function AboutUsPage() {
  const team = [
    {
      name: "Dr. Aris Thorne",
      role: "CEO & Co-Founder",
      background: "MIT Alum, Former EdTech Director",
      bio: "Aris is passionate about removing geographic barriers to top-tier university lectures. He coordinates partner university relationships.",
      imageBg: "from-blue-600/30 to-indigo-600/30"
    },
    {
      name: "Sarah Lin",
      role: "Chief AI Architect",
      background: "Former DeepMind Researcher, Ph.D. Stanford",
      bio: "Sarah built Admify's core profiling matching neural framework. She leads our study-abroad ML engineering group.",
      imageBg: "from-purple-600/30 to-pink-600/30"
    },
    {
      name: "Prof. Robert Chen",
      role: "Advisory Council",
      background: "Former Ivy League Admissions Dean",
      bio: "Robert advises on admission expectations, transcript evaluations, and historical visa clearance rates to audit our models.",
      imageBg: "from-amber-600/30 to-orange-600/30"
    }
  ];

  const statistics = [
    { num: "50,000+", label: "Students Guided", desc: "Successfully admitted globally" },
    { num: "$12M+", label: "Scholarships Won", desc: "Relieving financial burdens" },
    { num: "400+", label: "University Partners", desc: "Integrated application systems" },
    { num: "99.2%", label: "Visa Success Rate", desc: "Unmatched checklist precision" }
  ];

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
          >
            <Compass className="w-4 h-4 animate-pulse" />
            Our Vision & Journey
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
            Democratizing <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Global Education</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
            We are a group of educators, researchers, and software engineers dedicated to making study abroad predictable, modern, and accessible to everyone, everywhere.
          </p>
        </div>

        {/* Mission, Vision & Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-28 max-w-6xl mx-auto">
          {[
            { 
              title: "Our Mission", 
              desc: "To break down administrative and geographical barriers, allowing qualified students to matching seamlessly with international higher education institutions.", 
              icon: Target, 
              color: "text-primary-400 bg-primary-500/10 border-primary-550/20" 
            },
            { 
              title: "Our Vision", 
              desc: "A borderless educational landscape where admissions are powered by intelligence and clarity rather than complicated agency hierarchies.", 
              icon: Eye, 
              color: "text-blue-400 bg-blue-500/10 border-blue-550/20" 
            },
            { 
              title: "Platform Goals", 
              desc: "To automate scholarship acquisition, streamline SOP reviews, and optimize university pathways to guarantee student visa approvals.", 
              icon: Award, 
              color: "text-amber-400 bg-amber-500/10 border-amber-550/20" 
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.15 }}
                className="glass p-8 rounded-3xl border border-slate-700/60 flex flex-col items-start shadow-xl h-72 justify-between"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-extrabold text-xl mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Global Impact Statistics Block */}
        <div className="glass rounded-3xl p-10 border border-slate-700/60 mb-28 max-w-6xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/5 rounded-full blur-2xl" />
          
          <div className="text-center mb-12">
            <h2 className="text-white font-extrabold text-2xl md:text-3xl">Admify Global Footprint</h2>
            <p className="text-slate-400 text-sm font-light mt-2">Delivering real quantitative results for applicants since inception.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 text-center">
            {statistics.map((s, idx) => (
              <div key={idx} className={`pt-6 lg:pt-0 ${idx > 0 ? "lg:px-4" : ""}`}>
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent mb-1">
                  {s.num}
                </p>
                <p className="text-white font-bold text-sm">{s.label}</p>
                <p className="text-slate-500 text-xs font-light mt-1.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team Section */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-white font-extrabold text-3xl text-center mb-4">Our Leadership Team</h2>
          <p className="text-slate-400 text-sm font-light text-center mb-16 max-w-xl mx-auto">
            Supported by top engineering directors and former ivy league advisors committed to study abroad excellence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div 
                key={idx}
                className="glass rounded-3xl p-6.5 border border-slate-700/60 hover:border-slate-500/80 transition-all flex flex-col justify-between h-96 shadow-xl relative overflow-hidden group"
              >
                <div className="space-y-6">
                  {/* Fictional Premium Profile Image placeholder */}
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${member.imageBg} border border-slate-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all`}>
                    <span className="text-white font-black text-2xl">
                      {member.name.split(" ").pop().charAt(0)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-white font-extrabold text-lg leading-snug group-hover:text-primary-450 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-primary-400 text-xs font-bold uppercase tracking-wider mt-1">{member.role}</p>
                    <p className="text-slate-500 text-[10px] font-bold mt-0.5">{member.background}</p>
                  </div>

                  <p className="text-slate-350 text-xs font-light leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                <div className="border-t border-slate-850 pt-4 flex gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span>Admissions Lab</span>
                  <span>•</span>
                  <span>Direct Advisor</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Founding Philosophy quote */}
        <div className="max-w-3xl mx-auto text-center mt-28 glass p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative">
          <Quote className="w-10 h-10 text-primary-500/20 absolute -top-5 left-1/2 -translate-x-1/2 bg-slate-950 px-2" />
          <p className="text-slate-300 font-light italic leading-relaxed text-base md:text-lg mb-4">
            "Education shouldn't belong to those who can afford expensive migration brokers. We believe in providing every capable mind the scientific resources to navigate their global academic paths accurately."
          </p>
          <span className="text-white font-bold text-xs uppercase tracking-widest block">
            — Admify Founding Philosophy
          </span>
        </div>

      </div>
    </div>
  );
}

export default AboutUsPage;
