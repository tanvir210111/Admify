import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Plus, Edit, Trash2, Search, Calendar, Landmark, Coins,
  Users, RefreshCw, X, Globe, ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null or { isNew, data }
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    university: "",
    country: "Global",
    amount: "$10,000 / year",
    deadline: "2026-12-31",
    eligibility: "GPA 3.5+ or Equivalent",
    studyLevel: "Master / Postgraduate",
    description: "",
    status: "published",
  });

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/admin/scholarships?search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setScholarships(data.data?.scholarships || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const openCreateModal = () => {
    setForm({
      name: "",
      university: "Global University Partner",
      country: "Global",
      amount: "Full Tuition + Stipend",
      deadline: "2026-12-31",
      eligibility: "Minimum 3.5 CGPA & IELTS 6.5",
      studyLevel: "Master",
      description: "",
      status: "published",
    });
    setModal({ isNew: true });
  };

  const openEditModal = (s) => {
    setForm({
      name: s.name || "",
      university: s.university || "",
      country: s.country || "Global",
      amount: s.amount || "",
      deadline: s.deadline || "",
      eligibility: s.eligibility || "",
      studyLevel: s.studyLevel || "Master",
      description: s.description || "",
      status: s.status || "published",
    });
    setModal({ isNew: false, id: s._id || s.id });
  };

  const handleSaveScholarship = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Scholarship name is required");
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = modal.isNew ? "/api/admin/scholarships" : `/api/admin/scholarships/${modal.id}`;
      const method = modal.isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(modal.isNew ? "Scholarship created" : "Scholarship updated");
        setModal(null);
        fetchScholarships();
      } else {
        toast.error(data.message || "Failed to save scholarship");
      }
    } catch (err) {
      toast.error("Error saving scholarship");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteScholarship = async (id, name) => {
    if (!window.confirm(`Delete scholarship "${name}"?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/scholarships/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Scholarship removed");
        fetchScholarships();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting scholarship");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-violet-400" /> Scholarship Catalog & Grants
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Manage global merit grants, institutional financial aid, and government fellowships
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Scholarship
          </button>
          <button
            onClick={fetchScholarships}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="p-4 rounded-2xl border flex items-center justify-between"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scholarship by title or university..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <span className="text-slate-400 text-xs">{scholarships.length} Registered Opportunities</span>
      </div>

      {/* Scholarships Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Scholarship Program</th>
                <th className="px-4 py-3 font-bold">Institution / Provider</th>
                <th className="px-4 py-3 font-bold">Funding Amount</th>
                <th className="px-4 py-3 font-bold">Eligible Region</th>
                <th className="px-4 py-3 font-bold">Deadline</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Loading scholarships catalog...
                  </td>
                </tr>
              ) : scholarships.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                    No scholarships found in catalog.
                  </td>
                </tr>
              ) : (
                scholarships.map((s) => (
                  <tr
                    key={s._id || s.id || s.name}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-violet-400 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-white text-xs">{s.name}</p>
                          <p className="text-[10px] text-slate-400">{s.studyLevel || "Undergraduate / Graduate"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-200 font-medium">{s.university || s.provider || "Global"}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-emerald-400 font-bold">{s.amount}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{s.country || "Global"}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">{s.deadline || "Ongoing"}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="Edit Scholarship"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteScholarship(s._id || s.id, s.name)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                          title="Delete Scholarship"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ── Create / Edit Scholarship Modal ── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" />
                  {modal.isNew ? "Add Scholarship Opportunity" : "Edit Scholarship"}
                </h3>
                <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScholarship} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Scholarship Title <span className="text-red-400">*</span></label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Dean's International Merit Award"
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Host University / Provider</label>
                    <input
                      value={form.university}
                      onChange={(e) => setForm({ ...form, university: e.target.value })}
                      placeholder="e.g. University of Manchester"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Eligible Country</label>
                    <input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="e.g. UK / Global"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Grant Value</label>
                    <input
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="e.g. £10,000 or Full Tuition"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Application Deadline</label>
                    <input
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      placeholder="e.g. 2026-11-30"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Eligibility Criteria</label>
                  <input
                    value={form.eligibility}
                    onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                    placeholder="e.g. Minimum CGPA 3.5, IELTS 7.0"
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/8">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : modal.isNew ? "Create Scholarship" : "Update Scholarship"}
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
