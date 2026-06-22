import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserCheck, Plus, Eye, Edit, Trash2, CheckCircle2, XCircle, Star, TrendingUp } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const AGENTS = [
  { name: "James Thornton",  agency: "GlobalStudy UK",     students: 48, revenue: "$22,400", rate: 94, status: "active",    rating: 4.9, country: "🇬🇧 UK" },
  { name: "Mei Lin",         agency: "Pacific Edu Group",  students: 62, revenue: "$31,200", rate: 91, status: "active",    rating: 4.8, country: "🇦🇺 Australia" },
  { name: "Rahul Verma",     agency: "Apex Consultancy",   students: 55, revenue: "$28,600", rate: 88, status: "active",    rating: 4.7, country: "🇮🇳 India" },
  { name: "Sophie Laurent",  agency: "EduConnect France",  students: 41, revenue: "$19,800", rate: 96, status: "active",    rating: 4.9, country: "🇫🇷 France" },
  { name: "Ahmed Nasser",    agency: "MidEast Admissions", students: 33, revenue: "$16,500", rate: 85, status: "pending",   rating: 4.5, country: "🇦🇪 UAE" },
  { name: "Grace Mwangi",    agency: "AfriStudy Hub",      students: 27, revenue: "$13,200", rate: 89, status: "active",    rating: 4.6, country: "🇰🇪 Kenya" },
  { name: "Ivan Petrov",     agency: "EuroPath Agency",    students: 19, revenue: "$9,400",  rate: 78, status: "suspended", rating: 3.8, country: "🇷🇺 Russia" },
  { name: "Fatou Diallo",    agency: "WestAfrica Edu",     students: 22, revenue: "$11,000", rate: 82, status: "pending",   rating: 4.2, country: "🇸🇳 Senegal" },
];

const STATUS_MAP = {
  active:    { label: "Active",    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pending:   { label: "Pending",   cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  suspended: { label: "Suspended", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminAgents() {
  const [filter, setFilter] = useState("all");

  const filtered = AGENTS.filter(a => filter === "all" || a.status === filter);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2"><UserCheck className="w-6 h-6 text-blue-400" /> Agent Management</h1>
          <p className="text-slate-400 text-sm mt-1">320 agents across 45+ countries</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg"><Plus className="w-4 h-4" /> Create Agent</button>
      </motion.div>

      {/* KPI */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Agents",  val: "320",  color: "text-blue-400",    icon: UserCheck },
          { label: "Active Agents", val: "284",  color: "text-emerald-400", icon: CheckCircle2 },
          { label: "Pending",       val: "28",   color: "text-yellow-400",  icon: Star },
          { label: "Success Rate",  val: "89.5%",color: "text-violet-400",  icon: TrendingUp },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={fade} className="flex gap-2">
        {["all","active","pending","suspended"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors capitalize ${filter === f ? "bg-violet-600/25 text-violet-300 border border-violet-500/30" : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"}`}>
            {f}
          </button>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Agent","Agency","Country","Assigned Students","Revenue Generated","Success Rate","Rating","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => {
                const st = STATUS_MAP[a.status];
                return (
                  <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600/40 to-cyan-600/40 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                          {a.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                        </div>
                        <span className="text-slate-200 font-semibold text-sm whitespace-nowrap">{a.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-sm whitespace-nowrap">{a.agency}</td>
                    <td className="px-4 py-3.5 text-slate-300 text-sm">{a.country}</td>
                    <td className="px-4 py-3.5 text-white font-bold text-sm">{a.students}</td>
                    <td className="px-4 py-3.5 text-emerald-400 font-bold text-sm font-mono">{a.revenue}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden"><div className={`h-full rounded-full ${a.rate >= 90 ? "bg-emerald-500" : "bg-yellow-500"}`} style={{ width: `${a.rate}%` }} /></div>
                        <span className="text-xs font-bold text-slate-300">{a.rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-yellow-400 text-xs font-bold">{a.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-emerald-500/15 text-slate-400 hover:text-emerald-400 transition-colors" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors" title="Suspend"><XCircle className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/15 text-slate-400 hover:text-red-400 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
