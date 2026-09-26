import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  Building2,
  GraduationCap,
  Handshake,
  Users2,
  FileCheck2,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Bell,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Award,
  Megaphone,
  ShieldCheck,
  Globe,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function UniRepDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/university-rep/dashboard");
      if (res?.success && res?.data) {
        setData(res.data);
      } else {
        throw new Error(res?.message || "Failed to load representative dashboard.");
      }
    } catch (err) {
      setError(err.message || "Unable to load dashboard records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = data?.stats || {
    universityProfileStatus: user?.uniRepVerificationStatus || "PENDING",
    universityName: "Not Linked",
    activePrograms: 0,
    connectedAgencies: 0,
    pendingPartnershipRequests: 0,
    acceptedPartnerships: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    recentMessagesCount: 0,
    unreadNotifications: 0,
    upcomingDeadlinesCount: 0,
  };

  const university = data?.university;
  const recentActivity = data?.recentActivity || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Top Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-6 sm:p-8 border border-purple-500/20 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(124, 58, 237, 0.16) 0%, rgba(37, 99, 235, 0.10) 50%, rgba(5, 11, 31, 0.95) 100%)",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Institutional Representative</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || "Representative"}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Managing admissions, academic catalog, and verified recruitment agencies for{" "}
              <span className="font-semibold text-white">{university?.name || stats.universityName}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              to="/university-rep/programs"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition"
            >
              <GraduationCap className="w-4 h-4" />
              Manage Catalog
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Metric Cards Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Connected Agencies */}
        <div className="rounded-xl p-4 sm:p-5 bg-[#0B1228] border border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Connected Agencies</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Handshake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.connectedAgencies}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>Pending Requests:</span>
            <span className="font-bold text-amber-400">{stats.pendingPartnershipRequests}</span>
          </div>
        </div>

        {/* Card 2: Active Programs */}
        <div className="rounded-xl p-4 sm:p-5 bg-[#0B1228] border border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Programs</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.activePrograms}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>Institutional Catalog</span>
            <Link to="/university-rep/programs" className="text-purple-400 hover:underline">View</Link>
          </div>
        </div>

        {/* Card 3: Total Applications */}
        <div className="rounded-xl p-4 sm:p-5 bg-[#0B1228] border border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Applications Received</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalApplications}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>Pending Review:</span>
            <span className="font-bold text-cyan-400">{stats.pendingApplications}</span>
          </div>
        </div>

        {/* Card 4: Offers Accepted */}
        <div className="rounded-xl p-4 sm:p-5 bg-[#0B1228] border border-white/5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Offers / Enrolled</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.acceptedApplications}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
            <span>Upcoming Deadlines:</span>
            <span className="font-bold text-emerald-400">{stats.upcomingDeadlinesCount}</span>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Quick Actions & Recent Activity (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick Management Shortcuts */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Institutional Management Shortcuts
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                to="/university-rep/partnerships"
                className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-purple-600/10 border border-white/5 hover:border-purple-500/30 transition text-center group"
              >
                <Handshake className="w-5 h-5 mx-auto mb-1.5 text-purple-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Agency Requests</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{stats.pendingPartnershipRequests} pending</p>
              </Link>

              <Link
                to="/university-rep/applications"
                className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-cyan-600/10 border border-white/5 hover:border-cyan-500/30 transition text-center group"
              >
                <FileCheck2 className="w-5 h-5 mx-auto mb-1.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Applications</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{stats.totalApplications} total</p>
              </Link>

              <Link
                to="/university-rep/announcements"
                className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 transition text-center group"
              >
                <Megaphone className="w-5 h-5 mx-auto mb-1.5 text-blue-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Announcements</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Post updates</p>
              </Link>

              <Link
                to="/university-rep/scholarships"
                className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-emerald-600/10 border border-white/5 hover:border-emerald-500/30 transition text-center group"
              >
                <Award className="w-5 h-5 mx-auto mb-1.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-semibold text-white">Scholarships</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage funding</p>
              </Link>
            </div>
          </div>

          {/* Real Recent Activity Timeline */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Recent Institutional Activity
              </h2>
              <span className="text-[11px] text-slate-400">Live Backend Stream</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading activity records...</div>
            ) : recentActivity.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-slate-300">No partnership requests or updates yet.</p>
                <p className="text-[11px] text-slate-500">
                  As partner agencies connect or students submit applications, events will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-purple-500/15 text-purple-300 border border-purple-500/20">
                          {act.type}
                        </span>
                        <p className="text-xs font-semibold text-white">{act.title}</p>
                      </div>
                      <p className="text-[11px] text-slate-400">{act.subtitle}</p>
                    </div>
                    {act.createdAt && (
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: University Summary & Upcoming Deadlines (1 Col) */}
        <div className="space-y-6">

          {/* University Factsheet Pill */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-400" />
              University Overview
            </h2>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-base">
                  {university?.logo ? (
                    <img src={university.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Building2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{university?.name || stats.universityName}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {university?.location || university?.country || "International"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                <div>
                  <span className="text-slate-500 block text-[10px]">Type</span>
                  <span className="text-slate-200 font-medium">{university?.type || "Public"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Official Website</span>
                  {university?.website ? (
                    <a
                      href={university.website.startsWith("http") ? university.website : `https://${university.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 font-medium truncate block hover:underline"
                    >
                      Visit Portal
                    </a>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </div>
              </div>

              <Link
                to="/university-rep/university"
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <span>Edit Institutional Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Upcoming Admission Deadlines */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Upcoming Deadlines
              </h2>
              <Link to="/university-rep/intakes" className="text-[11px] text-purple-400 hover:underline">
                Manage
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No active program deadlines configured.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingDeadlines.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{dl.title}</p>
                      <p className="text-[10px] text-slate-400">{dl.programName}</p>
                    </div>
                    <span className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold">
                      {dl.deadline}
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
