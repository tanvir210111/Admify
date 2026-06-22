import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, FileText, Search, Download, Edit2, CheckCircle, FileDown, MessageCircle, X } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const INITIAL_REQUESTS = [
  { student: "Ahmad Khalid", university: "University of Toronto", program: "MSc Computer Science", type: "SOP", status: "Generated", date: "2026-06-20", text: "I am writing to express my strong interest in the Master of Science in Computer Science program at the University of Toronto. With a robust background in software engineering and data pipelines, my goal is to research distributed systems under the guidance of..." },
  { student: "Sarah Jenkins", university: "University of Melbourne", program: "Master of Finance", type: "LOR", status: "Pending Review", date: "2026-06-21", text: "Letter of Recommendation:\n\nIt is my great pleasure to recommend Sarah Jenkins for admission to the Master of Finance program. As her academic advisor at university, I have observed her remarkable analytical acumen and numerical proficiency..." },
  { student: "Liu Wei", university: "University of Manchester", program: "BSc Data Science", type: "SOP", status: "Approved", date: "2026-06-19", text: "My fascination with numbers and large data structures led me to pursue a Bachelor of Science in Data Science. The University of Manchester's curriculum aligns perfectly with my ambition to..." },
];

export default function AgentSopLor() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [selectedReq, setSelectedReq] = useState(INITIAL_REQUESTS[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [search, setSearch] = useState("");

  const handleApprove = (student, type) => {
    setRequests(prev => prev.map(r => (r.student === student && r.type === type) ? { ...r, status: "Approved" } : r));
    if (selectedReq.student === student && selectedReq.type === type) {
      setSelectedReq(prev => ({ ...prev, status: "Approved" }));
    }
  };

  const filtered = requests.filter(r =>
    r.student.toLowerCase().includes(search.toLowerCase()) ||
    r.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" /> SOP & LOR Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review AI-assisted Statements of Purpose & Letters of Recommendation drafted for students</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Generated SOPs", val: "42 drafts", color: "text-violet-400" },
          { label: "Generated LORs", val: "18 drafts", color: "text-blue-400" },
          { label: "Pending Agent Review", val: "6 files", color: "text-yellow-400" },
          { label: "Approved Documents", val: "54 files", color: "text-emerald-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Split layout: List on Left, Preview Pane on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Table of requests */}
        <motion.div variants={fade} className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3 p-4 border-b border-white/6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search SOP/LOR requests by student or university..."
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm cursor-pointer">
              <thead>
                <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                  {["Student", "University", "Target Program", "Type", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => { setSelectedReq(r); setShowPreview(true); }}
                    className={`border-b border-white/4 hover:bg-white/3 transition-colors ${selectedReq.student === r.student && selectedReq.type === r.type ? "bg-white/4" : ""}`}
                  >
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{r.student}</td>
                    <td className="px-4 py-3.5 text-slate-300">{r.university}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{r.program}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-black ${
                        r.type === "SOP" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedReq(r); setShowPreview(true); }}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold border border-white/10 text-slate-300"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Side: Preview Pane */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-5 rounded-2xl border space-y-4"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-white font-bold text-sm flex items-center gap-1.5"><FileText className="w-4 h-4 text-violet-400" /> Document Viewer</h3>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm">{selectedReq.student} — {selectedReq.type}</h4>
              <p className="text-slate-500 text-xs">{selectedReq.university} · {selectedReq.program}</p>
            </div>

            {/* Document Draft text */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-white/5 max-h-56 overflow-y-auto text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line custom-scrollbar">
              {selectedReq.text}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>Comments & Feedback</span>
                <span className="text-violet-400">Ver 1.2 (AI Auto-Draft)</span>
              </div>
              <textarea
                placeholder="Type your notes or revisions needed..."
                className="w-full bg-[#0b1228] border border-white/8 rounded-xl py-2 px-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleApprove(selectedReq.student, selectedReq.type)}
                className="flex-1 flex items-center justify-center gap-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl hover:brightness-110 transition-all shadow"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Approve
              </button>
              <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl border border-white/8 transition-all flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl border border-white/8 transition-all flex items-center justify-center">
                <FileDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
