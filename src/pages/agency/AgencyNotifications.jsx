import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCircle2,
  RefreshCw,
  Clock,
  Check,
  AlertCircle,
  FileCheck,
  Handshake,
  Briefcase,
} from "lucide-react";

export default function AgencyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/notifications");
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await api.put(`/api/agency/notifications/${notifId}/read`);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Notifications Center</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Operational alerts, student service requests, and admissions status notifications.
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications List */}
      <div
        className="rounded-2xl border divide-y divide-white/5 overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No notifications</p>
            <p className="text-slate-500 text-xs mt-1">
              You are all caught up! New student bookings and compliance notices will appear here.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.read ? "bg-transparent opacity-75" : "bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    n.read
                      ? "bg-white/5 border-white/10 text-slate-400"
                      : "bg-violet-600/20 border-violet-500/30 text-violet-400"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold ${n.read ? "text-slate-300" : "text-white"}`}>
                      {n.title || "Notification"}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {new Date(n.createdAt || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold transition-colors shrink-0 flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-slate-400" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
