import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  LayoutDashboard,
  Users,
  FileCheck,
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Building2,
} from "lucide-react";

export default function AgentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/agent/dashboard");
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || "Failed to load agent dashboard");
      }
    } catch (err) {
      setError(err.message || "Unable to load dashboard records from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    assignedStudents: 0,
    activeApplications: 0,
    pendingApplications: 0,
    documentsPending: 0,
    applicationsSubmitted: 0,
    offersReceived: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0,
    unreadNotifications: 0,
  };

  const statCards = [
    {
      title: "Assigned Students",
      value: stats.assignedStudents,
      sub: "Active guidance caseload",
      icon: Users,
      color: "from-cyan-600/20 to-blue-600/20 text-cyan-400 border-cyan-500/20",
      link: "/agent/students",
    },
    {
      title: "Active Applications",
      value: stats.activeApplications,
      sub: `${stats.pendingApplications} under processing`,
      icon: FileCheck,
      color: "from-violet-600/20 to-indigo-600/20 text-violet-400 border-violet-500/20",
      link: "/agent/applications",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      sub: "Awaiting review or documents",
      icon: Clock,
      color: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/20",
      link: "/agent/applications",
    },
    {
      title: "Documents Pending",
      value: stats.documentsPending,
      sub: "Transcripts / certificates required",
      icon: FileText,
      color: "from-rose-600/20 to-pink-600/20 text-rose-400 border-rose-500/20",
      link: "/agent/documents",
    },
    {
      title: "Applications Submitted",
      value: stats.applicationsSubmitted,
      sub: "Transmitted to admissions",
      icon: FileCheck,
      color: "from-blue-600/20 to-cyan-600/20 text-blue-400 border-blue-500/20",
      link: "/agent/applications",
    },
    {
      title: "Offers Received",
      value: stats.offersReceived,
      sub: "Accepted by institutions",
      icon: CheckCircle2,
      color: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/20",
      link: "/agent/applications",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      sub: "Action items on schedule",
      icon: Calendar,
      color: "from-indigo-600/20 to-purple-600/20 text-indigo-400 border-indigo-500/20",
      link: "/agent/tasks",
    },
    {
      title: "Upcoming Deadlines",
      value: stats.upcomingDeadlines,
      sub: "Next 14 days",
      icon: Clock,
      color: "from-amber-600/20 to-yellow-600/20 text-amber-400 border-amber-500/20",
      link: "/agent/tasks",
    },
    {
      title: "Unread Notifications",
      value: stats.unreadNotifications,
      sub: "Casework alerts",
      icon: Bell,
      color: "from-purple-600/20 to-pink-600/20 text-purple-400 border-purple-500/20",
      link: "/agent/notifications",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
            <span>Agency Counselor</span>
            <span>•</span>
            <span>Operational Casework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Counselor Workspace
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time pipeline monitoring, student admissions, document checks, and institutional deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/agent/applications"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all"
          >
            <span>Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchDashboard} className="underline hover:text-white font-semibold text-xs">
            Retry
          </button>
        </div>
      )}

      {/* 9 Real KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              to={card.link}
              className="block p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl group"
              style={{
                background: "#0B1228",
                borderColor: "rgba(255, 255, 255, 0.07)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center bg-gradient-to-br ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {loading ? "..." : card.value}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 truncate">{card.sub}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout: Recent Applications & Upcoming Tasks/Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Recent Applications</h3>
                  <p className="text-[11px] text-slate-400">Assigned admissions cases</p>
                </div>
              </div>
              <Link
                to="/agent/applications"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading applications...</div>
            ) : !data?.recentApplications || data.recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-400 text-xs font-medium">No applications assigned yet</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Applications allocated to you by your agency will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentApplications.map((app) => (
                  <div key={app._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        {app.university} — {app.program}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Student: {app.user?.name || "Student"} • {app.country || "Global"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {app.stage || "Submitted"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tasks & Upcoming Deadlines */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upcoming Deadlines & Tasks</h3>
                  <p className="text-[11px] text-slate-400">Counselor action items and milestones</p>
                </div>
              </div>
              <Link
                to="/agent/tasks"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading tasks...</div>
            ) : !data?.recentTasks || data.recentTasks.length === 0 ? (
              <div className="py-12 text-center">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-400 text-xs font-medium">No pending deadlines</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Create task reminders for document requests, follow-ups, or institutional submission deadlines.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentTasks.map((t) => (
                  <div key={t._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{t.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No date set"}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        t.priority === "URGENT"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : t.priority === "HIGH"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
