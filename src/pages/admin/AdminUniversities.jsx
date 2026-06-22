import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Eye, Edit, Trash2, Search, Globe, GraduationCap, FileCheck } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const UNIVERSITIES = [
  { name: "University of Toronto",     country: "🇨🇦 Canada",      rank: "#21", fee: "CAD 35k", apps: 342, status: "active",   programs: 280 },
  { name: "University of Manchester",  country: "🇬🇧 UK",          rank: "#28", fee: "£26k",    apps: 289, status: "active",   programs: 340 },
  { name: "University of Melbourne",   country: "🇦🇺 Australia",   rank: "#33", fee: "AUD 44k", apps: 201, status: "active",   programs: 220 },
  { name: "TU Munich",                 country: "🇩🇪 Germany",     rank: "#49", fee: "€500",    apps: 176, status: "active",   programs: 190 },
  { name: "McGill University",         country: "🇨🇦 Canada",      rank: "#46", fee: "CAD 29k", apps: 154, status: "active",   programs: 310 },
  { name: "ETH Zurich",                country: "🇨🇭 Switzerland", rank: "#7",  fee: "CHF 1.5k",apps: 98,  status: "pending",  programs: 160 },
  { name: "University of Amsterdam",   country: "🇳🇱 Netherlands", rank: "#61", fee: "€12k",    apps: 87,  status: "active",   programs: 200 },
  { name: "Seoul National University", country: "🇰🇷 South Korea", rank: "#41", fee: "KRW 2.5M",apps: 64,  status: "active",   programs: 140 },
  { name: "University of Auckland",    country: "🇳🇿 New Zealand", rank: "#87", fee: "NZD 32k", apps: 52,  status: "pending",  programs: 175 },
  { name: "University of Cape Town",   country: "🇿🇦 South Africa",rank: "#171",fee: "ZAR 85k", apps: 38,  status: "active",   programs: 120 },
];

const STATUS_MAP = {
  active:  { label: "Active",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pending: { label: "Pending", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

export default function AdminUniversities() {
  const [search, setSearch] = useState("");
  const filtered = UNIVERSITIES.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.country.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2"><Building2 className="w-6 h-6 text-emerald-400" /> University Management</h1>
          <p className="text-slate-400 text-sm mt-1">450+ partner institutions · 23 countries</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg"><Plus className="w-4 h-4" /> Add University</button>
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Universities",  val: "450+", color: "text-emerald-400", icon: Building2 },
          { label: "Partner Institutions",val: "380",  color: "text-blue-400",    icon: GraduationCap },
          { label: "Countries Covered",   val: "23",   color: "text-violet-400",  icon: Globe },
          { label: "Applications Received",val:"8,920",color: "text-orange-400",  icon: FileCheck },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex gap-3 p-4 border-b border-white/6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search universities..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["University","Country","Ranking","Tuition Fee","Programs","Applications","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600/30 to-teal-600/30 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-slate-200 font-semibold text-sm">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 text-sm whitespace-nowrap">{u.country}</td>
                  <td className="px-4 py-3.5"><span className="text-violet-400 font-bold text-sm">{u.rank}</span></td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono text-sm">{u.fee}</td>
                  <td className="px-4 py-3.5 text-slate-300 text-sm">{u.programs}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">{u.apps}</span>
                      <div className="w-12 h-1 bg-white/8 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((u.apps/350)*100, 100)}%` }} /></div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5"><span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_MAP[u.status].cls}`}>{STATUS_MAP[u.status].label}</span></td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[Eye, Edit, Trash2].map((Icon, j) => (
                        <button key={j} className={`p-1.5 rounded-lg transition-colors ${j === 2 ? "hover:bg-red-500/15 text-slate-400 hover:text-red-400" : "hover:bg-white/8 text-slate-400 hover:text-white"}`}><Icon className="w-3.5 h-3.5" /></button>
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
