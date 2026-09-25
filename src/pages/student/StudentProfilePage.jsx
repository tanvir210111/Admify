import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { studentService, calculateProfileStrength } from "../../services/studentService";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

function StudentProfilePage() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.user_metadata?.full_name || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || user?.phone || "");
  const [targetCountry, setTargetCountry] = useState(user?.targetCountry || "United States");
  const [targetCourse, setTargetCourse] = useState(user?.targetCourse || "Computer Science");
  const [targetIntake, setTargetIntake] = useState("Fall 2026");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);

  const profileStrength = calculateProfileStrength(user);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.name || "");
      setEmail(user.email || "");
      setPhone(user.user_metadata?.phone || user.phone || "");
      if (user.targetCountry) setTargetCountry(user.targetCountry);
      if (user.targetCourse) setTargetCourse(user.targetCourse);
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await studentService.updateProfile({
        name,
        phone,
        targetCountry,
        targetCourse,
        bio,
      });
      if (updateUser) {
        updateUser(updated);
      }
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">My Profile</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Personal Information</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Keep your personal information up-to-date to ensure smooth university applications.
          </p>
        </div>

        <Link
          to="/student/academic-profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 text-cyan-400 text-xs font-bold transition-all shadow-sm"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Academic Profile & Scores →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Strength & Verification Card (1 Col) */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Profile Strength</h2>
              <span className="text-sm font-black text-cyan-400">{profileStrength.percentage}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-[2px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                style={{ width: `${profileStrength.percentage}%` }}
              />
            </div>

            <div className="space-y-2.5 pt-2">
              {profileStrength.checks.map((check) => (
                <div key={check.key} className="flex items-center justify-between text-xs">
                  <span className={check.completed ? "text-slate-300" : "text-slate-400"}>
                    {check.label}
                  </span>
                  {check.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      Required
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Admify Student Trust Badge</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your profile is private and only shared with universities or agencies you explicitly apply to or authorize.
            </p>
          </div>
        </div>

        {/* Profile Edit Form (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full bg-[#07142D]/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target Destination Country
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Netherlands">Netherlands</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target Study Field / Program
                </label>
                <input
                  type="text"
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  placeholder="e.g. M.S. Computer Science"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Target Intake Season
                </label>
                <select
                  value={targetIntake}
                  onChange={(e) => setTargetIntake(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="Fall 2026">Fall 2026 (Aug / Sep)</option>
                  <option value="Spring 2027">Spring 2027 (Jan / Feb)</option>
                  <option value="Fall 2027">Fall 2027 (Aug / Sep)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Personal Academic Statement / Bio
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly describe your academic background, research interests, and global education ambitions..."
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-70"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
