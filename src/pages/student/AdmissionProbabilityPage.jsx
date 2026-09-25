import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import {
  Calculator,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Building2,
  GraduationCap,
  Award,
  ArrowRight,
  Info,
  Send,
  Users2,
} from "lucide-react";
import toast from "react-hot-toast";

function AdmissionProbabilityPage() {
  const { user } = useAuth();

  const [university, setUniversity] = useState("Stanford University");
  const [program, setProgram] = useState("M.S. Computer Science");
  const [gpa, setGpa] = useState(user?.gpa || "3.8");
  const [ielts, setIelts] = useState(user?.ielts || "7.5");
  const [rank, setRank] = useState("3");
  const [workYears, setWorkYears] = useState("1.5");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Initial calculation on load
    handleCalculate();
  }, []);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const pred = await studentService.predictAdmission({
        gpa: parseFloat(gpa),
        ielts: parseFloat(ielts),
        universityRank: parseInt(rank, 10),
        workExperienceYears: parseFloat(workYears),
      });
      setResult(pred);
    } catch (err) {
      toast.error("Prediction calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const prob = result?.probability;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Discover</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Admissions Probability</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Calculator className="w-7 h-7 text-cyan-400" />
          Admission Probability Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Calculate an indicative admission estimate based on your academic GPA, test scores, and historical benchmarks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Side: Parameters (2 Cols) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Target Profile & Scores</span>
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Target Institution
              </label>
              <select
                value={university}
                onChange={(e) => {
                  setUniversity(e.target.value);
                  if (e.target.value === "Stanford University") setRank("3");
                  else if (e.target.value === "University of Oxford") setRank("2");
                  else if (e.target.value === "University of Toronto") setRank("21");
                  else setRank("50");
                }}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
              >
                <option value="Stanford University">Stanford University (QS #3)</option>
                <option value="University of Oxford">University of Oxford (QS #2)</option>
                <option value="University of Toronto">University of Toronto (QS #21)</option>
                <option value="ETH Zurich">ETH Zurich (QS #7)</option>
                <option value="National University of Singapore">NUS Singapore (QS #8)</option>
                <option value="Technical University of Munich">TUM Germany (QS #28)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Target Program
              </label>
              <input
                type="text"
                required
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. M.S. Computer Science"
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cumulative GPA
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="2.0"
                  max="4.0"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  English Score (IELTS)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="5.0"
                  max="9.0"
                  value={ielts}
                  onChange={(e) => setIelts(e.target.value)}
                  className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Relevant Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={workYears}
                onChange={(e) => setWorkYears(e.target.value)}
                className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-70 mt-2"
            >
              {loading ? "Calculating..." : "Calculate Estimated Probability"}
            </button>
          </form>
        </div>

        {/* Right Side: Prediction Visual & Key Drivers (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          {!result ? (
            <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
              <Calculator className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No probability calculated yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Fill out your academic profile on the left and click "Calculate Estimated Probability".
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                    Estimated Competitiveness
                  </span>
                  <h3 className="text-xl font-extrabold text-white">{university}</h3>
                  <p className="text-xs text-slate-400">{program}</p>
                </div>

                {/* Circular Gauge */}
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="54" className="stroke-slate-800" strokeWidth="12" fill="none" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      className="stroke-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="339"
                      strokeDashoffset={339 - (339 * prob) / 100}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{prob}%</span>
                    <span className="text-[10px] uppercase font-bold text-cyan-400">
                      Estimated
                    </span>
                  </div>
                </div>
              </div>

              {/* Key Matching Factors Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Key Profile Factors
                </h4>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-white font-medium">Academic GPA ({gpa})</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Evaluated</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-white font-medium">English Score (IELTS {ielts})</span>
                    </div>
                    <span className="text-emerald-400 font-bold">Evaluated</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-white font-medium">Experience ({workYears} years)</span>
                    </div>
                    <span className="text-cyan-400 font-bold">Evaluated</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2 mt-4">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <p>
                    <strong>Disclaimer:</strong> This is an indicative estimate based on historical admission data. It does not constitute or guarantee an official offer of admission.
                  </p>
                </div>
              </div>

            {/* Profile Optimization Tips */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Profile Optimization Tips
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result?.recommendations?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Neutral Disclaimer */}
            <div className="p-4 rounded-2xl bg-[#050B1F] border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Disclaimer:</strong> Admission probabilities are statistical estimates based on historical cohort indicators and do not guarantee an offer of admission. Institutional admissions committees review applications holistically.
              </p>
            </div>

            {/* Actions for this university */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Link
                to={`/student/direct-applications?uni=${encodeURIComponent(university)}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs transition-all shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply Directly to {university}</span>
              </Link>
              <Link
                to={`/student/agency-assistance?targetUni=${encodeURIComponent(university)}`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>Request Agency Assistance</span>
              </Link>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdmissionProbabilityPage;
