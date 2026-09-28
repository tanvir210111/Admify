import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useStudentBadges } from "../../context/StudentBadgeContext";
import {
  Bell,
  CheckCircle2,
  Users2,
  FileCheck2,
  Award,
  Sparkles,
  AlertTriangle,
  FolderOpen,
  DollarSign,
  Check,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

function NotificationsCenterPage() {
  const navigate = useNavigate();
  const { refreshSidebarCounts, markEntityAsSeen } = useStudentBadges();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from backend if available
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get("/api/notifications");
        if (isMounted && res?.data?.notifications) {
          const mapped = res.data.notifications.map((n) => ({
            id: n._id || n.id,
            category: n.type || "system",
            icon: Bell,
            color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
            title: n.title,
            message: n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
            read: n.read || false,
            relatedEntityType: n.relatedEntityType || null,
            relatedEntityId: n.relatedEntityId || null,
            actionUrl: n.actionUrl || null,
          }));
          setNotifications(mapped);
        }
      } catch {
        // Real empty state when no notifications
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
    } catch {
      // Offline fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    refreshSidebarCounts();
    toast.success("All notifications marked as read!");
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.put(`/api/notifications/${notif.id}/read`);
      } catch (e) {
        console.warn(e);
      }
      if (notif.relatedEntityType && notif.relatedEntityId) {
        await markEntityAsSeen(notif.relatedEntityType, notif.relatedEntityId);
      } else {
        refreshSidebarCounts();
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const getUnreadCountForTab = (tab) => {
    if (tab === "all" || tab === "unread") {
      return notifications.filter((n) => !n.read).length;
    }
    return notifications.filter((n) => !n.read && (n.category === tab || (tab === "documents" && n.category === "document"))).length;
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter !== "all") return n.category === filter;
    return true;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Communication</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Alert Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-7 h-7 text-cyan-400" />
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time updates regarding agency proposals, application decisions, and document verifications.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1228] hover:bg-[#07142D] border border-slate-800 text-cyan-400 text-xs font-bold transition-all"
        >
          <Check className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["all", "unread", "agency", "application", "scholarship", "documents"].map((tab) => {
          const count = getUnreadCountForTab(tab);
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border capitalize transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === tab
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-[#0B1228] text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <span>{tab === "all" ? "All Alerts" : tab}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-violet-600 text-white shadow-sm shadow-violet-500/40">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No notifications yet.</h3>
            <p className="text-xs text-slate-400">You're all caught up.</p>
          </div>
        ) : (
          filtered.map((notif) => {
            const Icon = notif.icon || Bell;
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 rounded-3xl border transition-all flex items-start gap-4 cursor-pointer ${
                  isUnread
                    ? "bg-violet-950/30 border-l-4 border-l-violet-500 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)] border border-violet-500/40 hover:border-violet-400/60"
                    : "bg-[#0B1228] border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl ${notif.color} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                      {isUnread && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40 animate-pulse">
                          UNREAD
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 bg-violet-400 rounded-full shrink-0 shadow-[0_0_8px_rgba(167,139,250,0.8)] mt-2" />
                )}
                {notif.actionUrl && (
                  <ArrowRight className="w-4 h-4 text-slate-500 hover:text-cyan-400 shrink-0 mt-2" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NotificationsCenterPage;
