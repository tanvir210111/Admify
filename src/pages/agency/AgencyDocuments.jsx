import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  FileText,
  Upload,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Download,
  ExternalLink,
  X,
} from "lucide-react";

export default function AgencyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("agency"); // 'agency' | 'applications'

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState("tradeLicense");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileMime, setFileMime] = useState("");

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/documents");
      if (res.success && res.data) {
        setDocuments(res.data.documents || []);
        setVerificationStatus(res.data.verificationStatus || "PENDING");
      }
    } catch (err) {
      toast.error(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error("File size must not exceed 10 MB");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result);
      setFileName(file.name);
      setFileMime(file.type || "application/pdf");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileData) {
      return toast.error("Please choose a file to upload");
    }

    setUploading(true);
    try {
      const res = await api.post("/api/agency/documents", {
        docType,
        fileName,
        fileType: fileMime,
        fileData,
      });
      if (res.success) {
        toast.success("Document uploaded successfully!");
        setShowUploadModal(false);
        setFileData("");
        setFileName("");
        fetchDocs();
      }
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Agency Document Repository</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Institutional compliance credentials, trade certifications, and admissions document vaults.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDocs}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Compliance Overview Card */}
      <div
        className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Institutional Verification Status</h3>
            <p className="text-slate-400 text-xs">
              {verificationStatus === "VERIFIED"
                ? "Your agency compliance file is verified by Admify Compliance."
                : "Documents under active review by Platform Administration."}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            verificationStatus === "VERIFIED"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {verificationStatus}
        </span>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading document repository...
          </div>
        ) : documents.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border"
            style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}>
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No uploaded compliance files</p>
            <p className="text-slate-500 text-xs mt-1">Upload your trade license, TIN, or VAT certificates to complete your vault.</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-all inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Compliance File</span>
            </button>
          </div>
        ) : (
          documents.map((doc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border flex flex-col justify-between"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    VERIFIED FILE
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-bold text-white truncate">{doc.name || doc.type}</h3>
                  <p className="text-slate-400 text-[11px] truncate mt-0.5">{doc.fileName || "document.pdf"}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-slate-500 flex justify-between">
                  <span>Type: {doc.fileType || "PDF"}</span>
                  <span>Uploaded {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                {doc.fileData && (
                  <a
                    href={doc.fileData}
                    download={doc.fileName || `${doc.type}.pdf`}
                    className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Upload Compliance / Accreditation File</h3>
                <p className="text-xs text-slate-400">PDF, JPG, or PNG files up to 10 MB</p>
              </div>

              <form onSubmit={handleUploadSubmit} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Document Category</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="tradeLicense">Trade License</option>
                    <option value="businessRegistration">Certificate of Incorporation / Registration</option>
                    <option value="tinCertificate">Tax Identification Number (TIN)</option>
                    <option value="binVatCertificate">VAT / BIN Registration Certificate</option>
                    <option value="agencyProfileDocument">Company Portfolio / Corporate Deck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Choose File</label>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500"
                  />
                  {fileName && (
                    <p className="mt-1 text-emerald-400 text-[11px]">Selected: {fileName}</p>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !fileData}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/30 disabled:opacity-50"
                  >
                    {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload Document</span>
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
