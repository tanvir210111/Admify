import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Coins, TrendingUp, CreditCard, Search, Landmark, RefreshCw,
  Plus, X, Filter, ArrowUpRight, ArrowDownRight, User, ShieldCheck, Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import AdminCreditAdjustmentModal from "../../components/admin/AdminCreditAdjustmentModal";

const TX_TYPES = ["all", "PURCHASE", "USAGE", "ADMIN_ADJUSTMENT", "WELCOME_CREDIT", "REFUND"];

export default function AdminWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Adjustment modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [syncingWelcome, setSyncingWelcome] = useState(false);

  const handleSyncWelcome = async () => {
    setSyncingWelcome(true);
    try {
      const res = await api.post("/api/admin/credits/sync-welcome-ledger");
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || "Welcome credit ledger synchronized!");
        fetchTransactions();
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to sync welcome credits");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to sync welcome credits");
    } finally {
      setSyncingWelcome(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/credits/transactions?type=${encodeURIComponent(typeFilter)}&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      const isSuccess = res?.success || res?.data?.success;
      const txs = res?.data?.transactions || res?.transactions || [];
      if (isSuccess) {
        setTransactions(txs);
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to load transactions");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message || "Failed to connect to credit ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  // Metrics from real ledger
  const totalPurchased = transactions
    .filter((tx) => tx.type === "PURCHASE")
    .reduce((acc, curr) => acc + (curr.credits || 0), 0);

  const totalUsed = transactions
    .filter((tx) => tx.type === "USAGE")
    .reduce((acc, curr) => acc + Math.abs(curr.credits || 0), 0);

  const totalAdjusted = transactions
    .filter((tx) => tx.type === "ADMIN_ADJUSTMENT")
    .reduce((acc, curr) => acc + (curr.credits || 0), 0);

  const totalWelcome = transactions
    .filter((tx) => tx.type === "WELCOME_CREDIT")
    .reduce((acc, curr) => acc + (curr.credits || 0), 0);

  const totalRefunds = transactions
    .filter((tx) => tx.type === "REFUND")
    .reduce((acc, curr) => acc + (curr.credits || 0), 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Coins className="w-6 h-6 text-amber-400" /> Platform Credit Ledger & Wallets
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Double-entry credit audit trail, manual controlled adjustments, and usage analytics (1 Credit = ৳100)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSyncWelcome}
            disabled={syncingWelcome}
            className="flex items-center gap-2 px-3.5 py-2 bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
            title="Safely sync missing welcome credit ledger records for registered students"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> {syncingWelcome ? "Syncing..." : "Sync Welcome Credits"}
          </button>
          <button
            onClick={() => setAdjustModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Adjust Credits
          </button>
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Real Ledger KPI Summary (6 KPI Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {[
          { label: "Total Ledger Entries", val: transactions.length, color: "text-violet-400" },
          { label: "Purchased Credits", val: `+${totalPurchased.toLocaleString()} CR`, color: "text-emerald-400" },
          { label: "Consumed on Services", val: `-${totalUsed.toLocaleString()} CR`, color: "text-rose-400" },
          { label: "Admin Adjustments", val: `${totalAdjusted >= 0 ? "+" : ""}${totalAdjusted.toLocaleString()} CR`, color: "text-amber-400" },
          { label: "Welcome Credits", val: `+${totalWelcome.toLocaleString()} CR`, color: "text-sky-400" },
          { label: "Refunds", val: `+${totalRefunds.toLocaleString()} CR`, color: "text-purple-400" },
        ].map((k, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border"
            style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-slate-400 text-xs font-medium truncate">{k.label}</p>
            <p className={`text-xl xl:text-2xl font-black ${k.color} mt-1 font-mono truncate`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Toolbar: Search + Filter */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by TxID, user, or description..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {TX_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                typeFilter === t
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/30"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {t === "all" ? "All Types" : t.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Transaction Reference</th>
                <th className="px-4 py-3 font-bold">User Account</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Credit Amount</th>
                <th className="px-4 py-3 font-bold">Balance (Before → After)</th>
                <th className="px-4 py-3 font-bold">Reason / Description</th>
                <th className="px-4 py-3 font-bold">Originator</th>
                <th className="px-4 py-3 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    Loading ledger records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                    No transactions found in ledger.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isPositive = (tx.credits || 0) > 0;
                  return (
                    <tr
                      key={tx._id || tx.transactionId}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                    >
                      <td className="px-4 py-3.5">
                        <p className="font-mono text-xs font-bold text-white">{tx.transactionId}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{tx.referenceId || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-200">{tx.user?.name || "System"}</p>
                        <p className="text-[10px] text-slate-500">{tx.user?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          tx.type === 'WELCOME_CREDIT'
                            ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                            : tx.type === 'PURCHASE'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : tx.type === 'USAGE'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : tx.type === 'ADMIN_ADJUSTMENT'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : tx.type === 'REFUND'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-white/4 text-slate-300 border-white/8'
                        }`}>
                          {tx.type?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit ${
                            isPositive
                              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                              : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                          }`}
                        >
                          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {isPositive ? `+${tx.credits}` : tx.credits} CR
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-300">
                        {tx.balanceBefore !== undefined ? tx.balanceBefore : "—"} →{" "}
                        <strong className="text-white">{tx.balanceAfter !== undefined ? tx.balanceAfter : "—"}</strong> CR
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 text-[11px] max-w-xs">
                        <p className="truncate" title={tx.reason || tx.desc}>
                          {tx.reason || tx.desc || "—"}
                        </p>
                        {tx.note && (
                          <p className="text-[10px] text-slate-500 italic truncate" title={tx.note}>
                            Note: {tx.note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {tx.adminName || tx.adminEmail ? (
                          <div>
                            <p className="text-slate-200 font-semibold">{tx.adminName || "Admin"}</p>
                            {tx.adminEmail && <p className="text-[10px] text-slate-500">{tx.adminEmail}</p>}
                          </div>
                        ) : tx.type === 'WELCOME_CREDIT' ? (
                          <span className="text-sky-400 text-[10px]">System (Registration)</span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">System</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Controlled Credit Adjustment Modal ── */}
      <AdminCreditAdjustmentModal
        isOpen={adjustModal}
        onClose={() => setAdjustModal(false)}
        onSuccess={() => {
          fetchTransactions();
        }}
      />

    </div>
  );
}
