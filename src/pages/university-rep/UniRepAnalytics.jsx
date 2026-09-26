import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Globe,
  GraduationCap,
  Users2,
  FileCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Building2,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/analytics");
      if (res?.success && res?.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load recruitment analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const total = data?.totalApplications || 0;
  const byCountry = data?.byCountry || [];
  const byProgram = data?.byProgram || [];
  const byAgency = data?.byAgency || [];
  const byIntake = data?.byIntake || [];
  const stages = data?.stageBreakdown || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Admissions Intelligence
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            University Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time candidate demographics, agency recruitment conversion, and enrollment pipeline.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* ── KPI Conversion Funnel ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Received</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">{total}</p>
          <p className="text-[10px] text-slate-500">Live candidate caseload</p>
        </div>

        <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">In Review</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{data?.inReview || 0}</p>
          <p className="text-[10px] text-slate-500">Under admissions evaluation</p>
        </div>

        <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Offers Issued</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{data?.offersAccepted || 0}</p>
          <p className="text-[10px] text-slate-500">Accepted candidate offers</p>
        </div>

        <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recruitment Channels</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-400">{data?.connectedAgenciesCount || 0}</p>
          <p className="text-[10px] text-slate-500">Authorized active agencies</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Computing real-time analytics...</p>
        </div>
      ) : total === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <BarChart3 className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No application analytics to display yet</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Charts and demographic breakdowns populate automatically using real data once candidates submit applications to your university.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications by Country */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              Candidate Country of Origin
            </h3>
            <div className="space-y-3">
              {byCountry.map((item, idx) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{item.country}</span>
                      <span className="text-slate-400 font-mono">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050B1F] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications by Program */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              Applications by Degree Program
            </h3>
            <div className="space-y-3">
              {byProgram.map((item, idx) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[220px]">{item.program}</span>
                      <span className="text-slate-400 font-mono">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050B1F] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applications by Recruitment Agency */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users2 className="w-4 h-4 text-emerald-400" />
              Applications by Recruitment Agency
            </h3>
            <div className="space-y-3">
              {byAgency.map((item, idx) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium truncate max-w-[220px]">{item.agency}</span>
                      <span className="text-slate-400 font-mono">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050B1F] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admissions Funnel & Pipeline */}
          <div className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Admissions Stage Breakdown
            </h3>
            <div className="space-y-3 text-xs">
              {Object.entries(stages).map(([stage, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">{stage}</span>
                      <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#050B1F] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
