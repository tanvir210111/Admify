import React, { useState } from "react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Settings,
  Lock,
  Phone,
  Bell,
  Save,
  RefreshCw,
  Shield,
  Key,
} from "lucide-react";

export default function AgencySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Notification Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [appAlerts, setAppAlerts] = useState(true);
  const [serviceAlerts, setServiceAlerts] = useState(true);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      return toast.error("Please enter both current and new password");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters");
    }
    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirmation do not match");
    }

    setSavingPassword(true);
    try {
      const res = await api.put("/api/agency/settings", {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        toast.success("Agency password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return toast.error("Please enter a phone number");

    setSavingPhone(true);
    try {
      const res = await api.put("/api/agency/settings", { phone });
      if (res.success) {
        toast.success("Agency contact number updated!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update contact number");
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Agency Account & Security Settings</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Manage your organizational credentials, security settings, and communication preferences.
        </p>
      </div>

      {/* Password & Security Card */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <Lock className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-bold text-white">Change Master Password</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 text-xs max-w-md">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">New Password (min 6 chars) *</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50"
            >
              {savingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Contact Phone Card */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <Phone className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Direct Operational Helpline Number</h2>
        </div>

        <form onSubmit={handlePhoneSubmit} className="space-y-3.5 text-xs max-w-md">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Official Mobile / Helpline</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801700000000"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingPhone || !phone.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-lg shadow-cyan-600/30 disabled:opacity-50"
            >
              {savingPhone ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Phone</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <Bell className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">System Notification Preferences</h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <div>
              <p className="text-white font-semibold">Email Alerts for New Service Bookings</p>
              <p className="text-slate-400 text-[11px]">Receive emails when a student books 800 CR / 1500 CR service</p>
            </div>
            <input
              type="checkbox"
              checked={serviceAlerts}
              onChange={(e) => setServiceAlerts(e.target.checked)}
              className="w-4 h-4 accent-violet-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <div>
              <p className="text-white font-semibold">Application Progress Updates</p>
              <p className="text-slate-400 text-[11px]">Notify when university reps or agents change stage</p>
            </div>
            <input
              type="checkbox"
              checked={appAlerts}
              onChange={(e) => setAppAlerts(e.target.checked)}
              className="w-4 h-4 accent-violet-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer">
            <div>
              <p className="text-white font-semibold">Institutional Connection Requests</p>
              <p className="text-slate-400 text-[11px]">Receive notices when university reps respond to partnerships</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 accent-violet-600 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
