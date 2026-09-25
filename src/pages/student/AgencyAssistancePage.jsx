import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { studentService, REGISTERED_AGENCIES } from "../../services/studentService";
import {
  Users2,
  Building2,
  Send,
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  X,
  Lock,
  FileCheck2,
  Sparkles,
  Wallet,
  Briefcase,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";

function AgencyAssistancePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUniPrefill = searchParams.get("targetUni") || "";

  const [walletCredits, setWalletCredits] = useState(user?.walletCredits ?? 0);
  const [agencyState, setAgencyState] = useState(() => studentService.getAgencyAssistanceState(user));
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // 'AGENCY_ASSISTANCE' or 'FULL_AGENCY_MANAGED'
  const [activating, setActivating] = useState(false);

  // Intake Form states
  const [targetCountry, setTargetCountry] = useState("United States");
  const [studyLevel, setStudyLevel] = useState("Master's Degree");
  const [targetDiscipline, setTargetDiscipline] = useState(
    targetUniPrefill ? `Applications to ${targetUniPrefill}` : "Computer Science & Engineering"
  );
  const [budgetRange, setBudgetRange] = useState("৳2,400,000 - ৳4,800,000 / yr");
  const [notes, setNotes] = useState("");

  // Load latest wallet & agency orders from API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get("/api/wallet");
        if (res?.data) {
          setWalletCredits(res.data.availableCredits);
          if (res.data.agencyOrders && res.data.agencyOrders.length > 0) {
            const latest = res.data.agencyOrders[0];
            setAgencyState((prev) => ({
              ...prev,
              hasActiveRequest: true,
              serviceType: latest.serviceType,
              requestDetails: {
                id: latest.orderId,
                serviceType: latest.serviceType,
                targetCountry: latest.targetCountry,
                studyLevel: latest.studyLevel,
                targetDiscipline: latest.targetDiscipline,
                submittedAt: new Date(latest.createdAt).toLocaleDateString(),
                status: latest.status,
              },
              selectedAgency: latest.assignedAgency?.agencyName
                ? {
                    name: latest.assignedAgency.agencyName,
                    agentName: latest.assignedAgency.agentName,
                    agentRole: latest.assignedAgency.agentRole || "Senior Counselor",
                    agentAvatar: latest.assignedAgency.agentAvatar,
                  }
                : null,
            }));
          }
        }
      } catch (err) {
        console.warn("Wallet sync warning:", err.message);
      }
    }
    loadData();
  }, []);

  const handleInitiateActivation = (serviceType) => {
    const requiredCredits = serviceType === "AGENCY_ASSISTANCE" ? 800 : 1500;
    if (walletCredits < requiredCredits) {
      toast.error(
        `Insufficient Credits! Requires ${requiredCredits} CR (You currently have ${walletCredits} CR). Please buy credits in your Wallet.`,
        { duration: 5000 }
      );
      return;
    }
    setSelectedService(serviceType);
    setShowActivateModal(true);
  };

  const handleConfirmActivation = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setActivating(true);
    try {
      const res = await api.post("/api/wallet/agency-service/activate", {
        serviceType: selectedService,
        targetCountry,
        studyLevel,
        targetDiscipline,
        budgetRange,
        notes,
      });

      const newBalance = res?.data?.balanceAfter ?? Math.max(0, walletCredits - (selectedService === "AGENCY_ASSISTANCE" ? 800 : 1500));
      setWalletCredits(newBalance);
      if (updateUser) {
        updateUser({ walletCredits: newBalance });
      }

      const order = res?.data?.agencyOrder;
      const updated = studentService.submitAgencyAssistanceRequest(
        {
          serviceType: selectedService,
          targetCountry,
          studyLevel,
          targetDiscipline,
          budgetRange,
          notes,
        },
        user
      );
      setAgencyState({
        ...updated,
        requestDetails: {
          ...updated.requestDetails,
          id: order?.orderId || updated.requestDetails.id,
        },
      });

      setShowActivateModal(false);
      toast.success(
        `${selectedService === "AGENCY_ASSISTANCE" ? "Agency Assistance" : "Full Agency Managed Service"} activated successfully! Admify counselor assignment in progress.`
      );
    } catch (err) {
      toast.error(err.message || "Failed to activate agency service");
    } finally {
      setActivating(false);
    }
  };

  const activeRequest = agencyState?.requestDetails;
  const assignedAgency = agencyState?.selectedAgency;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Expert Guidance</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Credit-Based Agency Services</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users2 className="w-7 h-7 text-cyan-400" />
            Agency Services & Counseling
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Activate verified study abroad counselor support or full end-to-end agency process management using platform Credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-[#0B1228] border border-cyan-500/30 flex items-center gap-2 text-xs">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300">Your Balance:</span>
            <span className="font-black text-cyan-400">{walletCredits} CR</span>
          </div>
          <button
            onClick={() => navigate("/student/wallet")}
            className="px-4 py-2 rounded-2xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold transition-all"
          >
            Buy Credits
          </button>
        </div>
      </div>

      {/* ── Critical Service Boundary Disclaimer ─────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1228] border border-amber-500/30 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-white">Important Agency Service Boundaries</h4>
          <p className="text-slate-300 leading-relaxed">
            Agency Assistance and Full Agency Managed Service provide application guidance, strategy, and counseling. Neither service guarantees university admission, scholarships, or visa issuance. Official fees (university tuition, official application fees, visa fees, embassy fees, accommodation) are outside the service credit price.
          </p>
        </div>
      </div>

      {/* ── Active Service Order View (If Student Activated Agency Service) ── */}
      {agencyState?.hasActiveRequest ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1228] via-[#07142D] to-[#0B1228] border border-cyan-500/40 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {agencyState.serviceType === "FULL_AGENCY_MANAGED"
                    ? "Full Agency Managed Service (1,500 CR)"
                    : "Agency Assistance (800 CR)"}
                </span>
                <span className="text-xs text-slate-400">Order ID: <strong className="text-white font-mono">{activeRequest?.id}</strong></span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-2">
                Active Counseling Order in Progress
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Status: {assignedAgency ? "Counselor Assigned" : "Admin Assigning Counselor"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request Summary */}
            <div className="p-5 rounded-2xl bg-[#0B1228] border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-cyan-400" />
                Service Order Details
              </h3>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Country:</span>
                  <span className="font-semibold text-white">{activeRequest?.targetCountry || "United States"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degree Level:</span>
                  <span className="font-semibold text-white">{activeRequest?.studyLevel || "Master's"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Discipline:</span>
                  <span className="font-semibold text-white">{activeRequest?.targetDiscipline || "Computer Science"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Submitted Date:</span>
                  <span className="font-semibold text-white">{activeRequest?.submittedAt || "Recent"}</span>
                </div>
              </div>
            </div>

            {/* Assigned Counselor Card */}
            <div className="p-5 rounded-2xl bg-[#0B1228] border border-cyan-500/30 space-y-4">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Assigned Dedicated Counselor
              </h3>

              {assignedAgency ? (
                <div className="flex items-start gap-4">
                  <img
                    src={assignedAgency.agentAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                    alt={assignedAgency.agentName}
                    className="w-12 h-12 rounded-2xl object-cover border border-cyan-500/40"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-bold text-white">{assignedAgency.agentName || "Eleanor Vance"}</p>
                    <p className="text-xs text-cyan-300">{assignedAgency.agentRole || "Senior Admissions Counselor"}</p>
                    <p className="text-[11px] text-slate-400">{assignedAgency.name || "GlobalBridge Pathways"}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#07142D] border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-amber-300">Admify Admin Counselor Matching</p>
                  <p className="text-slate-400 text-[11px]">
                    Admin is reviewing your academic profile and assigning a certified counselor specializing in {activeRequest?.targetCountry || "your destinations"}.
                  </p>
                </div>
              )}

              <button
                onClick={() => navigate("/student/messages")}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Counselor Chat</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Agency Service Packages Comparison ──────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service 1: Agency Assistance (800 CR) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-cyan-500/40 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Option A • Support Service</span>
                  <h3 className="text-2xl font-black text-white mt-1">Agency Assistance</h3>
                  <p className="text-xs text-cyan-300 font-semibold italic mt-0.5">"Agency helps me."</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">800</span>
                  <span className="text-xs font-bold text-cyan-400 block">CR</span>
                  <span className="text-xs text-emerald-400 font-bold block mt-0.5">৳80,000 BDT</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Personalized support and guidance throughout your applications while you remain in control of personal submissions.
              </p>

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Included Support:</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {[
                    "Student academic profile review",
                    "University & course selection support",
                    "Application strategy & timeline planning",
                    "Document checklist & vault compliance audit",
                    "SOP & LOR guidance and recommendations",
                    "Application preparation & submission support",
                    "Application status tracking & follow-ups",
                    "Necessary university liaison communication",
                    "Assigned certified Agent & counselor chat",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-300 block">Student Responsibility:</span>
                <p>Student remains responsible for personal information verification, original documents, required fees, and embassy presence.</p>
              </div>
            </div>

            <button
              onClick={() => handleInitiateActivation("AGENCY_ASSISTANCE")}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20"
            >
              Activate Agency Assistance (800 CR)
            </button>
          </div>

          {/* Service 2: Full Agency Managed Service (1,500 CR) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-purple-500/50 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Option B • End-to-End</span>
                  <h3 className="text-2xl font-black text-white mt-1">Full Agency Managed</h3>
                  <p className="text-xs text-purple-300 font-semibold italic mt-0.5">"Agency manages my overall process."</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-white">1,500</span>
                  <span className="text-xs font-bold text-purple-400 block">CR</span>
                  <span className="text-xs text-emerald-400 font-bold block mt-0.5">৳1,50,000 BDT</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Comprehensive, hands-off management of your global admission journey from initial shortlisting to visa preparation.
              </p>

              <div className="space-y-2.5 pt-2">
                <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">Everything in Assistance PLUS:</span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {[
                    "Full multi-university portfolio management",
                    "Complete document preparation & verification coordination",
                    "SOP/LOR draft preparation & academic polishing",
                    "Direct university application submissions",
                    "Application fee process coordination",
                    "Continuous university communication & offer letter tracking",
                    "Complete visa documentation checklist & preparation",
                    "Mock visa interview sessions & feedback",
                    "Pre-departure orientation & housing guidance",
                    "Dedicated Senior Agent direct management",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-purple-300 block">Open to All Students:</span>
                <p>Not subscription-exclusive. Any student with 1,500 Credits can purchase end-to-end management.</p>
              </div>
            </div>

            <button
              onClick={() => handleInitiateActivation("FULL_AGENCY_MANAGED")}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20"
            >
              Activate Full Managed Service (1,500 CR)
            </button>
          </div>
        </div>
      )}

      {/* ── Partner Agencies Showcase (Sanitized Directory) ─────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Verified Partner Agency Network
          </h2>
          <p className="text-xs text-slate-400">
            Certified partner agencies licensed to deliver counseling and application services on Admify.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {REGISTERED_AGENCIES.map((agency) => (
            <div
              key={agency.id}
              className="p-5 rounded-2xl bg-[#07142D] border border-slate-800 space-y-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agency.logo}</span>
                <div>
                  <h4 className="font-bold text-white">{agency.name}</h4>
                  <p className="text-[11px] text-slate-400">{agency.tagline}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Success Rate:</span>
                  <span className="font-bold text-emerald-400">{agency.successRate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Experience:</span>
                  <span className="font-bold text-white">{agency.experienceYears} Years</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {agency.services.slice(0, 3).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#0B1228] text-[10px] text-slate-300 border border-slate-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Activation Intake Modal ─────────────────────────────────── */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowActivateModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">
                  Activate {selectedService === "FULL_AGENCY_MANAGED" ? "Full Agency Managed Service" : "Agency Assistance"}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedService === "FULL_AGENCY_MANAGED" ? "1,500 Credits (৳1,50,000)" : "800 Credits (৳80,000)"} will be deducted from your wallet
                </p>
              </div>
              <button
                onClick={() => setShowActivateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmActivation} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Target Country *</label>
                  <select
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Degree Level *</label>
                  <select
                    value={studyLevel}
                    onChange={(e) => setStudyLevel(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Undergraduate">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Doctoral / PhD">PhD / Doctorate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Target Field / Program *</label>
                <input
                  type="text"
                  required
                  value={targetDiscipline}
                  onChange={(e) => setTargetDiscipline(e.target.value)}
                  placeholder="e.g. MS in Data Science & AI"
                  className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Notes & Objectives for Counselor</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell your counselor about target universities, intake timeline, budget expectations..."
                  className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800 text-[11px] text-slate-400">
                <p className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Credit Confirmation
                </p>
                <span>
                  Current Balance: <strong>{walletCredits} CR</strong>. After activation:{" "}
                  <strong>{walletCredits - (selectedService === "FULL_AGENCY_MANAGED" ? 1500 : 800)} CR</strong>.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowActivateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={activating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-60"
                >
                  {activating ? "Activating..." : "Confirm & Deduct Credits"}
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
