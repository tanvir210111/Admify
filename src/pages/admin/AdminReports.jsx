import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileDown, RefreshCw, Calendar, ArrowUpRight, TrendingUp } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function AdminReports() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-violet-400" /> Reports & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Export executive summaries, analyze enrollment funnel conversion, and check platform performance</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={handleGenerate} disabled={loading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-lg transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Compiling..." : "Generate Report"}
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all">
            <FileDown className="w-3.5 h-3.5" /> PDF
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all">
            <FileDown className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </motion.div>

      {/* Advanced Analytics Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Revenue Chart Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Revenue Growth</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +14%</span>
          </div>
          <p className="text-2xl font-black text-white">$184.2k <span className="text-xs text-slate-500 font-normal">this month</span></p>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[30, 45, 38, 55, 68, 85, 96].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-violet-600 to-blue-500 rounded-t" style={{ height: `${val}%` }} />
            ))}
          </div>
        </motion.div>

        {/* 2. Students Growth Chart Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Active Students</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +21%</span>
          </div>
          <p className="text-2xl font-black text-white">12,450 <span className="text-xs text-slate-500 font-normal">registered</span></p>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[40, 52, 60, 68, 80, 92, 110].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-violet-600 to-violet-500 rounded-t" style={{ height: `${(val / 110) * 100}%` }} />
            ))}
          </div>
        </motion.div>

        {/* 3. Agents Performance Chart Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Assigned Agents</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +8%</span>
          </div>
          <p className="text-2xl font-black text-white">320 <span className="text-xs text-slate-500 font-normal">advisors</span></p>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[50, 55, 58, 62, 70, 75, 80].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t" style={{ height: `${(val / 80) * 100}%` }} />
            ))}
          </div>
        </motion.div>

        {/* 4. Applications Conversion Chart Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Applications Received</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +16%</span>
          </div>
          <p className="text-2xl font-black text-white">8,920 <span className="text-xs text-slate-500 font-normal">submited</span></p>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[35, 42, 50, 60, 72, 85, 95].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t" style={{ height: `${val}%` }} />
            ))}
          </div>
        </motion.div>

        {/* 5. Universities MOU Chart Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Partner Universities</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +5%</span>
          </div>
          <p className="text-2xl font-black text-white">450+ <span className="text-xs text-slate-500 font-normal">active partners</span></p>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[80, 82, 85, 88, 92, 95, 100].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-violet-600 to-blue-500 rounded-t" style={{ height: `${val}%` }} />
            ))}
          </div>
        </motion.div>

        {/* 6. Scholarships Awarded Chart Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">Scholarship Matching</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center"><ArrowUpRight className="w-3.5 h-3.5" /> +19%</span>
          </div>
          <p className="text-2xl font-black text-white">1,240 <span className="text-xs text-slate-500 font-normal font-mono">grants</span></p>
          <div className="h-32 flex items-end gap-2 mt-4">
            {[45, 52, 60, 72, 85, 94, 110].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-orange-600 to-orange-500 rounded-t" style={{ height: `${(val / 110) * 100}%` }} />
            ))}
          </div>
        </motion.div>

        {/* 7. AI Recommendations Performance Visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border md:col-span-2 lg:col-span-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-bold text-sm">AI Matchmaking Queries</h3>
            <span className="text-emerald-400 text-xs font-bold flex items-center bg-emerald-500/10 px-2 py-0.5 rounded-full"><ArrowUpRight className="w-3.5 h-3.5" /> +32%</span>
          </div>
          <p className="text-2xl font-black text-white">2.1M+ <span className="text-xs text-slate-500 font-normal">matches calculated</span></p>
          <div className="h-28 flex items-end gap-1.5 mt-4">
            {[30, 42, 38, 55, 60, 78, 65, 82, 90, 88, 98, 120].map((val, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-violet-600 via-blue-500 to-emerald-400 rounded-t" style={{ height: `${(val / 120) * 100}%` }} />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
