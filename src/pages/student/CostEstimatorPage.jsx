import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calculator,
  PieChart,
  Globe,
  Home,
  Utensils,
  Shield,
  Plane,
  Briefcase,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { USD_TO_BDT_RATE } from "../../utils/currency";

// Country benchmark figures in USD
const COUNTRY_BENCHMARKS = {
  "United States": {
    currency: "USD",
    symbol: "$",
    avgTuition: 38000,
    accommodation: 14000,
    living: 8000,
    insurance: 2200,
    visaAndTravel: 2500,
  },
  "United Kingdom": {
    currency: "GBP",
    symbol: "£",
    avgTuition: 26000,
    accommodation: 11000,
    living: 7000,
    insurance: 1100,
    visaAndTravel: 2000,
  },
  "Canada": {
    currency: "CAD",
    symbol: "CA$",
    avgTuition: 32000,
    accommodation: 12000,
    living: 6500,
    insurance: 1200,
    visaAndTravel: 2200,
  },
  "Australia": {
    currency: "AUD",
    symbol: "A$",
    avgTuition: 36000,
    accommodation: 15000,
    living: 7500,
    insurance: 1400,
    visaAndTravel: 2400,
  },
  "Germany": {
    currency: "EUR",
    symbol: "€",
    avgTuition: 3000,
    accommodation: 6500,
    living: 5500,
    insurance: 1300,
    visaAndTravel: 1800,
  },
};

