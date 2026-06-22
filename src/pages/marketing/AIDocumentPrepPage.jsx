import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, FileText, UploadCloud, CheckSquare, 
  RefreshCw, Award, Copy, CheckCircle, Check,
  AlertTriangle, BookOpen, PenTool, ShieldAlert, Cpu
} from "lucide-react";

function AIDocumentPrepPage() {
  const [activeTab, setActiveTab] = useState("sop"); // "sop", "cv", "visa"
  
  // SOP / LOR Builder States
  const [uniName, setUniName] = useState("Stanford University");
  const [courseName, setCourseName] = useState("M.S. in Computer Science");
  const [experience, setExperience] = useState("2 years as a Software Engineer at TechCorp");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setOutputText("");
    setCopied(false);

    const fullSop = `STATEMENT OF PURPOSE\n\nTo the Admissions Committee of ${uniName},\n\nI am writing to formally express my interest in the ${courseName} program. Having accumulated ${experience}, my career objective is to pioneer scalable machine learning frameworks that optimize deep neural architectures. My academic record, paired with my professional endeavors, has reinforced my commitment to advancing data science paradigms at ${uniName}.\n\nThroughout my work, I succeeded in reducing machine learning model latency by 32% under load, demonstrating both practical programming skills and deep theoretical knowledge. I am eager to collaborate with your distinguished faculty...`;

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullSop.length) {
        setOutputText((prev) => prev + fullSop.charAt(idx));
        idx += 3; // Type multiple characters for a smooth but rapid experience
      } else {
        clearInterval(interval);
        setIsGenerating(false);
      }
    }, 15);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // CV Review states
  const [cvFile, setCvFile] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewReport, setReviewReport] = useState(null);

  const triggerCvReview = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setCvFile(file.name);
    setIsReviewing(true);
    setReviewReport(null);

    setTimeout(() => {
      setIsReviewing(false);
      setReviewReport({
        score: 87,
        clarity: "Excellent structure and chronological sequence.",
        actionNeeded: [
          "Include quantitative metrics (e.g. managed $X budget, improved speed by Y%).",
          "Shorten your hobbies section to leave room for technical stacks.",
          "Use stronger action verbs (replace 'Worked on' with 'Spearheaded' or 'Architected')."
        ],
        atsFriendly: "ATS Compatibility Score: 94%"
      });
    }, 2000);
  };

  // Visa Checklist state
  const [visaCountry, setVisaCountry] = useState("usa");
  const visaChecklists = {
    usa: [
      { doc: "Valid Passport (at least 6 months validity)", essential: true, done: true },
      { doc: "Signed Form I-20 from University", essential: true, done: true },
      { doc: "SEVIS I-901 Fee Payment Receipt", essential: true, done: false },
      { doc: "DS-160 Visa Application Confirmation Page", essential: true, done: false },
      { doc: "Admissions Offer Letter & Scholarships", essential: false, done: true },
      { doc: "Liquid Bank Statements (covering 1st-year tuition & living)", essential: true, done: false }
    ],
    uk: [
      { doc: "Valid Passport", essential: true, done: true },
      { doc: "CAS Number (Confirmation of Acceptance for Studies)", essential: true, done: true },
      { doc: "IELTS / Language Proficiency proof", essential: true, done: true },
      { doc: "TB Test Clearance Certificate (if applicable)", essential: true, done: false },
      { doc: "Financial statements matching 28-day holding rule", essential: true, done: false }
    ],
    canada: [
      { doc: "Valid Passport", essential: true, done: true },
      { doc: "Letter of Acceptance (LOA)", essential: true, done: true },
      { doc: "Guaranteed Investment Certificate (GIC) of $20,635 CAD", essential: true, done: false },
      { doc: "Provincial Attestation Letter (PAL)", essential: true, done: false },
      { doc: "Biometrics receipt & Medical exam confirmation", essential: true, done: true }
    ]
  };

  const [activeChecklist, setActiveChecklist] = useState(visaChecklists.usa);

  const handleVisaChange = (country) => {
    setVisaCountry(country);
    setActiveChecklist(visaChecklists[country]);
  };

  const toggleCheck = (idx) => {
    const updated = [...activeChecklist];
    updated[idx].done = !updated[idx].done;
    setActiveChecklist(updated);
  };

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
          >
            <Cpu className="w-4 h-4 text-primary-400 animate-spin" style={{ animationDuration: "3s" }} />
            Premium AI Document Engine
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            AI Document <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Laboratory</span>
          </h1>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Eliminate university application anxiety. Generate elite, customized admission essays, evaluate resume ATS readiness, and audit visa documents using state-of-the-art LLMs.
          </p>
        </div>

        {/* Dynamic Tool Tabs Selector */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex justify-center border-b border-slate-850 gap-4 md:gap-8 pb-3">
            {[
              { id: "sop", name: "SOP & LOR Builder", icon: FileText },
              { id: "cv", name: "AI CV Reviewer", icon: UploadCloud },
              { id: "visa", name: "Visa Checklist Audit", icon: CheckSquare }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-4 text-sm md:text-base font-bold transition-all relative ${
                    activeTab === tab.id 
                      ? "text-primary-400 font-extrabold" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 md:w-5 h-4 md:h-5" />
                  {tab.name}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabIndicator" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents Area */}
        <div className="max-w-5xl mx-auto mb-28">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: SOP/LOR Builder */}
            {activeTab === "sop" && (
              <motion.div
                key="sop-builder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Inputs Form */}
                <div className="lg:col-span-5 glass p-6.5 rounded-3xl border border-slate-700/60 flex flex-col justify-between">
                  <div className="space-y-5">
                    <h3 className="text-white font-extrabold text-lg flex items-center gap-2 mb-4">
                      <PenTool className="w-5 h-5 text-primary-450" /> Personalize Outline
                    </h3>
                    
                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Target University</label>
                      <input 
                        type="text" 
                        value={uniName}
                        onChange={(e) => setUniName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Course / Program</label>
                      <input 
                        type="text" 
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Background & Key Experience</label>
                      <textarea 
                        rows="3"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all border border-primary-500/50 shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center justify-center gap-2 mt-6"
                  >
                    {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGenerating ? "Drafting Document..." : "Generate SOP Draft"}
                  </button>
                </div>

                {/* Simulated Writing Output */}
                <div className="lg:col-span-7 flex flex-col justify-between glass p-6.5 rounded-3xl border border-slate-700/60">
                  <div>
                    <div className="flex justify-between items-center mb-4 border-b border-slate-850 pb-3">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">AI Generated Document</span>
                      {outputText && (
                        <button
                          onClick={handleCopy}
                          className="text-slate-400 hover:text-white transition-all flex items-center gap-1 text-xs font-bold"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? "Copied!" : "Copy to Clipboard"}
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-900 font-mono text-sm leading-relaxed text-slate-350 h-80 overflow-y-auto custom-scrollbar">
                      {outputText ? (
                        <p className="whitespace-pre-wrap">{outputText}</p>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-600">
                          <FileText className="w-12 h-12 mb-3" />
                          <p className="text-sm">Enter your specifications on the left and click "Generate" to construct your elite draft.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 mt-4 text-slate-500 text-xs font-light">
                    <ShieldAlert className="w-4 h-4 text-primary-400 shrink-0 animate-pulse" />
                    <span>Always customize and proofread AI outlines with your own personal stories for authentic impact.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 2: AI CV Reviewer */}
            {activeTab === "cv" && (
              <motion.div
                key="cv-reviewer"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Upload drag drop box */}
                <div className="lg:col-span-5 flex flex-col justify-center items-center text-center glass border border-dashed border-slate-700 hover:border-primary-500 transition-all rounded-3xl p-10 relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={triggerCvReview}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-16 h-16 text-slate-500 mb-4 animate-bounce" style={{ animationDuration: "2.5s" }} />
                  <h3 className="text-white font-extrabold text-lg mb-2">Upload your Resume</h3>
                  <p className="text-slate-400 text-xs font-light max-w-xs mx-auto leading-relaxed mb-6">
                    Supports PDF, DOCX formats. File size must be under 5MB.
                  </p>
                  
                  {cvFile && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-primary-400">
                      Active: {cvFile}
                    </div>
                  )}
                </div>

                {/* Review diagnostics output */}
                <div className="lg:col-span-7 glass p-6.5 rounded-3xl border border-slate-700/60 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-extrabold text-lg mb-6 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-450" /> Diagnostic Assessment
                    </h3>

                    {isReviewing ? (
                      <div className="py-16 text-center space-y-4">
                        <RefreshCw className="w-10 h-10 text-primary-450 animate-spin mx-auto" />
                        <p className="text-slate-350 text-sm font-semibold">AI is analyzing vocabulary strength and layout indexes...</p>
                      </div>
                    ) : reviewReport ? (
                      <div className="space-y-6">
                        
                        {/* Score Indicator */}
                        <div className="flex items-center gap-4.5 bg-slate-950/70 p-4.5 rounded-2xl border border-slate-900">
                          <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center font-black text-white text-xl">
                            {reviewReport.score}
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-base">Impact Index: Very Good</h4>
                            <p className="text-slate-500 text-xs mt-0.5">{reviewReport.atsFriendly}</p>
                          </div>
                        </div>

                        {/* Critique list */}
                        <div className="space-y-3.5">
                          <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Key Improvement Actions</p>
                          {reviewReport.actionNeeded.map((act, i) => (
                            <div key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                              <AlertTriangle className="w-4.5 h-4.5 text-amber-405 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>

                      </div>
                    ) : (
                      <div className="py-16 text-center text-slate-650 space-y-2">
                        <BookOpen className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-sm">Upload a CV/Resume file on the left to review metrics and compliance diagnostics.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Visa Checklist */}
            {activeTab === "visa" && (
              <motion.div
                key="visa-audit"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
              >
                {/* Destination Selector Sidebar */}
                <div className="lg:col-span-4 glass p-6.5 rounded-3xl border border-slate-700/60 flex flex-col gap-3">
                  <h3 className="text-white font-extrabold text-lg mb-4">Choose Destination</h3>
                  {[
                    { id: "usa", name: "United States (F-1 Student Visa)" },
                    { id: "uk", name: "United Kingdom (Student Visa)" },
                    { id: "canada", name: "Canada (Study Permit / SDS)" }
                  ].map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => handleVisaChange(ct.id)}
                      className={`px-5 py-4 rounded-2xl text-left text-sm font-bold border transition-all ${
                        visaCountry === ct.id 
                          ? "bg-slate-800 border-slate-700 text-white shadow-lg" 
                          : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {ct.name}
                    </button>
                  ))}
                </div>

                {/* Audit Checklist Table */}
                <div className="lg:col-span-8 glass p-6.5 rounded-3xl border border-slate-700/60">
                  <h3 className="text-white font-extrabold text-lg mb-6 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary-450" /> Audited Document Checklist
                  </h3>

                  <div className="space-y-4">
                    {activeChecklist.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => toggleCheck(idx)}
                        className="flex items-center justify-between p-4 bg-slate-950/70 hover:bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-2xl transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4.5">
                          {/* Checkbox circle */}
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                            item.done 
                              ? "bg-primary-600 border-primary-500 text-white" 
                              : "border-slate-800 bg-slate-900"
                          }`}>
                            {item.done && <Check className="w-4 h-4" />}
                          </div>

                          <div>
                            <p className={`text-sm font-bold ${item.done ? "text-slate-400 line-through font-light" : "text-white"}`}>
                              {item.doc}
                            </p>
                            {item.essential && (
                              <span className="text-[9px] uppercase font-black tracking-wide text-primary-400 mt-1 inline-block">
                                Mandatory Document
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* AI Assistants Showcase Grid */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12">
            Specialized Writing Assistants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Grammar & Flow Refiner", desc: "Instantly clean up complex syntax errors and enhance narrative fluency suited for graduate school admissions standards.", icon: PenTool, badge: "AI Active" },
              { title: "ATS Plagiarism Auditor", desc: "Cross-checks your admissions essays against global databases to guarantee 100% unique, original writing.", icon: CheckCircle, badge: "ATS Shielded" },
              { title: "Academic Tone Customizer", desc: "Shift the style of your text seamlessly from creative narrative to authoritative research proposal structure.", icon: BookOpen, badge: "Custom Tone" }
            ].map((as, idx) => {
              const Icon = as.icon;
              return (
                <div key={idx} className="glass p-6.5 rounded-3xl border border-slate-700/60 flex flex-col justify-between h-56 shadow-lg hover:border-slate-500/50 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="bg-primary-500/10 text-primary-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-primary-500/20">
                      {as.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-base mb-2">{as.title}</h4>
                    <p className="text-slate-400 text-xs font-light leading-relaxed">{as.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AIDocumentPrepPage;
