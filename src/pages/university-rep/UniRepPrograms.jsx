import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Calendar,
  BookOpen,
  Filter,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const DEGREE_LEVELS = [
  "All Levels",
  "Foundation",
  "Diploma",
  "Undergraduate",
  "Master's",
  "PhD",
];

export default function UniRepPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [universityName, setUniversityName] = useState("");

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    degree: "Undergraduate",
    department: "",
    subject: "",
    duration: "4 Years",
    tuitionFee: "BDT 1,200,000 / year ($10,000 USD)",
    applicationFee: "BDT 6,000 ($50 USD)",
    intake: "Fall",
    deadline: "June 30",
    eligibility: "HSC/A-Level GPA 3.5+ or equivalent",
    englishRequirement: "IELTS 6.5 (min 6.0) / PTE 58",
    requiredDocuments: "Transcript, Passport, SOP, Reference Letters",
    scholarshipAvailability: true,
  });

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/programs");
      if (res?.success && Array.isArray(res?.data?.programs)) {
        setPrograms(res.data.programs);
        if (res.data.universityName) setUniversityName(res.data.universityName);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load academic catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const openAddModal = () => {
    setEditingProgram(null);
    setForm({
      name: "",
      degree: "Undergraduate",
      department: "",
      subject: "",
      duration: "4 Years",
      tuitionFee: "BDT 1,200,000 / year ($10,000 USD)",
      applicationFee: "BDT 6,000 ($50 USD)",
      intake: "Fall",
      deadline: "June 30",
      eligibility: "HSC/A-Level GPA 3.5+ or equivalent",
      englishRequirement: "IELTS 6.5 (min 6.0) / PTE 58",
      requiredDocuments: "Transcript, Passport, SOP, Reference Letters",
      scholarshipAvailability: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (prog) => {
    setEditingProgram(prog);
    setForm({
      name: prog.name || "",
      degree: prog.degree || "Undergraduate",
      department: prog.department || "",
      subject: prog.subject || "",
      duration: prog.duration || "4 Years",
      tuitionFee: prog.tuitionFee || "",
      applicationFee: prog.applicationFee || "",
      intake: prog.intake || "Fall",
      deadline: prog.deadline || "",
      eligibility: prog.eligibility || "",
      englishRequirement: prog.englishRequirement || "",
      requiredDocuments: Array.isArray(prog.requiredDocuments)
        ? prog.requiredDocuments.join(", ")
        : prog.requiredDocuments || "",
      scholarshipAvailability: Boolean(prog.scholarshipAvailability),
    });
    setModalOpen(true);
  };

  const handleSaveProgram = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Program Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        requiredDocuments: form.requiredDocuments.split(",").map((d) => d.trim()).filter(Boolean),
      };

      if (editingProgram) {
        const id = editingProgram._id || editingProgram.id;
        const res = await api.put(`/api/university-rep/programs/${id}`, payload);
        if (res?.success) {
          toast.success("Program updated successfully.");
          fetchPrograms();
          setModalOpen(false);
        }
      } else {
        const res = await api.post("/api/university-rep/programs", payload);
        if (res?.success) {
          toast.success("New program added to catalog.");
          fetchPrograms();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to save program.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProgram = async (id) => {
    try {
      const res = await api.delete(`/api/university-rep/programs/${id}`);
      if (res?.success) {
        toast.success("Program removed from catalog.");
        setDeleteConfirmId(null);
        fetchPrograms();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete program.");
    }
  };

  const filtered = programs.filter((p) => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.department?.toLowerCase().includes(search.toLowerCase()) ||
      p.subject?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = selectedLevel === "All Levels" || p.degree === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Academic Catalog Management
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Programs & Departments
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official degree programs offered by <span className="text-white font-semibold">{universityName}</span>.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Add Degree Program
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search programs by name, department, or field of study..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Degree Level Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {DEGREE_LEVELS.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedLevel === lvl
                  ? "bg-purple-600/20 border border-purple-500/40 text-purple-200"
                  : "bg-[#0B1228] border border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* ── Catalog Table / Cards ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading university program catalog...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No academic programs found</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {search || selectedLevel !== "All Levels"
              ? "No programs matched your filter criteria. Try adjusting your query."
              : "No programs have been added to this university catalog yet. Click below to add your first program."}
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Add First Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prog, idx) => {
            const progId = prog._id || prog.id || idx;
            return (
              <motion.div
                key={progId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 bg-[#0B1228] border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/20">
                      {prog.degree}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(prog)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                        title="Edit Program"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(progId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Delete Program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{prog.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {prog.department ? `${prog.department} • ` : ""}
                      {prog.duration}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Tuition Fee:</span>
                      <span className="font-semibold text-emerald-400">{prog.tuitionFee || "Contact Uni"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Intake / Deadline:</span>
                      <span className="font-medium text-slate-300">
                        {prog.intake || "Fall"} ({prog.deadline || "Rolling"})
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">English Req:</span>
                      <span className="font-medium text-slate-300">{prog.englishRequirement || "IELTS 6.0"}</span>
                    </div>
                    {prog.scholarshipAvailability && (
                      <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                        <Award className="w-3 h-3" />
                        <span>Institutional Scholarship Eligible</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Eligibility: {prog.eligibility ? prog.eligibility.slice(0, 30) + "..." : "Standard criteria"}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                    Active
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal Drawer ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-[#0B1228] border border-white/10 shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingProgram ? "Edit Program Details" : "Add Degree Program to Catalog"}
                    </h3>
                    <p className="text-xs text-slate-400">{universityName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProgram} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Program Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. BSc Computer Science & Artificial Intelligence"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Degree Level *
                    </label>
                    <select
                      value={form.degree}
                      onChange={(e) => setForm({ ...form, degree: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                    >
                      <option value="Foundation">Foundation</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / Faculty
                    </label>
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. School of Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Subject / Field of Study
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Program Duration
                    </label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      placeholder="e.g. 3-4 Years"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tuition Fee (BDT primary, USD secondary)
                    </label>
                    <input
                      type="text"
                      value={form.tuitionFee}
                      onChange={(e) => setForm({ ...form, tuitionFee: e.target.value })}
                      placeholder="e.g. BDT 1,200,000 / year ($10,000 USD)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Fee
                    </label>
                    <input
                      type="text"
                      value={form.applicationFee}
                      onChange={(e) => setForm({ ...form, applicationFee: e.target.value })}
                      placeholder="e.g. BDT 6,000 ($50 USD)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Intake Season
                    </label>
                    <input
                      type="text"
                      value={form.intake}
                      onChange={(e) => setForm({ ...form, intake: e.target.value })}
                      placeholder="e.g. Fall / Spring"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Application Deadline
                    </label>
                    <input
                      type="text"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="e.g. June 30 or Rolling"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Academic Eligibility Criteria
                    </label>
                    <input
                      type="text"
                      value={form.eligibility}
                      onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                      placeholder="e.g. High school diploma with minimum GPA 3.0 / A-Levels BCC"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      English Language Proficiency Requirement
                    </label>
                    <input
                      type="text"
                      value={form.englishRequirement}
                      onChange={(e) => setForm({ ...form, englishRequirement: e.target.value })}
                      placeholder="e.g. IELTS 6.5 (no sub-score < 6.0) / TOEFL iBT 88"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Required Application Documents (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={form.requiredDocuments}
                      onChange={(e) => setForm({ ...form, requiredDocuments: e.target.value })}
                      placeholder="e.g. Academic Transcript, Passport Copy, SOP, 2 Reference Letters"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={form.scholarshipAvailability}
                        onChange={(e) => setForm({ ...form, scholarshipAvailability: e.target.checked })}
                        className="rounded border-white/20 bg-[#050B1F] text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span>Institutional Scholarship & Funding Availability for this Program</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingProgram ? "Save Changes" : "Create Program"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-[#0B1228] border border-white/10 p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="p-2 rounded-xl bg-red-500/10">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Delete Academic Program</h3>
              </div>
              <p className="text-xs text-slate-300">
                Are you sure you want to remove this program from your university catalog? This will prevent new agency applications for this program.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProgram(deleteConfirmId)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
