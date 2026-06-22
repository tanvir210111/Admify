import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Briefcase, Heart, Smile, Users, 
  MapPin, Clock, X, UploadCloud, CheckCircle, 
  ArrowRight, ShieldCheck, Zap, Laptop, ShieldAlert
} from "lucide-react";

function CareersPage() {
  const [selectedJob, setSelectedJob] = useState(null); // job object
  const [isApplying, setIsApplying] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantFile, setApplicantFile] = useState("");

  const jobs = [
    {
      id: "ml-eng",
      title: "Senior Machine Learning Engineer",
      dept: "Engineering",
      location: "Remote (Global)",
      type: "Full-Time",
      salary: "$130k - $160k",
      desc: "Lead the development of our next-gen statement profiling and admission probability forecasting algorithms.",
      requirements: [
        "4+ years NLP / deep learning experience.",
        "Proficiency in PyTorch, Python, and cloud services (AWS/GCP).",
        "Prior experience in educational matching or parsing engines is a big plus."
      ]
    },
    {
      id: "designer",
      title: "Senior Product Designer",
      dept: "Design & UX",
      location: "Remote (Europe / Americas)",
      type: "Full-Time",
      salary: "$100k - $130k",
      desc: "Architect the aesthetic interface of our student dashboard and document builder systems.",
      requirements: [
        "Portfolio demonstrating sleek dark-mode designs, glassmorphism, and dynamic animations.",
        "Deep familiarity with Figma components and design systems.",
        "Appreciation for micro-interactions and smooth page transitions."
      ]
    },
    {
      id: "advisor",
      title: "Global Admissions Advisor",
      dept: "Operations",
      location: "London, UK (Hybrid)",
      type: "Full-Time",
      salary: "£45k - £60k",
      desc: "Consult directly with our elite student base, reviewing application pipelines and auditing mock visa interview processes.",
      requirements: [
        "Prior experience as a study abroad counselor or university admissions administrator.",
        "Exceptional verbal and written empathy skills.",
        "Deep understanding of UK and North American student visa regulations."
      ]
    }
  ];

  const benefits = [
    { title: "Remote-First Work", desc: "Work from anywhere in the world. We offer full asynchronous scheduling setups.", icon: Laptop },
    { title: "Learning Allowance", desc: "$2,500 annual budget for books, classes, and study material to grow your skill set.", icon: Zap },
    { title: "Premium Cover", desc: "Comprehensive global health, dental, and psychological therapy plans for you and family.", icon: Heart },
    { title: "Stock Options", desc: "Share in the upside. Every full-time Admify employee receives meaningful equity shares.", icon: ShieldCheck },
    { title: "Company Retreats", desc: "Bi-annual fully funded retreats in tropical destinations like Bali and Costa Rica.", icon: Users },
    { title: "Home Office Budget", desc: "$2,000 allowance to purchase standing desks, monitors, and modern setups.", icon: Smile }
  ];

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsSubmitted(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setApplicantFile(file.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) return;

    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsSubmitted(true);
      setApplicantName("");
      setApplicantEmail("");
      setApplicantFile("");
    }, 1500);
  };

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
            <Briefcase className="w-4 h-4 animate-pulse" />
            We Are Hiring
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
            Build the Future of <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">EdTech</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed">
            Join a fast-growing, highly technical team reshaping study abroad advisory workflows globally. We look for builders, tinkerers, and empathetic minds.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mb-28 max-w-6xl mx-auto">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12">
            Why Join the Admify Team?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="glass p-6.5 rounded-3xl border border-slate-700/60 flex flex-col justify-between h-52 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-base mb-2">{b.title}</h4>
                    <p className="text-slate-400 text-xs font-light leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Open Positions list */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12">
            Active Open Roles
          </h2>

          <div className="space-y-6">
            {jobs.map((job) => (
              <div 
                key={job.id} 
                className="glass p-6 rounded-3xl border border-slate-700/60 hover:border-slate-500/80 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-white font-extrabold text-lg md:text-xl tracking-tight leading-snug">
                      {job.title}
                    </h3>
                    <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {job.dept}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wide">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-600" /> {job.location}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-600" /> {job.type}</span>
                    <span>•</span>
                    <span className="text-primary-400">{job.salary}</span>
                  </div>
                  <p className="text-slate-355 text-sm font-light leading-relaxed max-w-2xl">
                    {job.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyClick(job)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs md:text-sm px-6 py-3.5 transition-all border border-primary-500/50 shadow-[0_0_12px_rgba(124,58,237,0.2)] shrink-0 flex items-center gap-1.5"
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Apply Modal Backdrop/Drawer */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end items-stretch"
              onClick={() => setSelectedJob(null)}
            >
              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-full max-w-xl bg-slate-950 border-l border-slate-800 p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex justify-between items-center mb-8 border-b border-slate-850 pb-4">
                    <div>
                      <span className="text-primary-400 text-xs font-black uppercase tracking-wider">{selectedJob.dept}</span>
                      <h3 className="text-white font-extrabold text-xl md:text-2xl mt-1">{selectedJob.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedJob(null)}
                      className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {isSubmitted ? (
                    <div className="text-center py-16 space-y-6">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="text-white font-extrabold text-xl">Application Received!</h4>
                      <p className="text-slate-400 text-sm font-light leading-relaxed max-w-sm mx-auto">
                        Thank you for applying to the {selectedJob.title} role. Our team will review your CV and reach out within 3 business days.
                      </p>
                      <button
                        onClick={() => setSelectedJob(null)}
                        className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-xl text-sm transition-all"
                      >
                        Close Portal
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Job Description details in drawer */}
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 mb-6">
                        <h4 className="text-white font-bold text-sm mb-3">Core Qualifications Needed:</h4>
                        <ul className="space-y-2">
                          {selectedJob.requirements.map((req, i) => (
                            <li key={i} className="text-slate-350 text-xs font-light flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-1.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
                        <input
                          type="text"
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          placeholder="Alex Mercer"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email Address</label>
                        <input
                          type="email"
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="alex@example.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Upload Resume / CV</label>
                        <div className="border border-dashed border-slate-800 hover:border-primary-500/50 rounded-xl p-6 text-center relative cursor-pointer transition-all bg-slate-900/20">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <UploadCloud className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                          <p className="text-slate-400 text-xs font-bold">{applicantFile ? applicantFile : "Select PDF / Word File"}</p>
                          <p className="text-slate-500 text-[10px] mt-1 font-light">Max size: 5MB</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isApplying}
                        className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white font-bold rounded-2xl transition-all border border-primary-500/50 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
                      >
                        {isApplying ? "Submitting Application..." : "Submit Application"}
                      </button>
                    </form>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-600 text-xs font-light mt-8 border-t border-slate-850 pt-4">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-primary-500/50" />
                  <span>Admify values diversity. We encrypt and protect all candidate resume submissions.</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default CareersPage;