function CostEstimatorPage() {
  const [selectedCountry, setSelectedCountry] = useState("United States");
  const [programDurationYears, setProgramDurationYears] = useState(2);
  const [tuitionUsd, setTuitionUsd] = useState(COUNTRY_BENCHMARKS["United States"].avgTuition);
  const [accommodationUsd, setAccommodationUsd] = useState(COUNTRY_BENCHMARKS["United States"].accommodation);
  const [livingUsd, setLivingUsd] = useState(COUNTRY_BENCHMARKS["United States"].living);

  const currentBenchmark = COUNTRY_BENCHMARKS[selectedCountry];

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const b = COUNTRY_BENCHMARKS[country];
    setTuitionUsd(b.avgTuition);
    setAccommodationUsd(b.accommodation);
    setLivingUsd(b.living);
  };

  // Convert USD amounts to BDT
  const toBdt = (usd) => Math.round(usd * USD_TO_BDT_RATE);
  const formatBdt = (usd) => `৳${toBdt(usd).toLocaleString("en-BD")}`;
  const formatUsd = (usd) => `$${Math.round(usd).toLocaleString("en-US")}`;

  const annualUsd = tuitionUsd + accommodationUsd + livingUsd + currentBenchmark.insurance + currentBenchmark.visaAndTravel;
  const annualBdt = toBdt(annualUsd);

  const grandUsd = annualUsd * programDurationYears;
  const grandBdt = toBdt(grandUsd);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Discover</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Financial Planning (Primary: ৳ BDT, Secondary: $ USD)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 text-lg font-black">
            ৳
          </span>
          Study Abroad Cost Estimator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Calculate estimated annual tuition, living expenses, health insurance, and total program budget in <strong>Bangladeshi Taka (৳)</strong> with standard US Dollar ($) references.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Calculation Controls (3 Cols) */}
        <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Destination Country
                </label>
                <span className="text-[11px] text-cyan-400 font-semibold">1 USD = {USD_TO_BDT_RATE} BDT</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.keys(COUNTRY_BENCHMARKS).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCountryChange(c)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedCountry === c
                        ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                        : "bg-[#07142D] text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Program Duration
                </label>
                <select
                  value={programDurationYears}
                  onChange={(e) => setProgramDurationYears(Number(e.target.value))}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value={1}>1 Year (Intensive Master's)</option>
                  <option value={2}>2 Years (Standard Graduate)</option>
                  <option value={3}>3 Years (Bachelor's / UK)</option>
                  <option value={4}>4 Years (US/Can Bachelor's)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tuition Fee / Year (in USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    value={tuitionUsd}
                    onChange={(e) => setTuitionUsd(Number(e.target.value))}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-cyan-400 font-bold block mt-1">
                    ≈ {formatBdt(tuitionUsd)} BDT / year
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Housing & Rent / Year (in USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    value={accommodationUsd}
                    onChange={(e) => setAccommodationUsd(Number(e.target.value))}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-cyan-400 font-bold block mt-1">
                    ≈ {formatBdt(accommodationUsd)} BDT / year
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Food & Living / Year (in USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    value={livingUsd}
                    onChange={(e) => setLivingUsd(Number(e.target.value))}
                    className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[11px] text-cyan-400 font-bold block mt-1">
                    ≈ {formatBdt(livingUsd)} BDT / year
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#07142D] border border-slate-800 text-xs text-slate-400 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fixed Mandatory Costs</span>
              <div className="flex justify-between">
                <span>Health Insurance (Mandatory):</span>
                <span className="text-white font-medium">
                  {formatBdt(currentBenchmark.insurance)} <span className="text-slate-400 font-normal">({formatUsd(currentBenchmark.insurance)}) / yr</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span>Student Visa & Initial Airfare:</span>
                <span className="text-white font-medium">
                  {formatBdt(currentBenchmark.visaAndTravel)} <span className="text-slate-400 font-normal">({formatUsd(currentBenchmark.visaAndTravel)}) one-time</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Total Cost Breakdown Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1228] to-[#07142D] border border-cyan-500/30 space-y-6 shadow-xl">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Financial Summary ({selectedCountry})
              </span>
              <h3 className="text-xl font-extrabold text-white">Estimated Study Budget</h3>
            </div>

            {/* Primary in Taka, Secondary in USD */}
            <div className="p-5 rounded-2xl bg-[#050B1F] border border-slate-800 space-y-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Estimated Annual Cost</span>
                <p className="text-2xl sm:text-3xl font-black text-cyan-400 mt-1">
                  ৳{annualBdt.toLocaleString("en-BD")} <span className="text-xs text-cyan-300 font-bold">BDT / yr</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  (≈ ${annualUsd.toLocaleString("en-US")} USD per year)
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">
                  Estimated Total Budget ({programDurationYears} Year{programDurationYears > 1 ? "s" : ""})
                </span>
                <p className="text-3xl sm:text-4xl font-black text-white mt-1">
                  ৳{grandBdt.toLocaleString("en-BD")} <span className="text-xs text-cyan-400 font-bold">BDT Total</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  (≈ ${grandUsd.toLocaleString("en-US")} USD total degree cost)
                </p>
              </div>
            </div>

            {/* Expense Breakdown List in Dual Currency */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Tuition ({Math.round((tuitionUsd / annualUsd) * 100)}%)</span>
                <span className="text-white font-medium text-right">
                  <strong>{formatBdt(tuitionUsd)}</strong> <span className="text-slate-400 font-normal">({formatUsd(tuitionUsd)})</span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Housing & Rent</span>
                <span className="text-white font-medium text-right">
                  <strong>{formatBdt(accommodationUsd)}</strong> <span className="text-slate-400 font-normal">({formatUsd(accommodationUsd)})</span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Food & Living</span>
                <span className="text-white font-medium text-right">
                  <strong>{formatBdt(livingUsd)}</strong> <span className="text-slate-400 font-normal">({formatUsd(livingUsd)})</span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Insurance & Visa</span>
                <span className="text-white font-medium text-right">
                  <strong>{formatBdt(currentBenchmark.insurance + currentBenchmark.visaAndTravel)}</strong>{" "}
                  <span className="text-slate-400 font-normal">({formatUsd(currentBenchmark.insurance + currentBenchmark.visaAndTravel)})</span>
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/student/scholarships"
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20"
              >
                <span>Find Scholarships to Offset Cost</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostEstimatorPage;
