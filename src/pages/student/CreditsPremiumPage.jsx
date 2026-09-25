import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { studentService } from "../../services/studentService";
import {
  Crown,
  Wallet,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Send,
  Users2,
  FileCheck2,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Plus,
  Zap,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function CreditsPremiumPage() {
  const { user, updateUser } = useAuth();

  const [credits, setCredits] = useState(user?.walletCredits ?? 250);
  const [balanceUsd, setBalanceUsd] = useState(((user?.walletCredits ?? 250) * 0.1).toFixed(2));
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(100);
  const [toppingUp, setToppingUp] = useState(false);

  const freeStatus = studentService.getFreeApplicationStatus();
  const [plan, setPlan] = useState(studentService.getStudentPlan(user));

  const handleSwitchPlan = (newPlan) => {
    studentService.setStudentPlan(newPlan);
    setPlan(newPlan);
    if (updateUser) {
      updateUser({ subscriptionTier: newPlan });
    }
    const planName = newPlan === "free" ? "Free Starter ($0)" : newPlan === "pro" ? "Pro Path ($39/mo)" : "Elite Premium ($119/mo)";
    toast.success(`Account switched to ${planName}`);
  };

  // Load wallet data from API
  useEffect(() => {
    let isMounted = true;
    async function loadWallet() {
      try {
        setLoading(true);
        const res = await api.get("/api/wallet");
        if (isMounted && res?.data) {
          setCredits(res.data.credits);
          setBalanceUsd(res.data.balanceUsd);
          if (res.data.transactions) setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.warn("Wallet load fallback:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadWallet();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTopUp = async () => {
    setToppingUp(true);
    try {
      const res = await api.post("/api/wallet/topup", {
        amount: selectedPack,
        paymentMethod: "Card / Stripe Gateway",
      });

      const newBal = res?.data?.newBalance ?? (credits + selectedPack);
      setCredits(newBal);
      setBalanceUsd((newBal * 0.1).toFixed(2));
      if (res?.data?.transaction) {
        setTransactions((prev) => [res.data.transaction, ...prev]);
      }
      if (updateUser) {
        updateUser({ walletCredits: newBal });
      }
      setShowTopUpModal(false);
      toast.success(`Successfully added ${selectedPack} credits to your account!`);
    } catch (err) {
      toast.error(err.message || "Top-up processing encountered an error.");
    } finally {
      setToppingUp(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Account</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Balance & Tiers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Crown className="w-7 h-7 text-amber-400" />
            Wallet, Credits & Premium Tiers
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage application credits, unlock agency marketplace access, and inspect billing transactions.
          </p>
        </div>

        <button
          onClick={() => setShowTopUpModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Top Up Credits</span>
        </button>
      </div>

      {/* ── Key Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-cyan-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {credits} <span className="text-sm text-cyan-400 font-bold">CR</span>
            </p>
            <p className="text-sm font-extrabold text-cyan-400 mt-1">
              ৳{(credits * 12).toLocaleString("en-BD")} BDT{" "}
              <span className="text-xs text-slate-400 font-medium">(≈ ${balanceUsd} USD)</span>
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-300">1 Credit = ৳12 BDT ($0.10 USD) Application & Service conversion</span>
          </div>
        </div>

        {/* Card 2: Direct Application Credits */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Applications</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {freeStatus.freeAvailable ? "1 FREE" : "0 Free"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {freeStatus.freeAvailable
                ? "Every registered student receives 1 free direct application."
                : "Free application submitted. 50 Credits (৳600 BDT / $5 USD) per direct submission."}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-emerald-300">
              {freeStatus.freeAvailable ? "✓ 1 Application Available" : "Purchase 50 CR per new application"}
            </span>
          </div>
        </div>

        {/* Card 3: Membership Tier */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membership Tier</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white capitalize">
              {plan === "free" ? "Free Starter" : plan === "pro" ? "Pro Path" : "Elite Premium"}
            </p>
            <p className="text-xs text-purple-300 mt-1">
              {plan === "free"
                ? "Self-Service Student • $0/month"
                : plan === "pro"
                ? "AI & Confidential Agency Matching • $39/month"
                : "Full Marketplace & Dedicated Advisor • $119/month"}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-300">
              {plan === "free"
                ? "1 Free direct application included. Upgrade for agency assistance."
                : plan === "pro"
                ? "Unlimited AI tools + Admin-assigned agency support."
                : "Complete Agency Marketplace directory + 1-on-1 advisor."}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tier Comparison: 3 Plans (Free Starter, Pro Path, Elite Premium) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">Student Subscription Plans</h2>
            <p className="text-xs text-slate-400">Choose the right tier for your global admissions journey</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            Current Tier: <span className="font-extrabold capitalize">{plan}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Free Starter */}
          <div className={`p-6 rounded-2xl bg-[#07142D] border ${
            plan === "free" ? "border-cyan-500 ring-2 ring-cyan-500/30" : "border-slate-800"
          } space-y-4 flex flex-col justify-between`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Self-Service</span>
                  <h3 className="text-xl font-extrabold text-white">Free Starter</h3>
                </div>
                {plan === "free" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    Active Plan
                  </span>
                )}
              </div>
              <div>
                <p className="text-3xl font-black text-white">$0</p>
                <p className="text-xs text-slate-400">Forever free self-service</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Free Direct University Application</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Search Universities & Directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Search Scholarships & Eligibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic Document Checker</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="line-through text-slate-500">No Agency or Agent Assignment</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="line-through text-slate-500">No Agency Marketplace Browsing</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="line-through text-slate-500">No AI University Matching</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSwitchPlan("free")}
              disabled={plan === "free"}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                plan === "free"
                  ? "bg-slate-800 text-slate-400 cursor-default"
                  : "bg-slate-800 hover:bg-slate-700 text-white"
              }`}
            >
              {plan === "free" ? "Current Plan" : "Switch to Free Starter"}
            </button>
          </div>

          {/* Plan 2: Pro Path */}
          <div className={`p-6 rounded-2xl bg-[#07142D] border ${
            plan === "pro" ? "border-purple-500 ring-2 ring-purple-500/30" : "border-purple-500/40"
          } space-y-4 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-purple-500/5`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Most Popular</span>
                  <h3 className="text-xl font-extrabold text-white">Pro Path</h3>
                </div>
                {plan === "pro" ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Active Plan
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Recommended
                  </span>
                )}
              </div>
              <div>
                <p className="text-3xl font-black text-white">$39 <span className="text-xs font-medium text-slate-400">/ month (billed annually)</span></p>
                <p className="text-xs text-purple-300">or $49 billed monthly</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Unlimited AI University Matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Full AI SOP & LOR Generators (Editable)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Unlimited Document Reviews & Checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Direct Chat with Certified Advisors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Cost of Living & Tuition Estimator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Agency Assistance (Admin Counselor Assignment)</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-slate-400">No Directory Selection (Admin allocates agency)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSwitchPlan("pro")}
              disabled={plan === "pro"}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                plan === "pro"
                  ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-default"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20"
              }`}
            >
              {plan === "pro" ? "Current Plan" : "Upgrade to Pro Path ($39/mo)"}
            </button>
          </div>

          {/* Plan 3: Elite Premium */}
          <div className={`p-6 rounded-2xl bg-[#07142D] border ${
            plan === "elite" ? "border-blue-500 ring-2 ring-blue-500/30" : "border-blue-500/40"
          } space-y-4 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-blue-500/5`}>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Ultimate Tier</span>
                  <h3 className="text-xl font-extrabold text-white">Elite Premium</h3>
                </div>
                {plan === "elite" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Active Plan
                  </span>
                )}
              </div>
              <div>
                <p className="text-3xl font-black text-white">$119 <span className="text-xs font-medium text-slate-400">/ month (billed annually)</span></p>
                <p className="text-xs text-blue-300">or $149 billed monthly</p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Everything in Pro Path</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="text-blue-300 font-semibold">Agency Marketplace Access (Browse all agencies)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Dedicated 1-on-1 Study Abroad Advisor</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Full Mock Visa Interviews & Checklists</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Direct University Application Fee Waiver Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Post-Landing Accommodation Assistance</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-400">Verified Agency Network Protection</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSwitchPlan("elite")}
              disabled={plan === "elite"}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                plan === "elite"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
              }`}
            >
              {plan === "elite" ? "Current Plan" : "Upgrade to Elite Premium ($119/mo)"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Transaction History ─────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Recent Transactions & Credit History</h2>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#07142D] rounded-2xl border border-slate-800">
            No credit debits or top-ups recorded on account yet.
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, idx) => (
              <div
                key={tx._id || idx}
                className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      tx.type === "credit"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {tx.type === "credit" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">{tx.desc}</p>
                    <span className="text-[10px] text-slate-400">
                      {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "Recent"}
                    </span>
                  </div>
                </div>

                <span className={`font-black ${tx.type === "credit" ? "text-emerald-400" : "text-slate-300"}`}>
                  {tx.type === "credit" ? `+${tx.amount} CR` : `-${tx.amount} CR`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowTopUpModal(false)}
          />
          <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-white">Purchase Application Credits</h3>
              <p className="text-xs text-slate-400">Add credits to fund additional direct applications and AI generations</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[50, 100, 250].map((pack) => {
                const usd = (pack * 0.1).toFixed(0);
                const bdt = (pack * 12).toLocaleString("en-BD");
                return (
                  <button
                    key={pack}
                    type="button"
                    onClick={() => setSelectedPack(pack)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedPack === pack
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                        : "bg-[#0B1228] text-slate-300 border-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="text-lg font-black block text-white">{pack}</span>
                    <span className="text-[10px] text-slate-400 block">Credits</span>
                    <span className="text-xs font-black text-cyan-400 mt-1 block">৳{bdt} BDT</span>
                    <span className="text-[10px] text-slate-400 block">(${usd} USD)</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-[#0B1228] border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Processing</span>
              <p>Stripe / Card secure checkout connection enabled in BDT & USD.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={toppingUp}
                onClick={handleTopUp}
                className="px-6 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-70"
              >
                {toppingUp ? "Processing..." : `Confirm ৳${(selectedPack * 12).toLocaleString("en-BD")} ($${(selectedPack * 0.1).toFixed(0)} USD) Top-Up`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditsPremiumPage;
