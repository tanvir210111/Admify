import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { studentService } from "../../services/studentService";
import {
  Send,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
  Crown,
  FileCheck2,
  X,
  CreditCard,
  ArrowRight,
  UserCheck,
  MessageSquare,
  Receipt,
  Sparkles,
  Check,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

const POPULAR_UNIVERSITIES = [
  // Zero-Fee Universities (Free Application)
  { name: "Technical University of Munich (TUM)", country: "Germany", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "Heidelberg University", country: "Germany", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "Coventry University", country: "United Kingdom", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "University of Greenwich", country: "United Kingdom", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "IU International University of Applied Sciences", country: "Germany", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "Sorbonne University", country: "France", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "University of Vienna", country: "Austria", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "University of Auckland", country: "New Zealand", isZero: true, fee: "৳0 ($0) - Free" },
  { name: "Deakin University", country: "Australia", isZero: true, fee: "৳0 ($0) - Free" },
  // Paid Fee Universities
  { name: "Stanford University", country: "United States", isZero: false, fee: "৳15,000 ($125)" },
  { name: "Massachusetts Institute of Technology (MIT)", country: "United States", isZero: false, fee: "৳9,000 ($75)" },
  { name: "University of Oxford", country: "United Kingdom", isZero: false, fee: "৳11,400 ($95)" },
  { name: "University of Toronto", country: "Canada", isZero: false, fee: "৳11,400 ($95)" },
  { name: "Arizona State University", country: "United States", isZero: false, fee: "৳8,400 ($70)" },
  { name: "University of Texas at Arlington", country: "United States", isZero: false, fee: "৳9,000 ($75)" },
  { name: "University of Windsor", country: "Canada", isZero: false, fee: "৳10,800 ($90)" },
];

function DirectApplicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillUni = searchParams.get("uni") || "";

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freeAppStatus, setFreeAppStatus] = useState({ freeAvailable: true, usedCount: 0 });
  const [showApplyModal, setShowApplyModal] = useState(Boolean(prefillUni));

  // Application form fields
  const [university, setUniversity] = useState(prefillUni || "Coventry University");
  const [program, setProgram] = useState("M.S. Computer Science");
  const [intake, setIntake] = useState("Fall 2026");
  const [statement, setStatement] = useState("");
  const [attachedTranscript, setAttachedTranscript] = useState(true);
  const [attachedSop, setAttachedSop] = useState(true);
  const [attachedIelts, setAttachedIelts] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fee clearance & Assigned Agent states
  const [feeInfo, setFeeInfo] = useState(() => studentService.getUniversityAppFee(prefillUni || "Coventry University"));
  const [feeClearance, setFeeClearance] = useState(() => studentService.getFeeClearance(prefillUni || "Coventry University"));
  const [requestingAgent, setRequestingAgent] = useState(false);
  const [trxInput, setTrxInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bKash Merchant");
  const [confirmingDeposit, setConfirmingDeposit] = useState(false);

  // Sync fee info whenever university changes
  useEffect(() => {
    if (university) {
      const info = studentService.getUniversityAppFee(university);
      const clearance = studentService.getFeeClearance(university);
      setFeeInfo(info);
      setFeeClearance(clearance);
    }
  }, [university]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const apps = await studentService.getMyApplications();
        const status = studentService.getFreeApplicationStatus();
        if (isMounted) {
          setApplications(apps.filter((a) => a.applicationType === "direct" || !a.applicationType));
          setFreeAppStatus(status);
        }
      } catch (err) {
        console.warn(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenModal = () => {
    if (!freeAppStatus.freeAvailable) {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <span className="font-bold text-white text-xs">You have used your 1 free direct application.</span>
            <span className="text-[11px] text-slate-300">Purchase application credits or upgrade to submit additional applications.</span>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate("/student/wallet");
              }}
              className="mt-1 py-1 px-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white"
            >
              Purchase Application Credits →
            </button>
          </div>
        ),
        {
          duration: 5000,
          style: {
            background: "#07142D",
            border: "1px solid #3b82f6",
            borderRadius: "16px",
          },
        }
      );
      return;
    }
    setShowApplyModal(true);
  };

  // Request Admin Panel to assign fee collection agent
  const handleRequestFeeAgent = () => {
    setRequestingAgent(true);
    setTimeout(() => {
      const clearance = studentService.requestFeeAgent(university, program);
      setFeeClearance(clearance);
      setRequestingAgent(false);
      toast.success(
        `Admin Panel assigned Fee Agent ${clearance.assignedAgent?.name}! Deposit Ref: ${clearance.assignedAgent?.depositRef}`
      );
    }, 450);
  };

  // Confirm deposit with agent
  const handleConfirmDeposit = (e) => {
    e.preventDefault();
    if (!trxInput.trim()) {
      toast.error("Please enter your deposit Transaction ID (TrxID) or Reference");
      return;
    }

    setConfirmingDeposit(true);
    setTimeout(() => {
      const recorded = studentService.confirmFeeDeposit(university, {
        trxId: trxInput,
        paymentMethod,
      });
      setFeeClearance(recorded);
      setConfirmingDeposit(false);
      toast.success(`Deposit details submitted. Admin Fee Agent ${recorded.assignedAgent?.name || 'Tanvir Ahmed'} is verifying payment records.`);
    }, 400);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!university.trim() || !program.trim()) {
      toast.error("Please fill in university and program");
      return;
    }

    const requiredCredits = feeInfo.isZeroFee ? 20 : 40;
    const currentBal = user?.walletCredits ?? 0;
    if (currentBal < requiredCredits) {
      toast.error(
        `Insufficient Credits! Platform application service requires ${requiredCredits} CR (You have ${currentBal} CR). Please buy credits in your Wallet.`,
        { duration: 5000 }
      );
      return;
    }

    // Business rule enforcement:
    // If university requires application fee, it must have verified clearance by admin agent
    if (!feeInfo.isZeroFee && feeClearance.status !== "verified") {
      toast.error(
        `Application fee of ${feeInfo.feeDisplay} must be deposited & verified by your assigned Admin Agent before submission.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await studentService.submitDirectApplication({
        university,
        program,
        intake,
        statement,
        logo: "🎓",
      });

      // Deduct credits via API
      try {
        const deductRes = await api.post("/api/wallet/deduct", {
          serviceCode: feeInfo.isZeroFee ? "UNIVERSITY_APPLICATION_FREE" : "UNIVERSITY_APPLICATION_PAID",
          referenceId: created.id || created._id || `APP-${Date.now()}`,
        });
        if (updateUser && deductRes?.data?.balanceAfter !== undefined) {
          updateUser({ walletCredits: deductRes.data.balanceAfter });
        }
      } catch (dErr) {
        console.warn("Credit deduction warning:", dErr.message);
      }

      setApplications((prev) => [created, ...prev]);
      setFreeAppStatus(studentService.getFreeApplicationStatus());
      setShowApplyModal(false);
      toast.success(`Application submitted to ${university}! (${requiredCredits} CR deducted)`);
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Option A</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Direct Submissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Send className="w-7 h-7 text-cyan-400" />
            Direct University Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Apply directly to international partner institutions without agency intermediation.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Direct Application</span>
        </button>
      </div>

      {/* ── Business Rule Status Card: Credit-Based Application Cost ────────── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#07142D] via-[#0B1228] to-[#07142D] border border-cyan-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Credit-Based Platform Model
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white">
            $0 University Applications cost 20 CR • Paid Applications cost 40 CR + Official Fee
          </h3>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            <strong className="text-emerald-300">$0 Application Fee Universities (20 CR):</strong> Covered by your 20 Welcome Credits while valid, or standard wallet credits.
            <br />
            <strong className="text-cyan-300">Paid University Application Fee (40 CR + Official Fee):</strong> 40 Credits platform service cost, plus the official university fee deposited via our <strong className="text-white">Admin Fee Agent</strong> before clearance.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Balance</span>
            <span className="text-sm font-black text-cyan-400">{user?.walletCredits ?? 0} CR</span>
          </div>
          <Link
            to="/student/wallet"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Buy Credits</span>
          </Link>
        </div>
      </div>

      {/* ── Applications History List ─────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Submitted Direct Applications</h2>
          </div>
          <span className="text-xs text-slate-400">{applications.length} Recorded</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
            <Send className="w-10 h-10 mx-auto text-slate-600" />
            <h3 className="text-base font-bold text-white">No direct applications yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start your first university application today using your free tier credit.
            </p>
            <button
              onClick={handleOpenModal}
              className="px-5 py-2 rounded-xl bg-cyan-500 text-[#050B1F] text-xs font-bold"
            >
              Submit Application
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id || app.id}
                className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/30 transition-all space-y-5 shadow-lg"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#07142D] border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {app.logo || "🎓"}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-extrabold text-white">{app.university}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                          Direct App
                        </span>
                        {app.isFreeApplication && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                            Free Tier Submission
                          </span>
                        )}
                        {app.applicationFeeStatus && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            {app.applicationFeeStatus}
                          </span>
                        )}
                        {app.feeReceipt && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Receipt: {app.feeReceipt}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-cyan-300 font-medium mt-0.5">{app.program}</p>
                      {app.assignedFeeAgent && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Fee Clearance Agent: <span className="text-slate-200 font-semibold">{app.assignedFeeAgent}</span> (Admin Panel)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Submitted: {app.date}</span>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        app.stage === "Accepted"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : app.stage === "Documents Pending"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                          : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {app.stage}
                    </span>
                  </div>
                </div>

                {/* Progress Strategy */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-400">
                    <span>APPLICATION VERIFICATION PROGRESS</span>
                    <span className="text-cyan-400 font-bold">{app.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                      style={{ width: `${app.progress}%` }}
                    />
                  </div>
                </div>

                {/* Timeline Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {app.steps?.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-[#07142D] border border-slate-800 flex items-start gap-2.5 text-xs"
                    >
                      <div className="mt-0.5">
                        {step.status === "completed" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {step.status === "current" && <Clock className="w-4 h-4 text-cyan-400 animate-spin" />}
                        {step.status === "warning" && <AlertCircle className="w-4 h-4 text-amber-400" />}
                        {step.status === "upcoming" && (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500 font-bold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold ${step.status === "upcoming" ? "text-slate-500" : "text-white"} truncate`}>
                          {step.label}
                        </p>
                        <span className="text-[11px] text-slate-400">{step.date}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom link to detailed tracking */}
                <div className="flex justify-end pt-2">
                  <Link
                    to="/student/applications"
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <span>View Full Timeline Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit Direct Application Modal ────────────────────── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div
            className="fixed inset-0 bg-[#050B1F]/85 backdrop-blur-md"
            onClick={() => setShowApplyModal(false)}
          />
          <div className="relative z-10 w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-6 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 mb-1">
                  <span>1 Free Direct Application Benefit</span>
                </div>
                <h2 className="text-xl font-extrabold text-white">Direct University Application</h2>
                <p className="text-xs text-slate-400">Complete application package for direct admission review</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
              {/* Select University */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-slate-400 font-bold uppercase tracking-wider">
                    Select University
                  </label>
                  <span className="text-[11px] text-cyan-400">
                    {feeInfo.isZeroFee ? "✓ 0 Application Fee (Instant Free)" : `App Fee: ${feeInfo.feeDisplay}`}
                  </span>
                </div>

                <input
                  type="text"
                  required
                  list="popular-unis"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="Type or select university (e.g. Coventry University, TUM, Stanford)"
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-cyan-500"
                />
                <datalist id="popular-unis">
                  {POPULAR_UNIVERSITIES.map((u, i) => (
                    <option key={i} value={u.name}>
                      {u.isZero ? `[0 FEE / FREE] ${u.name}` : `[APP FEE: ${u.fee}] ${u.name}`}
                    </option>
                  ))}
                </datalist>

                {/* Quick Selection Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Quick Select:</span>
                  <button
                    type="button"
                    onClick={() => setUniversity("Coventry University")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      university === "Coventry University"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-slate-700"
                    }`}
                  >
                    Coventry ($0 Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniversity("Technical University of Munich (TUM)")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      university.includes("Munich")
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-800 text-emerald-400 border-emerald-500/30 hover:bg-slate-700"
                    }`}
                  >
                    TUM Germany ($0 Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniversity("Stanford University")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      university === "Stanford University"
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-slate-700"
                    }`}
                  >
                    Stanford ($125 Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUniversity("University of Oxford")}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                      university === "University of Oxford"
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-slate-700"
                    }`}
                  >
                    Oxford ($95 Fee)
                  </button>
                </div>
              </div>

              {/* ── DYNAMIC APPLICATION FEE VALIDATION & AGENT ASSIGNMENT BOX ── */}
              {feeInfo.isZeroFee ? (
                /* CASE 1: 0 Application Fee -> Instant Free Submission */
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#0B1228] to-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Eligible for Instant 100% Free Direct Application</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <strong>{university}</strong> requires <span className="text-emerald-300 font-bold">0 Application Fee ($0 / ৳0)</span>. You can submit your official direct application immediately using your 1 Free Application entitlement with zero extra cost.
                  </p>
                </div>
              ) : (
                /* CASE 2: Application Fee > 0 -> Admin Panel Agent Clearance Required */
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0B1228] via-[#07142D] to-[#0B1228] border border-amber-500/40 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>University Application Fee Required: {feeInfo.feeDisplay}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Admify direct service is free for your 1 Free Application. However, <strong>{university}</strong> requires an official institutional fee of <strong className="text-white">{feeInfo.feeDisplay}</strong>.
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Paid Institution
                    </span>
                  </div>

                  {/* 3 Clearance Phases */}
                  {feeClearance.status === "unpaid" && (
                    <div className="p-4 rounded-xl bg-[#07142D] border border-slate-800 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          To submit to this university, contact our <strong>Admin Panel</strong>. Admin will immediately assign a dedicated <strong>Fee Collection Agent</strong> to receive and verify the university application fee on your behalf.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRequestFeeAgent}
                        disabled={requestingAgent}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-[#050B1F] font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{requestingAgent ? "Connecting with Admin Panel..." : "Connect with Admin Panel to Assign Fee Agent"}</span>
                      </button>
                    </div>
                  )}

                  {feeClearance.status === "agent_assigned" && (
                    <div className="p-4 rounded-xl bg-[#07142D] border border-cyan-500/40 space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                            TA
                          </div>
                          <div>
                            <p className="font-extrabold text-white text-xs">
                              {feeClearance.assignedAgent?.name || "Tanvir Ahmed"}
                            </p>
                            <p className="text-[10px] text-cyan-300">
                              {feeClearance.assignedAgent?.department || "Admin Panel - Official Fee Collection Desk"}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                          Agent Assigned
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-[#0B1228] border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Fee Amount:</span>
                          <span className="font-extrabold text-white">{feeInfo.feeDisplay}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0B1228] border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Deposit Reference ID:</span>
                          <span className="font-mono font-bold text-cyan-300">{feeClearance.assignedAgent?.depositRef}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0B1228] border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">bKash Merchant:</span>
                          <span className="font-bold text-slate-200">{feeClearance.assignedAgent?.bkashMerchant}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#0B1228] border border-slate-800">
                          <span className="text-slate-400 block text-[10px] font-bold uppercase">Agent Contact:</span>
                          <span className="font-bold text-slate-200">{feeClearance.assignedAgent?.phone}</span>
                        </div>
                      </div>

                      {/* Deposit Verification Form */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="block text-[11px] font-bold text-slate-300">
                          Enter Deposit TrxID / Reference (Confirmed with Agent):
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="bg-[#0B1228] border border-slate-700/60 rounded-xl px-2.5 text-xs text-white"
                          >
                            <option value="bKash Merchant">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Bank Deposit">Bank Transfer</option>
                            <option value="Card">Visa/Mastercard</option>
                          </select>
                          <input
                            type="text"
                            value={trxInput}
                            onChange={(e) => setTrxInput(e.target.value)}
                            placeholder="e.g. BKASH99281X"
                            className="flex-1 bg-[#0B1228] border border-slate-700/60 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={handleConfirmDeposit}
                            disabled={confirmingDeposit}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0"
                          >
                            {confirmingDeposit ? "Verifying..." : "Confirm Deposit"}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                        <span>Need assistance with payment?</span>
                        <Link
                          to="/student/messages"
                          target="_blank"
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-bold"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Chat with Agent Tanvir</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {feeClearance.status === "pending_agent_verification" && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Deposit Submitted — Verification Pending</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>Assigned Agent: <strong className="text-white">{feeClearance.assignedAgent?.name || "Tanvir Ahmed"}</strong></div>
                        <div>Payment Method: <strong className="text-white">{feeClearance.paymentMethod}</strong></div>
                        <div>Submitted TrxID: <strong className="font-mono text-cyan-300">{feeClearance.trxId}</strong></div>
                        <div>Amount: <strong className="text-white">{feeInfo.feeDisplay}</strong></div>
                      </div>
                      <p className="text-[10px] text-amber-300/90 pt-1">
                        Your deposit transaction has been submitted to the Admin Fee Collection Desk. Once the agent confirms the bank record with {university}, this application will be unlocked for direct submission.
                      </p>
                    </div>
                  )}

                  {feeClearance.status === "verified" && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>University Application Fee Verified & Cleared!</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>Verified By: <strong className="text-white">{feeClearance.verifiedBy}</strong></div>
                        <div>Official Receipt: <strong className="font-mono text-emerald-300">{feeClearance.receiptNumber}</strong></div>
                        <div>TrxID: <strong className="font-mono text-slate-300">{feeClearance.trxId}</strong></div>
                        <div>Amount: <strong className="text-white">{feeInfo.feeDisplay}</strong></div>
                      </div>
                      <p className="text-[10px] text-emerald-300 pt-1">
                        ✓ Your university fee has been collected by the admin agent and credited to {university}. You may now submit your direct application!
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Target Program & Intake */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Target Program
                  </label>
                  <input
                    type="text"
                    required
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    placeholder="e.g. M.S. Computer Science"
                    className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Target Intake
                  </label>
                  <select
                    value={intake}
                    onChange={(e) => setIntake(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-white font-medium focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Fall 2026">Fall 2026</option>
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Fall 2027">Fall 2027</option>
                  </select>
                </div>
              </div>

              {/* Document Attachments Checklist */}
              <div className="p-4 rounded-2xl bg-[#0B1228] border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Application Documents Attached from Vault
                </span>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={attachedTranscript}
                    onChange={(e) => setAttachedTranscript(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>Official Academic Transcripts (Undergrad GPA 3.8)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={attachedIelts}
                    onChange={(e) => setAttachedIelts(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>English Test Certificate (IELTS 7.5 TRF)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={attachedSop}
                    onChange={(e) => setAttachedSop(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span>Statement of Purpose (AI Draft v2)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Application Statement / Applicant Notes
                </label>
                <textarea
                  rows={2}
                  value={statement}
                  onChange={(e) => setStatement(e.target.value)}
                  placeholder="Any specific department or scholarship instructions for the university committee..."
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || (!feeInfo.isZeroFee && feeClearance.status !== "verified")}
                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 ${
                    submitting || (!feeInfo.isZeroFee && feeClearance.status !== "verified")
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : "bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] shadow-cyan-500/20"
                  }`}
                >
                  {submitting ? (
                    "Submitting Application..."
                  ) : !feeInfo.isZeroFee && feeClearance.status !== "verified" ? (
                    "Admin Fee Clearance Required"
                  ) : (
                    `Submit Direct Application (${feeInfo.isZeroFee ? "Free - $0 Fee" : "Fee Cleared"})`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectApplicationsPage;
