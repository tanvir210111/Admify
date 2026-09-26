import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function UniRepProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable Form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    designation: "",
    department: "",
    employeeId: "",
    city: "",
    country: "",
    yearsExperience: 0,
    previousExperience: "",
    languages: "English",
    areasOfExpertise: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/profile");
      if (res?.success && res?.data) {
        setProfileData(res.data);
        const u = res.data.user || {};
        const app = res.data.application || {};
        const rep = app.representative || {};
        const prof = app.professional || {};

        setForm({
          name: u.name || rep.fullName || "",
          phone: u.phone || rep.phone || "",
          designation: u.designation || rep.designation || "Admissions Officer",
          department: u.department || app.academicScope?.programsDepartments || "",
          employeeId: u.employeeId || rep.employeeId || "",
          city: u.city || app.university?.city || "",
          country: u.country || app.university?.country || "",
          yearsExperience: prof.yearsOfExperience || 0,
          previousExperience: prof.previousExperience || "",
          languages: Array.isArray(prof.languages) ? prof.languages.join(", ") : "English",
          areasOfExpertise: Array.isArray(prof.areasOfExpertise) ? prof.areasOfExpertise.join(", ") : "",
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load representative profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        designation: form.designation,
        department: form.department,
        employeeId: form.employeeId,
        city: form.city,
        country: form.country,
        professional: {
          yearsOfExperience: Number(form.yearsExperience),
          previousExperience: form.previousExperience,
          languages: form.languages.split(",").map((l) => l.trim()).filter(Boolean),
          areasOfExpertise: form.areasOfExpertise.split(",").map((a) => a.trim()).filter(Boolean),
        },
      };

      const res = await api.put("/api/university-rep/profile", payload);
      if (res?.success) {
        toast.success("Profile updated successfully!");
        fetchProfile();
      } else {
        throw new Error(res?.message || "Failed to update profile.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const status = profileData?.user?.uniRepVerificationStatus || user?.uniRepVerificationStatus || "PENDING";
  const university = profileData?.university || profileData?.application?.university;
  const application = profileData?.application;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Status Banner (Section 23) ── */}
      <div className="rounded-2xl p-6 bg-[#0B1228] border border-white/5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            {form.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-white">{form.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Status: {status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {form.designation} • {university?.name || "Official University Partner"}
            </p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-white/5 sm:pl-6 text-xs text-slate-400">
          <span className="block text-[10px] uppercase font-bold text-slate-500">Employee ID</span>
          <span className="font-mono text-white font-semibold">{form.employeeId || "UREP-VERIFIED"}</span>
        </div>
      </div>

      {status === "REJECTED" && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-red-300">
            <XCircle className="w-4 h-4" /> Application Under Correction
          </p>
          <p>{application?.rejectionReason || "Verification submission requires additional documentation."}</p>
        </div>
      )}

      {/* ── Profile Edit Form ── */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal & Institutional Scope */}
        <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            Personal & Representative Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official University Email (Immutable)
              </label>
              <input
                type="email"
                disabled
                value={profileData?.user?.email || user?.email || ""}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F]/50 border border-white/5 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Direct Contact Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Employee / Representative ID
              </label>
              <input
                type="text"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Designation *
              </label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Department / Regional Office
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Professional Qualifications */}
        <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            Professional Credentials & Scope
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Years of Admissions Experience
              </label>
              <input
                type="number"
                min="0"
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Counseling Languages (Comma-separated)
              </label>
              <input
                type="text"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Areas of Expertise & Regional Specialization
              </label>
              <input
                type="text"
                value={form.areasOfExpertise}
                onChange={(e) => setForm({ ...form, areasOfExpertise: e.target.value })}
                placeholder="e.g. South Asia Admissions, STEM Scholarships, Visa Compliance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Previous Institutional Experience & Summary
              </label>
              <textarea
                rows={3}
                value={form.previousExperience}
                onChange={(e) => setForm({ ...form, previousExperience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile Changes
          </button>
        </div>
      </form>
    </div>
  );
}
