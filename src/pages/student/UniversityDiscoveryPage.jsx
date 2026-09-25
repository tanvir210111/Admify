import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { convertTextToDual } from "../../utils/currency";
import {
  Building2,
  Search,
  Filter,
  MapPin,
  GraduationCap,
  Award,
  Bookmark,
  GitCompare,
  Send,
  Users2,
  X,
  ExternalLink,
  CheckCircle2,
  Calendar,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

function UniversityDiscoveryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [countryFilter, setCountryFilter] = useState("all");
  const [savedUnis, setSavedUnis] = useState(() => studentService.getSavedUniversities());
  const [compareList, setCompareList] = useState(() => studentService.getComparisonList());
  const [selectedUniModal, setSelectedUniModal] = useState(null);

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
        const data = await studentService.getUniversities({
          search,
          country: countryFilter,
        });
        if (isMounted) setUniversities(data);
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
  }, [search, countryFilter]);

  const handleToggleSave = (slug) => {
    const updated = studentService.toggleSaveUniversity(slug);
    setSavedUnis(updated);
    toast.success(updated.includes(slug) ? "Added to saved shortlist" : "Removed from shortlist");
  };

  const handleToggleCompare = (slug) => {
    try {
      const updated = studentService.toggleComparison(slug);
      setCompareList(updated);
      toast.success(updated.includes(slug) ? "Added to comparison list" : "Removed from comparison");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Discover</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Institutional Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-cyan-400" />
            University Discovery
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore world-class partner institutions, check admission thresholds, and compare programs globally.
          </p>
        </div>

        {compareList.length > 0 && (
          <Link
            to="/student/compare"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/25 transition-all shadow-sm"
          >
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span>Compare {compareList.length} Selected Universities →</span>
          </Link>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by university name, program, location..."
              className="w-full bg-[#07142D] border border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-[#07142D] border border-slate-700/60 rounded-xl py-3 px-4 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 w-full sm:w-44"
            >
              <option value="all">All Countries</option>
              {countries.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-3xl bg-[#0B1228] border border-slate-800 overflow-hidden animate-pulse">
              <div className="h-44 bg-slate-800/80" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-24 bg-slate-800 rounded" />
                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : universities.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matching universities found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting a different country.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setCountryFilter("all");
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Universities Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {universities.map((uni) => {
          const isSaved = savedUnis.includes(uni.slug);
          const isComparing = compareList.includes(uni.slug);

          return (
            <div
              key={uni._id || uni.slug}
              className="rounded-3xl bg-[#0B1228] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between overflow-hidden group shadow-lg"
            >
              {/* Cover Image Header */}
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                <img
                  src={uni.coverImage || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800"}
                  alt={uni.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1228] via-[#0B1228]/40 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#050B1F]/90 text-cyan-300 border border-slate-700 backdrop-blur-md">
                    {uni.rank ? (uni.rank.startsWith('#') || uni.rank.toLowerCase().includes('rank') ? uni.rank : `Rank: ${uni.rank}`) : "N/A"}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleSave(uni.slug)}
                    className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                      isSaved
                        ? "bg-amber-500 text-white border-amber-400"
                        : "bg-slate-900/70 text-slate-300 border-slate-700 hover:text-white"
                    }`}
                    title={isSaved ? "Saved" : "Save to shortlist"}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{uni.country}</span>
                  <h3 className="text-base font-extrabold text-white leading-tight truncate">{uni.name}</h3>
                </div>
              </div>

              {/* Card Information */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Location:</span>
                    <span className="text-slate-300 font-medium truncate max-w-[180px]">{uni.location}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Annual Tuition:</span>
                    <span className="text-cyan-300 font-semibold">{convertTextToDual(uni.tuition)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Application Fee:</span>
                    <span className={`font-semibold ${uni.isZeroFee ? "text-emerald-400" : "text-amber-300"}`}>
                      {uni.applicationFeeDisplay || (uni.isZeroFee ? "৳0 ($0) - Free" : (uni.applicationFee ? convertTextToDual(uni.applicationFee) : "Standard Fee"))}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Acceptance Rate:</span>
                    <span className="text-slate-300 font-medium">{uni.acceptanceRate || "Not available"}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Key Programs:</span>
                    <span className="text-white font-medium truncate max-w-[180px]">
                      {uni.programs?.map((p) => p.name).slice(0, 2).join(", ") || "Not available"}
                    </span>
                  </div>
                </div>

                {/* Primary Card Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedUniModal(uni)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all text-center"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleToggleCompare(uni.slug)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                        isComparing
                          ? "bg-cyan-500 text-[#050B1F] border-cyan-400 font-extrabold"
                          : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                      }`}
                    >
                      {isComparing ? "✓ Compared" : "Compare"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => navigate(`/student/direct-applications?uni=${encodeURIComponent(uni.name)}`)}
                      className="py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-extrabold transition-all text-center flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Apply Directly</span>
                    </button>
                    <button
                      onClick={() => navigate(`/student/agency-assistance?targetUni=${encodeURIComponent(uni.name)}`)}
                      className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Users2 className="w-3 h-3" />
                      <span>Agency Help</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* University Details Modal */}
      {selectedUniModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setSelectedUniModal(null)}
          />
          <div className="relative z-10 w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-6 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {selectedUniModal.country}
                </span>
                <h2 className="text-2xl font-extrabold text-white leading-tight mt-1">
                  {selectedUniModal.name}
                </h2>
                <p className="text-xs text-slate-400">{selectedUniModal.location}</p>
              </div>
              <button
                onClick={() => setSelectedUniModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">World Rank</span>
                <span className="text-white font-bold">{selectedUniModal.rank || "N/A"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">App Fee</span>
                <span className={`font-bold ${selectedUniModal.isZeroFee ? "text-emerald-400" : "text-amber-300"}`}>
                  {selectedUniModal.applicationFeeDisplay || (selectedUniModal.isZeroFee ? "৳0 ($0) Free" : (selectedUniModal.applicationFee ? convertTextToDual(selectedUniModal.applicationFee) : "Standard Fee"))}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Acceptance Rate</span>
                <span className="text-white font-bold">{selectedUniModal.acceptanceRate || "Not available"}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Tuition</span>
                <span className="text-cyan-300 font-bold">{convertTextToDual(selectedUniModal.tuition)}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Intake Season</span>
                <span className="text-white font-bold">{selectedUniModal.intake || "Upcoming Intake"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Programs Offered</h4>
              <div className="flex flex-wrap gap-2">
                {selectedUniModal.programs?.map((prog, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-[#0B1228] border border-slate-800 text-xs text-slate-300"
                  >
                    {prog.name} ({prog.degree})
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-[#0B1228] p-4 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Admission Requirements</h4>
              <p>• GPA Benchmark: {selectedUniModal.admissionReqs?.gpa || "Not specified"}</p>
              <p>• Language Test: {selectedUniModal.admissionReqs?.englishProficiency || "Not specified"}</p>
              <p>• Standardized Test: {selectedUniModal.admissionReqs?.testScores || "Not specified"}</p>
              <p>• Application Deadline: {selectedUniModal.applicationDeadline || "Not specified"}</p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setSelectedUniModal(null);
                  navigate(`/student/direct-applications?uni=${encodeURIComponent(selectedUniModal.name)}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-bold text-xs shadow-md transition-all"
              >
                Apply Directly
              </button>
              <button
                onClick={() => {
                  setSelectedUniModal(null);
                  navigate(`/student/agency-assistance?targetUni=${encodeURIComponent(selectedUniModal.name)}`);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
              >
                Request Agency Assistance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityDiscoveryPage;
