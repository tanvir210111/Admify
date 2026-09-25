import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import { convertTextToDual } from "../../utils/currency";
import {
  Sparkles,
  Building2,
  Filter,
  CheckCircle2,
  GitCompare,
  Bookmark,
  Send,
  Users2,
  Globe,
  DollarSign,
  GraduationCap,
  ExternalLink,
  BookOpen,
  Award,
  ArrowRight,
  Sliders,
  Check,
  RotateCcw,
  Zap,
  HelpCircle,
  FileCheck2,
  AlertTriangle,
  Lock,
  Crown,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const POPULAR_DESTINATIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
  "Switzerland",
  "Sweden",
  "Japan",
  "Ireland",
  "Italy",
];

const MAJORS_SUGGESTIONS = [
  "Computer Science & AI",
  "Data Science & Analytics",
  "Software Engineering",
  "Business Administration & MBA",
  "Finance & FinTech",
  "Mechanical Engineering",
  "Electrical & Electronics",
  "Biomedical & Healthcare",
  "Cybersecurity",
  "Civil & Environmental Eng.",
  "Economics & Data Analytics",
];

function AIRecommendationsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Premium Membership Gate: Free account cannot access AI recommendations
  const isPremium = studentService.isPremiumAccount(user);

  // Load existing assessment from storage if exists
  const savedAssessment = (() => {
    try {
      const data = localStorage.getItem("admify_ai_rec_assessment");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  })();

  // Current view mode: 'assessment' (profile intake) vs 'results' (ai recommendations)
  const [viewMode, setViewMode] = useState(savedAssessment ? "results" : "assessment");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState(0);

  // Assessment Form State
  const [targetDegree, setTargetDegree] = useState(savedAssessment?.targetDegree || "Master's / Postgraduate");
  const [fieldOfStudy, setFieldOfStudy] = useState(savedAssessment?.fieldOfStudy || "Computer Science & AI");
  const [currentLevel, setCurrentLevel] = useState(savedAssessment?.currentLevel || "Undergraduate / Bachelor's");
  const [institution, setInstitution] = useState(savedAssessment?.institution || "University of Dhaka");
  const [gpa, setGpa] = useState(savedAssessment?.gpa || user?.gpa || "3.80");
  const [gpaScale, setGpaScale] = useState(savedAssessment?.gpaScale || "4.0");
  const [englishTest, setEnglishTest] = useState(savedAssessment?.englishTest || "IELTS Academic");
  const [ielts, setIelts] = useState(savedAssessment?.ielts || user?.ielts || "7.5");
  const [standardizedTest, setStandardizedTest] = useState(savedAssessment?.standardizedTest || "GRE");
  const [standardizedScore, setStandardizedScore] = useState(savedAssessment?.standardizedScore || "320");
  const [workExperience, setWorkExperience] = useState(savedAssessment?.workExperience || "1-2 Years");
  const [targetDestinations, setTargetDestinations] = useState(
    savedAssessment?.targetDestinations || ["United States", "United Kingdom", "Germany", "Canada"]
  );
  const [budget, setBudget] = useState(savedAssessment?.budget || "moderate");
  const [priority, setPriority] = useState(savedAssessment?.priority || "roi");
  const [intake, setIntake] = useState(savedAssessment?.intake || "Fall 2026");

  // Results State
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("all");
  const [selectedMatchCategory, setSelectedMatchCategory] = useState("all");
  const [savedUnis, setSavedUnis] = useState(() => studentService.getSavedUniversities());

  // Trigger recommendation generation
  const runEvaluation = async (profileData) => {
    try {
      setLoading(true);
      const data = await studentService.getAiRecommendations(profileData);
      setRecommendations(data);
    } catch (err) {
      console.warn("Failed to generate recommendations:", err);
      toast.error("Error generating recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Initial load if already assessed and premium
  useEffect(() => {
    if (savedAssessment && isPremium) {
      runEvaluation(savedAssessment);
    }
  }, [isPremium]);

  // Handle destination toggle
  const toggleDestination = (country) => {
    if (targetDestinations.includes(country)) {
      if (targetDestinations.length > 1) {
        setTargetDestinations(targetDestinations.filter((c) => c !== country));
      } else {
        toast("Select at least 1 destination country", { icon: "ℹ️" });
      }
    } else {
      setTargetDestinations([...targetDestinations, country]);
    }
  };

  // Submit assessment form & run AI matching simulation
  const handleAnalyzeProfile = (e) => {
    e?.preventDefault();

    if (!gpa || parseFloat(gpa) <= 0) {
      toast.error("Please provide a valid GPA");
      return;
    }

    const assessmentPayload = {
      targetDegree,
      fieldOfStudy,
      currentLevel,
      institution,
      gpa,
      gpaScale,
      englishTest,
      ielts,
      standardizedTest,
      standardizedScore,
      workExperience,
      targetDestinations,
      budget,
      priority,
      intake,
    };

    setIsAnalyzing(true);
    setAnalyzingStep(0);

    // Save to storage
    localStorage.setItem("admify_ai_rec_assessment", JSON.stringify(assessmentPayload));

    // Multi-phase AI synthesis animation
    const steps = [
      "Synthesizing your academic GPA & standardized test metrics...",
      `Auditing admission requirements across ${targetDestinations.length} destination countries...`,
      `Matching curriculum & faculty research for ${fieldOfStudy}...`,
      "Calculating financial viability, ROI, and merit scholarship feasibility...",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setAnalyzingStep(currentStep);
      } else {
        clearInterval(interval);
        runEvaluation(assessmentPayload);
        setIsAnalyzing(false);
        setViewMode("results");
        toast.success("AI Recommendation Profile synthesized successfully!");
      }
    }, 450);
  };

  const handleToggleSave = (slug) => {
    const updated = studentService.toggleSaveUniversity(slug);
    setSavedUnis(updated);
    toast.success(updated.includes(slug) ? "Saved to university shortlist" : "Removed from shortlist");
  };

  const handleAddCompare = (slug) => {
    try {
      studentService.toggleComparison(slug);
      toast.success("Updated comparison list");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Filter recommendations
  const filtered = recommendations.filter((r) => {
    if (selectedCountryFilter !== "all" && r.country.toLowerCase() !== selectedCountryFilter.toLowerCase()) {
      return false;
    }
    if (selectedMatchCategory === "target" && r.match < 85) return false;
    if (selectedMatchCategory === "safe" && (r.match < 65 || r.match >= 85)) return false;
    if (selectedMatchCategory === "reach" && r.match >= 65) return false;
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Top Header & Mode Toggle Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">AI Discovery Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Adaptive Profile Assessment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-cyan-400" />
            AI Study Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tailored university placement matching synthesized directly from your verified academic credentials and goals.
          </p>
        </div>

        {/* Controls / View Switcher */}
        {!isPremium ? (
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Pro / Elite Feature</span>
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Switcher Tabs */}
            <div className="flex items-center p-1 rounded-2xl bg-[#0B1228] border border-slate-800">
              <button
                onClick={() => setViewMode("assessment")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "assessment"
                    ? "bg-cyan-500 text-[#050B1F] shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Profile Assessment</span>
              </button>
              <button
                onClick={() => {
                  if (recommendations.length === 0) {
                    handleAnalyzeProfile();
                  } else {
                    setViewMode("results");
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "results"
                    ? "bg-cyan-500 text-[#050B1F] shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>2. AI Matches ({recommendations.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FREE ACCOUNT LOCKED GATE */}
      {!isPremium ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0B1228] border border-slate-800 text-center space-y-5 max-w-xl mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mx-auto flex items-center justify-center text-amber-400">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Pro & Elite Feature
            </span>
            <h2 className="text-xl font-bold text-white">
              AI Recommendations Locked
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Personalized university matching based on your academic credentials requires a Pro Path or Elite Premium subscription. Upgrade your account to run matching.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate("/student/wallet")}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:opacity-95 text-[#050B1F] font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              View Subscription Plans
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* AI Computing Animation Modal Overlay */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-[#050B1F]/90 backdrop-blur-md flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="max-w-md w-full p-8 rounded-3xl bg-[#07142D] border border-cyan-500/40 shadow-2xl text-center space-y-6"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 animate-ping" />
                    <div className="relative w-full h-full rounded-full bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-cyan-300 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      AI Algorithmic Engine Active
                    </span>
                    <h3 className="text-lg font-bold text-white">Synthesizing Your Global Matches</h3>
                    <p className="text-xs text-cyan-400/90 font-medium min-h-[40px] px-2 flex items-center justify-center">
                      {analyzingStep === 0 && "Parsing your academic GPA & test metrics..."}
                      {analyzingStep === 1 && `Auditing admission requirements across ${targetDestinations.join(", ")}...`}
                      {analyzingStep === 2 && `Matching curriculum & faculty for ${fieldOfStudy}...`}
                      {analyzingStep === 3 && "Finalizing ROI, tuition tiers, and scholarship probability..."}
                    </p>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                      initial={{ width: "10%" }}
                      animate={{ width: `${(analyzingStep + 1) * 25}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIEW MODE 1: ASSESSMENT INTAKE FORM */}
          {viewMode === "assessment" && (
            <form onSubmit={handleAnalyzeProfile} className="space-y-8">
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#07142D] via-[#0B1228] to-[#07142D] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Step 1 of 2: Academic Profile Intake
              </span>
              <h2 className="text-lg font-extrabold text-white">Provide Your Credentials to Unlock AI Matches</h2>
              <p className="text-xs text-slate-400">
                Our recommendation engine uses your exact GPA, intended major, test scores, and budget to calculate authentic admission compatibility.
              </p>
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#050B1F] text-xs font-black uppercase tracking-wider shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#050B1F]" />
              <span>Generate AI Recommendations →</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: Target Academic Goals */}
            <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Target Academic Goals</h3>
                  <p className="text-[11px] text-slate-400">What level of study and field do you wish to pursue?</p>
                </div>
              </div>

              {/* Target Degree */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Target Degree Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Bachelor's / Undergraduate", "Master's / Postgraduate", "PhD / Doctorate", "Post-Graduate Diploma"].map(
                    (deg) => (
                      <button
                        type="button"
                        key={deg}
                        onClick={() => setTargetDegree(deg)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left truncate ${
                          targetDegree === deg
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                            : "bg-[#07142D] text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {deg}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Field of Study */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Intended Field of Study / Major</label>
                <input
                  type="text"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder="e.g. Computer Science, MBA, Mechanical Engineering"
                  className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {MAJORS_SUGGESTIONS.slice(0, 5).map((major) => (
                    <button
                      type="button"
                      key={major}
                      onClick={() => setFieldOfStudy(major)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#07142D] hover:bg-cyan-500/15 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
                    >
                      {major}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Intake */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Target Intake Term</label>
                <select
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Fall 2026">Fall 2026 (Aug/Sept 2026) - Major Intake</option>
                  <option value="Spring 2027">Spring 2027 (Jan/Feb 2027)</option>
                  <option value="Fall 2027">Fall 2027</option>
                </select>
              </div>
            </div>

            {/* Section 2: Current Academic Credentials */}
            <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Current Academic Credentials</h3>
                  <p className="text-[11px] text-slate-400">Your latest educational qualification and GPA</p>
                </div>
              </div>

              {/* Current Education */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Latest Completed Education</label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Undergraduate / Bachelor's">Undergraduate / Bachelor's (Completed or Final Year)</option>
                  <option value="Higher Secondary / HSC / A-Levels">Higher Secondary / HSC / A-Levels / 12th Grade</option>
                  <option value="Master's / Post-Graduate">Master's / Post-Graduate Degree</option>
                </select>
              </div>

              {/* Institution */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Previous / Current Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University of Dhaka, BUET, North South, National University"
                  className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* GPA & Scale */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Cumulative GPA / CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={gpa}
                    onChange={(e) => setGpa(e.target.value)}
                    placeholder="3.80"
                    className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Grading Scale</label>
                  <select
                    value={gpaScale}
                    onChange={(e) => setGpaScale(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="4.0">4.0 Scale (Standard)</option>
                    <option value="5.0">5.0 Scale</option>
                    <option value="10.0">10.0 Scale</option>
                    <option value="100">Percentage (0 - 100%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Test Scores & Professional Experience */}
            <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">English Tests & Experience</h3>
                  <p className="text-[11px] text-slate-400">Language qualification & work history</p>
                </div>
              </div>

              {/* English Test & Score */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">English Test</label>
                  <select
                    value={englishTest}
                    onChange={(e) => setEnglishTest(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="IELTS Academic">IELTS Academic</option>
                    <option value="TOEFL iBT">TOEFL iBT</option>
                    <option value="Duolingo (DET)">Duolingo (DET)</option>
                    <option value="PTE Academic">PTE Academic</option>
                    <option value="Waived / Planning to take">Not taken yet / Waived</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Test Score</label>
                  <input
                    type="text"
                    value={ielts}
                    onChange={(e) => setIelts(e.target.value)}
                    placeholder="e.g. 7.5 (or 100 TOEFL)"
                    className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-bold placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Standardized Test */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Aptitude Test (Optional)</label>
                  <select
                    value={standardizedTest}
                    onChange={(e) => setStandardizedTest(e.target.value)}
                    className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="GRE">GRE General</option>
                    <option value="GMAT">GMAT Focus</option>
                    <option value="SAT">SAT</option>
                    <option value="None">None / Waived</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Score (If taken)</label>
                  <input
                    type="text"
                    value={standardizedScore}
                    onChange={(e) => setStandardizedScore(e.target.value)}
                    placeholder="e.g. 320"
                    className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Work Experience */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Work / Internship Experience</label>
                <select
                  value={workExperience}
                  onChange={(e) => setWorkExperience(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="0 Years / Fresh Graduate">0 Years / Fresh Graduate</option>
                  <option value="1-2 Years">1 - 2 Years</option>
                  <option value="3-5 Years">3 - 5 Years</option>
                  <option value="5+ Years">5+ Years of Professional Experience</option>
                </select>
              </div>
            </div>

            {/* Section 4: Budget & Destination Preferences */}
            <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Target Destinations & Budget</h3>
                  <p className="text-[11px] text-slate-400">Choose country preferences and financial tiers</p>
                </div>
              </div>

              {/* Target Destinations Multiple Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Preferred Countries</label>
                  <span className="text-[10px] text-cyan-400">{targetDestinations.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                  {POPULAR_DESTINATIONS.map((country) => {
                    const isSelected = targetDestinations.includes(country);
                    return (
                      <button
                        type="button"
                        key={country}
                        onClick={() => toggleDestination(country)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm"
                            : "bg-[#07142D] text-slate-400 border-slate-800 hover:text-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                        <span>{country}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tuition Budget Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Maximum Annual Tuition Budget</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="low">Low Cost / Zero Tuition Focus (Up to ৳6,00,000 / $5,000 / yr)</option>
                  <option value="moderate">Moderate (৳12,00,000 - ৳24,00,000 / $10k - $20k / yr)</option>
                  <option value="standard">Standard Global (৳24,00,000 - ৳42,00,000 / $20k - $35k / yr)</option>
                  <option value="ivy">High / Ivy League (৳48,00,000+ / $40k+ / yr)</option>
                  <option value="scholarship">100% Full Scholarship Dependent</option>
                </select>
              </div>

              {/* Key Placement Priority */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Top Priority for AI Matching</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "roi", label: "Post-Study Work Visa / ROI" },
                    { id: "rank", label: "Top QS Ranking (Prestige)" },
                    { id: "scholarship", label: "Maximum Scholarship" },
                    { id: "fast", label: "Fastest Acceptance" },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        priority === p.id
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                          : "bg-[#07142D] text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Submit Button */}
          <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Ready for Algorithmic Synthesis?</p>
                <p className="text-[11px] text-slate-400">
                  Matches are dynamically ranked based on your GPA ({gpa}), English score ({ielts}), and destinations.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:opacity-95 text-[#050B1F] font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#050B1F]" />
              <span>Analyze Profile & Generate Recommendations</span>
            </button>
          </div>
        </form>
      )}

      {/* VIEW MODE 2: PERSONALIZED AI RECOMMENDATIONS RESULTS */}
      {viewMode === "results" && (
        <div className="space-y-6">
          {/* Active Profile Snapshot Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#07142D] via-[#0B1228] to-[#07142D] border border-cyan-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Synthesized for:</span>
                  <span className="text-xs font-extrabold text-cyan-300">
                    {targetDegree} in {fieldOfStudy}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-300">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    GPA: <strong>{gpa}</strong>/{gpaScale}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {englishTest}: <strong>{ielts}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Destinations: <strong>{targetDestinations.slice(0, 3).join(", ")}{targetDestinations.length > 3 ? "..." : ""}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Intake: <strong>{intake}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
              <button
                onClick={() => setViewMode("assessment")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Profile & Re-calculate</span>
              </button>
            </div>
          </div>

          {/* Filtering and Categorization Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Match Tier Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Tiers:
              </span>
              {[
                { id: "all", label: "All Matches" },
                { id: "target", label: "Target / Ideal Fit (85%+)" },
                { id: "safe", label: "Safe / Pathway (65% - 84%)" },
                { id: "reach", label: "High Reach / Gaps (<65%)" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedMatchCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedMatchCategory === cat.id
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                      : "bg-[#0B1228] text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Country:</span>
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="bg-[#0B1228] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="all">All Countries</option>
                {Array.from(new Set(recommendations.map((r) => r.country))).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recommendations Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-spin" />
              <p className="text-xs text-slate-400">Recalculating algorithmic matches...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
              <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No matches found for current filter</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try selecting "All Matches" or adjust your target destination countries.
              </p>
              <button
                onClick={() => {
                  setSelectedCountryFilter("all");
                  setSelectedMatchCategory("all");
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((rec) => {
                const isSaved = savedUnis.includes(rec.slug);
                return (
                  <div
                    key={rec._id || rec.slug}
                    className="rounded-3xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
                  >
                    {/* Cover Image & Match Badge */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={
                          rec.coverImage ||
                          "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800"
                        }
                        alt={rec.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1228] via-[#0B1228]/40 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-black shadow-lg ${
                            rec.match >= 85
                              ? "bg-emerald-500 text-[#050B1F] shadow-emerald-500/30"
                              : rec.match >= 65
                              ? "bg-cyan-500 text-[#050B1F] shadow-cyan-500/30"
                              : rec.match >= 45
                              ? "bg-amber-500 text-slate-950 shadow-amber-500/30"
                              : "bg-rose-500 text-white shadow-rose-500/30"
                          }`}
                        >
                          {rec.match}% Match
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                            rec.match >= 85
                              ? "bg-[#07142D]/90 text-emerald-300 border-emerald-500/30"
                              : rec.match >= 65
                              ? "bg-[#07142D]/90 text-cyan-300 border-cyan-500/30"
                              : rec.match >= 45
                              ? "bg-[#07142D]/90 text-amber-300 border-amber-500/30"
                              : "bg-[#07142D]/90 text-rose-300 border-rose-500/30"
                          }`}
                        >
                          {rec.status}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleSave(rec.slug)}
                          className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                            isSaved
                              ? "bg-amber-500 text-white border-amber-400"
                              : "bg-slate-900/70 text-slate-300 border-slate-700 hover:text-white"
                          }`}
                          title={isSaved ? "Saved" : "Save to shortlist"}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                          {rec.country} • {rec.location}
                        </span>
                        <h3 className="text-base font-extrabold text-white leading-tight truncate">{rec.name}</h3>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Target Program:</span>
                          <span className="text-white font-bold truncate max-w-[190px]">{rec.prog}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Annual Tuition:</span>
                          <span className="text-cyan-300 font-semibold">{convertTextToDual(rec.tuition)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">World Standing:</span>
                          <span className="text-slate-300 font-medium">{rec.rank || "Top 100 QS"}</span>
                        </div>

                        {/* Key Match Drivers */}
                        <div className="p-3 rounded-2xl bg-[#07142D] border border-slate-800/80 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Why AI Matched You
                          </span>
                          {rec.reasons?.slice(0, 2).map((reason, i) => {
                            const isGap =
                              reason.startsWith("Significant GPA Gap") ||
                              reason.startsWith("Language Prerequisite Gap") ||
                              reason.startsWith("Reach Target");
                            return (
                              <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                                {isGap ? (
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                )}
                                <span className="leading-snug">{reason}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Primary Card Actions */}
                      <div className="space-y-2 pt-3 border-t border-slate-800">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => navigate(`/university/${rec.slug}`)}
                            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center"
                          >
                            View University
                          </button>
                          <button
                            onClick={() => handleAddCompare(rec.slug)}
                            className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all text-center"
                          >
                            Compare
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => navigate(`/student/direct-applications?uni=${encodeURIComponent(rec.name)}`)}
                            className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Send className="w-3 h-3" />
                            <span>Apply Directly</span>
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/student/agency-assistance?targetUni=${encodeURIComponent(rec.name)}`)
                            }
                            className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                          >
                            <Users2 className="w-3 h-3" />
                            <span>Agency Help</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
    )}
  </div>
  );
}

export default AIRecommendationsPage;
