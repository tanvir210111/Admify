import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  ShieldCheck,
  Star,
  TrendingUp,
  X,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import AdminAgentApplicationsTab from "../../components/admin/AdminAgentApplicationsTab";

const fade = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const STATUS_MAP = {
  UNDER_REVIEW: {
    label: "Under Review",
    cls: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  PENDING: {
    label: "Pending",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  VERIFIED: {
    label: "Verified / Approved",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  REJECTED: {
    label: "Rejected",
    cls: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
};

export default function AdminAgents() {
  const [mainTab, setMainTab] = useState("verifications"); // 'verifications' | 'roster'
  const [filter, setFilter] = useState("all");
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // Review Modal State
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchVerifications = async () => {
    setIsLoading(true);
    try {
      const url =
        filter === "all"
          ? "/api/admin/agencies/verifications"
          : `/api/admin/agencies/verifications?status=${filter}`;
      const res = await api.get(url);
      if (res?.data?.verifications) {
        setVerifications(res.data.verifications);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load agency verifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === "verifications") {
      fetchVerifications();
    }
  }, [mainTab, filter]);

  const handleUpdateStatus = async (status) => {
    if (!selectedApp) return;

    if (status === "REJECTED" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }

    setIsProcessing(true);
    try {
      const payload = {
        status,
        rejectionReason: rejectionReason.trim(),
        adminNotes: adminNotes.trim(),
      };

      const res = await api.put(
        `/api/admin/agencies/verifications/${selectedApp._id}/status`,
        payload
      );

      if (res?.success) {
        if (status === "VERIFIED") {
          toast.success(
            "Agency approved! One-time activation email dispatched to official email."
          );
        } else {
          toast.success("Agency verification rejected.");
        }
        setSelectedApp(null);
        setShowRejectForm(false);
        setRejectionReason("");
        setAdminNotes("");
        fetchVerifications();
      } else {
        toast.error(res?.message || "Failed to update status.");
      }
    } catch (err) {
      toast.error(err.message || "Action failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const underReviewCount = verifications.filter(
    (v) => v.verificationStatus === "UNDER_REVIEW"
  ).length;
  const verifiedCount = verifications.filter(
    (v) => v.verificationStatus === "VERIFIED"
  ).length;
  const rejectedCount = verifications.filter(
    (v) => v.verificationStatus === "REJECTED"
  ).length;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100"
    >
      {/* Header */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-400" /> Agency & Agent
            Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review partner study-abroad agency registrations, verify compliance
            documents, and manage accredited representatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchVerifications()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div variants={fade} className="flex gap-2 border-b border-white/6 pb-2">
        <button
          onClick={() => setMainTab("verifications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            mainTab === "verifications"
              ? "bg-violet-600/25 border-violet-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Agency Verification Requests ({verifications.length})
        </button>
        <button
          onClick={() => setMainTab("agent_applications")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            mainTab === "agent_applications"
              ? "bg-violet-600/25 border-violet-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Agent Applications & Codes
        </button>
        <button
          onClick={() => setMainTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            mainTab === "roster"
              ? "bg-violet-600/25 border-violet-500/40 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              : "bg-transparent border-transparent text-slate-400 hover:text-white"
          }`}
        >
          Individual Agent Directory
        </button>
      </motion.div>

      {mainTab === "verifications" && (
        /* Agency KPI Cards */
        <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Agency Requests",
              val: verifications.length,
              color: "text-blue-400",
              icon: Building2,
            },
            {
              label: "Under Review",
              val: underReviewCount,
              color: "text-amber-400",
              icon: Clock,
            },
            {
              label: "Approved & Verified",
              val: verifiedCount,
              color: "text-emerald-400",
              icon: CheckCircle2,
            },
            {
              label: "Rejected Applications",
              val: rejectedCount,
              color: "text-rose-400",
              icon: XCircle,
            },
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
              <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {mainTab === "verifications" ? (
        <>
          {/* Status Filter Tabs */}
          <motion.div variants={fade} className="flex gap-2">
            {[
              { id: "all", label: "All" },
              { id: "under_review", label: "Under Review" },
              { id: "pending", label: "Pending" },
              { id: "verified", label: "Verified" },
              { id: "rejected", label: "Rejected" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors capitalize ${
                  filter === f.id
                    ? "bg-violet-600/30 text-violet-300 border border-violet-500/40"
                    : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
                }`}
              >
                {f.label}
              </button>
            ))}
          </motion.div>

          {/* Applications Table */}
          <motion.div
            variants={fade}
            className="rounded-2xl border overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest bg-white/2">
                    <th className="px-4 py-3 font-bold">Agency Name</th>
                    <th className="px-4 py-3 font-bold">App ID</th>
                    <th className="px-4 py-3 font-bold">Country & City</th>
                    <th className="px-4 py-3 font-bold">Authorized Rep</th>
                    <th className="px-4 py-3 font-bold">Official Email</th>
                    <th className="px-4 py-3 font-bold">Submitted Date</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500 text-sm">
                        {isLoading
                          ? "Loading verification requests..."
                          : "No agency verification applications found for this filter."}
                      </td>
                    </tr>
                  ) : (
                    verifications.map((v) => {
                      const st = STATUS_MAP[v.verificationStatus] || STATUS_MAP.PENDING;
                      return (
                        <tr
                          key={v._id}
                          className="border-b border-white/4 hover:bg-white/3 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">
                                {v.agencyName?.slice(0, 2).toUpperCase() || "AG"}
                              </div>
                              <div>
                                <span className="text-slate-100 font-semibold text-sm block">
                                  {v.agencyName}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {v.legalName || v.agencyType}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-mono text-cyan-300">
                            {v.applicationId || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 text-sm">
                            {v.city ? `${v.city}, ` : ""}
                            {v.country || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 text-sm">
                            <span className="font-medium text-white block">
                              {v.authorizedPerson?.fullName || "—"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {v.authorizedPerson?.designation || ""}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs font-mono">
                            {v.officialBusinessEmail || v.user?.email || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs font-mono">
                            {v.submittedAt
                              ? new Date(v.submittedAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${st.cls}`}
                            >
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedApp(v);
                                setShowRejectForm(false);
                                setRejectionReason(v.rejectionReason || "");
                                setAdminNotes(v.adminNotes || "");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
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
        </>
      ) : mainTab === "agent_applications" ? (
        /* Agent Applications Tab */
        <AdminAgentApplicationsTab />
      ) : (
        /* Agent Directory Tab */
        <motion.div
          variants={fade}
          className="p-8 text-center rounded-2xl border border-white/6 bg-white/2 space-y-3"
        >
          <UserCheck className="w-12 h-12 text-blue-400 mx-auto opacity-70" />
          <h3 className="text-lg font-bold text-white">Agent Directory Active</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Accredited individual agent management and counselor roster. To approve or reject pending agency organizations, switch to the "Agency Verification Requests" tab.
          </p>
        </motion.div>
      )}

      {/* ── Review Application Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between sticky top-0 z-20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      Compliance Inspection
                    </span>
                    <h2 className="text-lg font-bold text-white">
                      {selectedApp.agencyName}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Application ID: {selectedApp.applicationId || "ADM-AGY-2026"} • Status:{" "}
                    <strong className="text-white">
                      {selectedApp.verificationStatus}
                    </strong>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Section 1: Basic Information */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    1. Agency Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Agency Name:</span>
                      <strong className="text-white">{selectedApp.agencyName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Official Legal Name:</span>
                      <strong className="text-white">
                        {selectedApp.legalName || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Agency Type:</span>
                      <strong className="text-white">{selectedApp.agencyType}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Year Established:</span>
                      <strong className="text-white">
                        {selectedApp.yearEstablished || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Country & City:</span>
                      <strong className="text-white">
                        {selectedApp.city}, {selectedApp.country}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Official Business Email:</span>
                      <strong className="text-cyan-300 font-mono">
                        {selectedApp.officialBusinessEmail}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block">Office Address:</span>
                      <strong className="text-white">
                        {selectedApp.officeAddress || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Website:</span>
                      <a
                        href={selectedApp.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-400 hover:underline inline-flex items-center gap-1"
                      >
                        {selectedApp.website || "—"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Section 2: Authorized Person */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    2. Authorized Representative
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Full Name:</span>
                      <strong className="text-white">
                        {selectedApp.authorizedPerson?.fullName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Designation:</span>
                      <strong className="text-white">
                        {selectedApp.authorizedPerson?.designation}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Phone Number:</span>
                      <strong className="text-white font-mono">
                        {selectedApp.authorizedPerson?.phone}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email Address:</span>
                      <strong className="text-cyan-300 font-mono">
                        {selectedApp.authorizedPerson?.email}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">NID / Passport Number:</span>
                      <strong className="text-white font-mono">
                        {selectedApp.authorizedPerson?.identityNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Identity Document:</span>
                      {selectedApp.authorizedPerson?.identityDocument?.fileData ? (
                        <a
                          href={selectedApp.authorizedPerson.identityDocument.fileData}
                          download={
                            selectedApp.authorizedPerson.identityDocument.fileName ||
                            "identity_document.pdf"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-400 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> View / Download Document
                        </a>
                      ) : (
                        <span className="text-slate-500">Document attached</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Business Verification */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    3. Business Verification Documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Trade License Number:</span>
                      <strong className="text-white font-mono">
                        {selectedApp.businessVerification?.tradeLicenseNumber || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Trade License Copy:</span>
                      {selectedApp.businessVerification?.tradeLicenseDocument?.fileData ? (
                        <a
                          href={
                            selectedApp.businessVerification.tradeLicenseDocument.fileData
                          }
                          download={
                            selectedApp.businessVerification.tradeLicenseDocument.fileName ||
                            "trade_license.pdf"
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-400 hover:underline font-semibold inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> View / Download Trade License
                        </a>
                      ) : (
                        <span className="text-slate-500">Document attached</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 block">TIN / Tax Number:</span>
                      <strong className="text-white font-mono">
                        {selectedApp.businessVerification?.tinNumber || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">BIN / VAT Number:</span>
                      <strong className="text-white font-mono">
                        {selectedApp.businessVerification?.binVatNumber || "—"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Section 4: Profile & Scope */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    4. Scope of Operations & Capacity
                  </h3>
                  <div className="space-y-2 text-xs">
                    <p>
                      <span className="text-slate-500">About Agency:</span>{" "}
                      <span className="text-slate-200">{selectedApp.about}</span>
                    </p>
                    <div>
                      <span className="text-slate-500 block mb-1">
                        Countries Served:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.countriesServed?.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-md bg-slate-700 text-slate-200 text-[11px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-1">
                        Services Offered:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedApp.servicesOffered?.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-md bg-slate-700 text-cyan-300 text-[11px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      <div>
                        <span className="text-slate-500">Experience:</span>{" "}
                        <strong className="text-white">
                          {selectedApp.experience?.yearsOfExperience} years
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Counselors:</span>{" "}
                        <strong className="text-white">
                          {selectedApp.experience?.numberOfCounselors}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Students Served:</span>{" "}
                        <strong className="text-white">
                          {selectedApp.experience?.approximateStudentsServed || "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 5: Rejection Form if triggered */}
                {showRejectForm && (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-3">
                    <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Specify Rejection Reason *
                    </h4>
                    <p className="text-xs text-slate-300">
                      Please enter a clear explanation. This reason will be recorded in the audit trail and displayed to the agency.
                    </p>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Trade license document scan is illegible or expired. Please upload a certified color scan."
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
                        onClick={() => handleUpdateStatus("REJECTED")}
                        disabled={isProcessing}
                        className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between sticky bottom-0 z-20">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {!showRejectForm && selectedApp.verificationStatus !== "REJECTED" && (
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject Agency
                    </button>
                  )}

                  {selectedApp.verificationStatus !== "VERIFIED" && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus("VERIFIED")}
                      disabled={isProcessing}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isProcessing ? "Processing Approval..." : "Approve Agency"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
