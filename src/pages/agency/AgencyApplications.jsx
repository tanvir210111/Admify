import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  FileCheck,
  Search,
  Filter,
  RefreshCw,
  Building2,
  GraduationCap,
  Calendar,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  X,
  Send,
  FileText,
} from "lucide-react";

const STAGES = [
  "all",
  "Submitted",
  "Documents Pending",
  "In Review",
  "Accepted",
  "Rejected",
  "Completed",
];

export default function AgencyApplications() {
  const [applications, setApplications] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  // Update Modal State
  const [selectedApp, setSelectedApp] = useState(null);
  const [updateStage, setUpdateStage] = useState("");
  const [updateProgress, setUpdateProgress] = useState(0);
  const [assignAgentId, setAssignAgentId] = useState("");
  const [stepNote, setStepNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/agency/applications?stage=${stageFilter}&search=${encodeURIComponent(search)}`);
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get("/api/agency/agents");
      if (res.success && res.data) {
        setAgents(res.data.registeredAgents || []);
      }
    } catch (err) {
      console.warn("Could not load agents for assignment:", err);
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchAgents();
  }, [stageFilter, search]);

  const handleOpenUpdate = (app) => {
    setSelectedApp(app);
    setUpdateStage(app.stage || "Submitted");
    setUpdateProgress(app.progress || 20);
    setAssignAgentId(app.assignedAgent?._id || app.assignedAgent || "");
    setStepNote("");
  };

  const handleSaveUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const payload = {
        stage: updateStage,
        progress: Number(updateProgress),
        assignedAgent: assignAgentId || undefined,
        notes: stepNote || undefined,
        stepLabel: stepNote ? `Stage updated to ${updateStage}: ${stepNote}` : `Stage updated to ${updateStage}`,
      };

      const res = await api.put(`/api/agency/applications/${selectedApp._id}`, payload);
      if (res.success) {
        toast.success("Application progress updated successfully!");
        setSelectedApp(null);
        fetchApplications();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update application");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Application Pipeline</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Track and process university applications assigned to your agency counselors.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stage Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {STAGES.map((st) => (
          <button
            key={st}
            onClick={() => setStageFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              stageFilter === st
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 font-bold"
                : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {st === "all" ? "All Stages" : st}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div
        className="p-4 rounded-2xl border flex items-center justify-between gap-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by university, program, or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          {applications.length} application{applications.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Applications Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading application pipeline...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center">
            <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
            <p className="text-white text-sm font-semibold">No applications yet</p>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Applications routed to or managed by your agency will appear here with progress tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white/[0.02]">
                  <th className="py-3.5 px-4">Application Details</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Assigned Agent</th>
                  <th className="py-3.5 px-4">Progress / Stage</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="text-white font-semibold">{app.university}</p>
                        <p className="text-slate-400 text-[11px]">{app.program}</p>
                        {app.applicationId && (
                          <span className="inline-block mt-0.5 text-[9px] font-mono text-violet-400">
                            ID: {app.applicationId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-white font-medium">{app.user?.name || "Student"}</p>
                      <p className="text-slate-400 text-[11px]">{app.user?.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {app.country || "Global"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <UserCheck className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span>{app.assignedAgent?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5 w-32">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-violet-300">{app.stage || "Submitted"}</span>
                          <span className="text-slate-500">{app.progress || 0}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                            style={{ width: `${app.progress || 20}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenUpdate(app)}
                        className="px-3 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Manage & Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manage Application Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
              style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">{selectedApp.university}</h3>
                <p className="text-xs text-slate-400">{selectedApp.program}</p>
                <p className="text-[11px] text-violet-400 mt-1">
                  Applicant: {selectedApp.user?.name} ({selectedApp.user?.email})
                </p>
              </div>

              <form onSubmit={handleSaveUpdate} className="py-4 space-y-4 text-xs">
                {/* Stage Selection */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Application Stage</label>
                  <select
                    value={updateStage}
                    onChange={(e) => {
                      setUpdateStage(e.target.value);
                      if (e.target.value === "Accepted" || e.target.value === "Completed") setUpdateProgress(100);
                      else if (e.target.value === "In Review") setUpdateProgress(60);
                      else if (e.target.value === "Documents Pending") setUpdateProgress(40);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Documents Pending">Documents Pending</option>
                    <option value="In Review">In Review by Admissions</option>
                    <option value="Accepted">Accepted / Offer Received</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed / Visa Granted</option>
                  </select>
                </div>

                {/* Progress Percentage */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300 font-semibold">Progress Completion</label>
                    <span className="text-violet-400 font-bold">{updateProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={updateProgress}
                    onChange={(e) => setUpdateProgress(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>

                {/* Assign Counselor / Agent */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Agency Counselor</label>
                  <select
                    value={assignAgentId}
                    onChange={(e) => setAssignAgentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Select Counselor from Agency Roster</option>
                    {agents.map((ag) => (
                      <option key={ag._id} value={ag._id}>
                        {ag.name} ({ag.designation || "Counselor"})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Internal Progress Step Note */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Step Note / Update Log</label>
                  <textarea
                    rows={2}
                    value={stepNote}
                    onChange={(e) => setStepNote(e.target.value)}
                    placeholder="e.g. Sent official transcripts to admissions office..."
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-all shadow-lg shadow-violet-600/30"
                  >
                    {updating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save Updates</span>
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
