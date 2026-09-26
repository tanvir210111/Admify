import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Coins, TrendingUp, CreditCard, Search, Landmark, RefreshCw,
  Plus, X, Filter, ArrowUpRight, ArrowDownRight, User, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

const TX_TYPES = ["all", "PURCHASE", "USAGE", "ADMIN_ADJUSTMENT", "WELCOME_CREDIT", "REFUND"];

export default function AdminWallet() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Adjustment modal
  const [adjustModal, setAdjustModal] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [creditType, setCreditType] = useState("paid");
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/admin/credits/transactions?type=${encodeURIComponent(typeFilter)}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data?.transactions || []);
      } else {
        toast.error(data.message || "Failed to load transactions");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to credit ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  // Search users for credit adjustment
  useEffect(() => {
    if (!userQuery.trim() || userQuery.trim().length < 2) {
      setSearchedUsers([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/admin/users?search=${encodeURIComponent(userQuery.trim())}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setSearchedUsers(data.data?.users || []);
        }
      } catch (e) {
        console.error(e);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [userQuery]);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Please select a recipient user");
      return;
    }
    const delta = Number(amount);
    if (isNaN(delta) || delta === 0) {
      toast.error("Please enter a valid non-zero amount");
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("A reason of at least 5 characters is required");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/credits/adjust", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          amount: delta,
          creditType,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Credits adjusted successfully");
        setAdjustModal(false);
        setSelectedUser(null);
        setUserQuery("");
        setAmount("");
        setReason("");
        fetchTransactions();
      } else {
        toast.error(data.message || "Failed to adjust credits");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setActionLoading(false);
    }
  };

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
        <div className="flex gap-2">
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

      {/* Real Ledger KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Ledger Entries", val: transactions.length, color: "text-violet-400" },
          { label: "Purchased Credits", val: `+${totalPurchased.toLocaleString()} CR`, color: "text-emerald-400" },
          { label: "Consumed on Services", val: `-${totalUsed.toLocaleString()} CR`, color: "text-rose-400" },
          { label: "Admin Adjustments", val: `${totalAdjusted >= 0 ? "+" : ""}${totalAdjusted.toLocaleString()} CR`, color: "text-amber-400" },
        ].map((k, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border"
            style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-slate-400 text-xs font-medium">{k.label}</p>
            <p className={`text-2xl font-black ${k.color} mt-1 font-mono`}>{k.val}</p>
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
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Transaction Reference</th>
                <th className="px-4 py-3 font-bold">User Account</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">Credit Amount</th>
                <th className="px-4 py-3 font-bold">Balance (Before → After)</th>
                <th className="px-4 py-3 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading ledger records...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
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
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.desc}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-200">{tx.user?.name || "System"}</p>
                        <p className="text-[10px] text-slate-500">{tx.user?.email || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/4 text-slate-300 border border-white/8">
                          {tx.type}
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
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
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
      <AnimatePresence>
        {adjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Manual Wallet Credit Adjustment
                </h3>
                <button onClick={() => setAdjustModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
                {/* User Search & Selection */}
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Target User Account <span className="text-red-400">*</span>
                  </label>
                  {selectedUser ? (
                    <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{selectedUser.name}</p>
                        <p className="text-[11px] text-slate-400">{selectedUser.email} · {selectedUser.role.toUpperCase()}</p>
                        <p className="text-amber-300 font-mono text-xs mt-0.5">Current Balance: {selectedUser.walletCredits || 0} CR</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 relative">
                      <input
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Search student or agency by name or email..."
                        className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                      {searchedUsers.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl">
                          {searchedUsers.map((u) => (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(u);
                                setSearchedUsers([]);
                                setUserQuery("");
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex justify-between items-center"
                            >
                              <div>
                                <p className="font-bold text-white">{u.name}</p>
                                <p className="text-[10px] text-slate-400">{u.email}</p>
                              </div>
                              <span className="font-mono text-amber-400 font-bold">{u.walletCredits || 0} CR</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Amount (+ or -) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 100 or -50"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Sub-Balance</label>
                    <select
                      value={creditType}
                      onChange={(e) => setCreditType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="paid">Paid Credits (Permanent)</option>
                      <option value="free">Free Welcome Credits</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Compliance Audit Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Document administrative purpose for financial balance adjustment..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setAdjustModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !selectedUser}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Commit Credit Adjustment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
