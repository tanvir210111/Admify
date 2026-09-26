import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  FileCheck,
  CheckCircle,
  Clock,
  Globe2,
  Award,
  RefreshCw,
  PieChart,
  BarChart2,
  GraduationCap,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/performance");
      if (res?.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load performance metrics:", err);
      toast.error("Failed to load counselor performance analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const totalApps = data?.totalApplications || 0;
  const stageBreakdown = data?.stageBreakdown || {};
  const countryBreakdown = data?.countryBreakdown || {};

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-violet-400" /> Counselor Performance & Caseload Analytics
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Real performance records strictly isolated to your assigned admissions pipeline and task delivery.
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm rounded-2xl border border-white/10 bg-[#0B1228]">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
          Aggregating counselor performance metrics...
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Caseload Applications",
                val: totalApps,
                color: "text-blue-400",
                icon: FileCheck,
              },
              {
                label: "Offer Letters Secured",
                val: data?.offersReceived || 0,
                color: "text-emerald-400",
                icon: Award,
              },
              {
                label: "Offer Conversion Rate",
                val: `${data?.conversionRate || 0}%`,
                color: "text-violet-400",
                icon: TrendingUp,
              },
              {
                label: "Task Completion Rate",
                val: `${data?.taskCompletionRate || 0}%`,
                color: "text-cyan-400",
                icon: CheckCircle,
              },
            ].map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl border flex items-center justify-between"
                  style={{
                    background: "rgba(11, 18, 40, 0.7)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <div>
                    <p className={`text-2xl font-black ${kpi.color}`}>{kpi.val}</p>
                    <p className="text-slate-400 text-xs mt-1 font-medium">{kpi.label}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Operational Caseload vs Task Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stage Distribution */}
            <motion.div
              variants={fade}
              className="p-5 rounded-2xl border space-y-4"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-violet-400" /> Application Stage Distribution
              </h3>

              {totalApps === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No applications recorded in your caseload yet.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {Object.entries(stageBreakdown).map(([stage, count]) => {
                    const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                    return (
                      <div key={stage} className="space-y-1">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>{stage}</span>
                          <span className="font-bold text-white">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-violet-500 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Target Countries Distribution */}
            <motion.div
              variants={fade}
              className="p-5 rounded-2xl border space-y-4"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" /> Target Study Destinations
              </h3>

              {Object.keys(countryBreakdown).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No country distribution data available yet.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  {Object.entries(countryBreakdown).map(([country, count]) => {
                    const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0;
                    return (
                      <div key={country} className="space-y-1">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>{country}</span>
                          <span className="font-bold text-cyan-400">
                            {count} cases ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-cyan-400 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Task Execution Summary */}
          <motion.div
            variants={fade}
            className="p-5 rounded-2xl border"
            style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Operational Task Execution Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
                <span className="text-slate-400">Total Tasks Registered:</span>
                <p className="text-lg font-bold text-white mt-0.5">{data?.totalTasks || 0}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
                <span className="text-slate-400">Completed On-Time:</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  {data?.completedTasks || 0}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5">
                <span className="text-slate-400">Execution Rate:</span>
                <p className="text-lg font-bold text-cyan-400 mt-0.5">
                  {data?.taskCompletionRate || 0}%
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
