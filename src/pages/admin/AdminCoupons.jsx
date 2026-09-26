import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, Edit, Trash2, Search, CheckCircle2, XCircle,
  RefreshCw, X, Calendar, Percent, ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null or { isNew, data }
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    discountPercent: 10,
    applicablePackages: ["all"],
    usageLimit: 100,
    perUserLimit: 1,
    isActive: true,
    expiryDays: 60,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/admin/coupons?search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setCoupons(data.data?.coupons || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreateModal = () => {
    setForm({
      code: "",
      discountPercent: 15,
      applicablePackages: ["all"],
      usageLimit: 100,
      perUserLimit: 1,
      isActive: true,
      expiryDays: 60,
    });
    setModal({ isNew: true });
  };

  const openEditModal = (c) => {
    setForm({
      code: c.code,
      discountPercent: c.discountPercent,
      applicablePackages: c.applicablePackages || ["all"],
      usageLimit: c.usageLimit || 100,
      perUserLimit: c.perUserLimit || 1,
      isActive: c.isActive !== false,
      expiryDays: 60,
    });
    setModal({ isNew: false, id: c._id });
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    setFormLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = modal.isNew ? "/api/admin/coupons" : `/api/admin/coupons/${modal.id}`;
      const method = modal.isNew ? "POST" : "PUT";

      const expiryDate = new Date(Date.now() + form.expiryDays * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase().trim(),
          expiryDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(modal.isNew ? "Coupon created" : "Coupon updated");
        setModal(null);
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to save coupon");
      }
    } catch (err) {
      toast.error("Error saving coupon");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      } else {
        toast.error(data.message || "Failed to delete coupon");
      }
    } catch (err) {
      toast.error("Error deleting coupon");
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/coupons/${coupon._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Coupon ${coupon.code} is now ${!coupon.isActive ? "Active" : "Inactive"}`);
        fetchCoupons();
      }
    } catch (err) {
      toast.error("Status update error");
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-amber-400" /> Promotional Coupons & Discounts
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Manage promotional codes, package restrictions, usage ceilings, and expiration timelines
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Create Coupon
          </button>
          <button
            onClick={fetchCoupons}
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
            placeholder="Search coupon by code..."
            className="w-full bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <span className="text-slate-400 text-xs">{coupons.length} Active Records</span>
      </div>

      {/* Coupons Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-white/8 text-[11px] text-slate-400 uppercase tracking-widest bg-white/2">
                <th className="px-4 py-3 font-bold">Coupon Code</th>
                <th className="px-4 py-3 font-bold">Discount</th>
                <th className="px-4 py-3 font-bold">Usage / Limit</th>
                <th className="px-4 py-3 font-bold">Eligible Packages</th>
                <th className="px-4 py-3 font-bold">Expiry Date</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Loading coupon records...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    No promotional coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr
                    key={c._id || c.code}
                    className="border-b border-white/4 hover:bg-white/2 transition-colors text-xs text-slate-300"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-mono font-bold text-white text-xs tracking-wider">{c.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono">
                        {c.discountPercent}% OFF
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-300">
                      {c.usedCount || 0} / {c.usageLimit || "∞"} uses
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-white/4 text-slate-300 capitalize text-[10px]">
                        {Array.isArray(c.applicablePackages) ? c.applicablePackages.join(", ") : "All Packages"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                      {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer ${
                          c.isActive
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 bg-white/4 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
                          title="Edit Coupon"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c._id, c.code)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                          title="Delete Coupon"
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

      {/* ── Create / Edit Coupon Modal ── */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl"
              style={{ background: "#0B1228" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  {modal.isNew ? "Create Promotional Coupon" : "Edit Coupon"}
                </h3>
                <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    Coupon Code (Uppercase) <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SUMMER25"
                    className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Discount (%) <span className="text-red-400">*</span></label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.discountPercent}
                      onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Usage Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Validity (Days from now)</label>
                    <input
                      type="number"
                      min="1"
                      value={form.expiryDays}
                      onChange={(e) => setForm({ ...form, expiryDays: Number(e.target.value) })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1 font-semibold">Per-User Limit</label>
                    <input
                      type="number"
                      min="1"
                      value={form.perUserLimit}
                      onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) })}
                      className="w-full bg-white/4 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
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
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all disabled:opacity-50"
                  >
                    {formLoading ? "Saving..." : modal.isNew ? "Create Coupon" : "Update Coupon"}
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
