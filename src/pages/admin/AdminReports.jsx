import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  ShieldAlert,
  User,
  Building2,
  FileText,
  CreditCard,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

const STATUS_BADGES = {
  OPEN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  INVESTIGATING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  REJECTED: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  CLOSED: "bg-slate-700/50 text-slate-400 border-slate-700",
};

const PRIORITY_BADGES = {
  urgent: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  low: "bg-slate-800 text-slate-400 border-slate-700",
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [selectedReport, setSelectedReport] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [statusInput, setStatusInput] = useState("INVESTIGATING");
  const [priorityInput, setPriorityInput] = useState("medium");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [resolutionSummaryInput, setResolutionSummaryInput] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/reports", {
        params: {
          status: statusFilter,
          targetType: targetFilter,
          priority: priorityFilter,
          search: search || undefined,
        },
      });
      if (res?.data?.reports) {
        setReports(res.data.reports);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, targetFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const openReviewModal = (r) => {
    setSelectedReport(r);
    setStatusInput(r.status || "INVESTIGATING");
    setPriorityInput(r.priority || "medium");
    setAdminNotesInput(r.adminNotes || "");
    setResolutionSummaryInput(r.resolutionSummary || "");
    setUpdateModalOpen(true);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    try {
      setUpdating(true);
      const res = await api.patch(`/api/admin/reports/${selectedReport._id || selectedReport.id}`, {
        status: statusInput,
        priority: priorityInput,
        adminNotes: adminNotesInput,
        resolutionSummary: resolutionSummaryInput,
      });

      toast.success(`Report #${selectedReport.reportId || selectedReport._id} status updated to ${statusInput}`);
      setUpdateModalOpen(false);
      fetchReports();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update report status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 max-w-[1500px] mx-auto text-slate-100">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" /> Reports & Complaints Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Investigate suspicious activities, agent complaints, application disputes, and service issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by report ID, subject, reporter email, target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition"
          />
        </form>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Targets</option>
            <option value="agent">Agent</option>
            <option value="agency">Agency</option>
            <option value="application">Application</option>
            <option value="payment">Payment</option>
            <option value="conversation">Conversation</option>
            <option value="service_issue">Service Issue</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Report ID & Date</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Target Type</th>
                <th className="py-3 px-4">Subject & Details</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-400" />
                    Loading complaints & reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No reports found matching criteria.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report._id || report.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-white block">
                        {report.reportId || report._id?.substring(0, 10)}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {report.reporter?.name || "Anonymous / Platform User"}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {report.reporter?.email || report.reporterModel || "student"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-medium text-[11px] uppercase">
                        {report.targetType === "agent" && <User className="w-3 h-3 text-blue-400" />}
                        {report.targetType === "agency" && <Building2 className="w-3 h-3 text-amber-400" />}
                        {report.targetType === "application" && <FileText className="w-3 h-3 text-violet-400" />}
                        {report.targetType === "payment" && <CreditCard className="w-3 h-3 text-emerald-400" />}
                        {report.targetType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-white truncate">{report.subject}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{report.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                          PRIORITY_BADGES[report.priority] || PRIORITY_BADGES.medium
                        }`}
                      >
                        {report.priority || "medium"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          STATUS_BADGES[report.status] || STATUS_BADGES.OPEN
                        }`}
                      >
                        {report.status || "OPEN"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openReviewModal(report)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-xs border border-rose-500/20 transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Resolution Modal */}
      <AnimatePresence>
        {updateModalOpen && selectedReport && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-rose-400 font-bold">
                    Case #{selectedReport.reportId || selectedReport._id}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedReport.subject}</h2>
                </div>
                <button
                  onClick={() => setUpdateModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {/* Case Details */}
              <div className="space-y-4 my-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Reported Target</span>
                    <span className="text-white font-bold uppercase">{selectedReport.targetType}</span>
                    {selectedReport.targetId && (
                      <span className="text-[10px] text-slate-500 block font-mono">ID: {selectedReport.targetId}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Reported By</span>
                    <span className="text-white font-bold">{selectedReport.reporter?.name || "System User"}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{selectedReport.reporter?.email}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Detailed Complaint</h4>
                  <p className="text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Attached Evidence</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.evidence.map((ev, i) => (
                        <a
                          key={i}
                          href={ev.url || ev}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-rose-400 flex items-center gap-1.5 border border-slate-700"
                        >
                          <FileText className="w-3.5 h-3.5" /> Evidence Document #{i + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Update Status Form */}
              <form onSubmit={handleUpdateReport} className="space-y-4 pt-4 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Investigation Status</label>
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Priority Level</label>
                    <select
                      value={priorityInput}
                      onChange={(e) => setPriorityInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Internal Investigation Notes (Admin only)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="Findings, agent interview remarks, verification notes..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Resolution Summary (Notified to user upon resolution)
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionSummaryInput}
                    onChange={(e) => setResolutionSummaryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    placeholder="Action taken: warnings issued, wallet adjustment refunded, case closed..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setUpdateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/20"
                  >
                    {updating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Save Resolution & Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
