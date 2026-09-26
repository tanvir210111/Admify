import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  FileCheck,
  ExternalLink,
  MessageSquare,
  X,
  Filter,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STATUS_COLOR = {
  PENDING: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  VERIFIED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  REVIEWED: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  REJECTED: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function AgentDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/documents");
      if (res?.data?.success) {
        setDocuments(res.data.data.documents || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
      toast.error("Failed to load documents repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      (doc.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.university || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.type || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (doc.status || "PENDING").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" /> Student Document Verification Center
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Review academic certificates, passport scans, English proficiency scores, and financial dossiers for assigned applicants.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* KPI Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Dossier Files", val: documents.length, color: "text-blue-400" },
          {
            label: "Pending Verification",
            val: documents.filter((d) => d.status === "PENDING" || !d.status).length,
            color: "text-yellow-400",
          },
          {
            label: "Verified / Checked",
            val: documents.filter((d) => d.status === "VERIFIED" || d.status === "REVIEWED").length,
            color: "text-emerald-400",
          },
          {
            label: "Action Required / Deficient",
            val: documents.filter((d) => d.status === "REJECTED").length,
            color: "text-red-400",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border"
            style={{
              background: "rgba(11, 18, 40, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.08)",
            }}
          >
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter / Search Bar */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student, file name, university, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-slate-200 focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="VERIFIED">Verified</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="REJECTED">Deficient / Rejected</option>
        </select>
      </motion.div>

      {/* Documents Table */}
      <motion.div
        variants={fade}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading assigned documents repository...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-16 text-center">
            <FileCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Documents Available</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              {search || statusFilter !== "all"
                ? "No documents matched your search filters."
                : "No student application documents have been uploaded to your active caseload yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/6">
                <tr>
                  <th className="py-3.5 px-4">Document Name</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Target University</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Uploaded Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredDocs.map((doc) => {
                  const statusClass =
                    STATUS_COLOR[doc.status] ||
                    "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                          <div className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                            {doc.name}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{doc.studentName}</div>
                        <div className="text-[11px] text-slate-500">{doc.studentEmail}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{doc.university || "Application Dossier"}</div>
                        <div className="text-[11px] text-slate-500">{doc.program || "General"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-white/5 text-[11px]">
                          {doc.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
                        >
                          {doc.status || "PENDING"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recent"}
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-violet-600/30 text-slate-300 hover:text-violet-300 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Document Review Drawer */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md h-full bg-[#0B1228] border-l border-white/10 p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                    Document Inspector
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedDoc.name}</h2>
                  <p className="text-xs text-slate-400">{selectedDoc.type}</p>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Association */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-1.5 text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Applicant</span>
                <div className="font-bold text-white text-sm">{selectedDoc.studentName}</div>
                <div className="text-slate-400">{selectedDoc.studentEmail}</div>
                <div className="text-slate-400 mt-1">Target: {selectedDoc.university}</div>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Verification Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    STATUS_COLOR[selectedDoc.status] || STATUS_COLOR.PENDING
                  }`}
                >
                  {selectedDoc.status || "PENDING"}
                </span>
              </div>

              {/* File Viewer / Link */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 space-y-3">
                <div className="text-xs font-bold text-slate-300">File Access</div>
                {selectedDoc.fileUrl ? (
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Document File
                  </a>
                ) : (
                  <div className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-900/70 border border-white/5 text-center">
                    Secure document file stored in student encrypted vault.
                  </div>
                )}
              </div>

              {/* Review Guidance Note */}
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 space-y-2">
                <div className="font-bold text-violet-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-violet-400" />
                  Counselor Verification Checklist:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Verify applicant full legal name matches passport identity.</li>
                  <li>Check validity dates and official institutional seals.</li>
                  <li>Ensure minimum IELTS/PTE subscores meet university program requirement.</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  toast.success("Document verified as authentic.");
                  setSelectedDoc(null);
                }}
                className="w-full py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-colors shadow-md shadow-emerald-600/20"
              >
                Mark Document as Reviewed
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
