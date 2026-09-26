import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck, Search, Filter, Eye, Edit, CheckCircle2, XCircle,
  Clock, AlertTriangle, RefreshCw, X, ChevronRight, UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../lib/api";

const STAGES = ["Submitted", "Documents Pending", "In Review", "Accepted", "Rejected", "Waitlisted"];

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  // Status update modal
  const [editModal, setEditModal] = useState(null); // application object
  const [targetStage, setTargetStage] = useState("In Review");
  const [progress, setProgress] = useState(50);
  const [stepNote, setStepNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const url = stageFilter !== "all"
        ? `/api/admin/applications?stage=${encodeURIComponent(stageFilter)}&search=${encodeURIComponent(search)}`
        : `/api/admin/applications?search=${encodeURIComponent(search)}`;
      const data = await api.get(url);
      if (data?.success) {
        setApplications(data.data?.applications || []);
      } else {
        toast.error(data?.message || "Failed to load applications");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to application records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [stageFilter]);

  const handleUpdateApplication = async (e) => {
    e.preventDefault();
    if (!editModal) return;

    setActionLoading(true);
    try {
      const data = await api.put(`/api/admin/applications/${editModal._id}`, {
        stage: targetStage,
        progress,
        notes: stepNote.trim(),
        stepLabel: stepNote ? `Admin Stage Update: ${targetStage}` : undefined,
      });

      if (data?.success) {
        toast.success("Application status updated");
        setEditModal(null);
        setStepNote("");
        fetchApplications();
        if (selectedApp && selectedApp._id === editModal._id) {
          setSelectedApp(data.data.application);
        }
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Error updating application");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = applications.filter((app) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      app.university?.toLowerCase().includes(s) ||
      app.program?.toLowerCase().includes(s) ||
      app.user?.name?.toLowerCase().includes(s) ||
      app.user?.email?.toLowerCase().includes(s) ||
      app._id?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-blue-400" /> University Applications Central
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Real student university admissions, stage updates, document verifications, and Counselor assignments
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </button>
      </div>

      {/* Toolbar: Search + Stage Filter */}
      <div
        className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, university, program..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full sm:w-auto">
          <button
            onClick={() => setStageFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              stageFilter === "all"
                ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
            }`}
          >
            All Stages
          </button>
          {STAGES.map((st) => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                stageFilter === st
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                  : "bg-white/4 text-slate-400 border border-white/8 hover:bg-white/8"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Student Applicant</th>
                <th className="px-4 py-3 font-bold">Target Institution & Program</th>
                <th className="px-4 py-3 font-bold">Current Stage</th>
                <th className="px-4 py-3 font-bold">Progress</th>
                <th className="px-4 py-3 font-bold">Applied Date</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading applications from database...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No applications found in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr
                    key={app._id}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-300 text-xs flex-shrink-0">
                          {app.user?.name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{app.user?.name || "Student"}</p>
                          <p className="text-slate-400 text-[11px]">{app.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-white text-xs">{app.university}</p>
                      <p className="text-slate-400 text-[11px]">{app.program}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          app.stage === "Accepted"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : app.stage === "Rejected"
                            ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                            : app.stage === "In Review"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {app.stage || "Submitted"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="w-28">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                          <span>Progress</span>
                          <span>{app.progress || 25}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                            style={{ width: `${app.progress || 25}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : app.date || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditModal(app);
                            setTargetStage(app.stage || "In Review");
                            setProgress(app.progress || 50);
                            setStepNote("");
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors"
                        >
                          Update Stage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-600/20 text-blue-300 border border-blue-500/30">
                      Application Dossier
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">{selectedApp.university}</h3>
                    <p className="text-xs text-slate-400">{selectedApp.program}</p>
                  </div>
                  <button onClick={() => setSelectedApp(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Applicant Info */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Student Profile</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Name</span>
                      <span className="text-white font-semibold">{selectedApp.user?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Email</span>
                      <span className="text-white font-semibold">{selectedApp.user?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">GPA / CGPA</span>
                      <span className="text-white font-semibold">{selectedApp.user?.gpa || "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">IELTS</span>
                      <span className="text-white font-semibold">{selectedApp.user?.ielts || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Status & Progress */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-bold uppercase text-slate-400">Application Pipeline</p>
                    <span className="font-bold text-blue-400">{selectedApp.stage}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Overall Progress</span>
                      <span className="font-bold text-white">{selectedApp.progress || 25}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${selectedApp.progress || 25}%` }} />
                    </div>
                  </div>
                </div>

                {/* Steps History */}
                <div className="p-3.5 rounded-xl border border-white/6 bg-white/2 space-y-2 text-xs">
                  <p className="text-[11px] font-bold uppercase text-slate-400">Timeline Milestones</p>
                  {selectedApp.steps?.map((step, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-white/3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{step.label}</p>
                        <p className="text-[10px] text-slate-500">{step.date}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        step.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-slate-400"
                      }`}>
                        {step.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/8">
                <button
                  onClick={() => {
                    setEditModal(selectedApp);
                    setTargetStage(selectedApp.stage || "In Review");
                    setProgress(selectedApp.progress || 50);
                    setStepNote("");
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                >
                  Modify Application Stage
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Modify Stage Modal ── */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">Update Application Stage</h3>
                <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateApplication} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">New Stage</label>
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1 font-semibold">
                    <span>Progress (%)</span>
                    <span className="text-white font-mono">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Milestone / Admin Notes</label>
                  <textarea
                    rows={2}
                    value={stepNote}
                    onChange={(e) => setStepNote(e.target.value)}
                    placeholder="e.g. Admission committee approved offer letter..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {actionLoading ? "Updating..." : "Save Stage"}
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
