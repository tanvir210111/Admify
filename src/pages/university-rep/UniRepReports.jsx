import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Agency Misrepresentation",
    priority: "MEDIUM",
    targetType: "agency",
    targetName: "",
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/reports");
      if (res?.success && Array.isArray(res?.data?.reports)) {
        setReports(res.data.reports);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load dispute reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Report Title and Description are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/api/university-rep/reports", form);
      if (res?.success) {
        toast.success("Issue report officially submitted to Admify Compliance.");
        setForm({
          title: "",
          description: "",
          category: "Agency Misrepresentation",
          priority: "MEDIUM",
          targetType: "agency",
          targetName: "",
        });
        setModalOpen(false);
        fetchReports();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "RESOLVED":
        return <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">RESOLVED</span>;
      case "UNDER_REVIEW":
      case "UNDER_INVESTIGATION":
        return <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">UNDER REVIEW</span>;
      case "CLOSED":
        return <span className="px-2 py-0.5 rounded bg-slate-500/15 text-slate-300 border border-slate-500/30 text-[10px] font-bold">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold">PENDING COMPLIANCE</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Integrity & Dispute Resolution
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Reports & Operational Issues
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit formal compliance grievances regarding partner agencies, invalid documentation, or system inquiries.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Submit Issue Ticket
        </button>
      </div>

      {/* ── Reports List ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading issue reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No reports or issues logged</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your university representative account has an unblemished record with zero active disputes or compliance grievances.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => (
            <motion.div
              key={rep._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5 bg-[#0B1228] border border-white/5 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-purple-400 text-xs font-bold">{rep.reportId}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{rep.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{rep.title}</h3>
                </div>
                {getStatusBadge(rep.status)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {rep.description}
              </p>

              <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Priority: <span className="font-semibold text-white">{rep.priority}</span></span>
                  {rep.targetName && (
                    <span>Related Entity: <span className="font-semibold text-slate-300">{rep.targetName}</span></span>
                  )}
                </div>
                <span>Submitted: {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : "Recent"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Submit Report Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B1228] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Submit Issue to Admify Administration</h3>
                    <p className="text-[11px] text-slate-400">Directly routed to platform compliance investigators</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Fraudulent academic certificate submitted via Agency X"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="Agency Misrepresentation">Agency Misrepresentation</option>
                      <option value="Document Authenticity Issue">Document Authenticity Issue</option>
                      <option value="Applicant Eligibility Dispute">Applicant Eligibility Dispute</option>
                      <option value="Platform Technical Issue">Platform Technical Issue</option>
                      <option value="Other Operational Grievance">Other Operational Grievance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Urgency / Priority
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent / Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Related Entity / Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.targetName}
                    onChange={(e) => setForm({ ...form, targetName: e.target.value })}
                    placeholder="e.g. Agency Name or Candidate Application ID"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detailed Explanation & Facts *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detail the circumstances, application references, dates, and evidence..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Submit Report</span>
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
