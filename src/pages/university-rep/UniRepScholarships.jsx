import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Building2,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [universityName, setUniversityName] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSch, setEditingSch] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    amount: "BDT 300,000 / year",
    coverage: "Partial Tuition",
    studyLevel: "Undergraduate",
    eligibility: "GPA 3.8+ or SAT 1350+",
    deadline: "May 15",
    requirements: "Academic essay, 2 Letters of Recommendation",
    applicationMethod: "Online Admissions Portal",
    officialLink: "",
    description: "",
  });

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/scholarships");
      if (res?.success && Array.isArray(res?.data?.scholarships)) {
        setScholarships(res.data.scholarships);
        if (res.data.universityName) setUniversityName(res.data.universityName);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const openAddModal = () => {
    setEditingSch(null);
    setForm({
      title: "",
      amount: "BDT 300,000 / year",
      coverage: "Partial Tuition",
      studyLevel: "Undergraduate",
      eligibility: "GPA 3.8+ or SAT 1350+",
      deadline: "May 15",
      requirements: "Academic essay, 2 Letters of Recommendation",
      applicationMethod: "Online Admissions Portal",
      officialLink: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEditModal = (sch) => {
    setEditingSch(sch);
    setForm({
      title: sch.title || "",
      amount: sch.amount || "",
      coverage: sch.coverage || "Partial Tuition",
      studyLevel: sch.studyLevel || "Undergraduate",
      eligibility: sch.eligibility || "",
      deadline: sch.deadline || "",
      requirements: sch.requirements || "",
      applicationMethod: sch.applicationMethod || "Online Admissions Portal",
      officialLink: sch.officialLink || "",
      description: sch.description || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount.trim() || !form.eligibility.trim()) {
      toast.error("Scholarship Title, Amount, and Eligibility are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingSch) {
        const id = editingSch._id || editingSch.id;
        const res = await api.put(`/api/university-rep/scholarships/${id}`, form);
        if (res?.success) {
          toast.success("Scholarship award updated.");
          fetchScholarships();
          setModalOpen(false);
        }
      } else {
        const res = await api.post("/api/university-rep/scholarships", form);
        if (res?.success) {
          toast.success("New university scholarship created.");
          fetchScholarships();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save scholarship.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scholarship?")) return;
    try {
      const res = await api.delete(`/api/university-rep/scholarships/${id}`);
      if (res?.success) {
        toast.success("Scholarship removed.");
        fetchScholarships();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete scholarship.");
    }
  };

  const filtered = scholarships.filter((s) => {
    const title = s.title || "";
    const coverage = s.coverage || "";
    const elig = s.eligibility || "";
    return (
      !search ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      coverage.toLowerCase().includes(search.toLowerCase()) ||
      elig.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Funding & Financial Awards
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Institutional Scholarships
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage merit and need-based tuition waivers offered by <span className="text-white font-semibold">{universityName}</span>.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create Scholarship
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scholarships by title, eligibility, or coverage..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* ── Scholarships Grid ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading university scholarship awards...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <Award className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No scholarships registered</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Provide tuition grants, entrance waivers, and merit bursaries to attract high-achieving international applicants.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Add Scholarship Award
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sch) => (
            <motion.div
              key={sch._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5 bg-[#0B1228] border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                    {sch.coverage || "Partial Tuition"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(sch)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                      title="Edit Scholarship"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sch._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete Scholarship"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{sch.title}</h3>
                  <p className="text-base font-extrabold text-emerald-400 mt-1">{sch.amount}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Degree Level:</span>
                    <span className="font-medium text-slate-300">{sch.studyLevel || "All Levels"}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Deadline:</span>
                    <span className="font-semibold text-amber-300">{sch.deadline}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    <span className="text-slate-500 block">Eligibility Criteria:</span>
                    <span className="text-slate-300">{sch.eligibility}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Method: {sch.applicationMethod || "Direct Apply"}</span>
                {sch.officialLink && (
                  <a
                    href={sch.officialLink.startsWith("http") ? sch.officialLink : `https://${sch.officialLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Portal <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
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
              className="w-full max-w-xl rounded-2xl bg-[#0B1228] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingSch ? "Edit Scholarship Award" : "Register Institutional Scholarship"}
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

              <form onSubmit={handleSave} className="space-y-4 max-h-[75vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scholarship Award Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Vice-Chancellor's Global Excellence Scholarship"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Award Amount / Value *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="e.g. BDT 400,000 or 50% Tuition Waiver"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Coverage Type
                    </label>
                    <select
                      value={form.coverage}
                      onChange={(e) => setForm({ ...form, coverage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="Partial Tuition">Partial Tuition</option>
                      <option value="Full Tuition">Full Tuition</option>
                      <option value="Living Allowance">Living Allowance</option>
                      <option value="Full Ride">Full Ride (Tuition + Living)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Target Degree Level
                    </label>
                    <select
                      value={form.studyLevel}
                      onChange={(e) => setForm({ ...form, studyLevel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                      <option value="All Levels">All Levels</option>
                    </select>
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
                      placeholder="e.g. May 31 or Rolling"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Eligibility *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. Minimum GPA 3.75 or equivalent international standard"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Required Documents / Criteria
                  </label>
                  <input
                    type="text"
                    value={form.requirements}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    placeholder="e.g. Personal statement, 500-word essay, portfolio"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Method
                    </label>
                    <input
                      type="text"
                      value={form.applicationMethod}
                      onChange={(e) => setForm({ ...form, applicationMethod: e.target.value })}
                      placeholder="e.g. Auto-Assessed with Admission"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official Portal Link
                    </label>
                    <input
                      type="text"
                      value={form.officialLink}
                      onChange={(e) => setForm({ ...form, officialLink: e.target.value })}
                      placeholder="https://www.university.edu/scholarships"
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
                    <span>{editingSch ? "Save Changes" : "Create Award"}</span>
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
