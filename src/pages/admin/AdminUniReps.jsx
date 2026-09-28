import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Building2, Search, Filter, Eye, CheckCircle2,
  XCircle, AlertTriangle, FileText, ExternalLink, ShieldCheck,
  RefreshCw, X, Clock, ChevronRight, Phone, Mail, Award, Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { triggerAdminBadgeRefresh } from "../../context/AdminBadgeContext";

const STATUS_MAP = {
  PENDING: { label: "Pending Review", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  PROFILE_INCOMPLETE: { label: "Profile Incomplete", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  APPROVED: { label: "Approved (Active/Pending Email)", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  ACTIVE: { label: "Active & Verified", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  REJECTED: { label: "Rejected", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
};

export default function AdminUniReps() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  // Review Modal State
  const [actionModal, setActionModal] = useState(null); // { app, targetStatus }
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState(null); // { app, confirmInput: "" }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Document Viewer
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = filter !== "all"
        ? `/api/admin/university-rep-applications?status=${encodeURIComponent(filter)}&search=${encodeURIComponent(search)}`
        : `/api/admin/university-rep-applications?search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      const isSuccess = res?.success || res?.data?.success;
      const apps = res?.data?.applications || res?.applications || [];
      if (isSuccess) {
        setApplications(apps);
      } else {
        toast.error(res?.message || res?.data?.message || "Failed to load representative applications");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message || "Failed to load representative applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 250);
    return () => clearTimeout(timer);
  }, [filter, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleApprove = async () => {
    if (!actionModal?.app) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/api/admin/university-rep-applications/${actionModal.app._id}/approve`, {
        adminNotes: adminNotes.trim(),
      });
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || "University representative approved and account activated.");
        setActionModal(null);
        setAdminNotes("");
        fetchApplications();
        triggerAdminBadgeRefresh();
        if (selectedApp && actionModal?.app && selectedApp._id === actionModal.app._id) {
          setSelectedApp({ ...selectedApp, status: "APPROVED" });
        }
      } else {
        toast.error(res?.message || res?.data?.message || "Approval failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Network error during approval");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionModal?.app) return;
    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/api/admin/university-rep-applications/${actionModal.app._id}/reject`, {
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes.trim(),
      });
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || "Application rejected.");
        const appId = actionModal.app._id;
        setActionModal(null);
        setRejectionReason("");
        setAdminNotes("");
        setApplications((prev) =>
          prev.map((a) => (a._id === appId ? { ...a, status: "REJECTED", profileStatus: "REJECTED" } : a))
        );
        if (selectedApp && selectedApp._id === appId) {
          setSelectedApp((prev) => (prev ? { ...prev, status: "REJECTED", profileStatus: "REJECTED" } : null));
        }
        await fetchApplications();
        triggerAdminBadgeRefresh();
      } else {
        toast.error(res?.message || res?.data?.message || "Rejection failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Network error during rejection");
    } finally {
      setActionLoading(false);
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
      const isSuccess = res?.success || res?.data?.success;
      if (isSuccess) {
        toast.success(res?.message || res?.data?.message || "University representative permanently deleted.");
        const deletedId = deleteModal.app._id;
        setDeleteModal(null);
        if (selectedApp && selectedApp._id === deletedId) {
          setSelectedApp(null);
        }
        fetchApplications();
        triggerAdminBadgeRefresh();
      } else {
        toast.error(res?.message || res?.data?.message || "Deletion failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Network error during deletion");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto pb-10 min-w-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-emerald-400" /> University Representative Governance
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Institutional credential auditing, official verification, and single-use account activation
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Toolbar: Search + Filter */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between w-full max-w-full min-w-0"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search representative, university, App ID..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto min-w-0 max-w-full">
          {["all", "PENDING", "PROFILE_INCOMPLETE", "UNDER_REVIEW", "APPROVED", "ACTIVE", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${
                filter === st
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {st === "all" ? "All Applications" : STATUS_MAP[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div
        className="rounded-2xl border overflow-hidden w-full max-w-full"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Representative & University</th>
                <th className="px-4 py-3 font-bold">Designation & Dept</th>
                <th className="px-4 py-3 font-bold">Official Email</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold">Submitted Date</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading university representatives...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No university representative applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => {
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
                    <tr
                      key={app._id}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                    >
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-bold text-white text-xs">
                            {app.representative?.fullName || app.user?.name || "Not provided"}
                          </p>
                          <p className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {app.university?.name || "Not provided"}
                          </p>
                          <span className="font-mono text-[9px] text-slate-500">{app.applicationId || "Legacy Profile"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-200 font-semibold">{app.representative?.designation || "Not provided"}</p>
                        <p className="text-slate-400 text-[10px]">{app.representative?.department || "Admissions Dept"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                        {app.representative?.officialEmail || app.user?.email || "Not provided"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Inspect Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {app.status !== "APPROVED" && app.status !== "ACTIVE" && app.status !== "REJECTED" && (
                            <button
                              onClick={() => setActionModal({ app, targetStatus: "APPROVED" })}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {app.status !== "REJECTED" && (
                            <button
                              onClick={() => setActionModal({ app, targetStatus: "REJECTED" })}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          {app.status === "REJECTED" ? (
                            <button
                              onClick={() => setDeleteModal({ app, confirmInput: "" })}
                              className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Delete rejected representative permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-2 py-1 rounded-lg bg-white/5 text-slate-500 border border-white/5 text-[10px] font-bold opacity-40 cursor-not-allowed flex items-center gap-1"
                              title="University representative must be rejected before deletion."
                            >
                              <Trash2 className="w-3 h-3" />
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

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 p-6 overflow-y-auto custom-scrollbar border-l border-white/10 flex flex-col justify-between"
              style={{ background: "#070B1E" }}
            >
              <div className="space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-white/8">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-600/20 text-emerald-300 border border-emerald-500/30">
                      Representative Dossier
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {selectedApp.representative?.fullName || selectedApp.user?.name}
                    </h3>
                    <p className="font-mono text-xs text-emerald-400">{selectedApp.applicationId}</p>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Incomplete Profile Alert Banner */}
                {!selectedApp.isProfileComplete && (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Incomplete Registration Profile</span>
                      <span className="text-amber-200/80 text-[11px] leading-relaxed">
                        Legacy verification fields (Employee ID, University City, and/or Website) were not provided in initial registration. Account can still be reviewed and governed safely.
                      </span>
                    </div>
                  </div>
                )}

                {/* University Info */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Institutional Affiliation</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">University</span>
                      <span className="text-white font-semibold">{selectedApp.university?.name || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Country</span>
                      <span className="text-white font-semibold">{selectedApp.university?.country || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">City</span>
                      <span className="text-white font-semibold">{selectedApp.university?.city || "Not provided"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Website</span>
                      {selectedApp.university?.website ? (
                        <a
                          href={selectedApp.university?.website?.startsWith("http") ? selectedApp.university.website : `https://${selectedApp.university.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          {selectedApp.university.website} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        <span className="text-slate-400">Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Official Email</span>
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">
                        {selectedApp.representative?.officialEmail || selectedApp.user?.email || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Employee / Staff ID</span>
                      <span className="text-slate-200 font-mono">{selectedApp.representative?.employeeId || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Scope & Programs */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Academic Scope & Destinations Handled</p>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">Target Regions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedApp.regionsHandled || ["South Asia", "Southeast Asia", "Middle East"]).map((r, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/4 text-slate-300 text-[10px]">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compliance Documents */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2.5 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Verification Credentials</p>
                  {[
                    { label: "Institutional Employment ID Card", doc: selectedApp.documents?.idCard },
                    { label: "Official Authorization Letter / MOU", doc: selectedApp.documents?.authorizationLetter },
                    { label: "Visiting Card / Professional Credential", doc: selectedApp.documents?.visitingCard },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white/3 flex items-center justify-between">
                      <span className="text-white font-semibold">{item.label}</span>
                      {item.doc?.fileData ? (
                        <button
                          onClick={() => setPreviewDoc(item.doc)}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View Doc
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">Not Provided</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/8 flex gap-2">
                {selectedApp.status !== "APPROVED" && selectedApp.status !== "ACTIVE" && selectedApp.status !== "REJECTED" && (
                  <button
                    onClick={() => setActionModal({ app: selectedApp, targetStatus: "APPROVED" })}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Approve Application
                  </button>
                )}
                {selectedApp.status !== "REJECTED" && (
                  <button
                    onClick={() => setActionModal({ app: selectedApp, targetStatus: "REJECTED" })}
                    className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                )}
                {selectedApp.status === "REJECTED" && (
                  <button
                    onClick={() => setDeleteModal({ app: selectedApp, confirmInput: "" })}
                    className="flex-1 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Status Modal (Approve / Reject) ── */}
      <AnimatePresence>
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">
                  {actionModal.targetStatus === "APPROVED" ? "Approve Representative" : "Reject Application"}
                </h3>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <p className="text-slate-300">
                  Representative: <strong className="text-white">
                    {actionModal.app?.representative?.fullName || actionModal.app?.user?.name || "Representative"}
                  </strong> (
                  {actionModal.app?.university?.name || "University Partner"})
                </p>

                {actionModal.targetStatus === "APPROVED" ? (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-[11px]">
                    Approving this representative will generate a cryptographically secure, single-use 48-hour activation link and
                    dispatch an activation email to <strong className="text-white">
                      {actionModal.app?.representative?.officialEmail || actionModal.app?.user?.email || "Not provided"}
                    </strong>.
                  </div>
                ) : (
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">
                      Rejection Reason <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Specify reasons for application rejection..."
                      className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Internal Audit Notes</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Optional internal note..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setActionModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={actionModal.targetStatus === "APPROVED" ? handleApprove : handleReject}
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-50 ${
                      actionModal.targetStatus === "APPROVED" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                    }`}
                  >
                    {actionLoading ? "Processing..." : `Confirm ${actionModal.targetStatus === "APPROVED" ? "Approval" : "Rejection"}`}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-rose-500/30 shadow-2xl space-y-4"
              style={{ background: "#0B1228" }}
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete University Representative?</h3>
                  <p className="text-xs text-rose-300/80">Permanent database deletion</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                This action will permanently delete the rejected university representative record for{" "}
                <strong className="text-white">
                  {deleteModal.app?.representative?.fullName || deleteModal.app?.user?.name || "Representative"}
                </strong>{" "}
                ({deleteModal.app?.university?.name || "University Partner"}).
              </p>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                This cannot be undone. To proceed, please type <span className="font-mono font-bold text-white uppercase">DELETE</span> below:
              </div>

              <input
                type="text"
                value={deleteModal.confirmInput}
                onChange={(e) => setDeleteModal({ ...deleteModal, confirmInput: e.target.value })}
                placeholder="Type DELETE to confirm"
                className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                autoFocus
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
                <button
                  type="button"
                  onClick={() => setDeleteModal(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
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

      {/* ── Document Viewer Modal ── */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">{previewDoc.fileName || "Credential Verification Scan"}</h3>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto rounded-xl border border-white/10 p-2 bg-black/50 flex items-center justify-center">
                {previewDoc.fileData?.startsWith("data:image") ? (
                  <img src={previewDoc.fileData} alt="Document" className="max-w-full max-h-[60vh] object-contain" />
                ) : (
                  <iframe src={previewDoc.fileData} title="Document" className="w-full h-[60vh] rounded" />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
