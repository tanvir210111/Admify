import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  UserCheck,
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  Handshake,
  Briefcase,
  AlertCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  Building2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/agency/dashboard");
      if (res.success && res.data) {
        setData(res.data);
      } else {
        throw new Error(res.message || "Failed to load dashboard data");
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
    totalAgents: 0,
    activeAgents: 0,
    assignedStudents: 0,
    activeApplications: 0,
    pendingApplications: 0,
    completedApplications: 0,
    universityPartnerships: 0,
    pendingPartnershipRequests: 0,
    pendingServiceRequests: 0,
  };

  const statCards = [
    {
      title: "Total Agents",
      value: stats.totalAgents,
      sub: `${stats.activeAgents} active now`,
      icon: UserCheck,
      color: "from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/20",
      link: "/agency/agents",
    },
    {
      title: "Active Agents",
      value: stats.activeAgents,
      sub: "Operational roster",
      icon: UserCheck,
      color: "from-emerald-600/20 to-teal-600/20 text-emerald-400 border-emerald-500/20",
      link: "/agency/agents",
    },
    {
      title: "Assigned Students",
      value: stats.assignedStudents,
      sub: "In guidance pipeline",
      icon: Users,
      color: "from-cyan-600/20 to-blue-600/20 text-cyan-400 border-cyan-500/20",
      link: "/agency/students",
    },
    {
      title: "Active Applications",
      value: stats.activeApplications,
      sub: `${stats.pendingApplications} pending action`,
      icon: FileCheck,
      color: "from-violet-600/20 to-purple-600/20 text-violet-400 border-violet-500/20",
      link: "/agency/applications",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      sub: "Awaiting documents or review",
      icon: Clock,
      color: "from-amber-600/20 to-orange-600/20 text-amber-400 border-amber-500/20",
      link: "/agency/applications",
    },
    {
      title: "Completed Applications",
      value: stats.completedApplications,
      sub: "Offers & enrollments",
      icon: CheckCircle2,
      color: "from-emerald-600/20 to-green-600/20 text-emerald-400 border-emerald-500/20",
      link: "/agency/applications",
    },
    {
      title: "University Partnerships",
      value: stats.universityPartnerships,
      sub: `${stats.pendingPartnershipRequests} pending requests`,
      icon: Handshake,
      color: "from-pink-600/20 to-rose-600/20 text-pink-400 border-pink-500/20",
      link: "/agency/university-partnerships",
    },
    {
      title: "Pending Partnerships",
      value: stats.pendingPartnershipRequests,
      sub: "Awaiting representative response",
      icon: Clock,
      color: "from-amber-600/20 to-yellow-600/20 text-amber-400 border-amber-500/20",
      link: "/agency/university-partnerships",
    },
    {
      title: "Pending Service Requests",
      value: stats.pendingServiceRequests,
      sub: "Credit-based student bookings",
      icon: Briefcase,
      color: "from-indigo-600/20 to-violet-600/20 text-indigo-400 border-indigo-500/20",
      link: "/agency/service-requests",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-violet-400 font-semibold uppercase tracking-wider">
            <span>Verified Consultancy</span>
            <span>•</span>
            <span>Operational Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Agency Management Hub
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real-time pipeline monitoring, student admissions, agent oversight, and representative networks.
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
            to="/agency/applications"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/25 transition-all"
          >
            <span>Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboard}
            className="underline hover:text-white font-semibold text-xs"
          >
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

      {/* Two Column Layout: Recent Applications & Recent Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Recent Applications</h3>
                  <p className="text-[11px] text-slate-400">Under agency processing</p>
                </div>
              </div>
              <Link
                to="/agency/applications"
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading application pipeline...</div>
            ) : !data?.recentApplications || data.recentApplications.length === 0 ? (
              <div className="py-12 text-center">
                <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-400 text-xs font-medium">No applications yet</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Applications submitted by or assigned to your agency will appear here.
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
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {app.stage || "Submitted"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Service Requests */}
        <div
          className="p-6 rounded-2xl border flex flex-col justify-between"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Recent Service Requests</h3>
                  <p className="text-[11px] text-slate-400">800 CR / 1500 CR credit-based services</p>
                </div>
              </div>
              <Link
                to="/agency/service-requests"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading service requests...</div>
            ) : !data?.recentServiceRequests || data.recentServiceRequests.length === 0 ? (
              <div className="py-12 text-center">
                <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-slate-400 text-xs font-medium">No service requests yet</p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Direct student bookings for Agency Assistance (800 CR) or Managed Service (1500 CR) will show here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentServiceRequests.map((ord) => (
                  <div key={ord._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        {ord.serviceName || "Agency Service"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Student: {ord.user?.name || "Student"} • {ord.creditsCharged || 0} Credits
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ord.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Partnership Activity & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Partnership Activity */}
        <div
          className="p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-600/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Handshake className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">University Representative Connections</h3>
                <p className="text-[11px] text-slate-400">Institutional network</p>
              </div>
            </div>
            <Link
              to="/agency/university-partnerships"
              className="text-xs text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500 text-xs">Loading partnerships...</div>
          ) : !data?.recentPartnerships || data.recentPartnerships.length === 0 ? (
            <div className="py-10 text-center">
              <Handshake className="w-9 h-9 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-slate-400 text-xs font-medium">No partnerships established yet</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Explore the verified University Representative directory to initiate collaboration.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.recentPartnerships.map((conn) => (
                <div key={conn._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-xs font-semibold truncate">
                      {conn.university?.name || "University Partner"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Representative: {conn.universityRepresentative?.name || "Official Rep"}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      conn.status === "ACCEPTED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : conn.status === "PENDING"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    }`}
                  >
                    {conn.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div
          className="p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Agency Notifications</h3>
                <p className="text-[11px] text-slate-400">System updates and admissions alerts</p>
              </div>
            </div>
            <Link
              to="/agency/notifications"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>All alerts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-500 text-xs">Loading alerts...</div>
          ) : !data?.recentNotifications || data.recentNotifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-9 h-9 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-slate-400 text-xs font-medium">No recent notifications</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Application events, verification notices, and connection responses will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.recentNotifications.map((notif) => (
                <div key={notif._id} className="py-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-semibold">{notif.title || "Notification"}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
