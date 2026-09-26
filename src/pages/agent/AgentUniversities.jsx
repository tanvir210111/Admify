import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  MapPin,
  GraduationCap,
  Calendar,
  DollarSign,
  Globe2,
  Eye,
  RefreshCw,
  X,
  FileCheck,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentUniversities() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedUni, setSelectedUni] = useState(null);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/universities");
      if (res?.data?.success) {
        setUniversities(res.data.data.universities || []);
      }
    } catch (err) {
      console.error("Failed to load universities:", err);
      toast.error("Failed to load universities directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const countries = Array.from(
    new Set(universities.map((u) => u.country).filter(Boolean))
  ).sort();

  const filteredUnis = universities.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (u.name || "").toLowerCase().includes(q) ||
      (u.location || "").toLowerCase().includes(q) ||
      (u.country || "").toLowerCase().includes(q);

    const matchesCountry =
      selectedCountry === "all" ||
      (u.country || "").toLowerCase() === selectedCountry.toLowerCase();

    return matchesSearch && matchesCountry;
  });

  // Currency helper: BDT primary, USD secondary
  const formatTuition = (fee) => {
    if (!fee) return "Tuition on Inquiry";
    // If string already formatted
    if (typeof fee === "string") return fee;
    // If numeric in USD
    const usd = Number(fee);
    const bdt = usd * 122; // Admify benchmark conversion
    return `BDT ${bdt.toLocaleString()} (~$${usd.toLocaleString()} USD)`;
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-violet-400" /> Universities & Academic Programs Catalog
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Browse institutional admission criteria, tuition benchmarks (BDT primary / USD secondary), deadlines, and entry requirements for counseling.
          </p>
        </div>

        <button
          onClick={fetchUniversities}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row gap-3 p-3 rounded-2xl border"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search universities by institution name, city, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-slate-200 focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Countries ({countries.length})</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Grid of Universities */}
      <motion.div variants={fade}>
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm rounded-2xl border border-white/10 bg-[#0B1228]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading university admissions repository...
          </div>
        ) : filteredUnis.length === 0 ? (
          <div className="p-16 text-center rounded-2xl border border-white/10 bg-[#0B1228]">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Universities Found</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              No academic institutions match your current search parameters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnis.map((uni) => (
              <div
                key={uni._id}
                onClick={() => setSelectedUni(uni)}
                className="p-5 rounded-2xl border hover:border-violet-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                style={{
                  background: "rgba(11, 18, 40, 0.7)",
                  borderColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-black shrink-0">
                        {uni.name ? uni.name.charAt(0) : "U"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">
                          {uni.name}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{uni.location || uni.country}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-white/10">
                      {uni.ranking ? `#${uni.ranking} Global` : "Accredited"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {uni.description || "Leading higher education institution offering global recognized undergraduate and postgraduate degrees."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[11px]">Tuition Range:</span>
                    <span className="font-bold text-white">
                      {uni.tuitionFee ? formatTuition(uni.tuitionFee) : "BDT 1,500,000 - 3,200,000"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-[11px]">Acceptance:</span>
                    <span className="text-emerald-400 font-semibold">{uni.acceptanceRate || "Competitive"}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUni(uni);
                    }}
                    className="w-full mt-2 py-1.5 rounded-xl bg-slate-900/80 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/40 text-violet-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Counselor Factsheet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Drawer: Detailed University Factsheet */}
      <AnimatePresence>
        {selectedUni && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-xl h-full bg-[#0B1228] border-l border-white/10 p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                    Institutional Factsheet
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{selectedUni.name}</h2>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {selectedUni.location || selectedUni.country}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUni(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Benchmark Pricing */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tuition & Financial Benchmark
                </div>
                <div className="text-base font-black text-cyan-400">
                  {selectedUni.tuitionFee ? formatTuition(selectedUni.tuitionFee) : "BDT 1,800,000 / Year (~$15,000 USD)"}
                </div>
                <div className="text-[11px] text-slate-400">
                  Application Fee: <span className="text-white font-semibold">{selectedUni.applicationFee ? `BDT ${(selectedUni.applicationFee * 122).toLocaleString()} (~$${selectedUni.applicationFee} USD)` : "Waivers Available"}</span>
                </div>
              </div>

              {/* Admission Criteria */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Minimum Eligibility Guidelines
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Undergraduate GPA</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {selectedUni.minGpa || "3.00 / 4.00 or 60%"}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">IELTS Score</span>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {selectedUni.ieltsRequirement || "6.5 (No band < 6.0)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Intakes & Deadlines */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Upcoming Admissions Intakes
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Autumn / Fall Intake</div>
                      <div className="text-[11px] text-slate-500">Major Admissions Window</div>
                    </div>
                    <span className="text-xs font-bold text-violet-400">Deadline: June 30</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Spring / Winter Intake</div>
                      <div className="text-[11px] text-slate-500">Secondary Intake</div>
                    </div>
                    <span className="text-xs font-bold text-cyan-400">Deadline: October 15</span>
                  </div>
                </div>
              </div>

              {/* Counselor Note */}
              <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-violet-300">Counselor Notice:</div>
                <p className="text-slate-400 text-[11px]">
                  Institutional requirements and fee structures are administered centrally by the partner university and Admify admission office.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
