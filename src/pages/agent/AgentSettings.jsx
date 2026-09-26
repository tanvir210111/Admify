import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  KeyRound,
  Bell,
  ShieldCheck,
  Smartphone,
  Save,
  Lock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentSettings() {
  const { user } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Phone state
  const [phone, setPhone] = useState(user?.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);

  // Preferences toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      const res = await api.put("/api/agent/settings", {
        currentPassword,
        newPassword,
      });

      if (res?.data?.success) {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhoneUpdate = async (e) => {
    e.preventDefault();
    try {
      setSavingPhone(true);
      const res = await api.put("/api/agent/settings", { phone });
      if (res?.data?.success) {
        toast.success("Counselor contact phone updated.");
      }
    } catch (err) {
      toast.error("Failed to update phone number.");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1000px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div variants={fade}>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-violet-400" /> Account & Security Settings
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Manage counselor account credentials, contact access, and operational alert preferences.
        </p>
      </motion.div>

      {/* Security: Change Password */}
      <motion.div
        variants={fade}
        className="p-6 rounded-2xl border space-y-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <KeyRound className="w-4 h-4 text-violet-400" />
          Update Counselor Password
        </div>
        <p className="text-xs text-slate-400">
          Ensure your account uses a secure password to protect student dossier data.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              New Password (min 6 characters) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {savingPassword ? "Updating Password..." : "Save New Password"}
          </button>
        </form>
      </motion.div>

      {/* Counselor Direct Contact */}
      <motion.div
        variants={fade}
        className="p-6 rounded-2xl border space-y-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          Direct Counselor Mobile Contact
        </div>
        <p className="text-xs text-slate-400">
          Used by assigned applicants and agency management for urgent admission updates.
        </p>

        <form onSubmit={handlePhoneUpdate} className="space-y-4 text-xs max-w-md">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700 000000"
              className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingPhone}
            className="px-5 py-2 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {savingPhone ? "Saving..." : "Update Mobile Number"}
          </button>
        </form>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        variants={fade}
        className="p-6 rounded-2xl border space-y-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Bell className="w-4 h-4 text-emerald-400" />
          Operational Alert Preferences
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 cursor-pointer">
            <div>
              <span className="font-semibold text-white block">
                Applicant Case Assignment Alerts
              </span>
              <span className="text-[11px] text-slate-400">
                Notify immediately when new students or service orders are assigned to your counselor caseload.
              </span>
            </div>
            <input
              type="checkbox"
              checked={assignmentAlerts}
              onChange={(e) => {
                setAssignmentAlerts(e.target.checked);
                toast.success("Preferences updated.");
              }}
              className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 cursor-pointer">
            <div>
              <span className="font-semibold text-white block">Admissions Deadline Alerts</span>
              <span className="text-[11px] text-slate-400">
                Receive notifications 7 days and 48 hours prior to university intake deadlines.
              </span>
            </div>
            <input
              type="checkbox"
              checked={deadlineReminders}
              onChange={(e) => {
                setDeadlineReminders(e.target.checked);
                toast.success("Preferences updated.");
              }}
              className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-white/5 cursor-pointer">
            <div>
              <span className="font-semibold text-white block">
                Applicant Messaging Notifications
              </span>
              <span className="text-[11px] text-slate-400">
                Alert on receiving new guidance inquiries from assigned students.
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => {
                setEmailAlerts(e.target.checked);
                toast.success("Preferences updated.");
              }}
              className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </motion.div>

      {/* Security Governance Notice */}
      <motion.div
        variants={fade}
        className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs text-slate-400"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>Role: <strong>Agent Counselor</strong> · Agency ID: <strong>{user?.agencyId || "AGY-ACCREDITED"}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          Enterprise RBAC Protected
        </div>
      </motion.div>
    </motion.div>
  );
}
