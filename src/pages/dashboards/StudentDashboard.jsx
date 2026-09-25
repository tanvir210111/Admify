import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { studentService, calculateProfileStrength } from "../../services/studentService";
import { convertTextToDual } from "../../utils/currency";
import {
  Sparkles,
  Target,
  Building2,
  Award,
  Calculator,
  FileEdit,
  ScrollText,
  Send,
  Users2,
  FileCheck2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  PlusCircle,
  Zap,
  Bot,
  MessageCircle,
  MessageSquare,
  Lock,
  Crown,
} from "lucide-react";
import toast from "react-hot-toast";

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileStrength, setProfileStrength] = useState(() => calculateProfileStrength(user));
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [scholarshipCount, setScholarshipCount] = useState(0);
  const [agencyState, setAgencyState] = useState(null);
  const [freeAppStatus, setFreeAppStatus] = useState({ freeAvailable: true, usedCount: 0 });

  const credits = user?.walletCredits ?? 0;
  const fullName = user?.user_metadata?.full_name || user?.name || "Student";
  const firstName = fullName.split(" ")[0];

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setLoading(true);
        // Calculate profile strength
        const strength = calculateProfileStrength(user);
        if (isMounted) setProfileStrength(strength);

        // Fetch applications
        const apps = await studentService.getMyApplications();
        if (isMounted) setApplications(apps);

        // Fetch recommendations
        const recs = await studentService.getAiRecommendations(user);
        if (isMounted) setRecommendations(recs.slice(0, 3));

        // Fetch saved & scholarships
        const saved = studentService.getSavedUniversities();
        const scholarships = await studentService.getScholarships();
        const freeStatus = studentService.getFreeApplicationStatus();
        const agState = studentService.getAgencyAssistanceState();

        if (isMounted) {
          setSavedCount(saved.length);
          setScholarshipCount(scholarships.length);
          setFreeAppStatus(freeStatus);
          setAgencyState(agState);
        }
      } catch (err) {
        console.warn("[StudentDashboard] Data load warning:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const quickActions = [
    { label: "Chatbot", icon: Bot, path: "/student/chatbot", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25" },
    { label: "Messages", icon: MessageSquare, path: "/student/messages", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" },
    { label: "Find Universities", icon: Building2, path: "/student/universities", color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
    { label: "AI Matches", icon: Sparkles, path: "/student/recommendations", color: "text-purple-400 bg-purple-500/10 border-purple-500/25" },
    { label: "Scholarships", icon: Award, path: "/student/scholarships", color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
    { label: "Admission Probability", icon: Calculator, path: "/student/probability", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25" },
    { label: "Generate SOP", icon: FileEdit, path: "/student/sop-generator", color: "text-pink-400 bg-pink-500/10 border-pink-500/25" },
    { label: "Apply Directly", icon: Send, path: "/student/direct-applications", color: "text-cyan-300 bg-cyan-400/10 border-cyan-400/30" },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-16">
      {/* ── Top Hero Greeting Section ────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#07142D] via-[#0B1228] to-[#07142D] border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">{firstName}</span> 👋
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Track applications, discover universities, and manage your admissions progress.
          </p>
        </div>

        {/* Profile Completion Card */}
        <div className="relative z-10 w-full lg:w-80 p-4 sm:p-5 rounded-2xl bg-[#050B1F]/90 border border-slate-800 backdrop-blur-md shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Strength</span>
            <span className="text-sm font-extrabold text-cyan-400">{profileStrength.percentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-[2px] mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileStrength.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_12px_rgba(34,211,238,0.5)]"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 truncate max-w-[170px]">
              {profileStrength.missingItems.length > 0
                ? `Missing: ${profileStrength.missingItems[0].label}`
                : "Profile complete"}
            </span>
            <Link to="/student/academic-profile" className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline">
              Complete →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Statistics Row ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Applications */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{applications.length}</p>
          <p className="text-xs text-slate-400 font-medium">Applications</p>
        </div>

        {/* Universities Saved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Saved</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{savedCount}</p>
          <p className="text-xs text-slate-400 font-medium">Universities</p>
        </div>

        {/* Scholarships Matched */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Eligible</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{scholarshipCount}</p>
          <p className="text-xs text-slate-400 font-medium">Scholarships</p>
        </div>

        {/* Profile Strength */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Target className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{profileStrength.percentage}%</p>
          <p className="text-xs text-slate-400 font-medium">Profile Strength</p>
        </div>

        {/* Active Agency Application */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Agency</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white truncate">
            {agencyState?.selectedAgency
              ? "Assigned"
              : agencyState?.hasActiveRequest
              ? "Under Review"
              : "Not Active"}
          </p>
          <p className="text-xs text-slate-400 font-medium">Agency Status</p>
        </div>

        {/* Available Credits */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-slate-800 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Credits</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {user?.walletCredits ?? 20} <span className="text-xs text-purple-400 font-bold">CR</span>
          </p>
          <p className="text-[11px] text-purple-300 font-semibold">
            ৳{((user?.walletCredits ?? 20) * 100).toLocaleString("en-BD")}
          </p>
          <p className="text-xs text-slate-400 font-medium">Available Credits</p>
        </div>
      </div>

      {/* ── Core Workflow Split: Option A vs Option B Banner ───────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Option A: Direct University Application */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-cyan-500/30 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">OPTION A</span>
                <h3 className="text-lg font-bold text-white">Apply Directly via Admify</h3>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              freeAppStatus.freeAvailable
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}>
              {freeAppStatus.freeAvailable ? "1 FREE Application Available" : "Free Used (1/1)"}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Submit your university application directly through the Admify engine. 1 Free Application for institutions with $0 application fee. For paid universities, connect with Admin Panel for dedicated fee agent assistance.
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-300 font-medium">
              {freeAppStatus.freeAvailable ? "Zero Admify processing charge" : "Purchase credits for additional applications"}
            </span>
            <Link
              to="/student/direct-applications"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              <span>{freeAppStatus.freeAvailable ? "Claim Free Application" : "Direct Applications"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Option B: Professional Agency Assistance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-purple-500/30 relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">OPTION B</span>
                <h3 className="text-lg font-bold text-white">Agency Counseling & Management</h3>
              </div>
            </div>
            {agencyState?.selectedAgency ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Counselor Assigned
              </span>
            ) : agencyState?.hasActiveRequest ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Order In Progress
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                800 CR / 1,500 CR
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            {agencyState?.selectedAgency
              ? `Your application is supported by ${agencyState.selectedAgency.name}. Dedicated counselor assigned.`
              : agencyState?.hasActiveRequest
              ? "Your agency service order is active. Admify Admin is allocating your certified admissions counselor."
              : "Activate Agency Assistance (800 CR / ৳80,000) or Full Agency Managed Service (1,500 CR / ৳1,50,000) directly using your wallet credits."}
          </p>
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-300 font-medium">
              {agencyState?.selectedAgency
                ? `Assigned: ${agencyState.selectedAgency.name}`
                : agencyState?.hasActiveRequest
                ? "Counselor assignment in progress"
                : "Credit-based • Zero subscriptions"}
            </span>
            <Link
              to="/student/agency-assistance"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20"
            >
              <span>{agencyState?.hasActiveRequest ? "View Agency Workspace" : "Explore Agency Services"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Quick Actions Grid ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          </div>
          <span className="text-xs text-slate-400">Common navigation shortcuts</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="p-3.5 rounded-2xl bg-[#0B1228] border border-slate-800/90 hover:border-cyan-500/40 hover:-translate-y-0.5 transition-all text-center flex flex-col items-center gap-2 group"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} border flex items-center justify-center transition-transform group-hover:scale-110`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white line-clamp-2 leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main Two-Column Content: AI Matches & Probability vs Timeline ─ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): AI Study Recommendations */}
        <div className="xl:col-span-2 space-y-6">
          {/* AI University Recommendations */}
          <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>AI Study Recommendations</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      10 CR per run
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Profile-driven institutional matches</p>
                </div>
              </div>
              <Link
                to="/student/recommendations"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>View all</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-[#07142D] rounded-2xl border border-slate-800 space-y-3">
                <p>No recommendations generated yet. Submit your academic intake to generate university matches.</p>
                <Link
                  to="/student/recommendations"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run AI Matching (10 CR)</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec._id || rec.slug}
                    className="p-4 rounded-2xl bg-[#07142D] border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {rec.match}% Match
                        </span>
                        <span className="text-[11px] text-slate-400">{rec.country}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white leading-tight line-clamp-1">{rec.name}</h3>
                      <p className="text-xs text-cyan-300 font-medium line-clamp-1">{rec.prog}</p>
                      <p className="text-[11px] text-slate-400">{convertTextToDual(rec.tuition)}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => navigate(`/student/universities?search=${encodeURIComponent(rec.name)}`)}
                        className="flex-1 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          studentService.toggleComparison(rec.slug);
                          toast.success("Added to university comparison");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                        title="Add to comparison"
                      >
                        Compare
                      </button>
                      <button
                        onClick={() => {
                          studentService.toggleSaveUniversity(rec.slug);
                          setSavedCount(studentService.getSavedUniversities().length);
                          toast.success("Saved to shortlist");
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                        title="Save university"
                      >
                        ★
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admission Probability Preview Panel */}
          <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Admission Probability Calculator</h2>
                  <p className="text-xs text-slate-400">Indicative admission estimate based on your academic profile</p>
                </div>
              </div>
              <Link
                to="/student/probability"
                className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Calculate</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-5 rounded-2xl bg-[#07142D] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">Estimate Your Competitiveness</p>
                <p className="text-xs text-slate-400 max-w-lg">
                  Select a target university and submit your GPA and language scores to calculate an estimated admission probability.
                </p>
              </div>
              <Link
                to="/student/probability"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold transition-all shrink-0 shadow-sm"
              >
                Open Calculator →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Application Tracker Snapshot & Agency Summary */}
        <div className="space-y-6">
          {/* Application Tracker Snapshot */}
          <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Recent Applications</h3>
              </div>
              <Link to="/student/applications" className="text-xs font-bold text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 rounded-2xl bg-[#07142D] border border-slate-800/80">
                <FileCheck2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-500" />
                <p className="text-xs font-medium text-slate-300 mb-2">No applications yet</p>
                <Link
                  to="/student/direct-applications"
                  className="inline-block px-3 py-1.5 rounded-lg bg-cyan-500 text-[#050B1F] text-xs font-bold"
                >
                  Start your first university application
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 2).map((app) => (
                  <div key={app._id || app.id} className="p-4 rounded-2xl bg-[#07142D] border border-slate-800/90 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">{app.university}</h4>
                        <p className="text-xs text-cyan-300 font-medium">{app.program}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {app.stage}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>Milestone Progress</span>
                        <span>{app.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                          style={{ width: `${app.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Agent / Agency Status Widget */}
          <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Users2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Agency Counseling</h3>
              </div>
              <Link
                to="/student/agency-assistance"
                className="text-xs font-bold text-purple-400 hover:underline"
              >
                {agencyState?.hasActiveRequest ? "View Workspace" : "Explore"}
              </Link>
            </div>

            {agencyState?.selectedAgency ? (
              <div className="p-4 rounded-2xl bg-[#07142D] border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={agencyState.assignedAgent?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                    alt={agencyState.assignedAgent?.name || "Counselor"}
                    className="w-10 h-10 rounded-full object-cover border border-purple-400/40"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{agencyState.assignedAgent?.name || "Assigned Counselor"}</h4>
                    <p className="text-[11px] text-purple-300">{agencyState.assignedAgent?.role || "Senior Admissions Counselor"}</p>
                    <p className="text-[10px] text-slate-400">{agencyState.selectedAgency.name}</p>
                  </div>
                </div>
                <Link
                  to="/student/messages"
                  className="block w-full py-2 text-center rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold transition-all"
                >
                  Open Messages with Agent
                </Link>
              </div>
            ) : agencyState?.hasActiveRequest ? (
              <div className="p-4 rounded-2xl bg-[#07142D] border border-slate-800 text-center space-y-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Matching in Progress
                </span>
                <p className="text-xs text-slate-300 font-medium">Under Admin Review</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Admify Admin is allocating your certified admissions agency counselor.
                </p>
                <Link
                  to="/student/agency-assistance"
                  className="inline-block px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Check Status
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#07142D] border border-slate-800 text-center space-y-2.5">
                <p className="text-xs text-slate-300 font-medium">Dedicated Agency Guidance</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Activate Agency Assistance (800 CR) or Full Agency Managed Service (1,500 CR) using your credit wallet.
                </p>
                <Link
                  to="/student/agency-assistance"
                  className="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-sm shadow-purple-500/20"
                >
                  Explore Agency Services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
