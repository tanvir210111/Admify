import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  RefreshCw,
  X,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  Award,
  AlertCircle
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } }
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  APPROVED: { label: "Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  ACTIVE: { label: "Active", cls: "bg-teal-500/15 text-teal-400 border-teal-500/30" },
  REJECTED: { label: "Rejected", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

export default function AdminUniRepApplicationsTab() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  // Review modal actions
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter !== "all") query.append("status", filter);
      if (search.trim()) query.append("search", search.trim());

      const res = await api.get(`/api/admin/university-rep-applications?${query.toString()}`);
      if (res?.data?.applications) {
        setApplications(res.data.applications);
      } else if (Array.isArray(res?.data)) {
        setApplications(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load Uni Rep applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/api/admin/university-rep-applications/${selectedApp._id}/approve`, {
        adminNotes: adminNotes.trim(),
      });
      toast.success(res?.message || "Uni Rep application approved! Activation email dispatched.");
      setSelectedApp(null);
      fetchApplications();
    } catch (err) {
      toast.error(err.message || "Approval failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      toast.error("A rejection reason is mandatory.");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await api.post(`/api/admin/university-rep-applications/${selectedApp._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes.trim(),
      });
      toast.success(res?.message || "Uni Rep application rejected.");
      setSelectedApp(null);
      setShowRejectForm(false);
      setRejectionReason("");
      fetchApplications();
    } catch (err) {
      toast.error(err.message || "Rejection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Rep name, University, Domain, App ID..."
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/60 text-slate-300 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="PENDING">Pending (Draft)</option>
            <option value="APPROVED">Approved</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            onClick={fetchApplications}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-2xl border border-slate-800/80 overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-500 uppercase tracking-widest bg-slate-900/80">
                <th className="px-5 py-3.5 font-bold">App ID</th>
                <th className="px-5 py-3.5 font-bold">Representative</th>
                <th className="px-5 py-3.5 font-bold">University</th>
                <th className="px-5 py-3.5 font-bold">Designation</th>
                <th className="px-5 py-3.5 font-bold">Submitted At</th>
                <th className="px-5 py-3.5 font-bold">Status</th>
                <th className="px-5 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                    Loading University Representative applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-500">
                    No University Representative applications found matching the criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-violet-400 font-bold">
                        {app.applicationId || "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-200">
                          {app.representativeInfo?.fullName || "Unnamed Rep"}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {app.representativeInfo?.officialEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-300">
                          {app.universityInfo?.universityName || "N/A"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {app.universityInfo?.country} {app.universityInfo?.officialEmailDomain ? `· @${app.universityInfo.officialEmailDomain}` : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {app.representativeInfo?.designation || "Authorized Rep"}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Pending Submit"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                          STATUS_MAP[app.status]?.cls || "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {STATUS_MAP[app.status]?.label || app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setShowRejectForm(false);
                          setRejectionReason("");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Review Uni Rep Application
                      <span className="font-mono text-xs px-2.5 py-0.5 bg-violet-900/30 text-violet-300 border border-violet-700/50 rounded-full">
                        {selectedApp.applicationId}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Verify University details, identity credentials, and authorization letters.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
                {/* Status Alert Banner */}
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-800/40 border-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span className="text-slate-300 font-medium">Application Status:</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_MAP[selectedApp.status]?.cls}`}>
                      {STATUS_MAP[selectedApp.status]?.label || selectedApp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Submitted: {selectedApp.submittedAt ? new Date(selectedApp.submittedAt).toLocaleString() : "N/A"}
                  </div>
                </div>

                {/* Section A: University Information */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-400" /> University Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">University Name</span>
                      <span className="text-slate-200 font-medium text-sm">{selectedApp.universityInfo?.universityName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Legal / Official Name</span>
                      <span className="text-slate-200 font-medium text-sm">{selectedApp.universityInfo?.officialLegalName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Official Website</span>
                      <a
                        href={selectedApp.universityInfo?.officialWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-400 hover:underline flex items-center gap-1"
                      >
                        {selectedApp.universityInfo?.officialWebsite || "N/A"} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email Domain</span>
                      <span className="font-mono text-slate-200">@{selectedApp.universityInfo?.officialEmailDomain || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Location</span>
                      <span className="text-slate-300">{selectedApp.universityInfo?.city}, {selectedApp.universityInfo?.country}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Institution Type</span>
                      <span className="text-slate-300">{selectedApp.universityInfo?.universityType || "Public"}</span>
                    </div>
                  </div>
                </div>

                {/* Section B: Representative Information */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-400" /> Representative Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name</span>
                      <span className="text-slate-200 font-medium text-sm">{selectedApp.representativeInfo?.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designation</span>
                      <span className="text-slate-300">{selectedApp.representativeInfo?.designation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Official University Email</span>
                      <span className="text-slate-200 font-mono">{selectedApp.representativeInfo?.officialEmail}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number</span>
                      <span className="text-slate-300">{selectedApp.representativeInfo?.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Employee / Rep ID</span>
                      <span className="text-slate-300 font-mono">{selectedApp.representativeInfo?.employeeId || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Section C: Authorization & Documents */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" /> Authorization Documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: "authorizationLetter", label: "Authorization Letter *" },
                      { key: "officialUniversityId", label: "Official University ID *" },
                      { key: "employeeIdDoc", label: "Employee / Representative ID" },
                      { key: "otherSupportingDoc", label: "Supporting Document" },
                    ].map((doc) => {
                      const docObj = selectedApp.documents?.[doc.key];
                      const hasDoc = Boolean(docObj && (docObj.dataUrl || docObj.fileUrl));
                      return (
                        <div
                          key={doc.key}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/60"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className={`w-4 h-4 flex-shrink-0 ${hasDoc ? "text-violet-400" : "text-slate-600"}`} />
                            <div className="truncate">
                              <span className="text-xs font-medium text-slate-300 block truncate">{doc.label}</span>
                              <span className="text-[10px] text-slate-500 truncate block">
                                {hasDoc ? (docObj.originalName || "Uploaded") : "Not provided"}
                              </span>
                            </div>
                          </div>
                          {hasDoc && (
                            <a
                              href={docObj.dataUrl || docObj.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={docObj.originalName || "document.pdf"}
                              className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1 transition-colors flex-shrink-0"
                            >
                              View <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section D: Academic Scope */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" /> Academic Scope
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-1">Study Levels Handled:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.academicScope?.studyLevels?.map((lvl) => (
                          <span key={lvl} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md text-[11px]">
                            {lvl}
                          </span>
                        )) || <span className="text-slate-500">None specified</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Programs / Departments:</span>
                      <span className="text-slate-300">{selectedApp.academicScope?.programsHandled || "All Departments"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Regions / Countries Handled:</span>
                      <span className="text-slate-300">{selectedApp.academicScope?.countriesHandled?.join(", ") || "Global"}</span>
                    </div>
                  </div>
                </div>

                {/* Rejection Form Drawer (if opened) */}
                {showRejectForm && (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-3">
                    <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Specify Rejection Reason
                    </h4>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain to the representative why this application was rejected (e.g. invalid authorization letter, mismatched university email domain)..."
                      rows={3}
                      className="w-full bg-slate-900 border border-rose-700/50 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedApp.status !== "APPROVED" && selectedApp.status !== "ACTIVE" && (
                    <>
                      {showRejectForm ? (
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handleReject}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/30 flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Confirm Rejection
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowRejectForm(true)}
                          className="px-4 py-2 bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-700/50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={handleApprove}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {isProcessing ? "Processing..." : "Approve & Dispatch Activation Link"}
                      </button>
                    </>
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
