import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins, Plus, Minus, X, AlertTriangle, ShieldAlert,
  CheckCircle2, ArrowRight, RefreshCw, User, Search
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

export default function AdminCreditAdjustmentModal({
  isOpen,
  onClose,
  targetStudent = null,
  onSuccess,
}) {
  const [selectedUser, setSelectedUser] = useState(targetStudent);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Form states
  const [actionType, setActionType] = useState("ADD"); // "ADD" or "REMOVE"
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [creditType, setCreditType] = useState("paid"); // "paid" or "free"

  // Confirmation step
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Update selectedUser when targetStudent prop changes
  useEffect(() => {
    setSelectedUser(targetStudent);
    setShowConfirm(false);
  }, [targetStudent, isOpen]);

  // Debounced search for student users if targetStudent is not provided
  useEffect(() => {
    if (targetStudent) return;
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/admin/users?role=student&search=${encodeURIComponent(searchQuery)}`);
        const users = res?.data?.users || res?.users || [];
        setSearchResults(users);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, targetStudent]);

  if (!isOpen) return null;

  const currentBalance = Number(selectedUser?.walletCredits) || 0;
  const parsedAmount = parseInt(amount, 10);
  const isValidAmount = Number.isInteger(parsedAmount) && parsedAmount > 0;
  const isRemove = actionType === "REMOVE";
  const isInsufficient = isRemove && isValidAmount && parsedAmount > currentBalance;

  const resultingBalance = isValidAmount
    ? isRemove
      ? Math.max(0, currentBalance - parsedAmount)
      : currentBalance + parsedAmount
    : currentBalance;

  const handleValidateAndProceed = (e) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error("Please select a student user.");
      return;
    }
    if (!isValidAmount) {
      toast.error("Credit amount must be a positive integer.");
      return;
    }
    if (isRemove && parsedAmount > currentBalance) {
      toast.error(`Cannot remove ${parsedAmount} CR. Student only has ${currentBalance} CR available.`);
      return;
    }
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error("Reason is required and must be at least 5 characters.");
      return;
    }

    // Advance to confirmation step
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post("/api/admin/credits/adjust", {
        userId: selectedUser._id,
        action: actionType,
        direction: actionType === "REMOVE" ? "DEBIT" : "CREDIT",
        amount: parsedAmount,
        creditType,
        reason: reason.trim(),
        note: note ? note.trim() : undefined,
      });

      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || "Wallet credits adjusted successfully!");
        if (onSuccess) {
          onSuccess(res?.data || res);
        }
        handleClose();
      } else {
        toast.error(res?.message || res?.data?.message || "Adjustment failed");
        setShowConfirm(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message || "Failed to process adjustment");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    setShowConfirm(false);
    setAmount("");
    setReason("");
    setNote("");
    setActionType("ADD");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        style={{ background: "#0B1228" }}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-white/2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manual Credit Adjustment</h3>
              <p className="text-[11px] text-slate-400">
                Controlled atomic wallet balance mutation with immutable audit trail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!showConfirm ? (
          <form onSubmit={handleValidateAndProceed} className="p-6 space-y-4 text-xs">
            {/* Target Student Display / Selector */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center justify-between">
                <span>Target Student Account <span className="text-rose-400">*</span></span>
                {selectedUser && !targetStudent && (
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-slate-400 hover:text-amber-400 text-[10px] underline"
                  >
                    Change Student
                  </button>
                )}
              </label>

              {selectedUser ? (
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-xs uppercase">
                      {selectedUser.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">{selectedUser.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Current Balance</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">
                      {selectedUser.walletCredits ?? 0} CR
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type student name or email..."
                      className="w-full bg-white/4 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  {isSearching && (
                    <p className="text-[10px] text-slate-400 mt-1">Searching student records...</p>
                  )}
                  {searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50 p-1 shadow-2xl space-y-0.5">
                      {searchResults.map((u) => (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(u);
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-white/5 text-xs flex justify-between items-center transition-colors"
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

            {/* Adjustment Type: ADD vs REMOVE (Segmented Toggle) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">
                Adjustment Action <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/4 border border-white/8">
                <button
                  type="button"
                  onClick={() => setActionType("ADD")}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    actionType === "ADD"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> ADD CREDITS
                </button>
                <button
                  type="button"
                  onClick={() => setActionType("REMOVE")}
                  className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    actionType === "REMOVE"
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" /> REMOVE CREDITS
                </button>
              </div>
            </div>

            {/* Credit Amount & Sub-balance type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Credit Amount <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50"
                    className={`w-full bg-white/4 border rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none transition-colors ${
                      isInsufficient
                        ? "border-rose-500 focus:border-rose-400"
                        : "border-white/10 focus:border-amber-500"
                    }`}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">CR</span>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Credit Sub-Balance
                </label>
                <select
                  value={creditType}
                  onChange={(e) => setCreditType(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                >
                  <option value="paid">Paid Credits (Permanent)</option>
                  <option value="free">Free Welcome Credits</option>
                </select>
              </div>
            </div>

            {/* Insufficient balance error message */}
            {isInsufficient && (
              <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center gap-2 text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>
                  Insufficient balance: Cannot remove {parsedAmount} CR from student with balance {currentBalance} CR.
                </span>
              </div>
            )}

            {/* Live Balance Transition Preview */}
            {isValidAmount && !isInsufficient && (
              <div className="p-3 rounded-xl border border-white/8 bg-white/2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Balance Preview:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-300">{currentBalance} CR</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className={`font-bold ${isRemove ? "text-rose-400" : "text-emerald-400"}`}>
                    {isRemove ? `-${parsedAmount}` : `+${parsedAmount}`} CR
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-white font-extrabold text-sm">{resultingBalance} CR</span>
                </div>
              </div>
            )}

            {/* Reason / Description (Required, >= 5 chars) */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Reason / Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Audit explanation (e.g., Promotional goodwill bonus, Duplicate charge correction)..."
                className="w-full bg-white/4 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 text-xs"
                required
              />
              <p className="text-[10px] text-slate-500 mt-0.5">
                Required for compliance ledger. Minimum 5 characters.
              </p>
            </div>

            {/* Optional Admin Note */}
            <div>
              <label className="text-slate-400 font-medium block mb-1">
                Internal Admin Note <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Confidential remarks for administrative review..."
                className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedUser || !isValidAmount || isInsufficient || reason.trim().length < 5}
                className={`px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed ${
                  actionType === "REMOVE"
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                Review Adjustment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Explicit Confirmation Step */
          <div className="p-6 space-y-4 text-xs">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              actionType === "REMOVE"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}>
              {actionType === "REMOVE" ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-white font-bold text-sm">
                  {actionType === "REMOVE"
                    ? `Are you sure you want to remove ${parsedAmount} CR from this student's wallet?`
                    : `Add ${parsedAmount} CR to this student's wallet?`}
                </h4>
                <p className="text-[11px] mt-1 opacity-90">
                  This transaction is immutable and will be permanently recorded in the Admify credit ledger and admin audit logs.
                </p>
              </div>
            </div>

            {/* Summary Breakdown */}
            <div className="p-4 rounded-xl bg-white/3 border border-white/8 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Student:</span>
                <span className="text-white font-bold">{selectedUser.name} ({selectedUser.email})</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Current Balance:</span>
                <span className="font-mono text-slate-300">{currentBalance} CR</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Adjustment:</span>
                <span className={`font-mono font-bold ${actionType === "REMOVE" ? "text-rose-400" : "text-emerald-400"}`}>
                  {actionType === "REMOVE" ? `-${parsedAmount}` : `+${parsedAmount}`} CR ({actionType})
                </span>
              </div>
              <div className="border-t border-white/8 pt-2 flex justify-between items-center text-slate-300 font-bold">
                <span>New Wallet Balance:</span>
                <span className="font-mono text-amber-400 text-sm">{resultingBalance} CR</span>
              </div>
              <div className="pt-1 text-[11px] text-slate-400">
                <span className="block font-semibold text-slate-300">Reason:</span>
                <span className="italic">"{reason.trim()}"</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold transition-colors disabled:opacity-50"
              >
                Back to Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={submitting}
                className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  actionType === "REMOVE"
                    ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                }`}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Adjustment...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-3.5 h-3.5" />
                    <span>Confirm & Commit Ledger Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
