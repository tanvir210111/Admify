import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  DollarSign,
  Compass,
  FileText,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function AdminCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    flag: "",
    region: "Europe",
    currency: "USD",
    averageTuition: "",
    livingCost: "",
    visaRequirements: "",
    englishRequirements: "",
    studyLevels: "Bachelor's, Master's, PhD",
    description: "",
    isActive: true,
  });

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/countries");
      if (res?.data?.countries) {
        setCountries(res.data.countries);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load countries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  const openCreateModal = () => {
    setEditingCountry(null);
    setFormData({
      name: "",
      code: "",
      flag: "🌍",
      region: "Europe",
      currency: "USD",
      averageTuition: "",
      livingCost: "",
      visaRequirements: "",
      englishRequirements: "",
      studyLevels: "Bachelor's, Master's, PhD",
      description: "",
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCountry(c);
    setFormData({
      name: c.name || "",
      code: c.code || "",
      flag: c.flag || "🌍",
      region: c.region || "Europe",
      currency: c.currency || "USD",
      averageTuition: c.averageTuition || "",
      livingCost: c.livingCost || "",
      visaRequirements: c.visaRequirements || "",
      englishRequirements: c.englishRequirements || "",
      studyLevels: Array.isArray(c.studyLevels) ? c.studyLevels.join(", ") : (c.studyLevels || ""),
      description: c.description || "",
      isActive: c.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error("Country name and 2-letter ISO code are required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        studyLevels: typeof formData.studyLevels === "string" 
          ? formData.studyLevels.split(",").map((s) => s.trim()).filter(Boolean)
          : formData.studyLevels,
      };

      if (editingCountry) {
        await api.put(`/api/admin/countries/${editingCountry._id || editingCountry.id}`, payload);
        toast.success(`Country "${payload.name}" updated successfully`);
      } else {
        await api.post("/api/admin/countries", payload);
        toast.success(`Country "${payload.name}" created successfully`);
      }
      setModalOpen(false);
      fetchCountries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save country");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (country) => {
    try {
      await api.delete(`/api/admin/countries/${country._id || country.id}`);
      toast.success(`Country "${country.name}" deleted`);
      setDeleteConfirm(null);
      fetchCountries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete country");
    }
  };

  const filtered = countries.filter((c) => {
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()) ||
      c.region?.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === "all" || c.region === selectedRegion;
    return matchSearch && matchRegion;
  });

  const regions = ["all", ...new Set(countries.map((c) => c.region).filter(Boolean))];

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-6 max-w-[1400px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-violet-400" /> Destination Countries
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage global study abroad destinations, visa guides, living costs, and entry standards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCountries}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/20 transition"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by country, code, region..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-violet-500 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All Regions" : r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Countries Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading destinations...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
          <Globe className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-base font-bold text-slate-300">No destination countries found</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search filters or add a new country.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((country) => (
            <div
              key={country._id || country.id}
              className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-1 bg-slate-800 rounded-xl border border-slate-700">
                      {country.flag || "🌍"}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                        {country.name}
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {country.code}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Compass className="w-3 h-3 text-violet-400" /> {country.region} • {country.currency}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      country.isActive !== false
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {country.isActive !== false ? "Active" : "Disabled"}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed">
                  {country.description || "No description provided."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Avg. Tuition</span>
                    <span className="text-slate-200 font-semibold">{country.averageTuition || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Living Cost</span>
                    <span className="text-slate-200 font-semibold">{country.livingCost || "N/A"}</span>
                  </div>
                  <div className="col-span-2 mt-1">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">English Requirement</span>
                    <span className="text-slate-300 font-medium">{country.englishRequirements || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(country)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3 h-3 text-violet-400" /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(country)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 border border-red-500/20 transition"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-violet-400" />
                  {editingCountry ? `Edit ${editingCountry.name}` : "Add New Destination Country"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Country Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="e.g. United Kingdom"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">ISO Code (2-letter) *</label>
                    <input
                      type="text"
                      maxLength={3}
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 uppercase"
                      placeholder="GB"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Flag Emoji</label>
                    <input
                      type="text"
                      value={formData.flag}
                      onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="🇬🇧"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Region</label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="Europe, North America..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Currency</label>
                    <input
                      type="text"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="GBP, USD, CAD..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Avg. Tuition Fee</label>
                    <input
                      type="text"
                      value={formData.averageTuition}
                      onChange={(e) => setFormData({ ...formData, averageTuition: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="£15,000 - £30,000/year"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Living Cost</label>
                    <input
                      type="text"
                      value={formData.livingCost}
                      onChange={(e) => setFormData({ ...formData, livingCost: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                      placeholder="£1,000 - £1,300/month"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">English Requirements</label>
                  <input
                    type="text"
                    value={formData.englishRequirements}
                    onChange={(e) => setFormData({ ...formData, englishRequirements: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="IELTS 6.0 - 6.5+, TOEFL 80+"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Visa Guidelines & Process</label>
                  <textarea
                    rows={2}
                    value={formData.visaRequirements}
                    onChange={(e) => setFormData({ ...formData, visaRequirements: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="Student Route Visa, CAS requirement, proof of funds..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Study Levels (comma separated)</label>
                  <input
                    type="text"
                    value={formData.studyLevels}
                    onChange={(e) => setFormData({ ...formData, studyLevels: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="Bachelor's, Master's, PhD, Foundation"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Overview Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                    placeholder="Summary of student life, post-study work visa opportunities..."
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="isActive" className="text-xs font-bold text-slate-200 cursor-pointer">
                    Enable Destination Country for Student Discovery
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-2"
                  >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    {editingCountry ? "Save Changes" : "Create Country"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl"
            >
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="font-bold text-base text-white">Delete Destination Country</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Are you sure you want to permanently delete{" "}
                <strong className="text-white">{deleteConfirm.name} ({deleteConfirm.code})</strong>? This action
                will be recorded in the Admin Audit Log.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
