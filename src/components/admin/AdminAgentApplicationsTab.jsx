import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Building2,
  Key,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  X,
  Search,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  APPROVED: { label: "Approved / Code Issued", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  REJECTED: { label: "Rejected", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  REGISTERED: { label: "Registered / Completed", cls: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  COMPLETED: { label: "Registered / Completed", cls: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
};

export default function AdminAgentApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Review & Action State
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/admin/agent-applications"
          : `/api/admin/agent-applications?status=${filter.toUpperCase()}`;
      const res = await api.get(url);
      if (res?.data?.applications) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load agent applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/api/admin/agent-applications/${selectedApp._id}/approve`, {
        adminNotes: "Approved by Admin. Activation code generated.",
      });

      if (res?.success) {
        toast.success(`Agent application approved! Activation code generated: ${res.data?.activationCode}`);
        // Update local selectedApp with returned approved state
        setSelectedApp(res.data.application || {
          ...selectedApp,
          status: "APPROVED",
          activationCode: res.data.activationCode,
          activationCodeStatus: "ISSUED",
          activationCodeExpires: res.data.activationCodeExpires,
        });
        fetchApplications();
      } else {
        toast.error(res?.message || "Failed to approve application.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to approve application.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post(`/api/admin/agent-applications/${selectedApp._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
      });

      if (res?.success) {
        toast.success("Agent application rejected.");
        setSelectedApp(res.data?.application || { ...selectedApp, status: "REJECTED", rejectionReason: rejectionReason.trim() });
        setShowRejectForm(false);
        setRejectionReason("");
        fetchApplications();
      } else {
        toast.error(res?.message || "Failed to reject application.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to reject application.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success("Activation code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredApps = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (app.applicationId || "").toLowerCase().includes(q) ||
      (app.agentName || "").toLowerCase().includes(q) ||
      (app.email || "").toLowerCase().includes(q) ||
      (app.phone || "").toLowerCase().includes(q) ||
      (app.agencyName || "").toLowerCase().includes(q) ||
      (app.agencyApplicationId || "").toLowerCase().includes(q)
    );
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const registeredCount = applications.filter((a) => a.status === "REGISTERED" || a.status === "COMPLETED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Nominations", val: applications.length, color: "text-blue-400", icon: FileText },
          { label: "Pending Review", val: pendingCount, color: "text-amber-400", icon: Clock },
          { label: "Approved & Code Issued", val: approvedCount, color: "text-emerald-400", icon: Key },
          { label: "Registered Agents", val: registeredCount, color: "text-violet-400", icon: UserCheck },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={fade}
            className="p-4 rounded-2xl border"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending" },
            { id: "approved", label: "Approved" },
            { id: "registered", label: "Registered" },
            { id: "rejected", label: "Rejected" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors capitalize ${
                filter === f.id
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, agency..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 font-mono"
            />
          </div>
          <button
            onClick={() => fetchApplications()}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <motion.div
        variants={fade}
        initial="hidden"
        animate="show"
        className="rounded-2xl border overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/6 text-slate-400 bg-white/2">
                <th className="py-3 px-4 font-semibold">Agent App ID</th>
                <th className="py-3 px-4 font-semibold">Sponsoring Agency</th>
                <th className="py-3 px-4 font-semibold">Agent Candidate</th>
                <th className="py-3 px-4 font-semibold">Submitted</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Activation Code</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    {isLoading ? "Loading agent applications..." : "No agent applications found."}
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const statusInfo = STATUS_MAP[app.status] || {
                    label: app.status,
                    cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
                  };
                  return (
                    <tr key={app._id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-violet-300">
                        {app.applicationId}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-violet-400" />
                          {app.agencyName || "Agency Partner"}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {app.agencyApplicationId || app.agency?._id || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{app.agentName}</div>
                        <div className="text-[11px] text-slate-400">{app.email}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{app.phone}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {app.submittedAt
                          ? new Date(app.submittedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.cls}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {app.activationCode ? (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-violet-950/40 border border-violet-500/30 text-violet-300 font-mono text-[11px]">
                            <Key className="w-3 h-3 text-violet-400" />
                            <span>{app.activationCode}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 uppercase">
                              {app.activationCodeStatus || "ISSUED"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Pending Approval</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectForm(false);
                            setRejectionReason("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 font-semibold transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between sticky top-0 z-20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Agent Nomination Review
                    </span>
                    <h2 className="text-lg font-bold text-white">{selectedApp.agentName}</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Application ID: <strong className="text-violet-300">{selectedApp.applicationId}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                {/* Sponsoring Agency Section */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Sponsoring Agency Accreditation
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Agency Name:</span>
                      <strong className="text-white text-sm">{selectedApp.agencyName || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Agency Application ID / Reference:</span>
                      <strong className="text-violet-300 font-mono">
                        {selectedApp.agencyApplicationId || selectedApp.agency?._id || "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Candidate Agent Section */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Nominated Agent Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name:</span>
                      <strong className="text-white">{selectedApp.agentName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designation:</span>
                      <strong className="text-white">{selectedApp.designation || "Counselor / Agent"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Official Email:</span>
                      <strong className="text-cyan-300 font-mono">{selectedApp.email}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number:</span>
                      <strong className="text-white font-mono">{selectedApp.phone}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Country / Market Specialization:</span>
                      <strong className="text-white">
                        {Array.isArray(selectedApp.countrySpecialization)
                          ? selectedApp.countrySpecialization.join(", ")
                          : selectedApp.countrySpecialization || "Global Education"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Activation Code Display if Approved */}
                {selectedApp.activationCode && (
                  <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                        <Key className="w-4 h-4 text-violet-400" /> Issued Activation Code
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30 font-mono">
                        Status: {selectedApp.activationCodeStatus || "ISSUED"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-violet-500/50">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Activation Code</span>
                        <span className="text-lg font-mono font-black text-white tracking-widest">
                          {selectedApp.activationCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedApp.activationCode)}
                        className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedCode ? "Copied" : "Copy Code"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>
                        <span>Expires At: </span>
                        <strong className="text-slate-200">
                          {selectedApp.activationCodeExpires
                            ? new Date(selectedApp.activationCodeExpires).toLocaleDateString()
                            : "7 days from issuance"}
                        </strong>
                      </div>
                      <div>
                        <span>Registration State: </span>
                        <strong className="text-slate-200">{selectedApp.status}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Details if Rejected */}
                {selectedApp.status === "REJECTED" && (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2 text-xs">
                    <span className="font-bold text-rose-400 uppercase flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Rejection Details
                    </span>
                    <p className="text-slate-300 italic">{selectedApp.rejectionReason || "No details provided."}</p>
                  </div>
                )}

                {/* Inline Rejection Form */}
                {showRejectForm && (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/40 space-y-3">
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Specify Rejection Reason *
                    </h4>
                    <p className="text-xs text-slate-300">
                      Please enter a clear explanation. This reason will be recorded in the audit trail.
                    </p>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Sponsoring agency nomination details could not be validated or candidate profile is incomplete."
                      className="w-full bg-slate-900 border border-rose-500/50 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-400"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectForm(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between sticky bottom-0 z-20">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {!showRejectForm && selectedApp.status !== "REJECTED" && selectedApp.status !== "REGISTERED" && (
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Application
                    </button>
                  )}

                  {(selectedApp.status === "PENDING" || selectedApp.status === "UNDER_REVIEW") && (
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isProcessing ? "Generating Code..." : "Approve & Generate Activation Code"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
