import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Plus, Eye, Edit, Trash2, Download, ChevronUp, ChevronDown, Users } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const STUDENTS = [
  { name: "Ahmad Khalid",    email: "ahmad@example.com",  country: "🇬🇧 UK / Canada",    degree: "M.Sc. CS",         gpa: "3.8", ielts: "7.5", match: 95, status: "approved" },
  { name: "Priya Sharma",    email: "priya@gmail.com",    country: "🇦🇺 Australia",       degree: "MBA",              gpa: "3.6", ielts: "7.0", match: 88, status: "in_review" },
  { name: "Liu Wei",         email: "liu.wei@uni.cn",     country: "🇺🇸 USA",             degree: "Ph.D. AI",         gpa: "3.9", ielts: "8.0", match: 97, status: "approved" },
  { name: "Fatima Al-Hassan",email: "fatima@email.com",   country: "🇩🇪 Germany",         degree: "M.Eng.",           gpa: "3.4", ielts: "6.5", match: 79, status: "pending" },
  { name: "Carlos Mendez",   email: "carlos@mail.mx",     country: "🇨🇦 Canada",          degree: "M.Sc. Data Sci",   gpa: "3.7", ielts: "7.0", match: 91, status: "in_review" },
  { name: "Aisha Okafor",    email: "aisha@example.ng",   country: "🇬🇧 UK",              degree: "MBA",              gpa: "3.5", ielts: "6.5", match: 82, status: "pending" },
  { name: "Ravi Kumar",      email: "ravi@example.in",    country: "🇨🇦 Canada / 🇦🇺 AU", degree: "M.Sc. CS",         gpa: "3.8", ielts: "7.5", match: 93, status: "approved" },
  { name: "Emma Johnson",    email: "emma@example.uk",    country: "🇺🇸 USA",             degree: "M.A. Economics",   gpa: "3.9", ielts: "—",   match: 96, status: "approved" },
  { name: "Yusuf Adebayo",   email: "yusuf@mail.ng",      country: "🇩🇪 Germany",         degree: "M.Sc. Finance",    gpa: "3.3", ielts: "6.0", match: 74, status: "rejected" },
  { name: "Sofia Petrov",    email: "sofia@mail.ru",      country: "🇬🇧 UK",              degree: "M.Sc. Marketing",  gpa: "3.7", ielts: "7.5", match: 89, status: "in_review" },
];

const STATUS_MAP = {
  approved:  { label: "Approved",   cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  in_review: { label: "In Review",  cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  pending:   { label: "Pending",    cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  rejected:  { label: "Rejected",   cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = STUDENTS.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2"><Users className="w-6 h-6 text-violet-400" /> Student Management</h1>
          <p className="text-slate-400 text-sm mt-1">12,450 registered students · 847 added this month</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/8 text-slate-300 text-sm rounded-xl hover:bg-white/8 transition-colors"><Download className="w-4 h-4" /> Export</button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl"><Plus className="w-4 h-4" /> Add Student</button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students",   val: "12,450", color: "text-violet-400" },
          { label: "Approved",         val: "3,840",  color: "text-emerald-400" },
          { label: "In Review",        val: "2,710",  color: "text-blue-400" },
          { label: "Pending",          val: "4,780",  color: "text-yellow-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters + Table */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-white/6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all" />
          </div>
          <div className="flex gap-2">
            {["all", "approved", "in_review", "pending", "rejected"].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors capitalize ${statusFilter === f ? "bg-violet-600/30 text-violet-300 border border-violet-500/30" : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"}`}>
                {f === "all" ? "All" : STATUS_MAP[f]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Student","Email","Country Pref.","Target Degree","GPA","IELTS","AI Match","Status","Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const st = STATUS_MAP[s.status];
                return (
                  <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600/40 to-blue-600/40 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                          {s.name.split(" ").map(w => w[0]).join("").slice(0,2)}
                        </div>
                        <span className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors whitespace-nowrap">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{s.email}</td>
                    <td className="px-4 py-3.5 text-slate-300 text-sm whitespace-nowrap">{s.country}</td>
                    <td className="px-4 py-3.5 text-slate-300 text-sm whitespace-nowrap">{s.degree}</td>
                    <td className="px-4 py-3.5">
                      <span className={`font-bold text-sm ${parseFloat(s.gpa) >= 3.7 ? "text-emerald-400" : parseFloat(s.gpa) >= 3.4 ? "text-yellow-400" : "text-orange-400"}`}>{s.gpa}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 text-sm font-mono">{s.ielts}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-white/8 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.match >= 90 ? "bg-emerald-500" : s.match >= 80 ? "bg-yellow-500" : "bg-orange-500"}`} style={{ width: `${s.match}%` }} /></div>
                        <span className={`text-xs font-bold ${s.match >= 90 ? "text-emerald-400" : s.match >= 80 ? "text-yellow-400" : "text-orange-400"}`}>{s.match}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[Eye, Edit, Trash2].map((Icon, j) => (
                          <button key={j} className={`p-1.5 rounded-lg transition-colors ${j === 2 ? "hover:bg-red-500/15 text-slate-400 hover:text-red-400" : "hover:bg-white/8 text-slate-400 hover:text-white"}`}><Icon className="w-3.5 h-3.5" /></button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center px-4 py-3 border-t border-white/6">
          <span className="text-slate-500 text-xs">Showing {filtered.length} of 12,450 students</span>
          <div className="flex gap-1">
            {[1,2,3,"...",124].map((p, i) => (
              <button key={i} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === 1 ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-white/8"}`}>{p}</button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
