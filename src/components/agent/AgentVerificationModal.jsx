import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Key, ShieldCheck, X, FileText, AlertCircle, ArrowRight } from "lucide-react";

export default function AgentVerificationModal({
  isOpen,
  onClose,
  onVerify,
  isSubmitting = false,
  initialEmail = "",
}) {
  const [agencyId, setAgencyId] = useState("");
  const [agentApplicationId, setAgentApplicationId] = useState("");
  const [activationCode, setActivationCode] = useState("");
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    if (!agencyId.trim()) {
      setLocalError("Agency ID is required.");
      return;
    }
    if (!agentApplicationId.trim()) {
      setLocalError("Agent Application ID is required.");
      return;
    }
    if (!activationCode.trim()) {
      setLocalError("Activation Code is required.");
      return;
    }

    onVerify({
      agencyId: agencyId.trim(),
      agentApplicationId: agentApplicationId.trim().toUpperCase(),
      activationCode: activationCode.trim().toUpperCase(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-purple-950/40 overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Agent Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify approved agency accreditation to complete agent registration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 pt-4">
          <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-500/25 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Agents operate exclusively under an approved study-abroad Agency. Enter the credentials issued by your sponsoring Agency and verified by Admify Admin.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {localError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{localError}</span>
            </motion.div>
          )}

          {/* 1. Agency ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Agency ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative group">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                required
                value={agencyId}
                onChange={(e) => {
                  setAgencyId(e.target.value);
                  if (localError) setLocalError("");
                }}
                placeholder="e.g. ADM-AGY-2026-XXXX or Agency Identifier"
                className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Your sponsoring agency's official registration or reference ID.
            </p>
          </div>

          {/* 2. Agent Application ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Agent Application ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative group">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                required
                value={agentApplicationId}
                onChange={(e) => {
                  setAgentApplicationId(e.target.value);
                  if (localError) setLocalError("");
                }}
                placeholder="e.g. AGT-APP-20260925-0042"
                className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono uppercase"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The unique application reference generated when your agency nominated you.
            </p>
          </div>

          {/* 3. Activation Code */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Activation Code <span className="text-rose-400">*</span>
            </label>
            <div className="relative group">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                required
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value);
                  if (localError) setLocalError("");
                }}
                placeholder="e.g. ADM-AGT-7K4P9X"
                className="w-full bg-slate-800/60 border border-slate-700/70 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono uppercase tracking-wider"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Single-use secure code issued by Admify Admin upon application approval.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
