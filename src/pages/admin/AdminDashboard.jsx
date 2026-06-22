import React from "react";
import { motion } from "framer-motion";
import { Users, UserCheck, Building2, Award, FileCheck, Sparkles, TrendingUp, ArrowUpRight, RefreshCw, Download, Plus, Activity, Server, Database, Target, GraduationCap, BarChart3, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const KPIS = [
  { label: "Total Students",    value: "12,450", change: "+8.2%",  icon: GraduationCap, color: "from-violet-600 to-purple-700",  glow: "rgba(139,92,246,0.35)" },
  { label: "Total Agents",      value: "320",    change: "+4.1%",  icon: UserCheck,     color: "from-blue-600 to-cyan-600",      glow: "rgba(37,99,235,0.35)" },
  { label: "Partner Universities", value: "450+", change: "+15",   icon: Building2,     color: "from-emerald-600 to-teal-600",   glow: "rgba(5,150,105,0.35)" },
  { label: "Applications",      value: "8,920",  change: "+12.5%", icon: FileCheck,     color: "from-orange-500 to-amber-600",   glow: "rgba(234,88,12,0.35)" },
  { label: "Monthly Revenue",   value: "$184,200", change: "+18.3%", icon: TrendingUp,  color: "from-pink-600 to-rose-600",      glow: "rgba(219,39,119,0.35)" },
  { label: "AI Recommendations", value: "2.1M+", change: "+31.7%", icon: Sparkles,     color: "from-indigo-600 to-violet-600",  glow: "rgba(99,102,241,0.35)" },
];

const REV = [62,78,71,88,95,84,104,98,118,111,128,127];
const MONTHS = ["J","F","M","A","M","J","J","A","S","O","N","D"];

const ACTIVITIES = [
  { icon: "🎓", color: "bg-blue-500/15 text-blue-400",    title: "New Student Registered",   desc: "Ahmad Khalid — targeting UK universities",           time: "2m ago" },
  { icon: "📋", color: "bg-purple-500/15 text-purple-400", title: "Application Submitted",    desc: "Priya Sharma — University of Melbourne MSc",         time: "8m ago" },
  { icon: "💰", color: "bg-emerald-500/15 text-emerald-400", title: "Scholarship Matched",   desc: "$25k Global Excellence Award → Liu Wei",             time: "15m ago" },
  { icon: "🤝", color: "bg-orange-500/15 text-orange-400", title: "Agent Assigned",          desc: "Fatima Hassan → Agent James Thornton",               time: "32m ago" },
  { icon: "✍️", color: "bg-indigo-500/15 text-indigo-400", title: "SOP Generated",          desc: "AI generated SOP for Carlos Mendez — Stanford CS",   time: "1h ago" },
  { icon: "💳", color: "bg-pink-500/15 text-pink-400",     title: "Wallet Recharged",        desc: "Aisha Okafor topped up 500 credits ($49)",           time: "1h 20m ago" },
];

const AI_SVC = [
  { name: "Recommendation Engine", status: "online",   latency: "98ms",  acc: "94.2%", icon: Sparkles },
  { name: "Admission Predictor",   status: "online",   latency: "142ms", acc: "91.8%", icon: Target },
  { name: "SOP Generator",         status: "online",   latency: "3.2s",  acc: "97.1%", icon: FileCheck },
  { name: "Scholarship Matcher",   status: "degraded", latency: "380ms", acc: "89.4%", icon: Award },
  { name: "API Gateway",           status: "online",   latency: "12ms",  acc: "—",     icon: Server },
  { name: "Database Cluster",      status: "online",   latency: "4ms",   acc: "—",     icon: Database },
];

const APP_FUNNEL = [
  { label: "Submitted",     val: 8920, pct: 100, color: "bg-blue-500" },
  { label: "Under Review",  val: 5210, pct: 58,  color: "bg-violet-500" },
  { label: "Approved",      val: 3840, pct: 43,  color: "bg-emerald-500" },
  { label: "Rejected",      val: 1120, pct: 13,  color: "bg-red-500" },
];

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border ${className}`} style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
    {children}
  </div>
);

export default function AdminDashboard() {
  const maxRev = Math.max(...REV);
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Admify Platform — Real-time overview & management</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors"><RefreshCw className="w-4 h-4" /> Refresh</button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow"><Download className="w-4 h-4" /> Export</button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPIS.map((k, i) => (
          <motion.div key={i} variants={fade} className="rounded-2xl border p-4 hover:-translate-y-1 transition-transform cursor-default group relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className={`p-2 rounded-xl bg-gradient-to-br ${k.color} mb-3 w-fit shadow-lg`} style={{ boxShadow: `0 4px 14px ${k.glow}` }}>
              <k.icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-black text-white">{k.value}</p>
            <p className="text-slate-500 text-xs mt-0.5">{k.label}</p>
            <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5 mt-1"><ArrowUpRight className="w-3 h-3" />{k.change}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue + Application Funnel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <motion.div variants={fade} className="xl:col-span-3 p-6 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex justify-between items-center mb-5">
            <div><h2 className="text-lg font-bold text-white">Revenue Analytics</h2><p className="text-slate-500 text-xs mt-0.5">Monthly revenue — 2026</p></div>
            <div className="text-right"><p className="text-2xl font-black text-white">$184.2k</p><p className="text-emerald-400 text-xs flex items-center justify-end gap-0.5 mt-0.5"><ArrowUpRight className="w-3 h-3" />+18.3%</p></div>
          </div>
          <div className="flex items-end gap-1.5 h-32">
            {REV.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                <div className="w-full flex flex-col justify-end relative" style={{ height: "104px" }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(v / maxRev) * 100}%` }} transition={{ delay: i * 0.05, duration: 0.7, ease: "easeOut" }}
                    className="w-full rounded-t-md bg-gradient-to-t from-violet-700 to-blue-400 group-hover/bar:from-violet-500 group-hover/bar:to-cyan-300 transition-all" />
                </div>
                <span className="text-[8px] text-slate-600">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fade} className="xl:col-span-2 p-6 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="text-lg font-bold text-white mb-5">Application Analytics</h2>
          <div className="space-y-4">
            {APP_FUNNEL.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-300 font-medium">{s.label}</span>
                  <span className="text-white font-bold">{s.val.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }} className={`h-full rounded-full ${s.color}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 rounded-xl border border-violet-500/20 bg-violet-500/8">
            <p className="text-xs text-slate-400">Processing Rate</p>
            <p className="text-2xl font-black text-white mt-0.5">96.2% <span className="text-emerald-400 text-sm">↑ +2.1%</span></p>
          </div>
        </motion.div>
      </div>

      {/* AI Engine Status + Recent Activities */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <motion.div variants={fade} className="xl:col-span-2 p-6 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-violet-400" /> AI Engine Status</h2>
          <div className="space-y-2.5">
            {AI_SVC.map((s, i) => {
              const isOnline = s.status === "online";
              return (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? "bg-emerald-400" : "bg-yellow-400"} animate-pulse`} />
                    <span className="text-slate-300 text-xs font-medium">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-slate-400">{s.latency}</p>
                    {s.acc !== "—" && <p className="text-[10px] text-emerald-400">{s.acc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div variants={fade} className="xl:col-span-3 p-6 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h2 className="text-lg font-bold text-white mb-4">Recent Activities</h2>
          <div className="space-y-0">
            {ACTIVITIES.map((a, i) => (
              <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/2 rounded-xl px-2 transition-colors">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${a.color}`}>{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 text-sm font-semibold">{a.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5 truncate">{a.desc}</p>
                </div>
                <span className="text-slate-600 text-[10px] flex-shrink-0 pt-0.5">{a.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Add University",    icon: Building2,  color: "from-emerald-600 to-teal-600" },
            { label: "Add Scholarship",   icon: Award,      color: "from-yellow-600 to-orange-600" },
            { label: "Create Agent",      icon: UserCheck,  color: "from-blue-600 to-cyan-600" },
            { label: "Export Report",     icon: Download,   color: "from-violet-600 to-purple-600" },
          ].map((q, i) => (
            <button key={i} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r ${q.color} shadow-lg hover:opacity-90 hover:-translate-y-0.5 transition-all`}>
              <q.icon className="w-4 h-4" />{q.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
