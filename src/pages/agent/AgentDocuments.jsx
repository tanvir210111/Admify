import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, CheckCircle, XCircle, RefreshCw, Eye, HelpCircle } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const INITIAL_DOCS = [
  { student: "Ahmad Khalid", type: "Passport", date: "2026-06-21", status: "Verified" },
  { student: "Ahmad Khalid", type: "Transcript", date: "2026-06-20", status: "Pending" },
  { student: "Sarah Jenkins", type: "IELTS Certificate", date: "2026-06-21", status: "Pending" },
  { student: "Liu Wei", type: "Bank Statement", date: "2026-06-19", status: "Verified" },
  { student: "Amara Diallo", type: "Recommendation Letter", date: "2026-06-18", status: "Verified" },
  { student: "Carlos Ruiz", type: "CV / Resume", date: "2026-06-17", status: "Rejected" },
  { student: "Ivan Petrov", type: "SOP Draft", date: "2026-06-15", status: "Verified" },
];

export default function AgentDocuments() {
  const [docs, setDocs] = useState(INITIAL_DOCS);
  const [search, setSearch] = useState("");

  const handleUpdate = (student, type, newStatus) => {
    setDocs(prev => prev.map(d => (d.student === student && d.type === type) ? { ...d, status: newStatus } : d));
  };

  const filtered = docs.filter(d =>
    d.student.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" /> Student Document Verification
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review academic certificates, passport copies, financial bank statements, and transcripts</p>
        </div>
      </motion.div>

      {/* KPI stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending Verification", val: "8 files", color: "text-yellow-400" },
          { label: "Verified / Checked", val: "142 files", color: "text-emerald-400" },
          { label: "Rejected / Deficient", val: "3 files", color: "text-red-400" },
          { label: "Missing Student Files", val: "11 items", color: "text-indigo-400" },
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
              placeholder="Search documents by student name or file type..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Student Name", "Document Type", "Upload Date", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5 font-semibold text-slate-200">{d.student}</td>
                  <td className="px-4 py-3.5 text-slate-300">
                    <span className="font-mono text-xs">{d.type}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{d.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
                      d.status === "Verified" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      d.status === "Pending" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleUpdate(d.student, d.type, "Verified")}
                            className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                            title="Approve File"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdate(d.student, d.type, "Rejected")}
                            className="p-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                            title="Reject File"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleUpdate(d.student, d.type, "Pending")}
                        className="p-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                        title="Request Revision"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10" title="View Document">
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
