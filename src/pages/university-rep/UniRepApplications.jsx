import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck2,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  X,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const STAGES = [
  "All Stages",
  "Submitted",
  "Documents Pending",
  "In Review",
  "Accepted",
  "Rejected",
];

const STAGE_COLORS = {
  "Submitted": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Documents Pending": "text-amber-400 bg-amber-500/10 border-amber-500/20",
  "In Review": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "Accepted": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Rejected": "text-red-400 bg-red-500/10 border-red-500/20",
  "Waitlisted": "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

export default function UniRepApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/applications");
      if (res?.success && Array.isArray(res?.data?.applications)) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load university applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = applications.filter((app) => {
    const studentName = app.student?.name || "";
    const programName = app.program || "";
    const appId = app.applicationId || "";
    const matchesSearch =
      !search ||
      studentName.toLowerCase().includes(search.toLowerCase()) ||
      programName.toLowerCase().includes(search.toLowerCase()) ||
      appId.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === "All Stages" || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Admissions Caseload
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Applications & Inquiries
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time candidate submissions routed to your institution from students and authorized agencies.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh List
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
            placeholder="Search candidate by name, Application ID, or degree program..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STAGES.map((stg) => (
            <button
              key={stg}
              onClick={() => setStageFilter(stg)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                stageFilter === stg
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-200"
                  : "bg-[#0B1228] border border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {stg}
            </button>
          ))}
        </div>
      </div>

      {/* ── Applications Table / Cards ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading student applications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No applications match your criteria</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Applications submitted to your university via Admify direct apply or partner agencies will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 bg-[#0B1228] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#070E24] border-b border-white/5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Student Candidate</th>
                  <th className="py-3 px-4">Program & Intake</th>
                  <th className="py-3 px-4">Stage / Status</th>
                  <th className="py-3 px-4">Recruitment Channel</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((app) => {
                  const student = app.student || {};
                  const stageClass = STAGE_COLORS[app.stage] || "text-slate-400 bg-slate-500/10 border-slate-500/20";

                  return (
                    <tr key={app._id} className="hover:bg-white/[0.02] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {app.applicationId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-white">{student.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {student.country || "International"} • GPA: {student.gpa || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{app.program}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{app.intake || "Upcoming Intake"}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider inline-block ${stageClass}`}>
                          {app.stage}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {app.assignedAgency?.name ? (
                          <div className="flex items-center gap-1 text-slate-300">
                            <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate max-w-[130px]">{app.assignedAgency.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Direct Candidate</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {app.date ? new Date(app.date).toLocaleDateString() : "Recent"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View Application Drawer Modal ── */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0B1228] border border-white/10 shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Application Review</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedApp.applicationId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
                {/* Candidate Info */}
                <div className="p-4 rounded-xl bg-[#050B1F] border border-white/5 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-purple-400">
                    Candidate Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Full Name</span>
                      <span className="font-semibold text-white">{selectedApp.student?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Email</span>
                      <span className="font-semibold text-white">{selectedApp.student?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Country of Origin</span>
                      <span>{selectedApp.student?.country || "International"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Academic Records</span>
                      <span>GPA: {selectedApp.student?.gpa || "N/A"} • IELTS: {selectedApp.student?.ielts || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Program Details */}
                <div className="p-4 rounded-xl bg-[#050B1F] border border-white/5 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                    Applied Program
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Degree Program</span>
                      <span className="font-semibold text-white">{selectedApp.program}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Intake</span>
                      <span>{selectedApp.intake || "Upcoming"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Application Stage</span>
                      <span className="font-semibold text-emerald-400">{selectedApp.stage}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Submitted Date</span>
                      <span>{selectedApp.date ? new Date(selectedApp.date).toLocaleDateString() : "Recent"}</span>
                    </div>
                  </div>
                </div>

                {/* Submitted Documents */}
                <div className="p-4 rounded-xl bg-[#050B1F] border border-white/5 space-y-3">
                  <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-amber-400">
                    Attached Application Documents ({selectedApp.documents?.length || 0})
                  </h4>
                  {(!selectedApp.documents || selectedApp.documents.length === 0) ? (
                    <p className="text-slate-500">No documents attached to this application record.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedApp.documents.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <div>
                              <p className="font-semibold text-white">{doc.name || "Document"}</p>
                              <p className="text-[10px] text-slate-500">{doc.type || "Academic"}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300">
                            Available in Docs Hub
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-3 border-t border-white/10 bg-[#070E24]">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Close Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
