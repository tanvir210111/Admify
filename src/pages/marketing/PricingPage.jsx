import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, HelpCircle, AlertCircle, ArrowRight, ShieldCheck, Flame, Star } from "lucide-react";

function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState("annual"); // "monthly" or "annual"

  const plans = [
    {
      name: "Free Starter",
      tagline: "Explore the platform & matching.",
      price: { monthly: 0, annual: 0 },
      features: [
        "Up to 3 university recommendations",
        "Basic document checker (1 SOP scan)",
        "Global scholarship search access",
        "Email support",
        "Basic Application Tracker status"
      ],
      cta: "Start for Free",
      popular: false,
      icon: ShieldCheck,
      color: "border-slate-800 bg-slate-900/40"
    },
    {
      name: "Pro Path",
      tagline: "For active applications to top-tier schools.",
      price: { monthly: 49, annual: 39 },
      features: [
        "Unlimited AI university matching",
        "Full AI SOP & LOR generators",
        "Unlimited document reviews & checks",
        "Direct chat with certified advisors",
        "Priority application submittal support",
        "Cost of living & tuition estimators"
      ],
      cta: "Get Pro Access",
      popular: true,
      icon: Flame,
      color: "border-primary-500/50 bg-slate-900/60 shadow-[0_0_30px_rgba(124,58,237,0.15)]"
    },
    {
      name: "Elite Premium",
      tagline: "Ultimate dedicated mentorship & visa guarantee.",
      price: { monthly: 149, annual: 119 },
      features: [
        "Everything in Pro Path",
        "Dedicated study abroad advisor (1-on-1)",
        "Full mock visa interviews & checklists",
        "Direct university application fee waivers",
        "Guaranteed admissions offer or refund",
        "Post-landing accommodation assistance"
      ],
      cta: "Unlock Elite Path",
      popular: false,
      icon: Star,
      color: "border-blue-500/50 bg-slate-900/40 shadow-[0_0_30px_rgba(59,130,246,0.15)]"
    }
  ];

  const comparisonTable = [
    { feature: "AI Course Matching", free: "Basic (3)", pro: "Unlimited", elite: "Unlimited + Expert Review" },
    { feature: "AI SOP & LOR Writing", free: "Draft template only", pro: "Unlimited Generation", elite: "Unlimited + Editor Review" },
    { feature: "Advisor Consultations", free: "No", pro: "Text chat support", elite: "1-on-1 Dedicated Video Calls" },
    { feature: "Scholarship Matches", free: "Search list only", pro: "Priority Matching", elite: "Direct application assistance" },
    { feature: "Visa Interview Mocks", free: "No", pro: "AI mock module", elite: "Live panel mock reviews" },
    { feature: "Fee Waivers & Discounts", free: "No", pro: "No", elite: "Direct partner waivers (up to $500)" },
    { feature: "Post-Arrival Support", free: "No", pro: "Forum community", elite: "Accommodation & bank setup help" }
  ];

  const faqs = [
    { q: "Can I change my plan later?", a: "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time directly from your billing profile page." },
    { q: "What is your refund guarantee on the Elite package?", a: "We guarantee that you will receive at least one admissions letter from our mutually agreed university matches, or we will refund 100% of your consulting fee. Terms apply." },
    { q: "Are university application fees included?", a: "Application fees are charged directly by the respective universities. However, our Elite plan offers direct partner application fee waivers at over 400+ premium institutions." },
    { q: "Is there a student discount available?", a: "We run periodic seasonal promos. Reach out to our contact support chat with a valid university or high school ID card to inquire about specialized scholarship codes!" }
  ];

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
          >
            Flexible Billing Packages
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-8">
            Simple, Transparent <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed mb-10">
            Choose the perfect roadmap to your dream university. Save 20% on our annual plans.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="inline-flex items-center bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-slate-800 text-white border border-slate-700 shadow-lg" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === "annual" 
                  ? "bg-primary-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Annual Billing
              <span className="bg-white/20 text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-28 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            const priceVal = billingPeriod === "annual" ? plan.price.annual : plan.price.monthly;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`relative flex flex-col justify-between p-8 rounded-3xl border border-slate-700/60 hover:border-slate-500/80 transition-all ${plan.color}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
                    <Flame className="w-3.5 h-3.5 fill-white" /> Most Popular Choice
                  </div>
                )}

                <div>
                  {/* Plan Icon & Title */}
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-extrabold text-2xl">{plan.name}</h3>
                    <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center ${
                      plan.popular ? "text-primary-400" : "text-slate-400"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-slate-400 text-sm font-light mb-8 h-12 leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Pricing figure */}
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-slate-400 text-2xl font-light">$</span>
                    <span className="text-5xl font-black text-white leading-none tracking-tight">
                      {priceVal}
                    </span>
                    <span className="text-slate-500 text-sm ml-1">
                      / {billingPeriod === "annual" ? "mo billed annually" : "month"}
                    </span>
                  </div>

                  {/* Feature list */}
                  <div className="border-t border-slate-850 pt-8 mb-8 space-y-4">
                    <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">What's Included</p>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-slate-350 text-sm">
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <button className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                  plan.popular 
                    ? "bg-primary-600 hover:bg-primary-700 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-primary-500/50" 
                    : "bg-slate-950 hover:bg-slate-900 text-white border border-slate-800 hover:border-slate-700"
                }`}>
                  {plan.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Feature Comparison */}
        <div className="mb-28 max-w-4xl mx-auto">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12">
            Detailed Package Comparison
          </h2>

          <div className="glass rounded-3xl border border-slate-700/60 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-850">
                    <th className="p-6 text-slate-400 text-sm font-bold uppercase tracking-wider">Features</th>
                    <th className="p-6 text-white text-base font-extrabold">Starter</th>
                    <th className="p-6 text-primary-400 text-base font-extrabold">Pro Path</th>
                    <th className="p-6 text-blue-400 text-base font-extrabold">Elite Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-sm text-slate-300">
                  {comparisonTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/30 transition-all">
                      <td className="p-6 font-semibold text-white">{row.feature}</td>
                      <td className="p-6 text-slate-400 font-light">{row.free}</td>
                      <td className="p-6 font-light">{row.pro}</td>
                      <td className="p-6 font-light">{row.elite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass p-6 rounded-2xl border border-slate-700/50 flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-primary-400 shrink-0">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-base mb-2">{faq.q}</h4>
                  <p className="text-slate-400 text-sm font-light leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default PricingPage;
