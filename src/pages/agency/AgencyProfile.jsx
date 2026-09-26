import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../../lib/api";
import toast from "react-hot-toast";
import {
  Building2,
  ShieldCheck,
  UserCheck,
  FileText,
  Globe,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function AgencyProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State for permitted editable fields
  const [form, setForm] = useState({
    agencyName: "",
    legalName: "",
    agencyType: "Study Abroad Consultancy",
    establishedYear: "",
    website: "",
    address: "",
    city: "",
    country: "Bangladesh",
    about: "",
    countriesServed: "",
    studyLevels: "",
    servicesOffered: "",
    counselorCount: 5,
    studentsServedApprox: 500,
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/agency/profile");
      if (res.success && res.data) {
        setProfileData(res.data);
        const p = res.data.profile || {};
        const u = res.data.user || {};
        setForm({
          agencyName: p.agencyName || u.name || "",
          legalName: p.legalName || p.agencyName || u.name || "",
          agencyType: p.agencyType || "Study Abroad Consultancy",
          establishedYear: p.establishedYear || "2018",
          website: p.website || "",
          address: p.address || "",
          city: p.city || "Dhaka",
          country: p.country || "Bangladesh",
          about: p.about || "",
          countriesServed: Array.isArray(p.countriesServed) ? p.countriesServed.join(", ") : (p.countriesServed || "USA, UK, Canada, Australia"),
          studyLevels: Array.isArray(p.studyLevels) ? p.studyLevels.join(", ") : (p.studyLevels || "Undergraduate, Postgraduate"),
          servicesOffered: Array.isArray(p.servicesOffered) ? p.servicesOffered.join(", ") : (p.servicesOffered || "Admissions, Visa Guidance, SOP Review"),
          counselorCount: p.counselorCount || 5,
          studentsServedApprox: p.studentsServedApprox || 500,
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load agency profile");
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
        ...form,
        countriesServed: form.countriesServed.split(",").map((s) => s.trim()).filter(Boolean),
        studyLevels: form.studyLevels.split(",").map((s) => s.trim()).filter(Boolean),
        servicesOffered: form.servicesOffered.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await api.put("/api/agency/profile", payload);
      if (res.success) {
        toast.success("Agency profile updated successfully!");
        fetchProfile();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const isVerified = profileData?.user?.agencyVerificationStatus === "VERIFIED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Agency Corporate Profile</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Official business profile, authorized representative records, and public international directory listings.
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Verification Status Banner */}
      <div
        className="p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isVerified ? "Verified Global Consultancy" : "Verification In Review"}
            </h3>
            <p className="text-slate-400 text-xs">
              {isVerified
                ? "Your organization is verified. Legal compliance documents are locked against tampering."
                : "Your documentation is under active review by the Admify Compliance Team."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED AGENCY</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
              <span>PENDING REVIEW</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section A: Basic Corporate Info */}
        <div
          className="p-6 rounded-2xl border space-y-4"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Building2 className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-white">A. Organization Basic Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Agency Name *</label>
              <input
                type="text"
                required
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Legal Name</label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Agency Type</label>
              <select
                value={form.agencyType}
                onChange={(e) => setForm({ ...form, agencyType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="Study Abroad Consultancy">Study Abroad Consultancy</option>
                <option value="Education Consultancy">Education Consultancy</option>
                <option value="Immigration Consultancy">Immigration Consultancy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Year Established</label>
              <input
                type="text"
                value={form.establishedYear}
                onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Website</label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://agency.com"
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Head Office City & Country</label>
              <input
                type="text"
                value={`${form.city}, ${form.country}`}
                onChange={(e) => {
                  const parts = e.target.value.split(",");
                  setForm({ ...form, city: parts[0]?.trim() || "", country: parts[1]?.trim() || "" });
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Section B: Authorized Person */}
        <div
          className="p-6 rounded-2xl border space-y-4"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">B. Authorized Representative</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Authorized Person Name</span>
              <p className="text-white font-medium bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                {profileData?.user?.name || "Managing Director"}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Corporate Email</span>
              <p className="text-white font-medium bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                {profileData?.user?.email || "director@agency.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Section C: Operations & Specializations */}
        <div
          className="p-6 rounded-2xl border space-y-4"
          style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.07)" }}
        >
          <div className="flex items-center gap-2 pb-3 border-b border-white/5">
            <Globe className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">C. Operations & Specializations</h2>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">About the Agency</label>
              <textarea
                rows={3}
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                placeholder="Overview of consultancy experience, achievements, and counseling philosophy..."
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Countries Handled (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.countriesServed}
                  onChange={(e) => setForm({ ...form, countriesServed: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Study Levels Offered (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.studyLevels}
                  onChange={(e) => setForm({ ...form, studyLevels: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
