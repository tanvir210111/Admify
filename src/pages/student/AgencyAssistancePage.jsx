import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService, REGISTERED_AGENCIES } from "../../services/studentService";
import { convertTextToDual } from "../../utils/currency";
import {
  Users2,
  Building2,
  Send,
  Star,
  CheckCircle2,
  Clock,
  Crown,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Filter,
  ArrowRight,
  DollarSign,
  AlertCircle,
  X,
  Lock,
  Flag,
  FileCheck2,
  Check,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

function AgencyAssistancePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUniPrefill = searchParams.get("targetUni") || "";

  // Subscription plan: 'free' | 'pro' | 'elite'
  const [currentPlan, setCurrentPlan] = useState(() => studentService.getStudentPlan(user));
  const [agencyState, setAgencyState] = useState(() => studentService.getAgencyAssistanceState(user));
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAgencyDetail, setSelectedAgencyDetail] = useState(null);

  // Assistance request form states
  const [targetCountry, setTargetCountry] = useState("United States");
  const [studyLevel, setStudyLevel] = useState("Master's Degree");
  const [targetDiscipline, setTargetDiscipline] = useState(
    targetUniPrefill ? `Applications to ${targetUniPrefill}` : "Computer Science & Artificial Intelligence"
  );
  const [budgetRange, setBudgetRange] = useState("৳3,600,000 - ৳6,000,000 / yr ($30,000 - $50,000 / yr)");
  const [notes, setNotes] = useState("");

  // Assistance request form states

  // Submit request (Pro or Elite)
  const handleCreateRequest = (e) => {
    e.preventDefault();
    try {
      const updated = studentService.submitAgencyAssistanceRequest(
        {
          targetCountry,
          studyLevel,
          targetDiscipline,
          budgetRange,
          notes,
        },
        user
      );
      setAgencyState(updated);
      setShowRequestModal(false);
      if (currentPlan === "pro") {
        toast.success("Request submitted! Admify Admin Panel is reviewing confidential bids from eligible agencies.");
      } else {
        toast.success("Assistance request created! You can now choose your preferred agency from the directory.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit request");
    }
  };



  // Elite: Student directly chooses an agency from the Directory
  const handleEliteSelectAgency = (agencyId) => {
    const updated = studentService.selectAgencyElite(agencyId, user);
    setAgencyState(updated);
    toast.success("Agency selected successfully! Your dedicated counselor has been assigned.");
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 1. FREE STARTER VIEW (Strictly Locked — Free students NEVER receive an Agency/Agent)
  // ──────────────────────────────────────────────────────────────────────────
  if (currentPlan === "free") {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option B</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Professional Agency Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Users2 className="w-7 h-7 text-purple-400" />
              Agency Assistance
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Personalized agency guidance and certified counselor assignment.
            </p>
          </div>

        </div>

        {/* Locked Screen */}
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#0B1228] via-[#07142D] to-[#0B1228] border border-purple-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-500/20 via-cyan-500/20 to-purple-500/20 border border-purple-500/40 mx-auto flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10 relative z-10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Pro Path & Elite Premium Exclusive
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Agency Assistance is available on Pro Path and Elite Premium
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Free Starter students are <strong>self-service applicants</strong> with access to direct university applications ($0 fee options). To receive personalized agency guidance, certified counselor assignment, and direct university representative support, please upgrade your plan.
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-3 relative z-10 pt-2">
            <button
              onClick={() => navigate("/student/wallet")}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-cyan-500 hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Crown className="w-4 h-4 text-white" />
              <span>Upgrade to Pro Path ($39/mo) →</span>
            </button>
            <p className="text-[11px] text-slate-400">
              Looking for full agency directory browsing? Check out{" "}
              <Link to="/student/wallet" className="text-cyan-400 font-bold hover:underline">
                Elite Premium ($119/mo)
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. PRO PATH & ELITE PREMIUM ACTIVE VIEW
  // ──────────────────────────────────────────────────────────────────────────
  const isElite = currentPlan === "elite";
  const selectedAgency = agencyState?.selectedAgency;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Option B</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              {isElite ? "Elite Premium Agency Directory" : "Pro Path Agency Assistance"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users2 className="w-7 h-7 text-purple-400" />
            {isElite ? "Elite Agency Marketplace & Directory" : "Agency Assistance & Admin Matching"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isElite
              ? "Browse all verified global education agencies and choose your preferred counselor."
              : "Post assistance requests, receive confidential Admin matching, and work 1-on-1 with your assigned counselor."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!agencyState?.hasActiveRequest && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/20"
            >
              <Send className="w-4 h-4" />
              <span>Post New Assistance Request</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Active Assigned Agent Workspace (When an Agency is Assigned) ──── */}
      {selectedAgency ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B1228] via-[#07142D] to-[#0B1228] border border-purple-500/40 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={agencyState.assignedAgent?.avatar}
                  alt={agencyState.assignedAgent?.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#0B1228] rounded-full" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">{agencyState.assignedAgent?.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {isElite ? "Selected Agency Counselor" : "Admin-Assigned Counselor"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-medium mt-0.5">{agencyState.assignedAgent?.role}</p>
                <p className="text-xs text-slate-400">
                  Agency: <span className="text-slate-200 font-bold">{selectedAgency.name}</span> ({selectedAgency.country})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                to="/student/messages"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Direct Chat</span>
              </Link>
              <Link
                to="/student/reports"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
                title="Report issue to Admin"
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Report / Flag</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs relative z-10">
            <div className="p-4 rounded-2xl bg-[#050B1F] border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Services Covered</span>
              <span className="text-white font-bold">{selectedAgency.services?.join(", ") || "Full University Admissions Guidance"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#050B1F] border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Countries Handled</span>
              <span className="text-cyan-300 font-bold">{selectedAgency.countriesServed?.join(", ") || "Global"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#050B1F] border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Liaison Status</span>
              <span className="text-emerald-400 font-bold">Dedicated 1-on-1 Guidance Active</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Active Request Summary ─────────────────────────────── */}
      {agencyState?.requestDetails && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Active Assistance Request: #{agencyState.requestDetails.id}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Broadcasted: {agencyState.requestDetails.submittedAt}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {selectedAgency ? "Agency Assigned" : "In Progress"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Region</span>
              <span className="text-white font-medium">{agencyState.requestDetails.targetCountry}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Study Level</span>
              <span className="text-white font-medium">{agencyState.requestDetails.studyLevel}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Program Discipline</span>
              <span className="text-white font-medium">{agencyState.requestDetails.targetDiscipline}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Budget Expectation</span>
              <span className="text-white font-medium">{convertTextToDual(agencyState.requestDetails.budgetRange)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PRO PATH WORKFLOW: CONFIDENTIAL BIDDING & ADMIN ASSIGNMENT
          The student must NOT know that multiple agencies bid.
          No bid count, no bid amount, no competing proposals.
      ────────────────────────────────────────────────────────────────── */}
      {!isElite && !selectedAgency && (
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Under Admin Review & Agency Matching</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {agencyState?.hasActiveRequest
                ? "Your Assistance Request is Under Confidential Review"
                : "Request Professional Agency Assistance"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {agencyState?.hasActiveRequest ? (
                <>
                  Your requirements have been securely submitted to the <strong>Admify Admin Desk</strong> and broadcasted to verified partner agencies. Eligible agencies submit confidential proposals to Admin. Our admissions committee will evaluate agency capacity and assign your dedicated counselor shortly.
                </>
              ) : (
                "Post your profile requirements to have our Admin Desk evaluate partner agency credentials and assign a certified counselor to manage your university applications."
              )}
            </p>
          </div>

          {agencyState?.hasActiveRequest ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Confidential Matching in Progress</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Admin is evaluating verified agencies to assign your counseling team. You will be notified once linked.
                </p>
              </div>
          ) : (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Post Assistance Request →</span>
            </button>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          ELITE PREMIUM WORKFLOW: AGENCY DIRECTORY (MARKETPLACE)
          Elite can browse all agencies and choose.
          CRITICAL: Bidding data (bid amount, bid proposal, counts) is CONFIDENTIAL
          and stripped from the directory.
      ────────────────────────────────────────────────────────────────── */}
      {isElite && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Registered & Eligible Agency Directory</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Elite Directory
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse certified agencies and choose your preferred agency to handle your admission portfolio.
              </p>
            </div>

            <span className="text-xs text-slate-400">
              {agencyState?.eligibleAgencies?.length || REGISTERED_AGENCIES.length} Verified Agencies Available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(agencyState?.eligibleAgencies || REGISTERED_AGENCIES).map((agency) => {
              const isCurrentSelected = selectedAgency?.id === agency.id;

              return (
                <div
                  key={agency.id}
                  className={`p-6 rounded-3xl bg-[#0B1228] border transition-all flex flex-col justify-between space-y-5 shadow-lg ${
                    isCurrentSelected
                      ? "border-purple-500 shadow-purple-500/15 bg-gradient-to-b from-[#0B1228] to-[#07142D]"
                      : "border-slate-800 hover:border-purple-500/40"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#07142D] border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                          {agency.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-white">{agency.name}</h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Verified
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{agency.tagline}</p>
                        </div>
                      </div>

                      {isCurrentSelected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500 text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Counselor Info */}
                    <div className="p-3 rounded-2xl bg-[#07142D] border border-slate-800/80 flex items-center gap-3">
                      <img
                        src={agency.agentAvatar}
                        alt={agency.agentName}
                        className="w-9 h-9 rounded-full object-cover border border-purple-500/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Counselor</span>
                        <p className="text-xs font-bold text-white truncate">{agency.agentName}</p>
                        <p className="text-[11px] text-purple-300 truncate">{agency.agentRole}</p>
                      </div>
                    </div>

                    {/* Stats & Countries */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-[#07142D] border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">Success Rate</span>
                        <span className="text-emerald-400 font-extrabold">{agency.successRate}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#07142D] border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">Placed</span>
                        <span className="text-white font-extrabold">{agency.studentsPlaced}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#07142D] border border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 block">Experience</span>
                        <span className="text-cyan-300 font-extrabold">{agency.experienceYears} Years</span>
                      </div>
                    </div>

                    {/* Services Tags */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Services:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {agency.services?.map((svc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg bg-[#07142D] border border-slate-800 text-[10px] text-slate-300"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Countries: <strong className="text-slate-300">{agency.countriesServed?.slice(0, 2).join(", ")}...</strong>
                    </span>

                    {isCurrentSelected ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>Assigned Agency</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleEliteSelectAgency(agency.id)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20"
                      >
                        Choose This Agency
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Assistance Request Modal ────────────────────────────── */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowRequestModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-5 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
                  Agency Assistance
                </span>
                <h3 className="text-xl font-extrabold text-white">Post Assistance Request</h3>
                <p className="text-xs text-slate-400">
                  {isElite
                    ? "Broadcast your preferences to verified global agencies."
                    : "Broadcast your profile to receive confidential proposals reviewed by Admify Admin."}
                </p>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Target Country</label>
                <select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Germany">Germany</option>
                  <option value="Australia">Australia</option>
                  <option value="Global / Multiple Destinations">Global / Multiple Destinations</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Study Level</label>
                  <select
                    value={studyLevel}
                    onChange={(e) => setStudyLevel(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                    <option value="Postgraduate Diploma">Postgraduate Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Budget Range</label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="৳1,200,000 - ৳2,400,000 / yr ($10,000 - $20,000 / yr)">৳1.2M - ৳2.4M / yr ($10k - $20k)</option>
                    <option value="৳2,400,000 - ৳4,800,000 / yr ($20,000 - $40,000 / yr)">৳2.4M - ৳4.8M / yr ($20k - $40k)</option>
                    <option value="৳4,800,000 - ৳7,200,000 / yr ($40,000 - $60,000 / yr)">৳4.8M - ৳7.2M / yr ($40k - $60k)</option>
                    <option value="Full Scholarship Dependent">Full Scholarship Dependent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Program / Field of Study</label>
                <input
                  type="text"
                  required
                  value={targetDiscipline}
                  onChange={(e) => setTargetDiscipline(e.target.value)}
                  placeholder="e.g. Data Science, MBA, Mechanical Engineering"
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Notes for Agency</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requirements (e.g. visa timeline, assistantship preference)..."
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyAssistancePage;
