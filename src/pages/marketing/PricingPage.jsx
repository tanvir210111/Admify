import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Coins, 
  Check, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Layers, 
  Crown,
  FileText,
  Compass,
  Headphones,
  CheckCircle2
} from "lucide-react";
import { CREDIT_PACKAGES, SERVICE_CREDIT_COSTS, formatBDT } from "../../utils/creditConstants";

export default function PricingPage() {
  const packagesList = [
    {
      id: CREDIT_PACKAGES.FREE_STARTER.id,
      name: CREDIT_PACKAGES.FREE_STARTER.name,
      credits: CREDIT_PACKAGES.FREE_STARTER.credits,
      priceBDT: CREDIT_PACKAGES.FREE_STARTER.priceBDT,
      tagline: "Free 20 Welcome Credits for every verified student upon registration.",
      features: [
        "20 Welcome Credits (৳2,000 value)",
        "Valid for 30 days from sign up",
        "Covers 1x $0 University Direct Application (20 CR)",
        "Or AI Tools: 2x AI SOP Generations (10 CR ea)",
        "Or 4x Admission Probability Analyses (5 CR ea)"
      ],
      popular: false,
      icon: ShieldCheck,
      color: "border-slate-800 bg-[#0B1228]/80",
      cta: "Register for 20 Free Credits"
    },
    {
      id: CREDIT_PACKAGES.BASIC.id,
      name: CREDIT_PACKAGES.BASIC.name,
      credits: CREDIT_PACKAGES.BASIC.credits,
      priceBDT: CREDIT_PACKAGES.BASIC.priceBDT,
      tagline: "Ideal for active applicants using AI essay tools and multiple applications.",
      features: [
        "100 Non-Expiring Paid Credits",
        "5x $0 University Applications (20 CR ea)",
        "Full AI SOP & LOR Draft Generators",
        "Document Review & Probability Analyses",
        "Standard Counselor Q&A Support"
      ],
      popular: false,
      icon: Zap,
      color: "border-slate-750 bg-[#0B1228]",
      cta: "Purchase 100 Credits"
    },
    {
      id: CREDIT_PACKAGES.STANDARD.id,
      name: CREDIT_PACKAGES.STANDARD.name,
      credits: CREDIT_PACKAGES.STANDARD.credits,
      priceBDT: CREDIT_PACKAGES.STANDARD.priceBDT,
      tagline: "Our most balanced package for comprehensive university application cycles.",
      features: [
        "500 Non-Expiring Paid Credits",
        "Multiple University Direct Applications",
        "Comprehensive SOP/LOR Rewrites & Reviews",
        "University Comparison & Cost Analyses",
        "Priority Verification Processing"
      ],
      popular: true,
      badge: "Most Popular",
      icon: Layers,
      color: "border-purple-500/50 bg-[#0E1630] shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      cta: "Purchase 500 Credits"
    },
    {
      id: CREDIT_PACKAGES.PREMIUM.id,
      name: CREDIT_PACKAGES.PREMIUM.name,
      credits: CREDIT_PACKAGES.PREMIUM.credits,
      priceBDT: CREDIT_PACKAGES.PREMIUM.priceBDT,
      tagline: "High-volume tier including full Agency Assistance counseling support.",
      features: [
        "1,000 Non-Expiring Paid Credits",
        "Eligible for Agency Assistance (800 CR)",
        "Assigned Human Admissions Counselor",
        "Direct SOP/LOR Guidance & Checklist Review",
        "200 Buffer Credits for AI & App Processing"
      ],
      popular: false,
      icon: Sparkles,
      color: "border-blue-500/50 bg-[#0B1228]",
      cta: "Purchase 1,000 Credits"
    },
    {
      id: CREDIT_PACKAGES.ULTIMATE.id,
      name: CREDIT_PACKAGES.ULTIMATE.name,
      credits: CREDIT_PACKAGES.ULTIMATE.credits,
      priceBDT: CREDIT_PACKAGES.ULTIMATE.priceBDT,
      tagline: "Complete coverage for Full Agency Managed end-to-end processing.",
      features: [
        "2,000 Non-Expiring Paid Credits",
        "Eligible for Full Agency Managed Service (1,500 CR)",
        "Dedicated Managing Agent & Counselor Desk",
        "Complete Coordination & University Follow-ups",
        "500 Reserve Credits for All Applications & AI Tools"
      ],
      popular: false,
      badge: "Comprehensive",
      icon: Crown,
      color: "border-amber-500/40 bg-[#0B1228]",
      cta: "Purchase 2,000 Credits"
    }
  ];

  const serviceCosts = [
    { name: "$0 University Application", cost: `${SERVICE_CREDIT_COSTS.ZERO_FEE_APP} CR`, note: "Platform processing fee (no official university fee)" },
    { name: "Paid University Application Service", cost: `${SERVICE_CREDIT_COSTS.PAID_APP_SERVICE} CR + Official Fee`, note: "Platform application service + official university fee via Fee Agent" },
    { name: "AI University Recommendation", cost: `${SERVICE_CREDIT_COSTS.AI_RECOMMENDATION} CR`, note: "Full algorithmic profile matching" },
    { name: "Admission Probability Analysis", cost: `${SERVICE_CREDIT_COSTS.ADMISSION_PROBABILITY} CR`, note: "Predictive acceptance analytics" },
    { name: "AI SOP Generation", cost: `${SERVICE_CREDIT_COSTS.AI_SOP_GEN} CR`, note: "Custom-tailored Statement of Purpose" },
    { name: "SOP AI Rewrite/Improve", cost: `${SERVICE_CREDIT_COSTS.SOP_REWRITE} CR`, note: "Refinement, tone polish & optimization" },
    { name: "AI LOR Generation", cost: `${SERVICE_CREDIT_COSTS.AI_LOR_GEN} CR`, note: "Tailored Letter of Recommendation" },
    { name: "LOR AI Rewrite/Improve", cost: `${SERVICE_CREDIT_COSTS.LOR_REWRITE} CR`, note: "Academic tone enhancement" },
    { name: "Document Review", cost: `${SERVICE_CREDIT_COSTS.DOC_REVIEW} CR`, note: "Automated structure & compliance checks" },
    { name: "AI Scholarship Matching", cost: `${SERVICE_CREDIT_COSTS.SCHOLARSHIP_MATCH} CR`, note: "Curated funding opportunities" },
    { name: "University Comparison", cost: `${SERVICE_CREDIT_COSTS.UNI_COMPARE} CR`, note: "Side-by-side metric analytics" },
    { name: "Cost Estimator", cost: `${SERVICE_CREDIT_COSTS.COST_ESTIMATOR} CR`, note: "Living & tuition budgeting breakdown" },
    { name: "Agency Assistance (Assigned Counselor)", cost: `${SERVICE_CREDIT_COSTS.AGENCY_ASSISTANCE} CR`, note: "৳80,000 equivalent. Guidance, checklist & review support" },
    { name: "Full Agency Managed Service (End-to-End)", cost: `${SERVICE_CREDIT_COSTS.FULL_AGENCY_MANAGED} CR`, note: "৳1,50,000 equivalent. End-to-end managing agent & coordination" }
  ];

  const faqs = [
    {
      q: "Does Admify use monthly or annual subscriptions?",
      a: "No. Admify operates entirely on a transparent Credit model. There are zero subscriptions, zero renewals, and zero recurring fees. You purchase credits only when you need them."
    },
    {
      q: "What is the base value of 1 Credit?",
      a: "1 Credit = ৳100 BDT. All platform purchases are priced strictly in BDT (Bangladesh Taka). There are no USD fees or currency conversions on platform credit packages."
    },
    {
      q: "Do Credits expire?",
      a: "The 20 Free Welcome Credits expire after 1 month (30 days). All purchased Paid Credits NEVER expire and remain in your wallet indefinitely until used."
    },
    {
      q: "What happens to Welcome Credits when I purchase a Paid Package?",
      a: "Per platform rules, purchasing any paid credit package forfeits any remaining Free Welcome Credits. Your wallet transitions to non-expiring Paid Credits."
    },
    {
      q: "How does payment work?",
      a: "Payments are conducted via secure manual bank transfer or bKash/Nagad merchant transfer. You submit your transaction ID and receipt screenshot. Admify Admin verifies and credits your account within 1-2 hours."
    },
    {
      q: "Do Agency Services guarantee admission or visa approval?",
      a: "No. Neither Agency Assistance nor Full Agency Managed Service guarantees admission, scholarships, or visa issuance. They provide professional guidance, application management, and coordination support. Official university tuition and embassy fees remain separate."
    }
  ];

  return (
    <div className="py-12 md:py-20 relative bg-[#050B1F]">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-semibold mb-6"
          >
            <Coins className="w-4 h-4 text-purple-400" />
            100% Credit-Based Platform • 1 CR = ৳100 BDT
          </motion.div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Pay As You Go. <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Zero Subscriptions.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-lg font-normal leading-relaxed mb-6">
            Access direct university applications, AI admissions engines, and dedicated agency counseling services using Credits. Every new student gets 20 Welcome Credits (৳2,000 value).
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24 max-w-7xl mx-auto items-stretch">
          {packagesList.map((pkg, idx) => {
            const Icon = pkg.icon;
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl border transition-all ${pkg.color}`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Sparkles className="w-3 h-3 fill-white" /> {pkg.badge}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-white font-extrabold text-xl">{pkg.name}</h3>
                      <p className="text-purple-300 text-xs font-semibold mt-0.5">
                        {pkg.credits} Credits
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-slate-400 text-xs sm:text-sm font-normal mb-6 min-h-[40px] leading-relaxed">
                    {pkg.tagline}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {formatBDT(pkg.priceBDT)}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold ml-2">
                      BDT ({pkg.credits} CR)
                    </span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-6 mb-6 space-y-3">
                    <p className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                      Included With This Tier
                    </p>
                    {pkg.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-slate-300 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to="/student/credits"
                  className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    pkg.popular
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/40"
                      : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-750"
                  }`}
                >
                  {pkg.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Service Cost Ledger Table */}
        <div className="mb-24 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Standard Service Credit Costs
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Opening a page costs 0 Credits. Deductions only occur upon successful execution.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#0B1228] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="p-4 sm:p-5">Platform Service</th>
                    <th className="p-4 sm:p-5">Credit Cost</th>
                    <th className="p-4 sm:p-5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-xs sm:text-sm text-slate-300">
                  {serviceCosts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4 sm:p-5 font-semibold text-white flex items-center gap-2">
                        {item.name}
                      </td>
                      <td className="p-4 sm:p-5 font-bold text-purple-400 whitespace-nowrap">
                        {item.cost}
                      </td>
                      <td className="p-4 sm:p-5 text-slate-400 text-xs">
                        {item.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-800 bg-[#0B1228] flex gap-3.5">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm mb-1.5">{faq.q}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
