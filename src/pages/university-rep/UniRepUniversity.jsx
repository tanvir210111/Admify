import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  MapPin,
  ShieldCheck,
  Save,
  RefreshCw,
  ExternalLink,
  BookOpen,
  DollarSign,
  GraduationCap,
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Home,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

export default function UniRepUniversity() {
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("about"); // 'about' | 'campus' | 'admissions' | 'careers'

  // Editable Form State
  const [formData, setFormData] = useState({
    about: "",
    history: "",
    city: "",
    location: "",
    website: "",
    facultyStudentRatio: "8:1",
    housing: "",
    facilities: "",
    clubs: "",
    careerServices: "",
    topEmployers: "",
    admissionGpa: "3.0+",
    admissionEnglish: "IELTS 6.5+ / PTE 58+",
    tuitionRange: "BDT 800,000 - 1,800,000 / year",
    livingCost: "BDT 350,000 - 600,000 / year",
  });

  const fetchUniversity = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/university-rep/university");
      if (res?.success && res?.data?.university) {
        const u = res.data.university;
        setUniversity(u);
        setFormData({
          about: u.about || "",
          history: u.history || "",
          city: u.city || "",
          location: u.location || "",
          website: u.website || "",
          facultyStudentRatio: u.facultyStudentRatio || "8:1",
          housing: u.housing || "",
          facilities: Array.isArray(u.facilities) ? u.facilities.join(", ") : u.facilities || "",
          clubs: u.clubs || "",
          careerServices: u.careerServices || "",
          topEmployers: Array.isArray(u.topEmployers) ? u.topEmployers.join(", ") : u.topEmployers || "",
          admissionGpa: u.admissionReqs?.gpa || "3.0+",
          admissionEnglish: u.admissionReqs?.englishProficiency || "IELTS 6.5+ / PTE 58+",
          tuitionRange: u.costs?.tuition || "BDT 800,000 - 1,800,000 / year",
          livingCost: u.costs?.housingAndFood || "BDT 350,000 - 600,000 / year",
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to load university profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversity();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        about: formData.about,
        history: formData.history,
        city: formData.city,
        location: formData.location,
        website: formData.website,
        facultyStudentRatio: formData.facultyStudentRatio,
        housing: formData.housing,
        facilities: formData.facilities.split(",").map((f) => f.trim()).filter(Boolean),
        clubs: formData.clubs,
        careerServices: formData.careerServices,
        topEmployers: formData.topEmployers.split(",").map((e) => e.trim()).filter(Boolean),
        admissionReqs: {
          gpa: formData.admissionGpa,
          englishProficiency: formData.admissionEnglish,
        },
        costs: {
          tuition: formData.tuitionRange,
          housingAndFood: formData.livingCost,
        },
      };

      const res = await api.put("/api/university-rep/university", payload);
      if (res?.success) {
        toast.success("Institutional profile updated successfully!");
        if (res.data?.university) {
          setUniversity(res.data.university);
        }
      } else {
        throw new Error(res?.message || "Failed to update profile.");
      }
    } catch (err) {
      toast.error(err.message || "Unable to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading verified institutional profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Verified Institutional Header Card ── */}
      <div className="rounded-2xl p-6 sm:p-8 bg-[#0B1228] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-extrabold text-2xl shrink-0 shadow-lg">
              {university?.logo ? (
                <img src={university.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <Building2 className="w-10 h-10" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {university?.name || "University Partner"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {university?.legalName || university?.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {university?.location || university?.country || "Global"}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-slate-300">
                  {university?.type || "Public"} Institution
                </span>
                {university?.website && (
                  <>
                    <span>•</span>
                    <a
                      href={university.website.startsWith("http") ? university.website : `https://${university.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:underline flex items-center gap-1 text-xs"
                    >
                      Official Website <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between gap-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Representative Portal</span>
            <span className="text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              Rank: {university?.rank || "Top Tier"}
            </span>
          </div>
        </div>

        {/* Administration Lock Alert Notice */}
        <div className="mt-5 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-purple-400" />
          <span>
            Institutional Identity (Name, Legal Status, Accreditation, Country) is locked and verified by Admify Compliance. Permitted campus facts, profile details, and costs can be updated below.
          </span>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 overflow-x-auto">
        {[
          { id: "about", label: "Overview & History", icon: BookOpen },
          { id: "campus", label: "Campus & Facilities", icon: Home },
          { id: "admissions", label: "Admission & Costs", icon: DollarSign },
          { id: "careers", label: "Careers & Outcomes", icon: Briefcase },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                isActive
                  ? "bg-purple-600/20 border border-purple-500/40 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Profile Edit Form ── */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: About & Overview */}
        {activeTab === "about" && (
          <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              Institutional Overview & History
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  About the University *
                </label>
                <textarea
                  rows={5}
                  value={formData.about}
                  onChange={(e) => handleChange("about", e.target.value)}
                  placeholder="Provide an overview of the university's academic vision, heritage, and international student community..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Heritage & Established History
                </label>
                <textarea
                  rows={3}
                  value={formData.history}
                  onChange={(e) => handleChange("history", e.target.value)}
                  placeholder="Historic milestones, charter date, and campus traditions..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.university.edu"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Campus Location Details
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g. London, United Kingdom"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Campus & Facilities */}
        {activeTab === "campus" && (
          <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-400" />
              Campus Information, Facilities & Housing
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Campus Facilities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => handleChange("facilities", e.target.value)}
                  placeholder="e.g. Modern Library, High-Performance Computing Lab, Olympic Sports Complex, Innovation Center"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Accommodation & Housing Services
                </label>
                <textarea
                  rows={3}
                  value={formData.housing}
                  onChange={(e) => handleChange("housing", e.target.value)}
                  placeholder="Details regarding on-campus dormitories, guaranteed first-year housing, and international residential support..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Faculty-to-Student Ratio
                  </label>
                  <input
                    type="text"
                    value={formData.facultyStudentRatio}
                    onChange={(e) => handleChange("facultyStudentRatio", e.target.value)}
                    placeholder="e.g. 10:1"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Student Organizations & Clubs
                  </label>
                  <input
                    type="text"
                    value={formData.clubs}
                    onChange={(e) => handleChange("clubs", e.target.value)}
                    placeholder="e.g. 120+ Student Societies, Robotics Club, International Cultural Union"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Admissions & Costs */}
        {activeTab === "admissions" && (
          <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              General Admission Requirements & Cost Estimates
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Minimum GPA Expectation
                  </label>
                  <input
                    type="text"
                    value={formData.admissionGpa}
                    onChange={(e) => handleChange("admissionGpa", e.target.value)}
                    placeholder="e.g. 3.0 / 4.0 or 75% equivalent"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    English Proficiency Benchmark
                  </label>
                  <input
                    type="text"
                    value={formData.admissionEnglish}
                    onChange={(e) => handleChange("admissionEnglish", e.target.value)}
                    placeholder="e.g. IELTS 6.5+ / PTE 58+ / TOEFL 88+"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Average Annual Tuition (BDT primary / USD secondary)
                  </label>
                  <input
                    type="text"
                    value={formData.tuitionRange}
                    onChange={(e) => handleChange("tuitionRange", e.target.value)}
                    placeholder="e.g. BDT 1,200,000 / year ($10,000 USD)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Estimated Annual Living Cost
                  </label>
                  <input
                    type="text"
                    value={formData.livingCost}
                    onChange={(e) => handleChange("livingCost", e.target.value)}
                    placeholder="e.g. BDT 450,000 / year"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Careers & Outcomes */}
        {activeTab === "careers" && (
          <div className="rounded-xl p-6 bg-[#0B1228] border border-white/5 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" />
              Graduate Outcomes & Career Services
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Career Services & Placement Support
                </label>
                <textarea
                  rows={3}
                  value={formData.careerServices}
                  onChange={(e) => handleChange("careerServices", e.target.value)}
                  placeholder="On-campus recruitment, post-study work visa guidance, internship hubs, and alumni mentorship programs..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Top Graduate Employers (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.topEmployers}
                  onChange={(e) => handleChange("topEmployers", e.target.value)}
                  placeholder="e.g. Google, Microsoft, PwC, Deloitte, Siemens, Amazon, NHS"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#050B1F] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Changes Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Institutional Profile
          </button>
        </div>
      </form>
    </div>
  );
}
