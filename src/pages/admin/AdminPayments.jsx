import React, { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, ArrowUpRight, CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const PAYMENTS = [
  { student: "Ahmad Khalid", amount: "$1,200", method: "Stripe (Visa)", txnId: "TXN-982180", date: "2026-06-21 14:32", status: "completed" },
  { student: "Liu Wei", amount: "$450", method: "PayPal", txnId: "TXN-821932", date: "2026-06-21 12:15", status: "completed" },
  { student: "Sarah Jenkins", amount: "$2,800", method: "Bank Wire", txnId: "TXN-109283", date: "2026-06-20 18:40", status: "completed" },
  { student: "Amara Diallo", amount: "$980", method: "Apple Pay", txnId: "TXN-720193", date: "2026-06-20 10:05", status: "completed" },
  { student: "Carlos Ruiz", amount: "$1,500", method: "Stripe (Mastercard)", txnId: "TXN-654920", date: "2026-06-19 16:55", status: "processing" },
  { student: "Yuki Tanaka", amount: "$3,400", method: "Bank Wire", txnId: "TXN-492019", date: "2026-06-19 09:30", status: "completed" },
  { student: "Emma Watson", amount: "$150", method: "PayPal", txnId: "TXN-321092", date: "2026-06-18 11:22", status: "refunded" },
];

const STATUS_MAP = {
  completed:  { label: "Completed",  cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  processing: { label: "Processing", cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
  refunded:   { label: "Refunded",   cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  failed:     { label: "Failed",     cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminPayments() {
  const [search, setSearch] = useState("");
  const filtered = PAYMENTS.filter(p =>
    p.student.toLowerCase().includes(search.toLowerCase()) ||
    p.txnId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-violet-400" /> Revenue & Payments
          </h1>
          <p className="text-slate-400 text-sm mt-1">Monitor billing logs, university application deposit payments, agent referral fees, and transaction refunds</p>
        </div>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" /> Gateway Connected
          </span>
        </div>
      </motion.div>

      {/* Monthly Chart Visual & Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Performance Graph Visual */}
        <motion.div variants={fade} className="lg:col-span-2 p-5 rounded-2xl border flex flex-col justify-between" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm font-semibold">Monthly Platform Revenue</p>
                <h3 className="text-3xl font-black text-white mt-1">$184,200</h3>
              </div>
              <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.8%
              </span>
            </div>

            {/* Custom styled CSS graph block representing monthly revenue */}
            <div className="h-48 flex items-end gap-3.5 pb-2 pt-6 px-4 mt-4 border-b border-white/5">
              {[45, 62, 54, 78, 85, 96, 120].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="relative w-full rounded-t-xl bg-gradient-to-t from-violet-600 to-blue-500 hover:brightness-125 transition-all" style={{ height: `${(val / 120) * 100}%` }}>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 rounded px-1.5 py-0.5 text-[9px] font-bold text-violet-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      ${val}k
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold font-mono">Month {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment Gateways Breakdown */}
        <motion.div variants={fade} className="p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-white font-bold text-base mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {[
              { name: "Stripe Credit Card", share: "58%", val: "$106,836", color: "bg-violet-500" },
              { name: "Bank Wire Transfers", share: "22%", val: "$40,524", color: "bg-blue-500" },
              { name: "PayPal Express", share: "12%", val: "$22,104", color: "bg-emerald-500" },
              { name: "Apple Pay Mobile", share: "8%", val: "$14,736", color: "bg-yellow-500" },
            ].map((g, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{g.name}</span>
                  <span className="text-slate-400 font-mono">{g.share} · <span className="text-white font-bold">{g.val}</span></span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${g.color} rounded-full`} style={{ width: g.share }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Billing Log Table */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex gap-3 p-4 border-b border-white/6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or transaction ID..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Student Name", "Amount Paid", "Gateway Method", "Transaction ID", "Billing Date", "Status"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-slate-200">{p.student}</td>
                  <td className="px-4 py-3.5 text-slate-300 font-bold font-mono">{p.amount}</td>
                  <td className="px-4 py-3.5 text-slate-400">{p.method}</td>
                  <td className="px-4 py-3.5 font-mono text-violet-400 font-bold">{p.txnId}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{p.date}</td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${STATUS_MAP[p.status].cls}`}>
                      {STATUS_MAP[p.status].label}
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
