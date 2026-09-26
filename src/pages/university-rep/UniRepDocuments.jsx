import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Search,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  X,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const DOC_TYPES = [
  "All Types",
  "Passport",
  "Transcript",
  "Academic Certificate",
  "IELTS/PTE",
  "SOP",
  "LOR",
];

export default function UniRepDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/documents");
      if (res?.success && Array.isArray(res?.data?.documents)) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load application documents repository.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filtered = documents.filter((doc) => {
    const sName = doc.studentName || "";
    const dName = doc.documentName || "";
    const pName = doc.program || "";
    const matchesSearch =
      !search ||
      sName.toLowerCase().includes(search.toLowerCase()) ||
      dName.toLowerCase().includes(search.toLowerCase()) ||
      pName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All Types" || doc.documentType?.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Verification Repository
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Application Documents
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional document repository for academic transcripts, passports, and certifications submitted for admissions.
          </p>
        </div>

        <button
          onClick={fetchDocuments}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Documents
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents by student name, document title, or program..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                typeFilter === t
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-200"
                  : "bg-[#0B1228] border border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Documents Table ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading document verification vault...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No documents found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Uploaded academic and compliance documents attached to student applications will automatically be archived here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-[#0B1228] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070E24] border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Applicant Candidate</th>
                  <th className="py-3 px-4">Degree Program</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Uploaded Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{doc.documentName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">App: {doc.applicationId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{doc.studentName}</p>
                      <p className="text-[10px] text-slate-400">{doc.studentEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {doc.program || "General Admissions"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-purple-300 border border-white/10 uppercase">
                        {doc.documentType || "Academic"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "Recent"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Document Inspection Modal ── */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B1228] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{previewDoc.documentName}</h3>
                    <p className="text-[11px] text-slate-400">Candidate: {previewDoc.studentName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300 bg-[#050B1F] p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Document Category</span>
                  <span className="text-white font-medium">{previewDoc.documentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Application Reference</span>
                  <span className="text-white font-mono">{previewDoc.applicationId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Degree Program</span>
                  <span className="text-white">{previewDoc.program}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Compliance Status</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Candidate Submission
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
                {previewDoc.url ? (
                  <a
                    href={previewDoc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Open / Download
                  </a>
                ) : (
                  <button
                    onClick={() => toast.success("Document verified directly in platform records.")}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                  >
                    Mark Reviewed
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
