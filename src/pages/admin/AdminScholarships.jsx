import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award, Plus, Edit, Trash2, Search, Calendar, Landmark, Coins, Users, FileCheck } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const SCHOLARSHIPS = [
  { name: "Global Excellence Scholarship", provider: "University of Toronto", amount: "CAD 15,000", deadline: "2026-11-30", apps: 245, status: "active" },
  { name: "Commonwealth Shared Scholarship", provider: "UK Government", amount: "Full Tuition + Stipend", deadline: "2026-12-15", apps: 412, status: "active" },
  { name: "Future Leaders Grant", provider: "University of Melbourne", amount: "AUD 20,000", deadline: "2027-01-10", apps: 188, status: "active" },
  { name: "DAAD Scholarships for Graduates", provider: "German Academic Exchange Service", amount: "€1,200 / Month", deadline: "2026-10-31", apps: 320, status: "active" },
  { name: "President's Admission Scholarship", provider: "McGill University", amount: "CAD 10,000", deadline: "2026-11-15", apps: 156, status: "active" },
  { name: "Swiss Government Excellence", provider: "Swiss Federal Govt", amount: "CHF 1,920 / Month", deadline: "2026-09-30", apps: 94, status: "pending" },
  { name: "Erasmus+ Joint Master Scholarship", provider: "European Union", amount: "€24,000 / Year", deadline: "2027-02-28", apps: 512, status: "active" },
  { name: "Gates Cambridge Scholarship", provider: "Gates Foundation", amount: "Full Cost of Study", deadline: "2026-12-01", apps: 389, status: "active" },
];

const STATUS_MAP = {
  active:  { label: "Active",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  expired: { label: "Expired", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminScholarships() {
  const [search, setSearch] = useState("");
  const filtered = SCHOLARSHIPS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-violet-400" /> Scholarship Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage global study grants, university merit scholarships, and financial awards</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Add Scholarship
        </button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Scholarships", val: "1,240+", color: "text-violet-400", icon: Award },
          { label: "Active Awards", val: "840", color: "text-emerald-400", icon: Coins },
          { label: "Awarded Students", val: "3,120", color: "text-blue-400", icon: Users },
          { label: "Total Applications", val: "24,890", color: "text-orange-400", icon: FileCheck },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
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
              placeholder="Search scholarships or providers..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Scholarship Name", "Provider", "Amount", "Deadline", "Applications", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-violet-400" />
                      </div>
                      <span className="text-slate-200 font-semibold">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.provider}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-emerald-400 font-bold font-mono">{s.amount}</td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.deadline}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{s.apps}</span>
                      <div className="w-12 h-1 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min((s.apps / 550) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_MAP[s.status].cls}`}>
                      {STATUS_MAP[s.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[Edit, Trash2].map((Icon, j) => (
                        <button
                          key={j}
                          className={`p-1.5 rounded-lg transition-colors ${j === 1 ? "hover:bg-red-500/15 text-slate-400 hover:text-red-400" : "hover:bg-white/8 text-slate-400 hover:text-white"}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
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
