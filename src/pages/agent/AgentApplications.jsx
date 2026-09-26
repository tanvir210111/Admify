import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  Search,
  Eye,
  Edit3,
  Calendar,
  Clock,
  Building2,
  GraduationCap,
  FileText,
  PlusCircle,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STAGES = [
  "Draft",
  "Submitted",
  "Under Review",
  "Interview",
  "Decision",
  "Visa Process",
  "Completed",
];

const STATUS_COLOR = {
  "Draft": "text-slate-400 bg-slate-500/10 border-slate-500/20",
  "NEW": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "IN_PROGRESS": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "DOCUMENTS_REQUIRED": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "READY_TO_SUBMIT": "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  "SUBMITTED": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Submitted": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "Under Review": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "OFFER_RECEIVED": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Decision (Accepted)": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "Accepted": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  "COMPLETED": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "Completed": "text-teal-400 bg-teal-500/10 border-teal-500/20",
  "REJECTED": "text-red-400 bg-red-500/10 border-red-500/20",
  "Rejected": "text-red-400 bg-red-500/10 border-red-500/20",
  "CANCELLED": "text-slate-400 bg-slate-500/10 border-slate-500/20",
};

export default function AgentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);

  // Edit / Update State
  const [newStage, setNewStage] = useState("");
  const [newProgress, setNewProgress] = useState(0);
  const [newStepLabel, setNewStepLabel] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/applications");
      if (res?.data?.success) {
        setApplications(res.data.data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load agent applications:", err);
      toast.error("Failed to load applications caseload.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openUpdateModal = (app) => {
    setEditingApp(app);
    setNewStage(app.stage || "Submitted");
    setNewProgress(app.progress || 0);
    setNewNotes(app.notes || "");
    setNewStepLabel("");
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/api/agent/applications/${editingApp._id}`, {
        stage: newStage,
        progress: Number(newProgress),
        notes: newNotes,
        stepLabel: newStepLabel.trim() || undefined,
      });

      if (res?.data?.success) {
        toast.success("Application progress updated.");
        setEditingApp(null);
        fetchApplications();
        if (selectedApp?._id === editingApp._id) {
          setSelectedApp(res.data.data.application);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update application.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.university || "").toLowerCase().includes(search.toLowerCase()) ||
      (app.program || "").toLowerCase().includes(search.toLowerCase()) ||
      (app.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (app._id || "").toLowerCase().includes(search.toLowerCase());

    const matchesStage =
      stageFilter === "all" ||
      (app.stage || "").toLowerCase() === stageFilter.toLowerCase();

    return matchesSearch && matchesStage;
  });

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Header */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-violet-400" /> Application Caseload Management
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Track student university submissions, verify stages, review offer letters, and record admission milestones.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Metrics Banner */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Assigned Applications", val: applications.length, color: "text-blue-400" },
          {
            label: "In Progress / Review",
            val: applications.filter(
              (a) =>
                a.stage === "In Review" ||
                a.stage === "Under Review" ||
                a.stage === "Documents Pending" ||
                a.stage === "Submitted"
            ).length,
            color: "text-yellow-400",
          },
          {
            label: "Offers Received",
            val: applications.filter((a) => a.stage === "Accepted" || a.stage === "OFFER_RECEIVED").length,
            color: "text-emerald-400",
          },
          {
            label: "Completed Enrolments",
            val: applications.filter((a) => a.stage === "Completed" || a.stage === "COMPLETED").length,
            color: "text-violet-400",
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

      {/* Search and Filter Bar */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student, university, program, or app ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-slate-200 focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Stages</option>
          <option value="Submitted">Submitted</option>
          <option value="Documents Pending">Documents Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Accepted">Accepted / Offer Received</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </motion.div>

      {/* Applications Caseload Table */}
      <motion.div
        variants={fade}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading assigned applications...
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Applications Found</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              {search || stageFilter !== "all"
                ? "No applications matched your search or stage criteria."
                : "No applications have been assigned to your counselor caseload yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/6">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">University & Program</th>
                  <th className="py-3.5 px-4">Intake & Country</th>
                  <th className="py-3.5 px-4">Stage / Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredApps.map((app) => {
                  const studentName = app.user?.name || "Student";
                  const studentEmail = app.user?.email || "";
                  const stageClass =
                    STATUS_COLOR[app.stage] ||
                    "text-slate-300 bg-slate-500/10 border-slate-500/20";

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => setSelectedApp(app)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-violet-400 transition-colors">
                          {studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">{studentEmail}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          {app.university}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3 h-3 text-slate-500 shrink-0" />
                          {app.program}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white font-medium">{app.intake || "Upcoming Intake"}</div>
                        <div className="text-[11px] text-slate-500">{app.country || "Global"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stageClass}`}
                        >
                          {app.stage || "Submitted"}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, app.progress || 20))}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">
                          {app.progress || 0}% Completed
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {app.updatedAt
                          ? new Date(app.updatedAt).toLocaleDateString()
                          : new Date(app.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            title="View Application Details"
                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-violet-600/30 text-slate-300 hover:text-violet-300 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openUpdateModal(app)}
                            title="Update Stage & Milestone"
                            className="p-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Slide-out Drawer: Application Details */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-xl h-full bg-[#0B1228] border-l border-white/10 p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                    Application Dossier
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    {selectedApp.university}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedApp.program}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Overview */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Student
                </div>
                <div className="text-sm font-bold text-white">
                  {selectedApp.user?.name || "Student"}
                </div>
                <div className="text-xs text-slate-400">
                  Email: {selectedApp.user?.email || "N/A"}
                </div>
                <div className="text-xs text-slate-400">
                  Phone: {selectedApp.user?.phone || "N/A"}
                </div>
              </div>

              {/* Key Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Intake</span>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {selectedApp.intake || "Upcoming"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Country</span>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {selectedApp.country || "Global"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Stage</span>
                  <div className="text-xs font-bold text-violet-400 mt-0.5">
                    {selectedApp.stage || "Submitted"}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Progress</span>
                  <div className="text-xs font-bold text-cyan-400 mt-0.5">
                    {selectedApp.progress || 0}%
                  </div>
                </div>
              </div>

              {/* Progress Milestones */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Admissions Milestones Track
                </h4>
                {selectedApp.steps && selectedApp.steps.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApp.steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-white font-medium">{st.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{st.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No formal milestone logs registered yet.</p>
                )}
              </div>

              {/* Supporting Documents Attached */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Dossier Documents
                </h4>
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedApp.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-violet-400" />
                          <div>
                            <div className="text-white font-medium">{doc.name}</div>
                            <div className="text-[10px] text-slate-500">{doc.type || "Document"}</div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
                          {doc.status || "PENDING"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No files attached to this application.</p>
                )}
              </div>

              {/* Internal Counselor Notes */}
              {selectedApp.notes && (
                <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20">
                  <div className="text-[11px] font-bold text-violet-300">Counselor Case Notes:</div>
                  <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{selectedApp.notes}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={() => {
                    openUpdateModal(selectedApp);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 text-center"
                >
                  Update Stage & Progress
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Update Application Stage & Progress */}
      <AnimatePresence>
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0B1228] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-violet-400" />
                  Update Application: {editingApp.university}
                </h3>
                <button
                  onClick={() => setEditingApp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
                {/* Stage Selection */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Application Stage
                  </label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Accepted">Accepted / Offer Received</option>
                    <option value="Visa Process">Visa Process</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Progress Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-semibold">Progress Percentage</label>
                    <span className="text-cyan-400 font-bold">{newProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Add Milestone Step */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Add Milestone Step (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CAS Letter issued by University"
                    value={newStepLabel}
                    onChange={(e) => setNewStepLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Internal Counselor Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Add internal counsel notes regarding this admission case..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingApp(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Save Updates"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
