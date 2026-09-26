import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  BarChart3,
  Globe,
  Building2,
  FileCheck,
  TrendingUp,
  UserCheck,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  PieChart,
} from "lucide-react";

export default function AgencyPerformance() {
  const [perf, setPerf] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/performance");
      if (res.success && res.data) {
        setPerf(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load performance metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const totalApps = perf?.totalApplications || 0;
  const countryBreakdown = perf?.countryBreakdown || {};
  const stageBreakdown = perf?.stageBreakdown || {};
  const agentWorkloads = perf?.agentWorkloads || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Agency Performance & Analytics</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Real aggregated operational conversion rates, destination distributions, and counselor workloads.
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Primary Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Applications</span>
            <FileCheck className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{loading ? "..." : totalApps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Processed by your agency</p>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Admissions Conversion</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3">
            {loading ? "..." : `${perf?.conversionRate || 0}%`}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Acceptances vs submissions</p>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Service Orders</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {loading ? "..." : perf?.totalServices || 0}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{perf?.completedServices || 0} completed</p>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Counselors On Roster</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-extrabold text-cyan-400 mt-3">
            {loading ? "..." : agentWorkloads.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Active case managers</p>
        </div>
      </div>

      {/* Two Column Layout: Country Distribution & Pipeline Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destination Countries */}
        <div
          className="p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Study Destination Distribution</h3>
              <p className="text-[11px] text-slate-400">Target countries across student applications</p>
            </div>
          </div>

          <div className="py-4">
            {Object.keys(countryBreakdown).length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No destination country records yet.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(countryBreakdown).map(([country, count]) => {
                  const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                  return (
                    <div key={country} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">{country}</span>
                        <span className="text-slate-400 font-mono">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Application Stage Breakdown */}
        <div
          className="p-6 rounded-2xl border"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Application Pipeline Stages</h3>
              <p className="text-[11px] text-slate-400">Progress funnel across all institutional cases</p>
            </div>
          </div>

          <div className="py-4">
            {Object.keys(stageBreakdown).length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active stages recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stageBreakdown).map(([stage, count]) => {
                  const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white font-medium">{stage}</span>
                        <span className="text-slate-400 font-mono">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Counselor Workload Distribution */}
      <div
        className="p-6 rounded-2xl border"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Counselor Workload & Assignment Distribution</h3>
            <p className="text-[11px] text-slate-400">Application caseload per verified agent</p>
          </div>
        </div>

        <div className="py-4">
          {agentWorkloads.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No counselors currently registered under your agency.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agentWorkloads.map((ag) => (
                <div key={ag.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-xs font-bold">{ag.name}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {ag.activeApplications} cases
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">{ag.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
