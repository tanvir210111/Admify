import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Lock,
  Bell,
  ShieldCheck,
  Save,
  RefreshCw,
  KeyRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [partnershipAlerts, setPartnershipAlerts] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters.");
        return;
      }
      if (!currentPassword) {
        toast.error("Current password is required to update password.");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        emailAlerts,
        partnershipAlerts,
        applicationAlerts,
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put("/api/university-rep/settings", payload);
      if (res?.success) {
        toast.success("Settings updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        throw new Error(res?.message || "Failed to update settings.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ── */}
      <div>
        <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
          Account & Security
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Representative Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure security credentials, password, and admissions alert notification preferences.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Security / Password Card */}
        <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Security & Password Update
          </h2>

          <div className="space-y-3 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Alert Preferences */}
        <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            Admissions Notification Preferences
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#050B1F] border border-white/5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Email Notifications</p>
                <p className="text-[11px] text-slate-400">Receive email alerts when major admissions events occur</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-white/20 bg-[#0B1228] text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#050B1F] border border-white/5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Agency Partnership Requests</p>
                <p className="text-[11px] text-slate-400">Instant notification when a verified agency requests partnership</p>
              </div>
              <input
                type="checkbox"
                checked={partnershipAlerts}
                onChange={(e) => setPartnershipAlerts(e.target.checked)}
                className="rounded border-white/20 bg-[#0B1228] text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#050B1F] border border-white/5 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-white">Candidate Application Alerts</p>
                <p className="text-[11px] text-slate-400">Get notified when candidates submit applications or upload documents</p>
              </div>
              <input
                type="checkbox"
                checked={applicationAlerts}
                onChange={(e) => setApplicationAlerts(e.target.checked)}
                className="rounded border-white/20 bg-[#0B1228] text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
            </label>
          </div>
        </div>

        {/* Security Audit Information Note */}
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-purple-400" />
          <span>
            Admify Audit Security: All institutional catalog edits, partnership updates, and profile changes are cryptographically recorded in the platform audit trail for institutional compliance.
          </span>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
