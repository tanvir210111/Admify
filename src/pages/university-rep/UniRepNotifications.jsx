import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Clock,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Handshake,
  FileCheck2,
  MessageSquare,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function UniRepNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/notifications");
      if (res?.success && Array.isArray(res?.data?.notifications)) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/university-rep/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, isRead: true } : n))
      );
    } catch (err) {
      console.warn("Failed to mark notification read", err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.put("/api/university-rep/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, isRead: true }))
      );
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error(err.message || "Failed to update notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read && !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Operational Alerts
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time updates regarding partner agency requests, student applications, and compliance alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              Mark All Read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Notifications Feed ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading notifications stream...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <Bell className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No notifications yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            When agencies submit connection requests or students apply to your degree catalog, notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isRead = notif.read || notif.isRead;
            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 sm:p-5 border transition flex items-start justify-between gap-4 ${
                  isRead
                    ? "bg-[#0B1228]/60 border-white/5 text-slate-400"
                    : "bg-[#0B1228] border-purple-500/30 shadow-lg text-white"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isRead ? "bg-white/5 text-slate-400" : "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                      <span>{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "Recent"}</span>
                      {notif.link && (
                        <Link to={notif.link} className="text-purple-400 hover:underline flex items-center gap-0.5">
                          View Details <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
