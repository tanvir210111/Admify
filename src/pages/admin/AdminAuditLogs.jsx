import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Shield,
  Eye,
  Calendar,
  User,
  ArrowRight,
  RefreshCw,
  Clock,
  Terminal,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

const ACTION_COLORS = {
  APPROVE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  REJECT: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  UPDATE: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  CREATE: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  DELETE: "text-red-400 bg-red-500/10 border-red-500/20",
  ADJUST: "text-amber-400 bg-amber-500/10 border-amber-500/20",
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (pg = 1) => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/audit-logs", {
        params: {
          page: pg,
          limit: 25,
          module: moduleFilter !== "all" ? moduleFilter : undefined,
          search: search || undefined,
        },
      });

      if (res?.data?.logs) {
        setLogs(res.data.logs);
        setPage(res.data.page || pg);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [moduleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getActionClass = (action) => {
    const act = (action || "").toUpperCase();
    if (act.includes("APPROVE")) return ACTION_COLORS.APPROVE;
    if (act.includes("REJECT")) return ACTION_COLORS.REJECT;
    if (act.includes("CREATE")) return ACTION_COLORS.CREATE;
    if (act.includes("DELETE")) return ACTION_COLORS.DELETE;
    if (act.includes("ADJUST")) return ACTION_COLORS.ADJUST;
    return ACTION_COLORS.UPDATE;
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 max-w-[1500px] mx-auto text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-violet-400" /> Immutable Audit Trail
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete cryptographic audit trail of all administrative actions, verifications, adjustments, and settings updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(page)}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by action, target ID, admin name, reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition"
          />
        </form>
        <div className="flex items-center gap-2">
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Modules</option>
            <option value="USER">USER</option>
            <option value="AGENCY">AGENCY</option>
            <option value="AGENT">AGENT</option>
            <option value="UNI_REP">UNI_REP</option>
            <option value="UNIVERSITY">UNIVERSITY</option>
            <option value="APPLICATION">APPLICATION</option>
            <option value="PAYMENT">PAYMENT</option>
            <option value="WALLET">WALLET</option>
            <option value="SCHOLARSHIP">SCHOLARSHIP</option>
            <option value="COUPON">COUPON</option>
            <option value="COUNTRY">COUNTRY</option>
            <option value="REPORT">REPORT</option>
            <option value="SETTINGS">SETTINGS</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Admin Operator</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Reference</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                    Fetching audit trail records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id || log.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-300 block text-xs">
                        {new Date(log.timestamp || log.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp || log.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-3 h-3 text-violet-400" />
                        {log.adminName || log.adminEmail || "Admin Staff"}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {log.ip || "System Internal"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getActionClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {log.targetType ? `${log.targetType}: ` : ""}
                      <span className="text-white font-semibold">{log.targetId || "N/A"}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      {log.reason || "System administrative action"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition inline-flex items-center gap-1"
                        title="View Full Payload Diff"
                      >
                        <Eye className="w-3.5 h-3.5 text-violet-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchLogs(page - 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchLogs(page + 1)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getActionClass(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                  <h3 className="font-bold text-white text-base mt-2">
                    Module: {selectedLog.module} • Target: {selectedLog.targetId}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 my-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Operator</span>
                    <span className="text-white font-bold">{selectedLog.adminName || selectedLog.adminEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Timestamp</span>
                    <span className="text-white font-mono">{new Date(selectedLog.timestamp || selectedLog.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-bold mb-1">Reason / Change Note</span>
                  <p className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-slate-200">
                    {selectedLog.reason || "No explicit reason specified."}
                  </p>
                </div>

                {selectedLog.previousValue && (
                  <div>
                    <span className="text-rose-400 block font-bold mb-1">Previous State</span>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-rose-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
                      {typeof selectedLog.previousValue === "object"
                        ? JSON.stringify(selectedLog.previousValue, null, 2)
                        : String(selectedLog.previousValue)}
                    </pre>
                  </div>
                )}

                {selectedLog.newValue && (
                  <div>
                    <span className="text-emerald-400 block font-bold mb-1">Updated State / Applied Changes</span>
                    <pre className="p-3 bg-slate-950 rounded-xl border border-emerald-950 text-slate-300 font-mono text-[11px] overflow-x-auto">
                      {typeof selectedLog.newValue === "object"
                        ? JSON.stringify(selectedLog.newValue, null, 2)
                        : String(selectedLog.newValue)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
