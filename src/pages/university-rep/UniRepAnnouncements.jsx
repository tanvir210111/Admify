import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  Building2,
  Users2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Save,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    program: "All Programs",
    isPublicToConnected: true,
    expiryDate: "",
    status: "ACTIVE",
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/announcements");
      if (res?.success && Array.isArray(res?.data?.announcements)) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openAddModal = () => {
    setEditingAnn(null);
    setForm({
      title: "",
      description: "",
      program: "All Programs",
      isPublicToConnected: true,
      expiryDate: "",
      status: "ACTIVE",
    });
    setModalOpen(true);
  };

  const openEditModal = (ann) => {
    setEditingAnn(ann);
    setForm({
      title: ann.title || "",
      description: ann.description || "",
      program: ann.program || "All Programs",
      isPublicToConnected: ann.isPublicToConnected !== false,
      expiryDate: ann.expiryDate ? ann.expiryDate.slice(0, 10) : "",
      status: ann.status || "ACTIVE",
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Announcement Title and Description are required.");
      return;
    }

    setSaving(true);
    try {
      if (editingAnn) {
        const id = editingAnn._id || editingAnn.id;
        const res = await api.put(`/api/university-rep/announcements/${id}`, form);
        if (res?.success) {
          toast.success("Announcement updated successfully.");
          fetchAnnouncements();
          setModalOpen(false);
        }
      } else {
        const res = await api.post("/api/university-rep/announcements", form);
        if (res?.success) {
          toast.success("Official announcement broadcasted to connected agencies.");
          fetchAnnouncements();
          setModalOpen(false);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to publish announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await api.delete(`/api/university-rep/announcements/${id}`);
      if (res?.success) {
        toast.success("Announcement deleted.");
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error(err.message || "Failed to remove announcement.");
    }
  };

  const filtered = announcements.filter((ann) => {
    const title = ann.title || "";
    const desc = ann.description || "";
    const prog = ann.program || "";
    return (
      !search ||
      title.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase()) ||
      prog.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
            Agency Broadcast System
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Institutional Announcements
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast admissions updates, new intakes, and scholarship news to all connected partner agencies.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search announcements by title, department, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B1228] border border-white/5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      {/* ── Announcements Feed ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading university announcements...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl p-12 bg-[#0B1228] border border-white/5 text-center space-y-3">
          <Megaphone className="w-12 h-12 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-white">No active announcements</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Notify your connected partner agencies about intake openings, scholarship deadlines, and admission requirement changes.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition"
          >
            Publish First Announcement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ann) => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5 bg-[#0B1228] border border-white/5 hover:border-purple-500/30 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/20">
                    {ann.program || "General Announcement"}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(ann)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                      title="Edit Announcement"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(ann._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{ann.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                    {ann.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Published: {ann.publishDate ? new Date(ann.publishDate).toLocaleDateString() : "Today"}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                  <Users2 className="w-3 h-3" />
                  Visible to Connected Agencies
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
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
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingAnn ? "Edit Announcement" : "Create Institutional Announcement"}
                    </h3>
                    <p className="text-[11px] text-slate-400">Broadcast to all authorized agency partners</p>
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
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Fall 2027 Admissions Open with 25% Merit Scholarship"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department / Target Academic Scope
                  </label>
                  <input
                    type="text"
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    placeholder="e.g. School of Business & Computing or All Programs"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Announcement Details & Directives *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe specific deadlines, documentation criteria, or priority admission policies..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                  />
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
                    <span>{editingAnn ? "Save Changes" : "Broadcast Announcement"}</span>
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
