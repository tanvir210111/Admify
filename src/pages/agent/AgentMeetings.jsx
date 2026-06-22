import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Video, Clock, FileEdit, Plus, HelpCircle, XCircle } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const INITIAL_MEETINGS = [
  { student: "Ahmad Khalid", date: "2026-06-22", time: "10:30 AM", purpose: "Visa Interview prep", status: "Scheduled" },
  { student: "Sarah Jenkins", date: "2026-06-22", time: "02:00 PM", purpose: "Counselling Intake choice", status: "Scheduled" },
  { student: "Carlos Ruiz", date: "2026-06-23", time: "11:00 AM", purpose: "Documents Review", status: "Scheduled" },
  { student: "Liu Wei", date: "2026-06-19", time: "04:30 PM", purpose: "Pre-departure brief", status: "Completed" },
  { student: "Amara Diallo", date: "2026-06-18", time: "09:00 AM", purpose: "Scholarship match", status: "Completed" },
];

export default function AgentMeetings() {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS);
  const [notes, setNotes] = useState("Ahmad Khalid is prepared for his visa interview. Recommended focusing on proof of funds explanation and study plan correlation. Next follow-up is tomorrow.");

  const handleCancel = (student, time) => {
    setMeetings(prev => prev.map(m => (m.student === student && m.time === time) ? { ...m, status: "Cancelled" } : m));
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-violet-400" /> Meeting Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Schedule and manage virtual counselling sessions, pre-departure briefings, and visa preparatory calls</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Book Meeting
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Consultations", val: "2 scheduled", color: "text-violet-400" },
          { label: "Upcoming Meetings", val: "5 upcoming", color: "text-blue-400" },
          { label: "Completed Meetings", val: "128 total", color: "text-emerald-400" },
          { label: "Cancelled Meetings", val: "2 cases", color: "text-red-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Double Column: Schedule list & Counselling Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Table Schedule */}
        <motion.div variants={fade} className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="p-4 border-b border-white/6">
            <h3 className="text-white font-bold text-base">Counselling Calendar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                  {["Student", "Date", "Time", "Purpose", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meetings.map((m, i) => (
                  <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{m.student}</td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">{m.date}</td>
                    <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">{m.time}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{m.purpose}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        m.status === "Scheduled" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" :
                        m.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {m.status === "Scheduled" && (
                          <>
                            <button className="px-2.5 py-1.5 rounded bg-violet-600/20 border border-violet-500/30 text-violet-400 text-xs font-bold flex items-center gap-1">
                              <Video className="w-3.5 h-3.5" /> Join
                            </button>
                            <button
                              onClick={() => handleCancel(m.student, m.time)}
                              className="p-1.5 rounded hover:bg-red-500/15 text-slate-400 hover:text-red-400"
                              title="Cancel Meeting"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <button className="p-1.5 rounded hover:bg-white/10 text-slate-300 border border-white/8" title="Edit Notes">
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Right Side: Meeting Counselling Notes */}
        <motion.div variants={fade} className="p-5 rounded-2xl border space-y-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-white font-bold text-sm border-b border-white/5 pb-2">Active Counselling Log</h3>
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Counsellor Observations</p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-[#0b1228] border border-white/8 rounded-xl p-3 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 leading-relaxed font-mono"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Follow-up Tasks Checklist</p>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-violet-600" />
                <span>Verify scholarship eligibility scores</span>
              </label>
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-violet-600" />
                <span>Draft LOR template reference letters</span>
              </label>
            </div>
            <button className="w-full py-2 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all">
              Save Observations
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
