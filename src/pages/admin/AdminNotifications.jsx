import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Filter,
  ShieldAlert,
  Award,
  FileCheck2,
  User,
  Users,
  Info,
  Building2,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const PRIO_MAP = {
  high: { label: "High", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  medium: { label: "Medium", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  low: { label: "Low", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifs, setNotifs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/notifications");
      if (res?.data?.notifications) {
        const formatted = res.data.notifications.map((n) => ({
          id: n._id,
          text: n.message || n.title,
          title: n.title,
          type: n.link?.includes("agent") ? "agents" : n.type === "alert" ? "system" : "all",
          priority: n.type === "alert" || n.type === "warning" ? "high" : "medium",
          time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          status: n.read ? "read" : "unread",
          icon: n.title?.toLowerCase().includes("agency") ? Building2 : Bell,
          link: n.link || "",
        }));
        setNotifs(formatted);
      }
    } catch (err) {
      console.warn("Could not load backend notifications:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifs((prev) => prev.map((n) => ({ ...n, status: "read" })));
      toast.success("All notifications marked as read.");
    } catch {
      setNotifs((prev) => prev.map((n) => ({ ...n, status: "read" })));
    }
  };

  const filtered = notifs.filter(
    (n) => activeTab === "all" || n.type === activeTab
  );

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1200px] mx-auto text-slate-100"
    >
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-400" /> Notification Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time compliance alerts, agency submissions, and platform events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all"
          >
            Mark all as read
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade} className="flex flex-wrap gap-2 border-b border-white/6 pb-2">
        {["all", "agents", "students", "system"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
              activeTab === t
                ? "bg-violet-600/20 border-violet-500/40 text-white"
                : "bg-transparent border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={fade} className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/6 bg-white/2 text-slate-500 text-sm">
            {isLoading ? "Loading notifications..." : "No notifications found."}
          </div>
        ) : (
          filtered.map((n) => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:bg-white/3 ${
                  n.status === "unread"
                    ? "border-violet-500/30 bg-violet-600/10"
                    : "border-white/6 bg-white/1"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                    n.status === "unread"
                      ? "bg-violet-500/20 border-violet-500/30 text-violet-300"
                      : "bg-slate-800 border-slate-700/50 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        PRIO_MAP[n.priority]?.cls || PRIO_MAP.medium.cls
                      }`}
                    >
                      {PRIO_MAP[n.priority]?.label || "Notice"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                    {n.status === "unread" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                  </div>
                  <h4 className="text-white text-sm font-semibold mt-1">{n.title}</h4>
                  <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">{n.text}</p>
                </div>
              </div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
