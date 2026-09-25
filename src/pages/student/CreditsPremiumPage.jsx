import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  Wallet,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Plus,
  Zap,
  X,
  Clock,
  Tag,
  AlertCircle,
  FileCheck2,
  Send,
  Building2,
  Users2,
  HelpCircle,
  Receipt,
  Copy,
} from "lucide-react";
import { CREDIT_PACKAGES, CREDIT_COSTS } from "../../utils/creditConstants";
import toast from "react-hot-toast";

function CreditsPremiumPage() {
  const { user, updateUser } = useAuth();

  const [wallet, setWallet] = useState({
    availableCredits: user?.walletCredits ?? 0,
    freeCredits: user?.freeCredits ?? 0,
    paidCredits: user?.paidCredits ?? 0,
    freeCreditExpiresAt: user?.freeCreditExpiresAt ?? null,
    isFreeExpired: false,
    freeCreditsForfeited: false,
    totalPurchasedCredits: user?.totalPurchasedCredits ?? 0,
    totalUsedCredits: user?.totalUsedCredits ?? 0,
    creditTransactions: [],
    paymentOrders: [],
  });

  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKAGES[1]); // Basic 100 CR
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Manual payment form
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [transactionId, setTransactionId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Load wallet & transactions from API
  const loadWallet = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/wallet");
      if (res?.data) {
        setWallet(res.data);
        if (updateUser) {
          updateUser({
            walletCredits: res.data.availableCredits,
            freeCredits: res.data.freeCredits,
            paidCredits: res.data.paidCredits,
          });
        }
      }
    } catch (err) {
      console.warn("Wallet load warning:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  // Handle coupon validation
  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await api.post("/api/wallet/coupon/validate", {
        couponCode: couponCode.trim(),
        packageId: selectedPack.id,
      });
      if (res?.data) {
        setAppliedCoupon(res.data);
        toast.success(`Coupon applied! ${res.data.discountPercent}% discount`);
      }
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.message || "Invalid or expired coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleOpenBuyModal = (pkg) => {
    if (pkg.isFree) {
      toast("Free Starter credits are granted upon registration.", { icon: "ℹ️" });
      return;
    }
    setSelectedPack(pkg);
    setCouponCode("");
    setAppliedCoupon(null);
    setTransactionId("");
    setAccountNumber("");
    setShowBuyModal(true);
  };

  // Calculate pricing
  const basePrice = selectedPack.priceBdt;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Submit manual payment order
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error("Please provide the Transaction ID from your payment SMS/receipt");
      return;
    }

    setSubmittingPayment(true);
    try {
      const res = await api.post("/api/wallet/payment-order", {
        packageId: selectedPack.id,
        couponCode: appliedCoupon?.code || "",
        paymentMethod,
        transactionId: transactionId.trim(),
        accountNumber: accountNumber.trim(),
        screenshotUrl: screenshotUrl.trim(),
        paidAmount: finalPrice,
      });

      toast.success(
        res?.message || "Payment submitted! Admin will verify within 1-2 hours.",
        { duration: 5000 }
      );
      setShowBuyModal(false);
      loadWallet();
    } catch (err) {
      toast.error(err.message || "Failed to submit payment order");
    } finally {
      setSubmittingPayment(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success(`Copied: ${text}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Student Finance</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">1 Credit = ৳100 BDT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Wallet className="w-7 h-7 text-cyan-400" />
            Wallet & Credit Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Admify is 100% credit-based with zero subscriptions. Access direct applications, AI tools, and agency services with Credits.
          </p>
        </div>

        <button
          onClick={() => handleOpenBuyModal(CREDIT_PACKAGES[1])}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Buy Credits</span>
        </button>
      </div>

      {/* ── Key Wallet Metrics Cards Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Available Credits */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-cyan-500/30 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Credits</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {wallet.availableCredits} <span className="text-sm text-cyan-400 font-bold">CR</span>
            </p>
            <p className="text-sm font-extrabold text-cyan-400 mt-1">
              ৳{(wallet.availableCredits * 100).toLocaleString("en-BD")} BDT
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Base Value: 1 CR = ৳100</span>
            <span className="text-cyan-400 font-semibold">Usable Balance</span>
          </div>
        </div>

        {/* Card 2: Free Welcome Credits */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Welcome Credits</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {wallet.freeCredits} <span className="text-sm text-amber-400 font-bold">CR</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {wallet.freeCreditsForfeited
                ? "Forfeited upon paid credit purchase"
                : wallet.isFreeExpired
                ? "Expired (1-month validity ended)"
                : wallet.freeCreditExpiresAt
                ? `Expires: ${new Date(wallet.freeCreditExpiresAt).toLocaleDateString()}`
                : "Valid for 1 month"}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300">
            {wallet.freeCreditsForfeited ? (
              <span className="text-slate-400">Paid credits only are active</span>
            ) : (
              <span>Covers 1 free $0 application (20 CR)</span>
            )}
          </div>
        </div>

        {/* Card 3: Paid Credits */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Credits</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black text-white">
              {wallet.paidCredits} <span className="text-sm text-emerald-400 font-bold">CR</span>
            </p>
            <p className="text-xs text-emerald-300 mt-1">
              ৳{(wallet.paidCredits * 100).toLocaleString("en-BD")} BDT
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Never expires</span>
          </div>
        </div>

        {/* Card 4: Usage Summary */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-purple-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credits Ledger</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-white">
              {wallet.totalUsedCredits} <span className="text-sm text-purple-400 font-bold">CR Used</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Purchased: {wallet.totalPurchasedCredits} CR
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
            <span>Deductions occur strictly on successful actions</span>
          </div>
        </div>
      </div>

      {/* ── Credit Packages Grid ──────────────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Official Credit Packages
            </h2>
            <p className="text-xs text-slate-400">
              Fixed rate: 1 Credit = ৳100 BDT. All platform payments are in BDT through manual verified transactions.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            Zero Recurring Fees • Pay As You Go
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CREDIT_PACKAGES.map((pkg) => {
            const isStarter = pkg.isFree;
            return (
              <div
                key={pkg.id}
                className={`p-5 rounded-2xl bg-[#07142D] border transition-all flex flex-col justify-between ${
                  pkg.id === "standard"
                    ? "border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10"
                    : pkg.id === "premium"
                    ? "border-purple-500/60"
                    : pkg.id === "ultimate"
                    ? "border-amber-500/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-extrabold text-white">{pkg.name}</h3>
                    {pkg.id === "standard" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        Popular
                      </span>
                    )}
                    {pkg.id === "premium" && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Agency Pack
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">{pkg.credits}</span>
                      <span className="text-xs font-bold text-cyan-400">CR</span>
                    </div>
                    <p className="text-sm font-black text-emerald-400 mt-1">
                      ৳{pkg.priceBdt.toLocaleString("en-BD")} <span className="text-[10px] text-slate-400 font-normal">BDT</span>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800">
                  {isStarter ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl text-xs font-bold bg-slate-800/80 text-slate-400 cursor-default"
                    >
                      Welcome Gift
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenBuyModal(pkg)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        pkg.id === "standard"
                          ? "bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] shadow-md shadow-cyan-500/20"
                          : "bg-slate-800 hover:bg-cyan-500 hover:text-[#050B1F] text-white"
                      }`}
                    >
                      Buy Credits
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Platform Service Costs Reference ─────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              Service Credit Costs Catalog
            </h2>
            <p className="text-xs text-slate-400">
              Credits are deducted only upon successful execution of the action. Opening a page costs 0 Credits.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">1 CR = ৳100 BDT</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {Object.values(CREDIT_COSTS).map((srv) => (
            <div
              key={srv.code}
              className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800/80 flex items-center justify-between"
            >
              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold text-white truncate">{srv.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{srv.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-black text-cyan-400">{srv.credits} CR</span>
                <span className="text-[10px] text-slate-400 block">৳{(srv.credits * 100).toLocaleString("en-BD")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Payment History & Credit Transaction History Tabs ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Payment History
            </h2>
            <span className="text-[11px] text-slate-400">Manual verification</span>
          </div>

          {wallet.paymentOrders.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 bg-[#07142D] rounded-2xl border border-slate-800">
              No payment history yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {wallet.paymentOrders.map((p) => {
                const statusColor =
                  p.status === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : p.status === "REJECTED"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30";

                return (
                  <div
                    key={p._id || p.orderId}
                    className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-300 font-bold">{p.orderId}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-white font-semibold">{p.packageName}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Txn ID: <strong className="text-slate-200">{p.transactionId}</strong> ({p.paymentMethod})
                      </span>
                      <span className="text-emerald-400 font-bold">
                        ৳{p.finalAmount?.toLocaleString("en-BD")} ({p.credits} CR)
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-800/80 pt-1.5">
                      <span>Submitted: {new Date(p.submittedDate || p.createdAt).toLocaleString()}</span>
                      {p.verifiedDate && <span>Verified: {new Date(p.verifiedDate).toLocaleDateString()}</span>}
                    </div>

                    {p.status === "REJECTED" && p.rejectionReason && (
                      <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                        Reason: {p.rejectionReason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Credit Transaction Ledger */}
        <div className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Credit Usage & Ledger
            </h2>
            <span className="text-[11px] text-slate-400">Audit trail</span>
          </div>

          {wallet.creditTransactions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 bg-[#07142D] rounded-2xl border border-slate-800">
              No credit transactions yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {wallet.creditTransactions.map((tx) => {
                const isPositive = tx.credits > 0;
                return (
                  <div
                    key={tx._id || tx.transactionId}
                    className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {isPositive ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{tx.desc}</p>
                        <span className="text-[10px] text-slate-400">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "Recent"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-black ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                        {isPositive ? `+${tx.credits} CR` : `${tx.credits} CR`}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Bal: {tx.balanceAfter} CR
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Buy Credits / Manual Payment Modal ──────────────────────── */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-8">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowBuyModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-6 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white">Purchase Credits — {selectedPack.name}</h3>
                <p className="text-xs text-slate-400">Submit manual payment proof for Admin verification (approx. 1–2 hours)</p>
              </div>
              <button
                onClick={() => setShowBuyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-2xl bg-[#0B1228] border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Package Credits:</span>
                <span className="font-extrabold text-white">{selectedPack.credits} CR</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Base Price (1 CR = ৳100):</span>
                <span className="font-medium text-slate-300">৳{basePrice.toLocaleString("en-BD")} BDT</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Coupon Discount ({appliedCoupon.discountPercent}% OFF):</span>
                  <span>-৳{discountAmount.toLocaleString("en-BD")} BDT</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 font-extrabold text-sm">
                <span className="text-white">Final Payable Amount:</span>
                <span className="text-cyan-400">৳{finalPrice.toLocaleString("en-BD")} BDT</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Promo Coupon (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-[#0B1228] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  disabled={validatingCoupon}
                  onClick={handleApplyCoupon}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs"
                >
                  {validatingCoupon ? "Checking..." : "Apply"}
                </button>
              </div>
            </div>

            {/* Manual Payment Instructions */}
            <div className="p-4 rounded-2xl bg-[#0B1228] border border-cyan-500/20 space-y-2 text-xs">
              <p className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Payment Accounts for ৳{finalPrice.toLocaleString("en-BD")} BDT:
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-slate-300">
                <div className="p-2 rounded-xl bg-[#07142D] border border-slate-800 flex justify-between items-center">
                  <span>bKash (Merchant): <strong>01711223344</strong></span>
                  <button type="button" onClick={() => copyToClipboard("01711223344")}>
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[#07142D] border border-slate-800 flex justify-between items-center">
                  <span>Nagad (Merchant): <strong>01811223344</strong></span>
                  <button type="button" onClick={() => copyToClipboard("01811223344")}>
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[#07142D] border border-slate-800 flex justify-between items-center">
                  <span>Rocket: <strong>01911223344-5</strong></span>
                  <button type="button" onClick={() => copyToClipboard("019112233445")}>
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[#07142D] border border-slate-800 flex justify-between items-center">
                  <span>City Bank: <strong>1102938475001</strong></span>
                  <button type="button" onClick={() => copyToClipboard("1102938475001")}>
                    <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Sender Phone / A/C</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Transaction ID (TrxID) *</label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 9K28DJ93X1"
                  className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[10px] text-slate-500">
                  Duplicate transaction IDs are strictly blocked server-side.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Payment Screenshot URL / Slip Note (Optional)</label>
                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="https://... or reference note"
                  className="w-full bg-[#0B1228] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuyModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-60"
                >
                  {submittingPayment ? "Submitting..." : `Submit ৳${finalPrice.toLocaleString("en-BD")} Payment`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditsPremiumPage;
