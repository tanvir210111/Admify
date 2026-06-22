import React, { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, Search, FileDown, Eye, Coins, TrendingUp } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const COMMISSIONS = [
  { student: "Ahmad Khalid", university: "University of Toronto", amount: "$1,240", date: "2026-06-20", status: "Paid" },
  { student: "Liu Wei", university: "University of Manchester", amount: "$980", date: "2026-06-19", status: "Paid" },
  { student: "Amara Diallo", university: "TU Munich", amount: "$450", date: "2026-06-18", status: "Pending" },
  { student: "Sarah Jenkins", university: "University of Melbourne", amount: "$1,120", date: "2026-06-15", status: "Processing" },
  { student: "Yuki Tanaka", university: "ETH Zurich", amount: "$1,450", date: "2026-06-10", status: "Paid" },
];

export default function AgentCommissions() {
  const [search, setSearch] = useState("");
  const filtered = COMMISSIONS.filter(c => c.student.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-violet-400" /> Commission Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track monthly referral earnings, pending university commission invoices, and payouts history</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Monthly Earnings", val: "$12,450", color: "text-violet-400", icon: Coins },
          { label: "Total Earnings", val: "$84,920", color: "text-emerald-400", icon: TrendingUp },
          { label: "Pending Payouts", val: "$2,850", color: "text-yellow-400", icon: Landmark },
          { label: "Paid Commissions", val: "$82,070", color: "text-indigo-400", icon: Coins },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Double Column: Charts & Transaction Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings chart visual */}
        <motion.div variants={fade} className="p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white font-bold text-sm mb-1">Earning Progress</h3>
            <p className="text-slate-500 text-xs mb-4">Commissions earned by target country destinations</p>
            <div className="space-y-3.5">
              {[
                { name: "Canada Partnerships", pct: "48%", val: "$5,976", color: "bg-violet-500" },
                { name: "UK Partner universities", pct: "26%", val: "$3,237", color: "bg-blue-500" },
                { name: "Australia merit courses", pct: "18%", val: "$2,241", color: "bg-emerald-500" },
                { name: "Germany technical modules", pct: "8%", val: "$996", color: "bg-yellow-500" },
              ].map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-slate-400 font-mono">{c.pct} · <span className="text-white font-bold">{c.val}</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: c.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Transaction log table */}
        <motion.div variants={fade} className="lg:col-span-2 rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-3 p-4 border-b border-white/6 items-center justify-between">
            <h3 className="text-white font-bold text-sm">Payout Registry</h3>
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student..."
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                  {["Student", "University", "Commission Earning", "Date Issued", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3.5 font-semibold text-slate-200">{c.student}</td>
                    <td className="px-4 py-3.5 text-slate-300 text-xs">{c.university}</td>
                    <td className="px-4 py-3.5 text-emerald-400 font-bold font-mono">{c.amount}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{c.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        c.status === "Processing" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                        "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/8" title="Download Invoice Receipt">
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/8" title="View Commission Details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
