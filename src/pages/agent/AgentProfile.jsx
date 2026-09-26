import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Globe2,
  GraduationCap,
  Layers,
  FileText,
  CheckCircle2,
  Save,
  Upload,
  Key,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STUDY_LEVEL_OPTIONS = [
  "Foundation",
  "Diploma",
  "Undergraduate",
  "Master's",
  "PhD",
];

const SERVICE_OPTIONS = [
  "University Selection",
  "University Application",
  "Application Processing",
  "Document Review",
  "SOP/LOR Guidance",
  "Scholarship Guidance",
  "Visa Assistance",
  "Visa Interview Preparation",
  "Accommodation Assistance",
  "Pre-departure Support",
  "Other",
];

const COUNTRY_OPTIONS = [
  "United Kingdom",
  "United States",
  "Canada",
  "Australia",
  "Germany",
  "Ireland",
  "New Zealand",
  "Netherlands",
  "Sweden",
  "Malaysia",
  "Singapore",
  "United Arab Emirates",
];

export default function AgentProfile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    // Personal Information
    fullName: user?.name || user?.user_metadata?.full_name || "Agent Representative",
    email: user?.email || "",
    phone: user?.phone || user?.user_metadata?.phone || "",
    profilePhoto: "",
    dateOfBirth: "",
    gender: "Prefer not to say",
    country: "Bangladesh",
    city: "Dhaka",
    address: "",

    // Professional Information
    designation: "Senior Education Counselor",
    yearsOfExperience: "5+ Years",
    previousExperience: "",
    languages: "English, Bengali",
    expertise: "STEM Admissions, Russell Group Universities, Visa Compliance",

    // Study Levels
    studyLevels: ["Undergraduate", "Master's"],

    // Countries
    targetCountries: ["United Kingdom", "Canada", "Australia", "United States"],

    // Services
    services: [
      "University Selection",
      "University Application",
      "Application Processing",
      "Document Review",
      "SOP/LOR Guidance",
      "Visa Assistance",
    ],

    // Optional Documents
    nidPassport: null,
    professionalCertificate: null,
    trainingCertificate: null,
    counselorCertificate: null,
    otherDocuments: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/agent/profile");
        if (res?.data?.success && res.data.data.user) {
          const u = res.data.data.user;
          setProfile((prev) => ({
            ...prev,
            fullName: u.name || prev.fullName,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
            designation: u.designation || prev.designation,
            dateOfBirth: u.dateOfBirth || prev.dateOfBirth,
            gender: u.gender || prev.gender,
            country: u.country || prev.country,
            city: u.city || prev.city,
            address: u.address || prev.address,
            studyLevels: u.academicScope?.studyLevels || prev.studyLevels,
            targetCountries: u.academicScope?.targetCountries || prev.targetCountries,
            services: u.professional?.services || prev.services,
            yearsOfExperience: u.professional?.yearsOfExperience || prev.yearsOfExperience,
            languages: u.professional?.languages || prev.languages,
            expertise: u.professional?.expertise || prev.expertise,
          }));
        }
      } catch (err) {
        console.error("Failed to load agent profile from backend:", err);
      }
    };
    fetchProfile();
  }, []);

  const toggleStudyLevel = (level) => {
    setProfile((prev) => {
      const exists = prev.studyLevels.includes(level);
      return {
        ...prev,
        studyLevels: exists
          ? prev.studyLevels.filter((l) => l !== level)
          : [...prev.studyLevels, level],
      };
    });
  };

  const toggleService = (srv) => {
    setProfile((prev) => {
      const exists = prev.services.includes(srv);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== srv)
          : [...prev.services, srv],
      };
    });
  };

  const toggleCountry = (country) => {
    setProfile((prev) => {
      const exists = prev.targetCountries.includes(country);
      return {
        ...prev,
        targetCountries: exists
          ? prev.targetCountries.filter((c) => c !== country)
          : [...prev.targetCountries, country],
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        designation: profile.designation,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        country: profile.country,
        city: profile.city,
        address: profile.address,
        academicScope: {
          studyLevels: profile.studyLevels,
          targetCountries: profile.targetCountries,
        },
        professional: {
          yearsOfExperience: profile.yearsOfExperience,
          languages: profile.languages,
          expertise: profile.expertise,
          services: profile.services,
        },
      };

      const res = await api.put("/api/agent/profile", payload);
      if (res?.data?.success) {
        toast.success("Agent profile updated and persisted successfully!");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update counselor profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1300px] mx-auto text-slate-100 pb-12"
    >
      {/* Title & Agency Association Banner */}
      <motion.div variants={fade} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-violet-400" /> Agent Profile & Credentials
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Global Study Abroad Representative accredited under sponsoring Agency.
          </p>
        </div>

        {/* Agency Accreditation Pill */}
        <div className="flex items-center gap-3 bg-violet-950/40 border border-violet-500/30 px-4 py-2 rounded-2xl">
          <Building2 className="w-5 h-5 text-violet-400 shrink-0" />
          <div className="text-xs">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Accredited Under Agency</div>
            <div className="text-white font-mono font-bold">
              ID: {user?.agencyId || "AGY-ACCREDITED"}
            </div>
          </div>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Active
          </span>
        </div>
      </motion.div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Personal Information */}
        <motion.div
          variants={fade}
          className="p-6 rounded-2xl border"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between border-b border-white/6 pb-3 mb-5">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" /> 1. Personal Information
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              App ID: {user?.agentApplicationId || "AGT-APP-VERIFIED"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Email *</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-white/2 border border-white/6 rounded-xl py-2.5 px-3 text-slate-400 font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white font-mono focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full bg-slate-900 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Office or residential street address"
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        </motion.div>

        {/* 2. Professional Information */}
        <motion.div
          variants={fade}
          className="p-6 rounded-2xl border"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/6 pb-3 mb-5">
            <Briefcase className="w-4 h-4 text-violet-400" /> 2. Professional Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Designation / Role Title</label>
              <input
                type="text"
                value={profile.designation}
                onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Years of Experience</label>
              <input
                type="text"
                value={profile.yearsOfExperience}
                onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Languages Spoken</label>
              <input
                type="text"
                value={profile.languages}
                onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                placeholder="e.g. English, French, Spanish"
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Previous Experience & Track Record</label>
              <input
                type="text"
                value={profile.previousExperience}
                onChange={(e) => setProfile({ ...profile, previousExperience: e.target.value })}
                placeholder="e.g. Former Senior Counselor at Global Pathways; 300+ successful admissions"
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admissions Expertise</label>
              <input
                type="text"
                value={profile.expertise}
                onChange={(e) => setProfile({ ...profile, expertise: e.target.value })}
                className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>
          </div>
        </motion.div>

        {/* 3. Study Levels & Target Countries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Levels */}
          <motion.div
            variants={fade}
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/6 pb-3 mb-4">
              <GraduationCap className="w-4 h-4 text-violet-400" /> 3. Study Levels Managed
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {STUDY_LEVEL_OPTIONS.map((lvl) => {
                const active = profile.studyLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => toggleStudyLevel(lvl)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      active
                        ? "bg-violet-600/30 text-violet-300 border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                        : "bg-white/4 text-slate-400 border-white/8 hover:text-white"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${active ? "bg-violet-400" : "bg-slate-600"}`} />
                    {lvl}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Target Countries */}
          <motion.div
            variants={fade}
            className="p-6 rounded-2xl border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/6 pb-3 mb-4">
              <Globe2 className="w-4 h-4 text-violet-400" /> 4. Destination Countries
            </h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {COUNTRY_OPTIONS.map((country) => {
                const active = profile.targetCountries.includes(country);
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleCountry(country)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                      active
                        ? "bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                        : "bg-white/4 text-slate-400 border-white/8 hover:text-white"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-blue-400" : "bg-slate-600"}`} />
                    {country}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* 5. Services Offered */}
        <motion.div
          variants={fade}
          className="p-6 rounded-2xl border"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/6 pb-3 mb-4">
            <Layers className="w-4 h-4 text-violet-400" /> 5. Services Offered
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
            {SERVICE_OPTIONS.map((srv) => {
              const active = profile.services.includes(srv);
              return (
                <button
                  key={srv}
                  type="button"
                  onClick={() => toggleService(srv)}
                  className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between ${
                    active
                      ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
                      : "bg-white/3 text-slate-400 border-white/8 hover:text-white"
                  }`}
                >
                  <span>{srv}</span>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 transition-opacity ${
                      active ? "opacity-100 text-emerald-400" : "opacity-20"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 6. Optional Verification Documents (No Trade License Required) */}
        <motion.div
          variants={fade}
          className="p-6 rounded-2xl border"
          style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center justify-between border-b border-white/6 pb-3 mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" /> 6. Optional Representative Documents
            </h2>
            <span className="text-[11px] text-emerald-400 font-semibold">Trade License Not Required for Agent</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {[
              { label: "NID / Passport Copy", key: "nidPassport" },
              { label: "Professional Certificate", key: "professionalCertificate" },
              { label: "Training Certificate", key: "trainingCertificate" },
              { label: "Counselor Certificate", key: "counselorCertificate" },
            ].map((doc) => (
              <div key={doc.key} className="p-3.5 rounded-xl bg-white/2 border border-white/6 space-y-2">
                <span className="font-semibold text-slate-300 block">{doc.label}</span>
                <label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/4 hover:bg-white/8 border border-white/10 text-slate-300 cursor-pointer transition-colors text-[11px]">
                  <Upload className="w-3.5 h-3.5 text-violet-400" />
                  <span>Choose file...</span>
                  <input type="file" className="hidden" />
                </label>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Agent Profile"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
