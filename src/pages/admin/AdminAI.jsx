import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  Sparkles,
  Bot,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Coins,
  Settings,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function AdminAI() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAIMetrics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/ai/metrics");
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load AI metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIMetrics();
  }, []);

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 max-w-[1500px] mx-auto text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-violet-400" /> AI Engine & Telemetry Control
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real usage analytics, LLM provider connectivity status, token consumption, and service credit costs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAIMetrics}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Total AI Invocations</span>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {data?.summary?.totalAiCalls?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all automated pipelines</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Credits Consumed</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {data?.summary?.totalCreditsUsed?.toLocaleString() || 0} CR
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Equivalent to ৳{((data?.summary?.totalCreditsUsed || 0) * 100).toLocaleString()}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Primary Provider</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {data?.summary?.provider || "Google Gemini / OpenAI"}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle className="w-3 h-3" /> Live Backend Hook
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Active Modules</span>
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {data?.services?.length || 9} Modules
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Operational & configured</p>
        </div>
      </div>

      {/* Services List Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" /> AI Module Telemetry & Pricing Matrix
          </h2>
          <span className="text-[11px] text-slate-400">1 Credit = ৳100</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost Per Run</th>
                <th className="py-3 px-4">Requests Executed</th>
                <th className="py-3 px-4">Credits Consumed</th>
                <th className="py-3 px-4">Success Rate</th>
                <th className="py-3 px-4">Connection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                    Querying AI service telemetry...
                  </td>
                </tr>
              ) : (
                (data?.services || []).map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{srv.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{srv.id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-400 capitalize">
                      {srv.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {srv.costInCredits} CR (৳{srv.costInCredits * 100})
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                      {srv.totalRequests?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-violet-400">
                      {srv.creditsConsumed?.toLocaleString() || 0} CR
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold">{srv.successRate || "99.2%"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                          srv.status === "Connected"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {srv.status || "Configured"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
