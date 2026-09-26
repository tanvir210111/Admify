import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, UserCheck, Building2, Award, FileCheck, Sparkles, TrendingUp,
  ArrowUpRight, RefreshCw, Download, Plus, Activity, Server, Database,
  Target, GraduationCap, BarChart3, Zap, CheckCircle2, AlertTriangle,
  CreditCard, ShieldCheck, Handshake, AlertCircle, Clock,
} from "lucide-react";
import { api } from "../../lib/api";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get("/api/admin/dashboard");
      if (result?.success && result?.data) {
        setData(result.data);
      } else {
        setError(result?.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err?.message || "Failed to connect to backend service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Aggregating platform intelligence...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-white font-bold text-lg">Unable to load dashboard</h3>
        <p className="text-slate-400 text-xs mt-1 mb-4">{error || "Data unavailable"}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, kpis, charts, recentActivities } = data;
  const monthly = charts?.monthlyRegistrations || [];
  const maxReg = Math.max(...monthly.map((m) => m.total || 0), 1);
  const stageCounts = charts?.stageCounts || {};
  const totalAppsCount = summary.totalApplications || 1;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Platform Control Center</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">
            Real-time administrative operations, entity verifications, and platform governance
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => navigate("/admin/audit-logs")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Audit Ledger
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div
            key={i}
            variants={fade}
            className="rounded-2xl border p-4 hover:border-violet-500/30 transition-all group relative overflow-hidden"
            style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-xs font-medium">{k.label}</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-white">{k.value}</p>
            {k.subValue ? (
              <p className="text-violet-400 text-xs font-semibold mt-1">{k.subValue}</p>
            ) : (
              <p className="text-slate-500 text-[11px] mt-1">Live Backend Ledger</p>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Review & Operational Action Toolbar */}
      <motion.div
        variants={fade}
        className="p-4 rounded-2xl border flex flex-wrap gap-2.5 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-white text-xs font-bold uppercase tracking-wider">Review Queues:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/agencies"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-violet-600/20 text-slate-300 hover:text-white border border-white/8 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-violet-400" />
            Agencies ({summary.pendingAgencyVerifications} Pending)
          </Link>
          <Link
            to="/admin/agents"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-blue-600/20 text-slate-300 hover:text-white border border-white/8 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            Agents ({summary.pendingAgentApplications} Pending)
          </Link>
          <Link
            to="/admin/university-representatives"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-emerald-600/20 text-slate-300 hover:text-white border border-white/8 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Uni Reps ({summary.pendingUniRepVerifications} Pending)
          </Link>
          <Link
            to="/admin/payments"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-pink-600/20 text-slate-300 hover:text-white border border-white/8 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-pink-400" />
            Payments ({summary.pendingPayments} Pending)
          </Link>
          <Link
            to="/admin/reports"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-red-600/20 text-slate-300 hover:text-white border border-white/8 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            Reports ({summary.openReports} Open)
          </Link>
        </div>
      </motion.div>

      {/* Real Charts: Registration Trends & Application Stage Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* User Registration Trend */}
        <motion.div
          variants={fade}
          className="xl:col-span-3 p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Platform Registration Velocity</h2>
              <p className="text-slate-400 text-xs mt-0.5">Real monthly user influx across all active roles</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-white">{summary.totalStudents + summary.totalAgencies + summary.totalAgents} Users</p>
              <p className="text-emerald-400 text-[11px] font-semibold">Active Catalog</p>
            </div>
          </div>

          <div className="flex items-end gap-3 h-40 pt-4">
            {monthly.map((m, i) => {
              const heightPct = Math.max(12, Math.round((m.total / maxReg) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <div className="w-full flex flex-col justify-end relative h-28">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ delay: i * 0.05, duration: 0.6 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-700 to-cyan-400 group-hover/bar:brightness-125 transition-all relative"
                    >
                      <span className="opacity-0 group-hover/bar:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded shadow whitespace-nowrap transition-opacity">
                        {m.total} users
                      </span>
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">{m.month}</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Application Stage Breakdown */}
        <motion.div
          variants={fade}
          className="xl:col-span-2 p-6 rounded-2xl border flex flex-col justify-between"
          style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-white">Application Pipeline</h2>
              <Link to="/admin/applications" className="text-violet-400 text-xs font-semibold hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {Object.entries(stageCounts).map(([stage, count], i) => {
                const pct = summary.totalApplications > 0 ? Math.round((count / summary.totalApplications) * 100) : 0;
                return (
                  <div key={stage}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{stage}</span>
                      <span className="text-white font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full rounded-full ${
                          stage === "Accepted"
                            ? "bg-emerald-500"
                            : stage === "Rejected"
                            ? "bg-rose-500"
                            : stage === "In Review"
                            ? "bg-blue-500"
                            : "bg-violet-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400">Total Applications</p>
              <p className="text-lg font-black text-white">{summary.totalApplications}</p>
            </div>
            <Link
              to="/admin/applications"
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors"
            >
              Manage
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Role Distribution & Recent Real Platform Events */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* User Role Breakdown */}
        <motion.div
          variants={fade}
          className="xl:col-span-2 p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" /> Platform Population by Role
          </h2>
          <div className="space-y-3">
            {[
              { role: "Students", count: summary.totalStudents, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", link: "/admin/students" },
              { role: "Agencies", count: summary.totalAgencies, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", link: "/admin/agencies" },
              { role: "Certified Agents", count: summary.totalAgents, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", link: "/admin/agents" },
              { role: "Uni Representatives", count: summary.totalUniReps, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", link: "/admin/university-representatives" },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(item.link)}
                className={`p-3 rounded-xl border ${item.border} ${item.bg} flex items-center justify-between cursor-pointer hover:brightness-125 transition-all`}
              >
                <span className={`text-xs font-bold ${item.color}`}>{item.role}</span>
                <span className="text-sm font-extrabold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Real Activities */}
        <motion.div
          variants={fade}
          className="xl:col-span-3 p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" /> Live Platform Activity
            </h2>
            <Link to="/admin/audit-logs" className="text-violet-400 text-xs font-semibold hover:underline">
              Audit Logs →
            </Link>
          </div>

          <div className="space-y-2">
            {recentActivities.length === 0 ? (
              <p className="text-slate-500 text-xs p-4 text-center">No recent activities recorded.</p>
            ) : (
              recentActivities.map((act, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-slate-200 truncate">{act.title}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{act.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
