import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Search, Eye, GraduationCap, X } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const UNIVERSITIES = [
  {
    name: "University of Toronto", country: "Canada", rank: "#21", fee: "CAD 45k", scholarships: "5 Available", deadline: "2026-12-15",
    overview: "Canada's leading institution, known for research excellence, computer science breakthrough hubs, and large international community.",
    programs: ["MSc Computer Science", "BSc Data Science", "BBA Management"],
    requirements: "GPA 3.6+ (WES equivalent), IELTS 7.0 (no band less than 6.5), 3 LORs, SOP.",
    process: "Online portal submit -> Document screen -> AI Match check -> Offer letter issuance (4-6 weeks)."
  },
  {
    name: "University of Manchester", country: "United Kingdom", rank: "#28", fee: "£28k", scholarships: "3 Available", deadline: "2026-11-30",
    overview: "A prestigious red-brick university in Northern England, famous for engineering, finance studies, and outstanding student employment.",
    programs: ["BSc Artificial Intelligence", "MSc Finance", "MSc Business Analytics"],
    requirements: "GPA 3.3+, IELTS 6.5 (no band less than 6.0), CV, Statement of Purpose.",
    process: "Submit via Admify -> Document checklist verification -> Academic review -> Decision."
  },
  {
    name: "University of Melbourne", country: "Australia", rank: "#33", fee: "AUD 44k", scholarships: "4 Available", deadline: "2027-01-10",
    overview: "Australia's number one university, based in the cultural hub of Melbourne. Offers flexible undergraduate degrees and excellent global recognition.",
    programs: ["Master of Finance", "BSc Information Technology", "MBA Executive"],
    requirements: "GPA 3.4+, IELTS 7.0 (no band less than 6.5), 2 LORs.",
    process: "Submit via agent -> GTE validation check -> Academic review -> COE issuance (3 weeks)."
  },
  {
    name: "TU Munich", country: "Germany", rank: "#49", fee: "€500 / Sem", scholarships: "2 Available", deadline: "2026-10-31",
    overview: "One of Europe's top tech universities. Offering tuition-free high-quality education for engineering, robotics, and physics.",
    programs: ["MSc Robotics & AI", "MSc Informatics", "BSc Electrical Engineering"],
    requirements: "GPA 3.5+ (German grade conversion < 2.0), IELTS 6.5, GRE / GATE recommended.",
    process: "Submit via Uni-Assist -> TU Munich portal application -> Aptitude assessment test -> Offer."
  },
  {
    name: "McGill University", country: "Canada", rank: "#46", fee: "CAD 38k", scholarships: "3 Available", deadline: "2027-02-01",
    overview: "Located in Montreal, McGill is known for medical studies, science research, business administration, and historic campus.",
    programs: ["BBA International Business", "MSc Bioinformatics", "BA Economics"],
    requirements: "GPA 3.5+, IELTS 7.0, SAT/ACT for US undergraduates.",
    process: "Submit profile -> Upload transcript portfolio -> Admissions review -> Offer."
  },
];

export default function AgentUniversities() {
  const [selectedUni, setSelectedUni] = useState(UNIVERSITIES[0]);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const filtered = UNIVERSITIES.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-400" /> Partner Universities Database
          </h1>
          <p className="text-slate-400 text-sm mt-1">Browse commission structures, courses intake info, and entry criteria for 450+ universities</p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Partner Universities", val: "450+", color: "text-violet-400" },
          { label: "Study Destinations", val: "23 countries", color: "text-emerald-400" },
          { label: "Active Programs Offered", val: "8,200+", color: "text-blue-400" },
          { label: "Scholarship Schemes", val: "150+", color: "text-indigo-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Double Column: Database & Selected Profile Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Table list */}
        <motion.div variants={fade} className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3 p-4 border-b border-white/6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search universities by name or country..."
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm cursor-pointer">
              <thead>
                <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                  {["University", "Country", "QS Ranking", "Tuition Fee", "Scholarships", "Action"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr
                    key={u.name}
                    onClick={() => { setSelectedUni(u); setShowProfile(true); }}
                    className={`border-b border-white/4 hover:bg-white/3 transition-colors ${selectedUni.name === u.name ? "bg-white/4" : ""}`}
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{u.name}</td>
                    <td className="px-4 py-3.5 text-slate-300">{u.country}</td>
                    <td className="px-4 py-3.5 text-violet-400 font-bold font-mono">{u.rank}</td>
                    <td className="px-4 py-3.5 text-slate-300 font-bold font-mono">{u.fee}</td>
                    <td className="px-4 py-3.5 text-emerald-400 text-xs font-semibold">{u.scholarships}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUni(u); setShowProfile(true); }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/10 text-slate-300 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Side: University details Panel */}
        <AnimatePresence mode="wait">
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-5 rounded-2xl border space-y-4"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-white font-bold text-base flex items-center gap-1.5"><GraduationCap className="w-5 h-5 text-emerald-400" /> University Profile</h3>
                <button onClick={() => setShowProfile(false)} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="text-violet-400 font-bold text-lg">{selectedUni.name}</h4>
                <p className="text-slate-400 text-xs mt-0.5">{selectedUni.country} · QS Rank {selectedUni.rank}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Overview</span>
                <p className="text-slate-300 text-xs leading-relaxed">{selectedUni.overview}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Trending Programs</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUni.programs.map((prog, idx) => (
                    <span key={idx} className="bg-violet-600/10 text-violet-400 text-[10px] px-2.5 py-1 rounded-full border border-violet-500/20 font-semibold">{prog}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Admission Requirements</span>
                <p className="text-slate-300 text-xs leading-relaxed font-semibold">{selectedUni.requirements}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Process Timeline</span>
                <p className="text-slate-400 text-xs leading-relaxed">{selectedUni.process}</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                  Apply Now
                </button>
                <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl border border-white/8 transition-all">
                  Recommend
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
