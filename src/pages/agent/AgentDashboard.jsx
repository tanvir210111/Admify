import React from "react";
import { motion } from "framer-motion";
import {
  Users, FileCheck, CheckCircle2, TrendingUp, Landmark, FileText, Calendar,
  ArrowUpRight, UserPlus, Video, PhoneCall, Activity, Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const ACTIVITIES = [
  { text: "David Miller uploaded a new transcript for review", time: "3m ago", type: "document" },
  { text: "University of Manchester updated eligibility rules for MSc DS", time: "12m ago", type: "university" },
  { text: "Counselling Interview scheduled with Sarah Jenkins", time: "18m ago", type: "meeting" },
  { text: "Scholarship approved: $15,000 for Ahmad Khalid", time: "1h ago", type: "scholarship" },
  { text: "New application received from Ivan Petrov (TU Munich)", time: "3h ago", type: "application" },
];

export default function AgentDashboard() {
  const navigate = useNavigate();

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <LayoutDashboardIcon className="w-6 h-6 text-violet-400" /> Agent Workspace
          </h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, Sarah. Here is your student pipeline overview for today</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Students", val: "48", color: "text-violet-400", icon: Users },
          { label: "Submitted", val: "134", color: "text-blue-400", icon: FileCheck },
          { label: "Approved", val: "92", color: "text-emerald-400", icon: CheckCircle2 },
          { label: "Success Rate", val: "94.2%", color: "text-indigo-400", icon: TrendingUp },
          { label: "Monthly Earning", val: "$12,450", color: "text-emerald-400", icon: Landmark },
          { label: "Pending Review", val: "8", color: "text-yellow-400", icon: FileText },
          { label: "Meetings Today", val: "3", color: "text-orange-400", icon: Calendar },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-3.5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
            <div>
              <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
              <p className="text-slate-400 text-[11px] font-semibold mt-0.5 whitespace-nowrap">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions Row */}
      <motion.div variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <h3 className="text-white font-bold text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Add Student", icon: UserPlus, path: "/agent/students", color: "from-violet-600 to-indigo-600" },
            { label: "Review Documents", icon: FileText, path: "/agent/documents", color: "from-blue-600 to-indigo-600" },
            { label: "Create Meeting", icon: Video, path: "/agent/meetings", color: "from-purple-600 to-pink-600" },
            { label: "View Applications", icon: FileCheck, path: "/agent/applications", color: "from-emerald-600 to-teal-600" },
            { label: "Contact Student", icon: PhoneCall, path: "/agent/messages", color: "from-orange-600 to-amber-600" },
          ].map((act, i) => (
            <button key={i} onClick={() => navigate(act.path)} className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-gradient-to-br ${act.color} bg-opacity-10 hover:scale-[1.03] active:scale-[0.98] transition-all text-center gap-2 group`}>
              <act.icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">{act.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth & Applications Trend */}
        <motion.div variants={fade} className="lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold text-sm">Monthly Applications & Visa Success</h3>
                <p className="text-slate-500 text-xs mt-0.5">Year-over-year pipeline growth analysis</p>
              </div>
              <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24% Growth
              </span>
            </div>
            {/* Custom chart lines */}
            <div className="h-44 flex items-end gap-3 pb-2 pt-6 px-2 mt-4 border-b border-white/5">
              {[40, 52, 60, 68, 85, 96, 120].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full rounded-t-lg bg-gradient-to-t from-violet-600/40 to-blue-500/80 hover:brightness-125 transition-all" style={{ height: `${(val / 120) * 100}%` }}>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-[9px] font-bold text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val} apps
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div variants={fade} className="p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-1.5"><Activity className="w-4 h-4 text-violet-400" /> Recent Activities</h3>
            <div className="space-y-4">
              {ACTIVITIES.map((act, i) => (
                <div key={i} className="flex gap-3 items-start text-xs border-b border-white/4 pb-3 last:border-0 last:pb-0">
                  <span className="text-lg">
                    {act.type === "document" ? "📄" :
                     act.type === "university" ? "🎓" :
                     act.type === "meeting" ? "📅" :
                     act.type === "scholarship" ? "💰" : "📋"}
                  </span>
                  <div>
                    <p className="text-slate-300 leading-snug">{act.text}</p>
                    <p className="text-slate-600 text-[10px] mt-0.5 font-mono">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function LayoutDashboardIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
