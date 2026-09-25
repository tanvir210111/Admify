import React, { useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import {
  FolderOpen,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Download,
  Plus,
  X,
  FileCheck2,
  FileEdit,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

function StudentDocumentsPage() {
  const [documents, setDocuments] = useState(() => studentService.getDocuments());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Form states for document upload
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Academic Transcript");
  const [fileSelected, setFileSelected] = useState(null);

  const categories = [
    "all",
    "Passport",
    "Academic Transcript",
    "IELTS / English Certificate",
    "CV / Resume",
    "SOP",
    "LOR",
    "Financial Documents",
  ];

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    const updated = studentService.addDocument({
      title: title.endsWith(".pdf") ? title : `${title}.pdf`,
      category,
      size: fileSelected ? `${(fileSelected.size / (1024 * 1024)).toFixed(1)} MB` : "1.8 MB",
    });
    setDocuments(updated);
    setShowUploadModal(false);
    setTitle("");
    setFileSelected(null);
    toast.success("Document uploaded to vault successfully!");
  };

  const handleDelete = (id) => {
    const updated = studentService.deleteDocument(id);
    setDocuments(updated);
    toast.success("Document removed from vault");
  };

  const filtered = selectedCategory === "all"
    ? documents
    : documents.filter((d) => d.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">My Profile</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Document Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Securely store, verify, and attach academic credentials, passports, and test certificates to applications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/sop-generator"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1228] border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <FileEdit className="w-4 h-4 text-cyan-400" />
            <span>Generate SOP</span>
          </Link>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap capitalize ${
              selectedCategory === cat
                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm"
                : "bg-[#0B1228] border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {cat === "all" ? "All Documents" : cat}
          </button>
        ))}
      </div>

      {/* Documents Grid / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
          <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">No documents uploaded yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Upload your passport, academic transcripts, or language test scores to easily attach to applications.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-3xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      doc.status === "Verified"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{doc.category}</p>
                </div>

                <div className="space-y-1.5 pt-2 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="text-slate-300 font-medium">{doc.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded Date:</span>
                    <span className="text-slate-300 font-medium">{doc.uploadedAt}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Applications:</span>
                    <span className="text-cyan-400 font-medium truncate max-w-[150px]">
                      {doc.usedInApps?.length > 0 ? doc.usedInApps.join(", ") : "Available for attach"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-800">
                <button
                  onClick={() => toast.success(`Downloading ${doc.title}...`)}
                  className="flex-1 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-colors"
                  title="Delete document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Upload New Document</h3>
                  <p className="text-xs text-slate-400">Attach verification file to your global vault</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Document Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="Passport">Passport</option>
                  <option value="Academic Transcript">Academic Transcript</option>
                  <option value="Academic Certificates">Academic Certificates</option>
                  <option value="IELTS / English Certificate">IELTS / English Certificate</option>
                  <option value="CV / Resume">CV / Resume</option>
                  <option value="SOP">Statement of Purpose (SOP)</option>
                  <option value="LOR">Letter of Recommendation (LOR)</option>
                  <option value="Financial Documents">Financial Documents / Bank Solvency</option>
                  <option value="Other">Other Application Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Document Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Official_Undergrad_Transcript_Final"
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select File (PDF, DOCX, PNG)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFileSelected(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDocumentsPage;
