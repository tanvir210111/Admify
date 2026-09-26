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
  AlertCircle,
  Trash2
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
  PROFILE_INCOMPLETE: { label: "Profile Incomplete", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
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

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null); // { app, confirmInput: "" }
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filter !== "all") query.append("status", filter);
      if (search.trim()) query.append("search", search.trim());

      const res = await api.get(`/api/admin/university-rep-applications?${query.toString()}`);
      const list = res?.data?.applications || res?.applications || (Array.isArray(res?.data) ? res.data : []);
      setApplications(list);
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
      toast.success(res?.message || res?.data?.message || "Uni Rep application rejected.");
      const rejectedId = selectedApp._id;
      setApplications((prev) =>
        prev.map((a) => (a._id === rejectedId ? { ...a, status: "REJECTED", profileStatus: "REJECTED" } : a))
      );
      setSelectedApp(null);
      setShowRejectForm(false);
      setRejectionReason("");
      await fetchApplications();
    } catch (err) {
      toast.error(err.message || "Rejection failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal?.app) return;
    if (deleteModal.confirmInput !== "DELETE") {
      toast.error("Please type DELETE to confirm permanent deletion.");
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/admin/university-rep-applications/${deleteModal.app._id}`);
      toast.success(res?.message || res?.data?.message || "University representative permanently deleted.");
      const deletedId = deleteModal.app._id;
      setDeleteModal(null);
      if (selectedApp && selectedApp._id === deletedId) {
        setSelectedApp(null);
      }
      fetchApplications();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Deletion failed.");
    } finally {
      setDeleteLoading(false);
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
            <option value="PENDING">Pending Review</option>
            <option value="PROFILE_INCOMPLETE">Profile Incomplete</option>
            <option value="UNDER_REVIEW">Under Review</option>
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
                applications.map((app) => {
                  const rep = app.representative || app.representativeInfo || {};
                  const uni = app.university || app.universityInfo || {};
                  const statusKey = app.status === 'REJECTED' || app.profileStatus === 'REJECTED'
                    ? 'REJECTED'
                    : (app.status === 'APPROVED' || app.status === 'ACTIVE'
                      ? app.status
                      : (app.status === 'UNDER_REVIEW' || app.profileStatus === 'UNDER_REVIEW'
                        ? 'UNDER_REVIEW'
                        : (!app.isProfileComplete || app.status === 'PROFILE_INCOMPLETE' || app.profileStatus === 'PROFILE_INCOMPLETE'
                          ? 'PROFILE_INCOMPLETE'
                          : (app.status || 'PENDING'))));
                  const statusInfo = STATUS_MAP[statusKey] || STATUS_MAP.PENDING;

                  return (
                    <tr key={app._id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-violet-400 font-bold">
                          {app.applicationId || "Legacy Profile"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-200">
                            {rep.fullName || app.user?.name || "Not provided"}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {rep.officialEmail || app.user?.email || "Not provided"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-300">
                            {uni.name || uni.universityName || "Not provided"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {uni.country || uni.city || "Not provided"} {uni.domain || uni.officialEmailDomain ? `· @${uni.domain || uni.officialEmailDomain}` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {rep.designation || "Not provided"}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400">
                        {app.submittedAt || app.createdAt ? new Date(app.submittedAt || app.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                            statusInfo.cls
                          }`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectForm(false);
                              setRejectionReason("");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Review
                          </button>
                          {app.status === "REJECTED" ? (
                            <button
                              onClick={() => setDeleteModal({ app, confirmInput: "" })}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                              title="Delete rejected representative permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          ) : (
                            <button
                              disabled
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/40 text-slate-500 border border-slate-700/40 rounded-xl text-xs font-semibold opacity-40 cursor-not-allowed"
                              title="University representative must be rejected before deletion."
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                {(() => {
                  const modalStatusKey = selectedApp.profileStatus === 'PROFILE_INCOMPLETE' || selectedApp.status === 'PROFILE_INCOMPLETE' || (!selectedApp.isProfileComplete && selectedApp.status === 'PENDING')
                    ? 'PROFILE_INCOMPLETE'
                    : selectedApp.status;
                  const statusInfo = STATUS_MAP[modalStatusKey] || STATUS_MAP.PENDING;
                  return (
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-800/40 border-slate-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-400" />
                        <span className="text-slate-300 font-medium">Application Status:</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Submitted: {selectedApp.submittedAt || selectedApp.createdAt ? new Date(selectedApp.submittedAt || selectedApp.createdAt).toLocaleString() : "N/A"}
                      </div>
                    </div>
                  );
                })()}

                {/* Legacy Profile Incomplete Banner */}
                {!selectedApp.isProfileComplete && (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Incomplete Registration Profile</span>
                      <span className="text-amber-200/80 text-[11px] leading-relaxed">
                        Legacy verification fields (Employee ID, University City, and/or Website) were not provided during initial registration. Account can still be reviewed and governed safely.
                      </span>
                    </div>
                  </div>
                )}

                {/* Section A: University Information */}
                {(() => {
                  const uni = selectedApp.university || selectedApp.universityInfo || {};
                  const rep = selectedApp.representative || selectedApp.representativeInfo || {};
                  return (
                    <>
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-violet-400" /> University Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-slate-500 block">University Name</span>
                            <span className="text-slate-200 font-medium text-sm">{uni.name || uni.universityName || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Legal / Official Name</span>
                            <span className="text-slate-200 font-medium text-sm">{uni.legalName || uni.officialLegalName || uni.name || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Official Website</span>
                            {uni.website || uni.officialWebsite ? (
                              <a
                                href={(uni.website || uni.officialWebsite).startsWith("http") ? (uni.website || uni.officialWebsite) : `https://${uni.website || uni.officialWebsite}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-violet-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                              >
                                {uni.website || uni.officialWebsite} <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-400">Not provided</span>
                            )}
                          </div>
                          <div>
                            <span className="text-slate-500 block">Email Domain</span>
                            <span className="font-mono text-slate-200">
                              {uni.domain || uni.officialEmailDomain ? `@${uni.domain || uni.officialEmailDomain}` : "Not provided"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Location</span>
                            <span className="text-slate-300">
                              {[uni.city, uni.country].filter(Boolean).join(", ") || "Not provided"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Institution Type</span>
                            <span className="text-slate-300">{uni.type || uni.universityType || "Public"}</span>
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
                            <span className="text-slate-200 font-medium text-sm">{rep.fullName || selectedApp.user?.name || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Designation</span>
                            <span className="text-slate-300">{rep.designation || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Official University Email</span>
                            <span className="text-slate-200 font-mono">{rep.officialEmail || selectedApp.user?.email || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Phone Number</span>
                            <span className="text-slate-300">{rep.phone || selectedApp.user?.phone || "Not provided"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Employee / Rep ID</span>
                            <span className="text-slate-300 font-mono">{rep.employeeId || "Not provided"}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}

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
                  {selectedApp.status === "REJECTED" && (
                    <button
                      type="button"
                      onClick={() => setDeleteModal({ app: selectedApp, confirmInput: "" })}
                      className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </button>
                  )}
                  {selectedApp.status !== "APPROVED" && selectedApp.status !== "ACTIVE" && selectedApp.status !== "REJECTED" && (
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

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete University Representative?</h3>
                  <p className="text-xs text-rose-300/80">Permanent database deletion</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                This action permanently deletes the rejected university representative record for{" "}
                <strong className="text-white">
                  {deleteModal.app?.representative?.fullName || deleteModal.app?.representativeInfo?.fullName || deleteModal.app?.user?.name || "Representative"}
                </strong>{" "}
                ({deleteModal.app?.university?.name || deleteModal.app?.universityInfo?.universityName || "University Partner"}).
              </p>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                This cannot be undone. To proceed, please type <span className="font-mono font-bold text-white uppercase">DELETE</span> below:
              </div>

              <input
                type="text"
                value={deleteModal.confirmInput}
                onChange={(e) => setDeleteModal({ ...deleteModal, confirmInput: e.target.value })}
                placeholder="Type DELETE to confirm"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                autoFocus
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteModal.confirmInput !== "DELETE" || deleteLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteLoading ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
