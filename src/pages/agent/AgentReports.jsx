import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  RefreshCw,
  X,
  FileText,
  ShieldAlert,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STATUS_COLOR = {
  OPEN: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  UNDER_REVIEW: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  RESOLVED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  CLOSED: "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function AgentReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [targetType, setTargetType] = useState("student_issue");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/reports");
      if (res?.data?.success) {
        setReports(res.data.data.reports || []);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
      toast.error("Failed to load operational issue reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide the issue summary.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/agent/reports", {
        targetType,
        reason: reason.trim(),
        details: details.trim(),
      });

      if (res?.data?.success) {
        toast.success("Operational report filed for Admin & Agency review.");
        setIsModalOpen(false);
        setReason("");
        setDetails("");
        setTargetType("student_issue");
        fetchReports();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1400px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" /> Operational Issue Reporting
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Report admissions discrepancies, applicant non-responsiveness, institutional delays, or technical issues to platform administration.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            File Operational Report
          </button>
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Reports Table */}
      <motion.div
        variants={fade}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading operational issue reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Reports Registered</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              You have not filed any operational reports or admissions dispute tickets yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/6">
                <tr>
                  <th className="py-3.5 px-4">Ticket / ID</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Issue Summary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Filed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {reports.map((r) => {
                  const statusClass =
                    STATUS_COLOR[r.status] || STATUS_COLOR.OPEN;
                  return (
                    <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-400">
                        {r._id?.slice(-8).toUpperCase()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-white/5 text-[11px]">
                          {r.targetType?.replace("_", " ") || "Operational Issue"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{r.reason}</div>
                        {r.details && (
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {r.details}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
                        >
                          {r.status || "OPEN"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Modal: File Issue Report */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0B1228] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  File Operational Issue Report
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Issue Category *
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="student_issue">Student Non-Responsiveness / Document Delay</option>
                    <option value="application_issue">Application Processing Discrepancy</option>
                    <option value="university_issue">University Admission Decision Delay</option>
                    <option value="document_issue">Document Authenticity or Verification Issue</option>
                    <option value="technical_issue">Platform Technical / System Bug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Issue Summary *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of the operational problem..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Detailed Explanation & Evidence
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific application IDs, student emails, timeline details, or evidence..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-md shadow-amber-600/30 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
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
