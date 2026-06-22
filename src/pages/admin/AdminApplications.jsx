import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, Search, Filter, CheckCircle2, XCircle, FileText, Eye, AlertCircle, ArrowUpRight } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const APPLICATIONS = [
  { id: "ADM-9021", student: "Ahmad Khalid", university: "University of Toronto", program: "MSc Computer Science", date: "2026-06-20", status: "under_review" },
  { id: "ADM-9022", student: "Liu Wei", university: "University of Manchester", program: "BSc Data Science", date: "2026-06-19", status: "approved" },
  { id: "ADM-9023", student: "Sarah Jenkins", university: "University of Melbourne", program: "Master of Finance", date: "2026-06-18", status: "submitted" },
  { id: "ADM-9024", student: "Amara Diallo", university: "TU Munich", program: "MSc Robotics", date: "2026-06-17", status: "approved" },
  { id: "ADM-9025", student: "Carlos Ruiz", university: "McGill University", program: "BBA International Business", date: "2026-06-16", status: "rejected" },
  { id: "ADM-9026", student: "Yuki Tanaka", university: "ETH Zurich", program: "MSc Quantum Engineering", date: "2026-06-15", status: "under_review" },
  { id: "ADM-9027", student: "Emma Watson", university: "University of Amsterdam", program: "MSc AI & Cognition", date: "2026-06-14", status: "submitted" },
];

const STATUS_MAP = {
  submitted:    { label: "Submitted",    cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  under_review: { label: "Under Review", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  approved:     { label: "Approved",     cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  rejected:     { label: "Rejected",     cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminApplications() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = APPLICATIONS.filter(app => {
    const matchesSearch = app.student.toLowerCase().includes(search.toLowerCase()) ||
                          app.id.toLowerCase().includes(search.toLowerCase()) ||
                          app.university.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-blue-400" /> Application Review Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review student admission applications, university offer letters, and eligibility</p>
        </div>
      </motion.div>

      {/* Funnel Chart / Visual Blocks */}
      <motion.div variants={fade} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Submitted", val: "8,920", sub: "+12% this month", pct: "100%", color: "bg-blue-500", text: "text-blue-400" },
          { label: "Under Review", val: "3,450", sub: "Avg. 4.2 days check", pct: "72%", color: "bg-yellow-500", text: "text-yellow-400" },
          { label: "Approved", val: "4,120", sub: "46.2% success rate", pct: "46%", color: "bg-emerald-500", text: "text-emerald-400" },
          { label: "Rejected", val: "1,350", sub: "GPA & Test Shortfalls", pct: "15%", color: "bg-red-500", text: "text-red-400" },
        ].map((f, i) => (
          <div key={i} className="p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm font-semibold">{f.label}</span>
                <span className={`text-xs font-bold ${f.text}`}>{f.pct}</span>
              </div>
              <h3 className="text-3xl font-black text-white mt-2">{f.val}</h3>
              <p className="text-slate-500 text-xs mt-1">{f.sub}</p>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-4">
              <motion.div initial={{ width: 0 }} animate={{ width: f.pct }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full ${f.color}`} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main List */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/6 justify-between items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search applications, ID, student..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["all", "submitted", "under_review", "approved", "rejected"].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${
                  filter === tab
                    ? "bg-violet-600/20 border-violet-500/40 text-white"
                    : "bg-transparent border-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["App ID", "Student Name", "University", "Program", "Submission Date", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((app, i) => (
                <tr key={app.id} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5 font-mono font-bold text-violet-400">{app.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-white">{app.student}</td>
                  <td className="px-4 py-3.5 text-slate-300">{app.university}</td>
                  <td className="px-4 py-3.5 text-slate-400">{app.program}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono">{app.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_MAP[app.status].cls}`}>
                      {STATUS_MAP[app.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors" title="Approve">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/25 transition-colors" title="Reject">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/25 transition-colors" title="Request Documents">
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 transition-colors" title="View Details">
                        <Eye className="w-3.5 h-3.5" />
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
