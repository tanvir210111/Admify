import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  Clock,
  RefreshCw,
  FileCheck,
  UserPlus,
  MessageSquare,
  AlertCircle,
  Building2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/notifications");
      if (res?.data?.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.put(`/api/agent/notifications/${id}/read`);
      if (res?.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => api.put(`/api/agent/notifications/${n._id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    } catch (err) {
      toast.error("Failed to mark all as read.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1200px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-400" /> Notifications & Operational Alerts
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time notifications on student case assignments, application stage updates, and document verification requests.
          </p>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all"
            >
              Mark All Read ({unreadCount})
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        variants={fade}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading notifications feed...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Notifications</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              You are completely caught up with all operational alerts.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.read && handleMarkAsRead(notif._id)}
                className={`p-4 transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                  notif.read
                    ? "opacity-60 bg-transparent hover:bg-white/[0.01]"
                    : "bg-violet-950/15 hover:bg-violet-950/25 border-l-2 border-violet-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      notif.read
                        ? "bg-slate-800 text-slate-400"
                        : "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-slate-500 block">
                      {new Date(notif.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notif._id);
                    }}
                    className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
