import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Brain, FileText, GraduationCap, 
  Layers, BarChart2, CheckCircle2, ChevronRight,
  TrendingUp, Award, Clock, ArrowRight, User
} from "lucide-react";

function FeaturesPage() {
  // AI Recommendation Engine state
  const [activeProfile, setActiveProfile] = useState("cs");
  const profiles = {
    cs: {
      name: "Alex (GPA: 3.9, GRE: 325)",
      interest: "M.S. in Computer Science",
      matches: [
        { uni: "Stanford University", match: 98, type: "Dream" },
        { uni: "University of Toronto", match: 95, type: "Target" },
        { uni: "NUS Singapore", match: 91, type: "Safe" }
      ]
    },
    bio: {
      name: "Elena (GPA: 3.7, IELTS: 8.0)",
      interest: "M.S. in Biotechnology",
      matches: [
        { uni: "Johns Hopkins University", match: 97, type: "Dream" },
        { uni: "Oxford University", match: 94, type: "Dream" },
        { uni: "LMU Munich", match: 92, type: "Target" }
      ]
    },
    biz: {
      name: "Raj (GPA: 3.5, GMAT: 710)",
      interest: "MBA in Finance",
      matches: [
        { uni: "Wharton School", match: 96, type: "Dream" },
        { uni: "INSEAD France", match: 93, type: "Target" },
        { uni: "London Business School", match: 90, type: "Target" }
      ]
    }
  };

  // SOP/LOR Generation simulated typing state
  const [docType, setDocType] = useState("sop");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState("");

  const docTemplates = {
    sop: `Statement of Purpose\n\nMy passion for Artificial Intelligence is rooted in its potential to transform healthcare diagnostics. Throughout my undergraduate study, I focused on deep learning models and computer vision...`,
    lor: `Letter of Recommendation\n\nDear Admissions Committee,\n\nI am writing to highly recommend Alex for your graduate program. As his professor in Advanced Algorithms, I observed his exceptional analytical capabilities...`
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedText("");
    let text = docTemplates[docType];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        setGeneratedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15);

    return () => clearInterval(interval);
  };

  // Run initial preview generation
  useEffect(() => {
    handleGenerate();
  }, [docType]);

  // Scholarship matching state
  const [countryFilter, setCountryFilter] = useState("all");
  const scholarships = [
    { title: "Commonwealth Scholarship", amount: "$45,000", country: "UK", coverage: "Full Tuition", icon: Award },
    { title: "Fulbright Program", amount: "$60,000", country: "USA", coverage: "Tuition + Stipend", icon: Sparkles },
    { title: "Ontario Graduate Scholarship", amount: "$15,000", country: "Canada", coverage: "Partial Funding", icon: GraduationCap },
    { title: "Eiffel Excellence Scholarship", amount: "$35,000", country: "Europe", coverage: "Full Tuition", icon: Award }
  ];

  const filteredScholarships = countryFilter === "all" 
    ? scholarships 
    : scholarships.filter(s => s.country.toLowerCase() === countryFilter.toLowerCase());

  // Application tracker step
  const [activeStep, setActiveStep] = useState(1);
  const steps = [
    { id: 1, title: "Profile Analysis", desc: "AI scans background, grades & test scores.", status: "completed" },
    { id: 2, title: "Documents Prep", desc: "Drafting SOP, LOR, and resume review.", status: "active" },
    { id: 3, title: "University Apply", desc: "Portals submitted, transcripts sent.", status: "pending" },
    { id: 4, title: "Visa Processing", desc: "Mock interviews & document checklist.", status: "pending" }
  ];

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
          >
            <Sparkles className="w-4 h-4 animate-pulse" />
            Empowering Your Study Abroad Journey
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
            Next-Gen <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">AI Features</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
            Discover how Admify integrates advanced predictive models and writing assistants to take you from university search to visa approval.
          </p>
        </div>

        {/* AI Recommendations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-[0_0_20px_rgba(124,58,237,0.25)]">
              <Brain className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              AI-Powered University Matches
            </h2>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Our hybrid machine learning models match your academic profile, budget, and work experience against 10,000+ courses worldwide, delivering accurate matching confidence scores.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>98.6% profile-matching accuracy rate</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span>Dynamic matching based on real historical acceptances</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-8 border border-slate-700/60 relative overflow-hidden shadow-2xl shadow-black/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl" />
              
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-400" /> Recommendation Simulation
              </h3>

              {/* Profiles Selector */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                {Object.keys(profiles).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveProfile(key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border shrink-0 ${
                      activeProfile === key 
                        ? "bg-primary-600 border-primary-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]" 
                        : "bg-slate-900 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-white"
                    }`}
                  >
                    {key.toUpperCase()} Profile
                  </button>
                ))}
              </div>

              {/* Profile Card details */}
              <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-1">Academic Snapshot</p>
                    <h4 className="text-white font-bold text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" /> {profiles[activeProfile].name}
                    </h4>
                  </div>
                  <span className="text-primary-400 bg-primary-500/10 px-3 py-1 rounded-full text-xs font-bold border border-primary-500/20">
                    {profiles[activeProfile].interest}
                  </span>
                </div>
              </div>

              {/* Matches List */}
              <div className="space-y-4">
                <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Predicted Admissions Recommendations</p>
                {profiles[activeProfile].matches.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700/80 transition-all">
                    <div>
                      <p className="text-white font-bold text-sm md:text-base">{item.uni}</p>
                      <span className={`inline-block text-[10px] uppercase font-bold mt-1 px-2 py-0.5 rounded-md ${
                        item.type === "Dream" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        item.type === "Target" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                        {item.match}%
                      </p>
                      <p className="text-slate-500 text-xs">Match Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LOR / SOP Generator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 lg:flex-row-reverse">
          <div className="lg:col-span-7 order-last lg:order-first">
            <div className="glass rounded-3xl p-8 border border-slate-700/60 shadow-2xl shadow-black/40">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDocType("sop")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      docType === "sop" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Statement of Purpose (SOP)
                  </button>
                  <button 
                    onClick={() => setDocType("lor")}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      docType === "lor" ? "bg-slate-800 text-white border border-slate-700" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Recommendation Letter (LOR)
                  </button>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 disabled:text-slate-400 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                >
                  {isGenerating ? "AI is Thinking..." : "Re-Generate"}
                </button>
              </div>

              {/* Glowing simulated editor */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-850 h-64 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300 custom-scrollbar">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 border-b border-slate-900 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-sans font-bold">Admify AI Writer v2.4</span>
                </div>
                <p className="whitespace-pre-wrap">
                  {generatedText}
                  {isGenerating && <span className="inline-block w-2 h-4 ml-1 bg-primary-400 animate-pulse" />}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)]">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Instant AI Document Prep
            </h2>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Craft beautiful, highly personalized Statements of Purpose (SOP) and Letters of Recommendation (LOR) in seconds. Our engine templates are tailored to match the specific tone expected by top-tier universities.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Avoid writer's block with dynamic structured templates</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span>Integrated grammar, tone and plagiarism checkers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Scholarship Intelligent Match Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32">
          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Intelligent Scholarship Matching
            </h2>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Never miss fully funded opportunities. Admify monitors hundreds of millions in global scholarship funds and connects them instantly with qualified applicants based on background, merit, and financial profile.
            </p>
            
            <div className="flex gap-2">
              {["all", "USA", "UK", "Canada"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCountryFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    countryFilter === c 
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-300" 
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {c === "all" ? "Show All" : c}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredScholarships.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      key={s.title}
                      className="glass p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all flex flex-col justify-between h-44 shadow-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="bg-slate-950 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-400 uppercase border border-slate-800">
                          {s.country}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm mb-1 leading-snug line-clamp-1">{s.title}</h4>
                        <p className="text-slate-400 text-xs">{s.coverage}</p>
                      </div>
                      <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center mt-2">
                        <span className="text-slate-500 text-xs">Value</span>
                        <span className="text-white font-black text-sm text-amber-300">{s.amount}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Global Application Tracker Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-32 lg:flex-row-reverse">
          <div className="lg:col-span-7 order-last lg:order-first">
            <div className="glass rounded-3xl p-8 border border-slate-700/60 shadow-2xl shadow-black/40">
              <h3 className="text-white font-bold text-lg mb-8 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400 animate-pulse" /> Platform Application Tracker
              </h3>

              <div className="relative">
                {/* Horizontal line connector */}
                <div className="absolute top-[1.35rem] left-8 right-8 h-0.5 bg-slate-800 -z-10" />

                <div className="grid grid-cols-4 gap-2 text-center">
                  {steps.map((s) => (
                    <div 
                      key={s.id}
                      onClick={() => setActiveStep(s.id)}
                      className="cursor-pointer group flex flex-col items-center"
                    >
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border transition-all ${
                        activeStep === s.id 
                          ? "bg-primary-600 border-primary-400 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)]" 
                          : s.id < activeStep 
                            ? "bg-slate-900 border-primary-500 text-primary-400" 
                            : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}>
                        {s.id < activeStep ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                      </div>
                      <p className={`text-[10px] md:text-xs font-bold mt-3 transition-colors ${
                        activeStep === s.id ? "text-white" : "text-slate-500 group-hover:text-slate-350"
                      }`}>
                        {s.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic details card for selected step */}
              <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 mt-8">
                <h4 className="text-white font-bold text-base mb-2">
                  Step {activeStep}: {steps[activeStep - 1].title}
                </h4>
                <p className="text-slate-400 text-sm font-light leading-relaxed mb-4">
                  {steps[activeStep - 1].desc}
                </p>
                <div className="flex gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${
                      activeStep === 1 ? "bg-green-400" :
                      activeStep === 2 ? "bg-amber-400" : "bg-slate-500"
                    }`} />
                    Status: {activeStep === 1 ? "Fully Completed" : activeStep === 2 ? "In Progress" : "Queued"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Unified Application Tracking
            </h2>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Consolidate a dozen separate university portals into a single, intuitive pipeline. Monitor document statuses, transcripts, and admissions responses in real time.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Aggregated notification dashboard for all universities</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span>Automatic deadline reminders and checklist items</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Analytics Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-5 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Predictive Admissions Analytics
            </h2>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Make data-driven application choices. Admify processes thousands of historic study-abroad applications to forecast acceptance ranges, visa clearance rate adjustments, and average scholarship payouts.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Real-time visa rejection trends forecasting by country</span>
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span>Comparative tuition & living cost calculator</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div className="glass rounded-3xl p-8 border border-slate-700/60 shadow-2xl shadow-black/40">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Admify Global Stats Overview
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Visa Success Rate", val: "99.2%", trend: "+2.4% vs Avg", desc: "For Admify users" },
                  { label: "Average Scholarship", val: "$28,500", trend: "Top Tier", desc: "Awarded per student" },
                  { label: "Partner Universities", val: "1,200+", trend: "Worldwide", desc: "Direct integrations" }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-slate-800 transition-all text-center">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                    <p className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
                      {stat.val}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-3">
                      {stat.trend}
                    </span>
                    <p className="text-slate-400 text-xs font-light">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="glass rounded-3xl p-12 text-center max-w-4xl mx-auto border border-slate-700/60 shadow-2xl relative overflow-hidden mt-20">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-950/20 via-transparent to-blue-950/20 pointer-events-none" />
          <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
            Ready to unlock the power of AI in study abroad?
          </h2>
          <p className="text-slate-300 font-light text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Create an account in less than a minute and let our system begin analyzing matches for your profile immediately.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition-all flex items-center justify-center gap-2 border border-primary-500/50">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 text-white font-bold rounded-2xl transition-all">
              Talk to an Advisor
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FeaturesPage;
