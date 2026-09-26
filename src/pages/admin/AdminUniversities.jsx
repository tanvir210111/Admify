import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Eye, Edit, Trash2, Search, Globe, GraduationCap,
  FileCheck, UserCheck, RefreshCw, X, MapPin, DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminUniRepApplicationsTab from "../../components/admin/AdminUniRepApplicationsTab";
import api from "../../lib/api";

const STATUS_MAP = {
  active: { label: "Active", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  inactive: { label: "Inactive", cls: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export default function AdminUniversities() {
  const [activeTab, setActiveTab] = useState("institutions"); // 'institutions' | 'unirep'
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  // Create / Edit modal state
  const [editModal, setEditModal] = useState(null); // null or { isNew: true/false, data }
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    legalName: "",
    country: "",
    city: "",
    type: "Public",
    rank: 100,
    tuition: "",
    applicationFee: "",
    livingCost: "",
    website: "",
    description: "",
    status: "active",
  });

  const fetchUniversities = async () => {
    setLoading(true);
    try {
      const url = countryFilter !== "all"
        ? `/api/admin/universities?country=${encodeURIComponent(countryFilter)}&search=${encodeURIComponent(search)}`
        : `/api/admin/universities?search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      if (res.data.success) {
        setUniversities(res.data.data?.universities || []);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load universities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "institutions") {
      fetchUniversities();
    }
  }, [activeTab, countryFilter]);

  const openCreateModal = () => {
    setFormData({
      name: "",
      legalName: "",
      country: "United States",
      city: "",
      type: "Public",
      rank: 50,
      tuition: "$20,000 - $40,000 / yr",
      applicationFee: "$75",
      livingCost: "$1,200 / mo",
      website: "https://",
      description: "",
      status: "active",
    });
    setEditModal({ isNew: true });
  };

  const openEditModal = (uni) => {
    setFormData({
      name: uni.name || "",
      legalName: uni.legalName || uni.name || "",
      country: uni.country || "",
      city: uni.city || "",
      type: uni.type || "Public",
      rank: uni.rank || 100,
      tuition: uni.tuition || "",
      applicationFee: uni.applicationFee || "",
      livingCost: uni.livingCost || "",
      website: uni.website || "",
      description: uni.description || "",
      status: uni.status || "active",
    });
    setEditModal({ isNew: false, id: uni._id });
  };

  const handleSaveUniversity = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = editModal.isNew ? "/api/admin/universities" : `/api/admin/universities/${editModal.id}`;
      const res = editModal.isNew ? await api.post(url, formData) : await api.put(url, formData);

      if (res.data.success) {
        toast.success(editModal.isNew ? "University added to catalog" : "University updated successfully");
        setEditModal(null);
        fetchUniversities();
      } else {
        toast.error(res.data.message || "Failed to save university");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving university");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUniversity = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the university catalog?`)) {
      return;
    }

    try {
      const res = await api.delete(`/api/admin/universities/${id}`);
      if (res.data.success) {
        toast.success("University removed");
        fetchUniversities();
      } else {
        toast.error(res.data.message || "Failed to delete university");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error deleting university");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" /> University Institution Governance
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Partner university catalog CRUD, academic programs, tuition fee metadata, and representative verifications
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "institutions" && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add University
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-white/8 pb-2">
        <button
          onClick={() => setActiveTab("institutions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "institutions"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          University Catalog
        </button>
        <button
          onClick={() => setActiveTab("unirep")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "unirep"
              ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          Uni Rep Applications & Verifications
        </button>
      </div>

      {activeTab === "unirep" ? (
        <AdminUniRepApplicationsTab />
      ) : (
        <div className="space-y-4">
          {/* Toolbar */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 items-center justify-between"
            style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search university by name, country, city..."
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <button
              onClick={fetchUniversities}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Universities Table */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                    <th className="px-4 py-3 font-bold">University & Rank</th>
                    <th className="px-4 py-3 font-bold">Country & Location</th>
                    <th className="px-4 py-3 font-bold">Type</th>
                    <th className="px-4 py-3 font-bold">Average Tuition</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                        Loading universities catalog from backend...
                      </td>
                    </tr>
                  ) : universities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
                        No universities found in database.
                      </td>
                    </tr>
                  ) : (
                    universities.map((uni) => (
                      <tr
                        key={uni._id}
                        className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs flex-shrink-0">
                              🎓
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{uni.name}</p>
                              <span className="font-mono text-[10px] text-emerald-400">
                                Global Rank #{uni.rank || "100+"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-slate-200 capitalize font-medium">{uni.country}</p>
                          <p className="text-slate-500 text-[10px]">{uni.location || uni.city || "—"}</p>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">{uni.type || "Public"}</td>
                        <td className="px-4 py-3.5 font-mono text-amber-300 font-semibold">{uni.tuition || "Varies"}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${STATUS_MAP[uni.status]?.cls || STATUS_MAP.active.cls}`}>
                            {uni.status || "Active"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(uni)}
                              className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                              title="Edit University Profile"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUniversity(uni._id, uni.name)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                              title="Delete University"
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
        </div>
      )}

      {/* ── Create / Edit University Modal ── */}
      <AnimatePresence>
        {editModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  {editModal.isNew ? "Add Partner University" : "Edit University Profile"}
                </h3>
                <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUniversity} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">University Name <span className="text-red-400">*</span></label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Oxford University"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Country <span className="text-red-400">*</span></label>
                    <input
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United Kingdom"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">City</label>
                    <input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Oxford"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Institution Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Public">Public Research</option>
                      <option value="Private">Private</option>
                      <option value="Collegiate">Collegiate</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">World Rank</label>
                    <input
                      type="number"
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Average Tuition</label>
                    <input
                      value={formData.tuition}
                      onChange={(e) => setFormData({ ...formData, tuition: e.target.value })}
                      placeholder="e.g. £25,000 / year"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Application Fee</label>
                    <input
                      value={formData.applicationFee}
                      onChange={(e) => setFormData({ ...formData, applicationFee: e.target.value })}
                      placeholder="e.g. £75"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Living Cost</label>
                    <input
                      value={formData.livingCost}
                      onChange={(e) => setFormData({ ...formData, livingCost: e.target.value })}
                      placeholder="e.g. £1,200 / month"
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Official Website</label>
                  <input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">Description & Overview</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive background, international student amenities..."
                    className="w-full bg-white/4 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500"
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
                    disabled={formLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : editModal.isNew ? "Create University" : "Update University"}
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
