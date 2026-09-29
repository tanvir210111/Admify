import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  AlertCircle,
  RefreshCw,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  X,
  Send,
  ShieldCheck,
} from "lucide-react";

import { useAgencyBadges } from "../../context/AgencyBadgeContext";

const REPORT_STATUS_TABS = [
  { key: "all", label: "All Reports" },
  { key: "PENDING_REVIEW", label: "PENDING_REVIEW" },
  { key: "UNDER_INVESTIGATION", label: "UNDER_INVESTIGATION" },
  { key: "RESOLVED", label: "RESOLVED" },
];

export default function AgencyReports() {
  const { getStatusCount, markEntityAsSeen } = useAgencyBadges();
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/reports");
      if (res.success && res.data) {
        setReports(res.data.reports || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRowClick = (r) => {
    const rId = r._id || r.reportId;
    if (!r.isSeenByAgency) {
      markEntityAsSeen("report", rId);
      setReports((prev) =>
        prev.map((item) => ((item._id === rId || item.reportId === rId) ? { ...item, isSeenByAgency: true } : item))
      );
    }
  };

  const handleOpenRespond = (report) => {
    setSelectedReport(report);
    setResponseText("");
    const rId = report._id || report.reportId;
    if (!report.isSeenByAgency) {
      markEntityAsSeen("report", rId);
      setReports((prev) =>
        prev.map((item) => ((item._id === rId || item.reportId === rId) ? { ...item, isSeenByAgency: true } : item))
      );
    }
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim() || !selectedReport) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/api/agency/reports/${selectedReport._id}/respond`, {
        responseText: responseText.trim(),
      });
      if (res.success) {
        toast.success("Official explanation submitted for Admin review!");
        setSelectedReport(null);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === "all") return true;
    return (r.status || "PENDING_REVIEW") === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Reports & Operational Issues</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Inquiries, dispute inquiries, and official platform compliance reports.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {REPORT_STATUS_TABS.map((st) => {
          const unseenCount = st.key === "all" ? getStatusCount("reports", "all") : getStatusCount("reports", st.key);
          return (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === st.key
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-bold"
                  : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{st.label}</span>
              {unseenCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusFilter === st.key ? "bg-white text-violet-700" : "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                }`}>
                  [{unseenCount}]
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Reports Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-75" />
            <p className="text-white text-sm font-semibold">Zero open complaints or disputes</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Your agency maintains an unblemished operational standing with zero reported incidents.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Logged At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredReports.map((r) => {
                  const isUnseen = r.isSeenByAgency === false;
                  return (
                    <tr
                      key={r._id}
                      onClick={() => handleRowClick(r)}
                      className={`transition-all cursor-pointer ${
                        isUnseen
                          ? "border-l-4 border-l-violet-500 bg-violet-950/30 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)]"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        {isUnseen && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40 uppercase tracking-wider mb-1">
                            NEW UPDATE
                          </span>
                        )}
                        <p className="text-white font-medium">{r.reason || "Operational Inquiry"}</p>
                        <p className="text-slate-400 text-[11px] truncate max-w-sm mt-0.5">{r.details}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {r.targetType || "Agency Service"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            r.status === "RESOLVED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {r.status || "PENDING_REVIEW"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenRespond(r);
                          }}
                          className="px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] font-semibold transition-colors"
                        >
                          Respond
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Submit Agency Explanation</h3>
                <p className="text-xs text-slate-400">Issue: {selectedReport.reason}</p>
                {selectedReport.details && (
                  <p className="text-slate-300 text-xs mt-2 bg-white/5 p-2 rounded-lg border border-white/5">
                    {selectedReport.details}
                  </p>
                )}
              </div>

              <form onSubmit={handleSendResponse} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Agency Statement / Action Plan *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Provide detailed facts and context for Platform Compliance..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !responseText.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50"
                  >
                    {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Submit to Admin</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
