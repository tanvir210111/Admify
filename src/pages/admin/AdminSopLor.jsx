import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileDown, CheckCircle, XCircle, Play, Eye, Search, AlertCircle, FileCheck2 } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const INITIAL_DOCS = [
  { id: "DOC-332", student: "Ahmad Khalid", university: "University of Toronto", program: "MSc Computer Science", type: "SOP", status: "generated", date: "2026-06-20" },
  { id: "DOC-333", student: "Liu Wei", university: "University of Manchester", program: "BSc Data Science", type: "LOR", status: "approved", date: "2026-06-19" },
  { id: "DOC-334", student: "Sarah Jenkins", university: "University of Melbourne", program: "Master of Finance", type: "SOP", status: "pending_review", date: "2026-06-18" },
  { id: "DOC-335", student: "Amara Diallo", university: "TU Munich", program: "MSc Robotics", type: "LOR", status: "approved", date: "2026-06-17" },
  { id: "DOC-336", student: "Carlos Ruiz", university: "McGill University", program: "BBA International Business", type: "SOP", status: "rejected", date: "2026-06-16" },
];

const STATUS_MAP = {
  generated:      { label: "Generated",      cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  pending_review: { label: "Pending Review", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  approved:       { label: "Approved",       cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  rejected:       { label: "Rejected",       cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminSopLor() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [search, setSearch] = useState("");

  const handleAction = (id, newStatus) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
  };

  const filtered = docs.filter(doc =>
    doc.student.toLowerCase().includes(search.toLowerCase()) ||
    doc.university.toLowerCase().includes(search.toLowerCase()) ||
    doc.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" /> Document Generation Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review, approve, and download AI-generated Statement of Purpose (SOP) & Letter of Recommendation (LOR) documents</p>
        </div>
      </motion.div>

      {/* KPI stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "SOPs Generated Today", val: "148", color: "text-violet-400" },
          { label: "LORs Generated Today", val: "62", color: "text-blue-400" },
          { label: "Pending Approvals", val: "24", color: "text-yellow-400" },
          { label: "Generation Accuracy", val: "98.8%", color: "text-emerald-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Database Container */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex gap-3 p-4 border-b border-white/6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students, university or programs..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Doc ID", "Student", "University", "Target Program", "Type", "Status", "Generated Date", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5 font-mono text-slate-400 font-bold">{d.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-white">{d.student}</td>
                  <td className="px-4 py-3.5 text-slate-300">{d.university}</td>
                  <td className="px-4 py-3.5 text-slate-400">{d.program}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                      d.type === "SOP" ? "bg-violet-500/10 text-violet-400 border border-violet-500/25" : "bg-blue-500/10 text-blue-400 border border-blue-500/25"
                    }`}>
                      {d.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_MAP[d.status].cls}`}>
                      {STATUS_MAP[d.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{d.date}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.status === "pending_review" && (
                        <>
                          <button
                            onClick={() => handleAction(d.id, "approved")}
                            className="p-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/20"
                            title="Approve"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAction(d.id, "rejected")}
                            className="p-1.5 rounded bg-red-500/15 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {d.status === "generated" && (
                        <button
                          onClick={() => handleAction(d.id, "pending_review")}
                          className="p-1.5 rounded bg-blue-500/15 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20"
                          title="Submit for Review"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10" title="Review Document">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10" title="Download Word / PDF">
                        <FileDown className="w-3.5 h-3.5" />
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
