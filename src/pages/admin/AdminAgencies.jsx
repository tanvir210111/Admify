import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, Filter, Eye, CheckCircle2, XCircle, AlertTriangle,
  FileText, ExternalLink, ShieldCheck, RefreshCw, X, Clock,
  ChevronRight, Phone, Mail, Globe, MapPin, Award,
} from "lucide-react";
import toast from "react-hot-toast";

const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  VERIFIED: { label: "Verified / Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  REJECTED: { label: "Rejected", cls: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
  SUSPENDED: { label: "Suspended", cls: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function AdminAgencies() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedAgency, setSelectedAgency] = useState(null);

  // Review status modal state
  const [actionModal, setActionModal] = useState(null); // { agency, targetStatus }
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Document viewer modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = filter !== "all"
        ? `/api/admin/agencies/verifications?status=${encodeURIComponent(filter)}`
        : "/api/admin/agencies/verifications";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setVerifications(data.data?.verifications || []);
      } else {
        toast.error(data.message || "Failed to load agency verifications");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load agency verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, [filter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    if (actionModal.targetStatus === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/agencies/verifications/${actionModal.agency._id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: actionModal.targetStatus,
          rejectionReason: rejectionReason.trim(),
          adminNotes: adminNotes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Status updated to ${actionModal.targetStatus}`);
        setActionModal(null);
        setRejectionReason("");
        setAdminNotes("");
        fetchAgencies();
        if (selectedAgency && selectedAgency._id === actionModal.agency._id) {
          setSelectedAgency({ ...selectedAgency, verificationStatus: actionModal.targetStatus });
        }
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Network error while updating agency status");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = verifications.filter((v) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      v.agencyName?.toLowerCase().includes(s) ||
      v.officialBusinessEmail?.toLowerCase().includes(s) ||
      v.applicationId?.toLowerCase().includes(s) ||
      v.user?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-violet-400" /> Agency Verification & Directory
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Audit trade licenses, business certifications, compliance documentation, and agency governance
          </p>
        </div>
        <button
          onClick={fetchAgencies}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agencies by name, email, App ID..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          {["all", "PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                filter === st
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {st === "all" ? "All Agencies" : STATUS_MAP[st]?.label || st}
            </button>
          ))}
        </div>
      </div>

      {/* Agencies Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Agency Name & App ID</th>
                <th className="px-4 py-3 font-bold">Authorized Contact</th>
                <th className="px-4 py-3 font-bold">Location</th>
                <th className="px-4 py-3 font-bold">Verification Status</th>
                <th className="px-4 py-3 font-bold">Applied On</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading agencies from backend server...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No agency records found.
                  </td>
                </tr>
              ) : (
                filtered.map((agency) => {
                  const statusInfo = STATUS_MAP[agency.verificationStatus] || STATUS_MAP.PENDING;
                  return (
                    <tr
                      key={agency._id}
                      className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300 text-xs flex-shrink-0">
                            {agency.logo ? (
                              <img src={agency.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              agency.agencyName?.charAt(0) || "A"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{agency.agencyName}</p>
                            <span className="font-mono text-[10px] text-violet-400">
                              {agency.applicationId || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-200 font-semibold">{agency.authorizedPersonName || agency.user?.name || "—"}</p>
                        <p className="text-slate-400 text-[11px]">{agency.officialBusinessEmail || agency.user?.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {agency.country ? `${agency.city ? agency.city + ", " : ""}${agency.country}` : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {agency.createdAt ? new Date(agency.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAgency(agency)}
                            className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {agency.verificationStatus !== "VERIFIED" && (
                            <button
                              onClick={() => setActionModal({ agency, targetStatus: "VERIFIED" })}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {agency.verificationStatus !== "REJECTED" && (
                            <button
                              onClick={() => setActionModal({ agency, targetStatus: "REJECTED" })}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-colors"
                            >
                              Reject
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
        {selectedAgency && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgency(null)}
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      Agency Profile
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedAgency.agencyName}</h3>
                    <p className="font-mono text-xs text-violet-400">{selectedAgency.applicationId}</p>
                  </div>
                  <button onClick={() => setSelectedAgency(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status card */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Current Verification Status</span>
                    <span className="font-bold text-white">{selectedAgency.verificationStatus}</span>
                  </div>
                  <div className="flex gap-2">
                    {selectedAgency.verificationStatus !== "VERIFIED" && (
                      <button
                        onClick={() => setActionModal({ agency: selectedAgency, targetStatus: "VERIFIED" })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve
                      </button>
                    )}
                    {selectedAgency.verificationStatus !== "REJECTED" && (
                      <button
                        onClick={() => setActionModal({ agency: selectedAgency, targetStatus: "REJECTED" })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Authorized Contact */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Authorized Representative</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Name</span>
                      <span className="text-white font-semibold">{selectedAgency.authorizedPersonName || selectedAgency.user?.name || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Designation</span>
                      <span className="text-white font-semibold">{selectedAgency.authorizedPersonDesignation || "Director"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Official Email</span>
                      <span className="text-white font-semibold">{selectedAgency.officialBusinessEmail || selectedAgency.user?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Contact Phone</span>
                      <span className="text-white font-semibold">{selectedAgency.officialPhone || selectedAgency.user?.phone || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Uploaded Verification Documents */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2.5 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Compliance & Business Documents</p>
                  {[
                    { label: "Trade License", doc: selectedAgency.tradeLicenseDoc, num: selectedAgency.tradeLicenseNumber },
                    { label: "Business Registration / Certificate", doc: selectedAgency.businessRegDoc, num: selectedAgency.businessRegNumber },
                    { label: "TIN Certificate", doc: selectedAgency.tinDoc, num: selectedAgency.tinNumber },
                    { label: "BIN / VAT Registration", doc: selectedAgency.binDoc, num: selectedAgency.binNumber },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white/3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{item.label}</p>
                        {item.num && <p className="text-slate-400 text-[10px]">Doc #: {item.num}</p>}
                      </div>
                      {item.doc?.fileData ? (
                        <button
                          onClick={() => setPreviewDoc(item.doc)}
                          className="px-2.5 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[10px] font-bold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View Doc
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">Not Provided</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Destinations & Specialization */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Market Coverage</p>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">Countries Served</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAgency.countriesServed || ["United Kingdom", "Canada", "Australia"]).map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/4 text-slate-300 text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Status Update Confirmation Modal ── */}
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
                  {actionModal.targetStatus === "VERIFIED" ? "Approve Agency Application" : "Reject Agency Application"}
                </h3>
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
                <p className="text-slate-300">
                  Target Agency: <strong className="text-white">{actionModal.agency.agencyName}</strong> (
                  {actionModal.agency.applicationId})
                </p>

                {actionModal.targetStatus === "VERIFIED" ? (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-[11px]">
                    Approving this agency will generate a cryptographically secure, single-use 48-hour activation link and
                    dispatch an activation email to <strong className="text-white">{actionModal.agency.officialBusinessEmail || actionModal.agency.user?.email}</strong>.
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
                      placeholder="Specify compliance issues or missing trade documentation..."
                      className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Internal Admin Notes</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Optional internal note for audit trail..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500"
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
                    type="submit"
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-50 ${
                      actionModal.targetStatus === "VERIFIED" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                    }`}
                  >
                    {actionLoading ? "Processing..." : `Confirm ${actionModal.targetStatus === "VERIFIED" ? "Approval" : "Rejection"}`}
                  </button>
                </div>
              </form>
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
                <h3 className="text-base font-bold text-white">{previewDoc.fileName || "Compliance Document Scan"}</h3>
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
