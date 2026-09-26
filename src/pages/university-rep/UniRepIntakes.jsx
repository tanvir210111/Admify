import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Building2,
  GraduationCap,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepIntakes() {
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [universityName, setUniversityName] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIntake, setEditingIntake] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "Fall 2027",
    studyLevel: "All Levels",
    program: "All Programs",
    openDate: "September 1",
    deadline: "June 30",
    scholarshipDeadline: "May 15",
    documentDeadline: "July 15",
    expectedDecisionDate: "2-4 Weeks from submission",
    status: "OPEN",
  });

  const fetchIntakes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/intakes");
      if (res?.success && Array.isArray(res?.data?.intakes)) {
        setIntakes(res.data.intakes);
        if (res.data.universityName) setUniversityName(res.data.universityName);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load intake admission cycles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  const openAddModal = () => {
    setEditingIntake(null);
    setForm({
      name: "Fall 2027",
      studyLevel: "All Levels",
      program: "All Programs",
      openDate: "September 1",
      deadline: "June 30",
      scholarshipDeadline: "May 15",
      documentDeadline: "July 15",
      expectedDecisionDate: "2-4 Weeks from submission",
      status: "OPEN",
    });
    setModalOpen(true);
  };

  const openEditModal = (intk) => {
    setEditingIntake(intk);
    setForm({
      name: intk.name || "",
      studyLevel: intk.studyLevel || "All Levels",
      program: intk.program || "All Programs",
      openDate: intk.openDate || "",
      deadline: intk.deadline || "",
      scholarshipDeadline: intk.scholarshipDeadline || "",
      documentDeadline: intk.documentDeadline || "",
      expectedDecisionDate: intk.expectedDecisionDate || "",
      status: intk.status || "OPEN",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.deadline.trim()) {
      toast.error("Intake Name and Application Deadline are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingIntake) {
        const id = editingIntake._id || editingIntake.id;
        const res = await api.put(`/api/university-rep/intakes/${id}`, form);
        if (res?.success) {
          toast.success("Admission intake cycle updated.");
          fetchIntakes();
          setModalOpen(false);
        }
      } else {
        const res = await api.post("/api/university-rep/intakes", form);
        if (res?.success) {
          toast.success("New admission cycle created.");
          fetchIntakes();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save intake cycle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this intake cycle?")) return;
    try {
      const res = await api.delete(`/api/university-rep/intakes/${id}`);
      if (res?.success) {
        toast.success("Intake cycle removed.");
        fetchIntakes();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete intake cycle.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Admissions Calendar
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Intakes & Deadlines
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Admission cycle timetables and official cutoff dates for <span className="text-white font-semibold">{universityName}</span>.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add Admission Cycle
        </button>
      </div>

      {/* ── Intakes List ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading admission cycles...</p>
        </div>
      ) : intakes.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No admission cycles configured</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Set application open dates, scholarship cutoffs, and document verification deadlines to guide partner agencies and candidates.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Create First Admission Cycle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {intakes.map((intk, idx) => {
            const intkId = intk._id || intk.id || idx;
            return (
              <motion.div
                key={intkId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 bg-[#0B1228] border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/20">
                      {intk.status || "OPEN"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(intk)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                        title="Edit Intake"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(intkId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete Intake"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      {intk.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {intk.program || "All Programs"} • {intk.studyLevel || "All Levels"}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Application Open:</span>
                      <span className="text-slate-300">{intk.openDate || "Rolling"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Application Deadline:</span>
                      <span className="font-bold text-amber-300">{intk.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Scholarship Cutoff:</span>
                      <span className="font-semibold text-emerald-400">{intk.scholarshipDeadline || "Same as deadline"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Document Submission:</span>
                      <span className="text-slate-300">{intk.documentDeadline || "Prior to enrollment"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Decision: {intk.expectedDecisionDate || "Standard timeline"}</span>
                  <span className="text-purple-400 font-semibold">Live on Portal</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-[#0B1228] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingIntake ? "Edit Admission Cycle" : "Add Admission Intake Cycle"}
                    </h3>
                    <p className="text-[11px] text-slate-400">{universityName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Intake Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Fall 2027 (September Intake)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Study Level
                    </label>
                    <select
                      value={form.studyLevel}
                      onChange={(e) => setForm({ ...form, studyLevel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="All Levels">All Levels</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="Foundation">Foundation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Intake Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="OPEN">OPEN (Accepting Applications)</option>
                      <option value="CLOSING_SOON">CLOSING SOON</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Open Date
                    </label>
                    <input
                      type="text"
                      value={form.openDate}
                      onChange={(e) => setForm({ ...form, openDate: e.target.value })}
                      placeholder="e.g. September 1"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Deadline *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="e.g. June 30"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Scholarship Cutoff Deadline
                    </label>
                    <input
                      type="text"
                      value={form.scholarshipDeadline}
                      onChange={(e) => setForm({ ...form, scholarshipDeadline: e.target.value })}
                      placeholder="e.g. May 15"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Final Document Deadline
                    </label>
                    <input
                      type="text"
                      value={form.documentDeadline}
                      onChange={(e) => setForm({ ...form, documentDeadline: e.target.value })}
                      placeholder="e.g. July 15"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingIntake ? "Save Changes" : "Create Cycle"}</span>
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
