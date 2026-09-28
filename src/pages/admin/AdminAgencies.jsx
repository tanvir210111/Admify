import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, Filter, Eye, CheckCircle2, XCircle, AlertTriangle,
  FileText, ExternalLink, ShieldCheck, RefreshCw, X, Clock,
  ChevronRight, Phone, Mail, Globe, MapPin, Award, Briefcase, Calendar,
  Hash, Users, User, Trash2, ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import { triggerAdminBadgeRefresh } from "../../context/AdminBadgeContext";

const STATUS_MAP = {
  PENDING: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  UNDER_REVIEW: { label: "Under Review", cls: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  VERIFIED: { label: "Verified / Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  APPROVED: { label: "Verified / Approved", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
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

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(null); // agency object
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  // Document viewer modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter && filter !== "all") params.append("status", filter);
      if (search && search.trim()) params.append("search", search.trim());
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const url = `/api/admin/agencies/verifications${queryString}`;
      const data = await api.get(url);
      if (data?.success) {
        setVerifications(data.data?.verifications || data?.verifications || []);
      } else {
        toast.error(data?.message || "Failed to load agency verifications");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message || "Failed to load agency verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgencies();
    }, 250);
    return () => clearTimeout(timer);
  }, [filter, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAgencies();
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    if (actionModal.targetStatus === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Rejection reason is required.");
      return;
    }

    setActionLoading(true);
    try {
      const data = await api.put(`/api/admin/agencies/verifications/${actionModal.agency._id}/status`, {
        status: actionModal.targetStatus,
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes.trim(),
      });

      if (data?.success) {
        toast.success(data.message || `Status updated to ${actionModal.targetStatus}`);
        setActionModal(null);
        setRejectionReason("");
        setAdminNotes("");
        fetchAgencies();
        triggerAdminBadgeRefresh();
        if (selectedAgency && selectedAgency._id === actionModal.agency._id) {
          setSelectedAgency({
            ...selectedAgency,
            verificationStatus: actionModal.targetStatus,
            adminNotes: adminNotes.trim() || selectedAgency.adminNotes,
            rejectionReason: actionModal.targetStatus === "REJECTED" ? rejectionReason.trim() : "",
          });
        }
      } else {
        toast.error(data?.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err?.message || "Network error while updating agency status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgency = async () => {
    if (!deleteModal) return;
    if (deleteConfirmInput.toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm permanent deletion.");
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/admin/agencies/verifications/${deleteModal._id}`);
      if (res?.success) {
        toast.success(`Agency "${deleteModal.agencyName || deleteModal.user?.name || 'Agency'}" permanently deleted.`);
        setDeleteModal(null);
        setDeleteConfirmInput("");
        if (selectedAgency?._id === deleteModal._id) setSelectedAgency(null);
        fetchAgencies();
        triggerAdminBadgeRefresh();
      } else {
        toast.error(res?.message || "Failed to delete agency.");
      }
    } catch (err) {
      const status = err?.status;
      if (status === 409) {
        toast.error("Agency must be REJECTED before it can be deleted.");
      } else {
        toast.error(err?.message || "Agency deletion failed.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Robust client-side fallback filtering
  const filtered = verifications.filter((v) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      v.agencyName?.toLowerCase().includes(s) ||
      v.legalName?.toLowerCase().includes(s) ||
      v.officialBusinessEmail?.toLowerCase().includes(s) ||
      v.applicationId?.toLowerCase().includes(s) ||
      v.user?.name?.toLowerCase().includes(s) ||
      v.user?.email?.toLowerCase().includes(s) ||
      v.user?.phone?.toLowerCase().includes(s) ||
      v.authorizedPerson?.fullName?.toLowerCase().includes(s) ||
      v.authorizedPerson?.email?.toLowerCase().includes(s) ||
      v.authorizedPerson?.phone?.toLowerCase().includes(s) ||
      v.authorizedPersonName?.toLowerCase().includes(s) ||
      v.officialPhone?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] w-full mx-auto pb-10 min-w-0">

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
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between w-full max-w-full min-w-0"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agencies by name, email, App ID, phone..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full sm:w-auto min-w-0 max-w-full">
          {[
            { id: "all", label: "All Agencies" },
            { id: "PENDING", label: "Pending" },
            { id: "UNDER_REVIEW", label: "Under Review" },
            { id: "VERIFIED", label: "Verified / Approved" },
            { id: "REJECTED", label: "Rejected" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilter(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer ${filter === st.id
                ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
                }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agencies Table */}
      <div
        className="rounded-2xl border overflow-hidden w-full max-w-full"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left" style={{ minWidth: "900px" }}>
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
                    No agency records found matching current query.
                  </td>
                </tr>
              ) : (
                filtered.map((agency) => {
                  const statusKey = (agency.verificationStatus || agency.user?.agencyVerificationStatus || "PENDING").toUpperCase();
                  const statusInfo = STATUS_MAP[statusKey] || STATUS_MAP.PENDING;
                  const agencyName = agency.agencyName || agency.user?.name || "Agency Profile";
                  const contactName = agency.authorizedPerson?.fullName || agency.authorizedPersonName || agency.user?.name || "—";
                  const contactEmail = agency.officialBusinessEmail || agency.authorizedPerson?.email || agency.user?.email || "—";
                  const contactPhone = agency.authorizedPerson?.phone || agency.officialPhone || agency.user?.phone || "";
                  const location = [agency.city || agency.user?.city, agency.country || agency.user?.country].filter(Boolean).join(", ") || "—";

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
                              agencyName.charAt(0) || "A"
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{agencyName}</p>
                            <span className="font-mono text-[10px] text-violet-400">
                              {agency.applicationId || "ADM-AGY-PENDING"}
                            </span>
                            {agency.legalName && agency.legalName !== agencyName && (
                              <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{agency.legalName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-slate-200 font-semibold">{contactName}</p>
                        <p className="text-slate-400 text-[11px]">{contactEmail}</p>
                        {contactPhone && <p className="text-slate-500 text-[10px]">{contactPhone}</p>}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">
                        {location}
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
                            className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {statusKey !== "VERIFIED" && statusKey !== "APPROVED" && (
                            <button
                              onClick={() => setActionModal({ agency, targetStatus: "VERIFIED" })}
                              className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                          {statusKey !== "REJECTED" && (
                            <button
                              onClick={() => setActionModal({ agency, targetStatus: "REJECTED" })}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          {/* Delete: only enabled when REJECTED */}
                          <button
                            onClick={() => {
                              if (statusKey === "REJECTED") {
                                setDeleteModal(agency);
                                setDeleteConfirmInput("");
                              } else {
                                toast.error("Agency must be rejected before deletion.");
                              }
                            }}
                            disabled={statusKey !== "REJECTED"}
                            title={statusKey === "REJECTED" ? "Permanently delete rejected agency" : "Agency must be rejected before deletion"}
                            className={`p-1.5 rounded-lg border transition-all ${statusKey === "REJECTED"
                              ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border-rose-500/30 cursor-pointer"
                              : "bg-white/2 text-slate-600 border-white/5 cursor-not-allowed opacity-40"
                              }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl z-50 p-6 overflow-y-auto custom-scrollbar border-l border-white/10 flex flex-col justify-between"
              style={{ background: "#070B1E" }}
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start pb-4 border-b border-white/8">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-600/20 text-violet-300 border border-violet-500/30">
                      Agency Profile & Verification Dossier
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">
                      {selectedAgency.agencyName || selectedAgency.user?.name}
                    </h3>
                    <p className="font-mono text-xs text-violet-400">{selectedAgency.applicationId || "ADM-AGY-PENDING"}</p>
                    {selectedAgency.legalName && (
                      <p className="text-slate-400 text-xs mt-0.5">Legal: {selectedAgency.legalName}</p>
                    )}
                  </div>
                  <button onClick={() => setSelectedAgency(null)} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Status card */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block font-semibold uppercase">Current Verification Status</span>
                    <span className="font-bold text-white text-sm">
                      {STATUS_MAP[selectedAgency.verificationStatus]?.label || selectedAgency.verificationStatus || "PENDING"}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Login Status:{" "}
                      <strong className={selectedAgency.verificationStatus === "VERIFIED" || selectedAgency.verificationStatus === "APPROVED" ? "text-emerald-400" : "text-amber-400"}>
                        {selectedAgency.verificationStatus === "VERIFIED" || selectedAgency.verificationStatus === "APPROVED" ? "ACTIVE" : "INACTIVE (Pending Approval)"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {selectedAgency.verificationStatus !== "VERIFIED" && selectedAgency.verificationStatus !== "APPROVED" && (
                      <button
                        onClick={() => setActionModal({ agency: selectedAgency, targetStatus: "VERIFIED" })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                    {selectedAgency.verificationStatus !== "REJECTED" && (
                      <button
                        onClick={() => setActionModal({ agency: selectedAgency, targetStatus: "REJECTED" })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                    {selectedAgency.verificationStatus === "REJECTED" && (
                      <button
                        onClick={() => setDeleteModal(selectedAgency)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* Basic Corporate Information */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2.5 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-violet-400" /> Agency Identity & Location
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Agency Type</span>
                      <span className="text-white font-semibold">{selectedAgency.agencyType || "Study Abroad Consultancy"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Year Established</span>
                      <span className="text-white font-semibold">{selectedAgency.yearEstablished || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Country / City</span>
                      <span className="text-white font-semibold">
                        {[selectedAgency.city || selectedAgency.user?.city, selectedAgency.country || selectedAgency.user?.country].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Office Address</span>
                      <span className="text-white font-semibold">{selectedAgency.officeAddress || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Website</span>
                      {selectedAgency.website ? (
                        <a
                          href={selectedAgency.website.startsWith("http") ? selectedAgency.website : `https://${selectedAgency.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-400 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" /> {selectedAgency.website}
                        </a>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Official Business Email</span>
                      <span className="text-white font-semibold truncate block">
                        {selectedAgency.officialBusinessEmail || selectedAgency.user?.email || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Authorized Contact */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" /> Authorized Representative
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Full Name</span>
                      <span className="text-white font-semibold">
                        {selectedAgency.authorizedPerson?.fullName || selectedAgency.authorizedPersonName || selectedAgency.user?.name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Designation</span>
                      <span className="text-white font-semibold">
                        {selectedAgency.authorizedPerson?.designation || selectedAgency.authorizedPersonDesignation || "Managing Director"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Authorized Email</span>
                      <span className="text-white font-semibold truncate block">
                        {selectedAgency.authorizedPerson?.email || selectedAgency.officialBusinessEmail || selectedAgency.user?.email || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Contact Phone</span>
                      <span className="text-white font-semibold">
                        {selectedAgency.authorizedPerson?.phone || selectedAgency.officialPhone || selectedAgency.user?.phone || "—"}
                      </span>
                    </div>
                    {selectedAgency.authorizedPerson?.identityNumber && (
                      <div className="col-span-2">
                        <span className="text-slate-500 text-[10px] block">National ID / Passport #</span>
                        <span className="text-white font-semibold">{selectedAgency.authorizedPerson.identityNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Verification Documents */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2.5 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Compliance & Business Documents
                  </p>
                  {[
                    {
                      label: "Trade License",
                      doc: selectedAgency.businessVerification?.tradeLicenseDocument || selectedAgency.tradeLicenseDoc,
                      num: selectedAgency.businessVerification?.tradeLicenseNumber || selectedAgency.tradeLicenseNumber,
                    },
                    {
                      label: "Business Registration / Incorporation",
                      doc: selectedAgency.businessVerification?.businessRegistrationDocument || selectedAgency.businessRegDoc,
                      num: selectedAgency.businessVerification?.businessRegistrationNumber || selectedAgency.businessRegNumber,
                    },
                    {
                      label: "Tax Identification Number (TIN)",
                      doc: selectedAgency.businessVerification?.tinDocument || selectedAgency.tinDoc,
                      num: selectedAgency.businessVerification?.tinNumber || selectedAgency.tinNumber,
                    },
                    {
                      label: "BIN / VAT Certificate",
                      doc: selectedAgency.businessVerification?.binDocument || selectedAgency.binDoc,
                      num: selectedAgency.businessVerification?.binVatNumber || selectedAgency.binNumber,
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white/3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">{item.label}</p>
                        {item.num ? (
                          <p className="text-slate-400 text-[10px] font-mono">Doc #: {item.num}</p>
                        ) : (
                          <p className="text-slate-500 text-[10px] italic">No document number provided</p>
                        )}
                      </div>
                      {item.doc?.fileData ? (
                        <button
                          onClick={() => setPreviewDoc(item.doc)}
                          className="px-2.5 py-1 rounded bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" /> View Doc
                        </button>
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">Not Uploaded</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Scope, Services & Experience */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2.5 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" /> Market Scope & Experience
                  </p>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">Services Offered</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAgency.servicesOffered || ["University Application", "Visa Assistance"]).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block mb-1">Destinations Served</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAgency.countriesServed || ["United Kingdom", "Canada", "Australia", "United States"]).map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/4 text-slate-300 text-[10px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/4">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Years Exp.</span>
                      <span className="text-white font-semibold">
                        {selectedAgency.experience?.yearsOfExperience ?? (selectedAgency.yearsOfExperience ?? 1)} yrs
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Counselors</span>
                      <span className="text-white font-semibold">
                        {selectedAgency.experience?.numberOfCounselors ?? (selectedAgency.numberOfCounselors ?? 1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Students Placed</span>
                      <span className="text-white font-semibold">
                        {selectedAgency.experience?.approximateStudentsServed ?? (selectedAgency.studentsServed ?? 0)}+
                      </span>
                    </div>
                  </div>
                </div>

                {/* Audit & Notes */}
                {(selectedAgency.adminNotes || selectedAgency.rejectionReason) && (
                  <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-1.5 text-xs">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Admin Audit Record</p>
                    {selectedAgency.rejectionReason && (
                      <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300">
                        <strong className="block text-[11px]">Rejection Reason:</strong>
                        {selectedAgency.rejectionReason}
                      </div>
                    )}
                    {selectedAgency.adminNotes && (
                      <div className="p-2.5 rounded bg-white/4 text-slate-300">
                        <strong className="block text-[11px] text-slate-400">Internal Admin Notes:</strong>
                        {selectedAgency.adminNotes}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-white/10 pt-4 mt-6 flex gap-2">
                {selectedAgency.verificationStatus === "REJECTED" && (
                  <button
                    onClick={() => setDeleteModal(selectedAgency)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Agency Permanently
                  </button>
                )}
                <button
                  onClick={() => setSelectedAgency(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer ml-auto"
                >
                  Close
                </button>
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
                <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3.5 text-xs">
                <p className="text-slate-300">
                  Target Agency: <strong className="text-white">{actionModal.agency.agencyName || actionModal.agency.user?.name}</strong> (
                  {actionModal.agency.applicationId || "ADM-AGY-PENDING"})
                </p>

                {actionModal.targetStatus === "VERIFIED" ? (
                  <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-300 text-[11px]">
                    Approving this agency will update its canonical status to <strong>VERIFIED</strong>, immediately enable <strong>ACTIVE</strong> portal login, and dispatch an approval notification email to <strong className="text-white">{actionModal.agency.officialBusinessEmail || actionModal.agency.user?.email}</strong>.
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
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`px-4 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-50 cursor-pointer ${actionModal.targetStatus === "VERIFIED" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
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
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-white cursor-pointer">
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

      {/* ── Agency Permanent Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Delete Agency</h3>
                  <p className="text-xs text-rose-400">Irreversible Action</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 space-y-1">
                <p className="font-bold">Agency: <span className="text-white">{deleteModal.agencyName || deleteModal.user?.name || "Agency"}</span></p>
                <p>Application ID: <span className="font-mono text-violet-300">{deleteModal.applicationId || "N/A"}</span></p>
                <p className="text-[11px] text-slate-400 mt-1">
                  This action permanently removes the rejected agency account and its verification/application record from the system.
                  Affiliated agents will have their agency reference unlinked but their accounts will remain intact.
                </p>
              </div>

              <p className="text-xs text-slate-400">
                To prevent accidental destruction, type <strong className="text-white">DELETE</strong> to confirm permanent removal.
              </p>

              <input
                type="text"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmInput}
                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                className="w-full px-3 py-2 bg-black/50 border border-rose-500/30 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setDeleteModal(null); setDeleteConfirmInput(""); }}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAgency}
                  disabled={deleteLoading || deleteConfirmInput.toUpperCase() !== "DELETE"}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white transition-all shadow-lg shadow-rose-600/20"
                >
                  {deleteLoading ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
