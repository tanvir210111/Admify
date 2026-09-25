import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";
import { convertTextToDual } from "../../utils/currency";
import {
  Award,
  Search,
  Filter,
  Sparkles,
  Calendar,
  DollarSign,
  CheckCircle2,
  ExternalLink,
  Send,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function ScholarshipsSystemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const types = ["all", "merit", "need", "subject", "government"];
  const countries = [
    "all",
    "United Kingdom",
    "Canada",
    "United States",
    "Germany",
    "France",
    "Netherlands",
    "Ireland",
    "Sweden",
    "Finland",
    "Norway",
    "Denmark",
    "Switzerland",
    "Italy",
    "Spain",
    "Belgium",
    "Austria",
    "Japan",
    "South Korea",
    "Australia",
    "New Zealand",
  ];

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await studentService.getScholarships({
          search,
          type: filterType,
          country: countryFilter,
        });
        if (isMounted) setScholarships(data);
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
  }, [search, filterType, countryFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Discover</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Financial Aid & Grants</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Award className="w-7 h-7 text-cyan-400" />
          Scholarship System & AI Matching
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Match with government, institutional, and merit-based global study grants aligned with your academic standing.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0B1228] border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by scholarship title, sponsor, or field..."
            className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-[#07142D] border border-slate-700/60 rounded-xl py-2 px-3 text-white text-xs font-semibold focus:outline-none focus:border-cyan-500"
          >
            {countries.map((c) => (
              <option key={c} value={c} className="bg-[#07142D] text-white">
                {c === "all" ? "All Countries" : c}
              </option>
            ))}
          </select>

          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border capitalize transition-all whitespace-nowrap ${
                filterType === t
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-[#07142D] text-slate-400 border-slate-700/60 hover:text-white"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-6 w-20 bg-slate-800 rounded-full" />
                <div className="h-4 w-16 bg-slate-800 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-slate-800 rounded" />
              <div className="h-10 bg-slate-800/60 rounded-xl" />
            </div>
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
          <Award className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matching scholarships found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, country selection, or scholarship category filter.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterType("all");
              setCountryFilter("all");
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Scholarships Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scholarships.map((sch) => (
          <div
            key={sch.id}
            className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  {sch.match}% Match
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {sch.country && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                      {sch.country}
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                    {sch.type}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white leading-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {sch.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{sch.sponsor}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Funding Amount:</span>
                  <span className="text-emerald-400 font-extrabold">{convertTextToDual(sch.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="text-slate-300 font-medium">{sch.coverage}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Application Deadline:</span>
                  <span className="text-amber-400 font-medium">{sch.deadline}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Eligibility Criteria</span>
                <p className="line-clamp-2 leading-relaxed text-slate-400">{sch.eligibility}</p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => setSelectedScholarship(sch)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center"
              >
                View Requirements
              </button>
              <button
                onClick={() => {
                  toast.success("Scholarship checklist added to your application workspace");
                  navigate("/student/direct-applications");
                }}
                className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-extrabold transition-all text-center"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Details Modal */}
      {selectedScholarship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setSelectedScholarship(null)}
          />
          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Scholarship Details</span>
                <h2 className="text-xl font-extrabold text-white mt-1 leading-tight">{selectedScholarship.title}</h2>
                <p className="text-xs text-slate-400">{selectedScholarship.sponsor}</p>
              </div>
              <button
                onClick={() => setSelectedScholarship(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Country</span>
                <span className="text-cyan-300 font-bold truncate block">{selectedScholarship.country || "Global"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Funding</span>
                <span className="text-emerald-400 font-extrabold">{convertTextToDual(selectedScholarship.amount)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Deadline</span>
                <span className="text-amber-400 font-bold">{selectedScholarship.deadline}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">Required Submission Documents</h4>
              <ul className="space-y-1.5 text-slate-300">
                {selectedScholarship.requirements?.map((req, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedScholarship(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedScholarship(null);
                  navigate("/student/direct-applications");
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs"
              >
                Attach to Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScholarshipsSystemPage;
