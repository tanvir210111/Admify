import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, Search, Eye, RefreshCcw, ArrowRight, CheckCircle } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const APPLICATIONS = [
  { id: "APP-4029", student: "Ahmad Khalid", university: "University of Toronto", program: "MSc Computer Science", date: "2026-06-20", deadline: "2026-12-15", status: "Visa Process", stepIndex: 5 },
  { id: "APP-3918", student: "Liu Wei", university: "University of Manchester", program: "BSc Data Science", date: "2026-06-19", deadline: "2026-11-30", status: "Completed", stepIndex: 6 },
  { id: "APP-2871", student: "Sarah Jenkins", university: "University of Melbourne", program: "Master of Finance", date: "2026-06-18", deadline: "2027-01-10", status: "Under Review", stepIndex: 2 },
  { id: "APP-5092", student: "Amara Diallo", university: "TU Munich", program: "MSc Robotics", date: "2026-06-17", deadline: "2026-10-31", status: "Decision (Accepted)", stepIndex: 4 },
  { id: "APP-1029", student: "Carlos Ruiz", university: "McGill University", program: "BBA International Business", date: "2026-06-16", deadline: "2027-02-01", status: "Draft", stepIndex: 0 },
  { id: "APP-8291", student: "Yuki Tanaka", university: "ETH Zurich", program: "MSc Quantum Engineering", date: "2026-06-15", deadline: "2026-12-01", status: "Interview Scheduled", stepIndex: 3 },
];

const STAGES = ["Draft", "Submitted", "Under Review", "Interview", "Decision", "Visa Process", "Completed"];

const STATUS_COLOR = {
  "Draft":               "text-slate-400 bg-slate-500/10 border-slate-500/20",
  "Submitted":           "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Under Review":        "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Interview Scheduled": "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  "Decision (Accepted)": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Visa Process":        "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "Completed":           "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

export default function AgentApplications() {
  const [selectedApp, setSelectedApp] = useState(APPLICATIONS[0]);
  const [search, setSearch] = useState("");

  const filtered = APPLICATIONS.filter(app =>
    app.student.toLowerCase().includes(search.toLowerCase()) ||
    app.university.toLowerCase().includes(search.toLowerCase()) ||
    app.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-violet-400" /> Application Tracking Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Submit admissions profiles, trace university feedback, and guide student visa stages</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Submitted Applications", val: "134", color: "text-blue-400" },
          { label: "Under Review", val: "38", color: "text-yellow-400" },
          { label: "Accepted Offers", val: "92", color: "text-emerald-400" },
          { label: "Rejected Applications", val: "4", color: "text-red-400" },
          { label: "Visa Approved", val: "28", color: "text-indigo-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Interactive Timeline Preview Panel */}
      <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-sm">
            Live Timeline: <span className="text-violet-400">{selectedApp.student}</span> ({selectedApp.id})
          </h3>
          <span className="text-xs text-slate-500 font-mono">Target: {selectedApp.university} · {selectedApp.program}</span>
        </div>

        {/* Horizontal Progression steps */}
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 py-4 px-2">
          {STAGES.map((st, i) => {
            const isCompleted = i <= selectedApp.stepIndex;
            const isCurrent = i === selectedApp.stepIndex;

            return (
              <div key={i} className="flex-1 w-full flex flex-col items-center relative group">
                {/* Visual Connector Line */}
                {i < STAGES.length - 1 && (
                  <div className="hidden md:block absolute top-[13px] left-[50%] right-[-50%] h-[2px] z-0" style={{ background: isCompleted ? "linear-gradient(90deg,#8b5cf6,#3b82f6)" : "rgba(255,255,255,0.06)" }} />
                )}

                {/* Step Circle */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold text-xs relative z-10 transition-all ${
                  isCurrent ? "bg-violet-600 border-violet-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)]" :
                  isCompleted ? "bg-blue-600 border-blue-500 text-white" :
                  "bg-slate-900 border-white/10 text-slate-500"
                }`}>
                  {isCompleted && !isCurrent ? <CheckCircle className="w-4 h-4 text-white" /> : i + 1}
                </div>

                <span className={`text-xs mt-2.5 font-bold text-center ${isCurrent ? "text-violet-400" : isCompleted ? "text-slate-300" : "text-slate-600"}`}>
                  {st}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Database Table */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex gap-3 p-4 border-b border-white/6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search applications by student, ID or university..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm cursor-pointer">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["App ID", "Student Name", "Target University", "Degree & Program", "Submitted Date", "Admissions Deadline", "Current Stage", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`border-b border-white/4 hover:bg-white/3 transition-colors ${selectedApp.id === app.id ? "bg-white/4" : ""}`}
                >
                  <td className="px-4 py-3.5 font-mono font-bold text-violet-400">{app.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-200">{app.student}</td>
                  <td className="px-4 py-3.5 text-slate-300">{app.university}</td>
                  <td className="px-4 py-3.5 text-slate-400">{app.program}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{app.date}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{app.deadline}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${STATUS_COLOR[app.status] || "text-slate-400 bg-white/5"}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10" title="Inspect Status Details">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
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
