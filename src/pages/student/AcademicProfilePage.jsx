import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService, calculateProfileStrength } from "../../services/studentService";
import {
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  FileCheck2,
  Save,
  CheckCircle2,
  Sparkles,
  Calculator,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

function AcademicProfilePage() {
  const { user, updateUser } = useAuth();

  const [currentLevel, setCurrentLevel] = useState("Undergraduate / Bachelor's");
  const [institution, setInstitution] = useState(user?.institution || "");
  const [gpa, setGpa] = useState(user?.gpa || "");
  const [gpaScale, setGpaScale] = useState("4.0");
  const [englishTest, setEnglishTest] = useState("IELTS Academic");
  const [ielts, setIelts] = useState(user?.ielts || "");
  const [standardizedTest, setStandardizedTest] = useState("GRE");
  const [standardizedScore, setStandardizedScore] = useState(user?.standardizedScore || "");
  const [workExperienceYears, setWorkExperienceYears] = useState(user?.workExperienceYears || "0");
  const [fieldOfStudy, setFieldOfStudy] = useState(user?.targetCourse || user?.fieldOfStudy || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.gpa) setGpa(user.gpa);
      if (user.ielts) setIelts(user.ielts);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await studentService.updateProfile({
        gpa,
        ielts,
      });
      if (updateUser) updateUser(updated);
      toast.success("Academic credentials updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to save academic profile");
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
            <span className="text-xs text-slate-400">Academic Background</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Academic Profile & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            These scores directly feed the AI Recommendation and Admission Probability engines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/student/probability"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-all"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>Test Admission Probability →</span>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1: Previous Education */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Degree & Institutional Background</h2>
                <p className="text-xs text-slate-400">Highest completed or ongoing educational level</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Highest Education Level
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="High School / Secondary Diploma">High School / Secondary Diploma</option>
                  <option value="Undergraduate / Bachelor's">Undergraduate / Bachelor's Degree</option>
                  <option value="Postgraduate / Master's">Postgraduate / Master's Degree</option>
                  <option value="Doctorate / PhD">Doctorate / PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Field of Study / Major
                </label>
                <input
                  type="text"
                  required
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science, Mechanical Engineering, Finance"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Graduating Institution
                </label>
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of California, Berkeley"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Cumulative GPA / Score
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="e.g. 3.8"
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Grading Scale
                  </label>
                  <select
                    value={gpaScale}
                    onChange={(e) => setGpaScale(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="4.0">Scale: 4.0</option>
                    <option value="5.0">Scale: 5.0</option>
                    <option value="10.0">Scale: 10.0</option>
                    <option value="100%">Percentage (100%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Standardized & Language Tests */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">English & Standardized Exams</h2>
                <p className="text-xs text-slate-400">Validated test credentials and test scores</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    English Exam Type
                  </label>
                  <select
                    value={englishTest}
                    onChange={(e) => setEnglishTest(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="IELTS Academic">IELTS Academic</option>
                    <option value="TOEFL iBT">TOEFL iBT</option>
                    <option value="PTE Academic">PTE Academic</option>
                    <option value="Duolingo English">Duolingo English</option>
                    <option value="Exempt">Native / Exempt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Overall Band / Score
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="120"
                    value={ielts}
                    onChange={(e) => setIelts(e.target.value)}
                    placeholder="e.g. 7.5"
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Standardized Exam
                  </label>
                  <select
                    value={standardizedTest}
                    onChange={(e) => setStandardizedTest(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="GRE">GRE General</option>
                    <option value="GMAT">GMAT Focus</option>
                    <option value="SAT">SAT</option>
                    <option value="ACT">ACT</option>
                    <option value="None">None / Waived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Score / Percentile
                  </label>
                  <input
                    type="text"
                    value={standardizedScore}
                    onChange={(e) => setStandardizedScore(e.target.value)}
                    placeholder="e.g. 324 (Q:168, V:156)"
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Work / Research Experience (Years)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={workExperienceYears}
                  onChange={(e) => setWorkExperienceYears(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Credentials..." : "Update Academic Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default AcademicProfilePage;
