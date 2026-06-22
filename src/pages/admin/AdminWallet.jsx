import React, { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Coins, TrendingUp, CreditCard, Search, Landmark } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const TRANSACTIONS = [
  { student: "Ahmad Khalid", amount: "$150", credits: "1,500 Cr", date: "2026-06-21 14:32", status: "completed" },
  { student: "Liu Wei", amount: "$50", credits: "500 Cr", date: "2026-06-21 12:15", status: "completed" },
  { student: "Sarah Jenkins", amount: "$250", credits: "2,500 Cr", date: "2026-06-20 18:40", status: "completed" },
  { student: "Amara Diallo", amount: "$100", credits: "1,000 Cr", date: "2026-06-20 10:05", status: "completed" },
  { student: "Carlos Ruiz", amount: "$150", credits: "1,500 Cr", date: "2026-06-19 16:55", status: "pending" },
  { student: "Yuki Tanaka", amount: "$50", credits: "500 Cr", date: "2026-06-19 09:30", status: "completed" },
  { student: "Emma Watson", amount: "$300", credits: "3,000 Cr", date: "2026-06-18 11:22", status: "failed" },
];

const STATUS_MAP = {
  completed: { label: "Completed", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  pending:   { label: "Pending",   cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  failed:    { label: "Failed",    cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminWallet() {
  const [search, setSearch] = useState("");
  const filtered = TRANSACTIONS.filter(t => t.student.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-violet-400" /> Wallet & Credits
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage platform credits sold to students, analyze purchasing metrics and transactions</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Credits Sold", val: "4.8M Cr", color: "text-violet-400", icon: Coins },
          { label: "Purchased Today", val: "145,000 Cr", color: "text-emerald-400", icon: Coins },
          { label: "Monthly Revenue", val: "$184,200", color: "text-blue-400", icon: TrendingUp },
          { label: "Pending Orders", val: "12", color: "text-yellow-400", icon: CreditCard },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Database Table */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex gap-3 p-4 border-b border-white/6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Student Name", "Paid Amount", "Credits Allocated", "Transaction Date", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-200">{t.student}</td>
                  <td className="px-4 py-3.5 text-slate-300 font-bold font-mono">{t.amount}</td>
                  <td className="px-4 py-3.5 text-violet-400 font-black font-mono">{t.credits}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{t.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_MAP[t.status].cls}`}>
                      {STATUS_MAP[t.status].label}
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
