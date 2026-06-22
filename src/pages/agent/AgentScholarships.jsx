import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Search, Filter, Coins, CheckSquare, GraduationCap, Globe } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const SCHOLARSHIPS = [
  { name: "Global Excellence Scholarship", university: "University of Toronto", country: "Canada", amount: "CAD 15,000", deadline: "2026-11-30", eligibility: "GPA 3.7+, IELTS 7.0", type: "Partial" },
  { name: "Commonwealth Shared Scholarship", university: "University of Manchester", country: "United Kingdom", amount: "Full Tuition + Stipend", deadline: "2026-12-15", eligibility: "GPA 3.5+, IELTS 6.5", type: "Full Tuition" },
  { name: "Future Leaders Grant", university: "University of Melbourne", country: "Australia", amount: "AUD 20,000", deadline: "2027-01-10", eligibility: "GPA 3.3+, IELTS 7.0", type: "Partial" },
  { name: "DAAD Graduate Scholarship", university: "TU Munich", country: "Germany", amount: "€1,200 / Month", deadline: "2026-10-31", eligibility: "GPA 3.6+, IELTS 6.5", type: "Stipend" },
  { name: "President's Admission Scholarship", university: "McGill University", country: "Canada", amount: "CAD 10,000", deadline: "2026-11-15", eligibility: "GPA 3.4+, IELTS 7.0", type: "Partial" },
];

export default function AgentScholarships() {
  const [search, setSearch] = useState("");
  const [fundingFilter, setFundingFilter] = useState("All");

  const filtered = SCHOLARSHIPS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.university.toLowerCase().includes(search.toLowerCase());
    const matchesFunding = fundingFilter === "All" || s.type === fundingFilter;
    return matchesSearch && matchesFunding;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-violet-400" /> Scholarship Recommendation Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Match registered students to active university merit grants and government scholarships</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Scholarships", val: "840", color: "text-violet-400", icon: Award },
          { label: "Matched Students", val: "18", color: "text-emerald-400", icon: GraduationCap },
          { label: "Approved Grants", val: "42", color: "text-blue-400", icon: CheckSquare },
          { label: "Total Funding Secured", val: "$480k", color: "text-indigo-400", icon: Coins },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Database Container */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/6 justify-between items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search scholarships by name or provider..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
          <div>
            <select
              value={fundingFilter}
              onChange={e => setFundingFilter(e.target.value)}
              className="bg-[#0b1228] border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50 h-full"
            >
              <option value="All">All Funding Types</option>
              <option value="Full Tuition">Full Tuition</option>
              <option value="Partial">Partial Award</option>
              <option value="Stipend">Monthly Stipend</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Scholarship Name", "University Partner", "Country", "Funding Amount", "Admissions Deadline", "Academic Eligibility", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5 font-semibold text-slate-200">{s.name}</td>
                  <td className="px-4 py-3.5 text-slate-300">{s.university}</td>
                  <td className="px-4 py-3.5 text-slate-400">{s.country}</td>
                  <td className="px-4 py-3.5 text-emerald-400 font-bold font-mono">{s.amount}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{s.deadline}</td>
                  <td className="px-4 py-3.5 text-violet-400 text-xs font-semibold">{s.eligibility}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2.5 py-1 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded text-xs font-bold shadow hover:brightness-110 transition-all">
                        Recommend
                      </button>
                      <button className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded text-xs font-bold transition-all">
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
