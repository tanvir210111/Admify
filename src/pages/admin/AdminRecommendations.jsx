import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, Cpu, TrendingUp, Target, Award, ListFilter, Play } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const RECO_LOGS = [
  { id: "LOG-01", student: "Ivan Petrov", target: "MSc Cybersecurity", uni: "TU Munich", score: "94%", date: "Just now", status: "applied" },
  { id: "LOG-02", student: "Deepika Rao", target: "BSc Biotechnology", uni: "University of Melbourne", score: "89%", date: "2 mins ago", status: "saved" },
  { id: "LOG-03", student: "Ali Al-Farsi", target: "MBA International", uni: "McGill University", score: "92%", date: "5 mins ago", status: "applied" },
  { id: "LOG-04", student: "Sarah Jenkins", target: "Master of Finance", uni: "University of Manchester", score: "85%", date: "12 mins ago", status: "rejected" },
  { id: "LOG-05", student: "Chen Wei", target: "PhD Machine Learning", uni: "ETH Zurich", score: "97%", date: "15 mins ago", status: "applied" },
];

export default function AdminRecommendations() {
  const [logs, setLogs] = useState(RECO_LOGS);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-400" /> AI Recommendations Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time study recommendation engine logs, predictive accuracy & matchmaking metrics</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8 text-emerald-400 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Core: Active
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Recommendations Generated", val: "2.1M+", color: "text-violet-400", icon: Brain },
          { label: "Prediction Accuracy", val: "94.2%", color: "text-emerald-400", icon: Target },
          { label: "Success Rate", val: "88.6%", color: "text-blue-400", icon: TrendingUp },
          { label: "Average Match Score", val: "87.4%", color: "text-orange-400", icon: Cpu },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Country Trends */}
        <motion.div variants={fade} className="p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white font-bold text-base mb-4">Top Country Preferences</h3>
            <div className="space-y-3.5">
              {[
                { country: "Canada", percent: 38, count: "12,450 matches", color: "bg-violet-500" },
                { country: "United Kingdom", percent: 27, count: "8,920 matches", color: "bg-blue-500" },
                { country: "United States", percent: 18, count: "5,800 matches", color: "bg-emerald-500" },
                { country: "Germany", percent: 11, count: "3,610 matches", color: "bg-yellow-500" },
                { country: "Australia", percent: 6, count: "2,050 matches", color: "bg-orange-500" },
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{c.country}</span>
                    <span className="text-slate-400">{c.percent}% · <span className="font-mono">{c.count}</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Popular Programs */}
        <motion.div variants={fade} className="p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white font-bold text-base mb-4">Trending Programs</h3>
            <div className="space-y-3.5">
              {[
                { name: "Computer Science & AI", percent: 42, count: "18.2k hits", color: "bg-violet-500" },
                { name: "Data Science & Analytics", percent: 26, count: "11.3k hits", color: "bg-blue-500" },
                { name: "Business Administration", percent: 15, count: "6.5k hits", color: "bg-emerald-500" },
                { name: "Robotics & Engineering", percent: 12, count: "5.2k hits", color: "bg-yellow-500" },
                { name: "Public Health / Biotech", percent: 5, count: "2.1k hits", color: "bg-orange-500" },
              ].map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{p.name}</span>
                    <span className="text-slate-400">{p.percent}% · <span className="font-mono">{p.count}</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Engine Match Performance */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-white font-bold text-base mb-3">Recommendation Trend</h3>
          <div className="h-44 flex items-end gap-2.5 pb-2 pt-4 px-2 border-b border-white/5">
            {[35, 45, 60, 52, 70, 85, 95].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="relative w-full rounded-t-lg bg-gradient-to-t from-violet-600/40 to-blue-500/80 transition-all group-hover:brightness-125" style={{ height: `${val}%` }}>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1 text-[9px] font-bold text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val * 10}k
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold font-mono">M{i+1}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Period: Last 7 Months</span>
            <span className="text-violet-400 font-black">+40% Growth</span>
          </div>
        </motion.div>
      </div>

      {/* Recommendation Logs */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex justify-between items-center p-4 border-b border-white/6">
          <h3 className="text-white font-bold text-base">Recommendation Logs</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all">
            <ListFilter className="w-3.5 h-3.5" /> Filter Log
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Log ID", "Student Name", "Target Program", "Recommended Uni", "Match Score", "Logged Time", "Action Status"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-slate-400">{log.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-white">{log.student}</td>
                  <td className="px-4 py-3.5 text-slate-300">{log.target}</td>
                  <td className="px-4 py-3.5 text-slate-300">{log.uni}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-400 font-black">{log.score}</td>
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-xs">{log.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.status === "applied" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      log.status === "saved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                    }`}>
                      {log.status}
                    </span>
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
