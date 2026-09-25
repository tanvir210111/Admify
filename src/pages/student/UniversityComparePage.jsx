import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { studentService } from "../../services/studentService";
import { universityDatabase } from "../../data/universityDetails";
import { convertTextToDual } from "../../utils/currency";
import {
  GitCompare,
  Building2,
  Trash2,
  Plus,
  Send,
  Users2,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

function UniversityComparePage() {
  const navigate = useNavigate();
  const [compareSlugs, setCompareSlugs] = useState(() => studentService.getComparisonList());
  const [availableUnis, setAvailableUnis] = useState([]);

  useEffect(() => {
    async function load() {
      const all = await studentService.getUniversities();
      setAvailableUnis(all);
    }
    load();
  }, []);

  const handleRemove = (slug) => {
    try {
      const updated = studentService.toggleComparison(slug);
      setCompareSlugs(updated);
      toast.success("Removed from comparison");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAdd = (slug) => {
    try {
      const updated = studentService.toggleComparison(slug);
      setCompareSlugs(updated);
      toast.success("Added to comparison");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Resolve compared items
  const comparedItems = compareSlugs
    .map((slug) => {
      const data = universityDatabase[slug];
      if (data) {
        return {
          slug,
          name: data.name,
          country: data.location.split(",").pop().trim(),
          rank: data.rank || "N/A",
          acceptanceRate: data.acceptanceRate || "Not available",
          tuition: data.costs?.tuition ? convertTextToDual(data.costs.tuition) : "Not available",
          livingCost: data.costs?.housingAndFood ? convertTextToDual(data.costs.housingAndFood) : "Not available",
          totalEstimated: data.costs?.totalEstimated ? convertTextToDual(data.costs.totalEstimated) : "Not available",
          gpaReq: data.admissionReqs?.gpa || "Not specified",
          englishReq: data.admissionReqs?.englishProficiency || "Not specified",
          deadlines: data.applicationDeadline || "Not specified",
          scholarships: data.scholarshipsList?.map((s) => s.name).join(", ") || "Not available",
          popularPrograms: data.programs?.map((p) => p.name).slice(0, 3).join(", ") || "Not available",
          logo: data.logo,
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Discover</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Side-by-Side Analysis</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <GitCompare className="w-7 h-7 text-cyan-400" />
            University Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare tuition, living costs, entry standards, and scholarship opportunities across target universities.
          </p>
        </div>

        <Link
          to="/student/universities"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 transition-all"
        >
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Browse More Universities</span>
        </Link>
      </div>

      {comparedItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4">
          <GitCompare className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-white">No universities in comparison</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select universities from the discovery catalog to compare requirements, costs, and programs side-by-side.
          </p>
          <button
            onClick={() => navigate("/student/universities")}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-[#050B1F] font-bold text-xs"
          >
            Explore Universities
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Comparison Matrix Table */}
          <div className="rounded-3xl bg-[#0B1228] border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                {/* Table Header with University Names */}
                <thead>
                  <tr className="border-b border-slate-800 bg-[#07142D]">
                    <th className="p-4 sm:p-5 text-slate-400 font-bold uppercase tracking-wider w-44">
                      Parameters
                    </th>
                    {comparedItems.map((item) => (
                      <th key={item.slug} className="p-4 sm:p-5 min-w-[240px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{item.country}</span>
                            <h3 className="text-sm font-extrabold text-white leading-tight">{item.name}</h3>
                          </div>
                          <button
                            onClick={() => handleRemove(item.slug)}
                            className="p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {/* World Standing */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">QS World Ranking</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 font-bold text-white">
                        {item.rank}
                      </td>
                    ))}
                  </tr>

                  {/* Acceptance Rate */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Acceptance Rate</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4">
                        {item.acceptanceRate}
                      </td>
                    ))}
                  </tr>

                  {/* Annual Tuition */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Annual Tuition</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 font-extrabold text-cyan-300">
                        {convertTextToDual(item.tuition)}
                      </td>
                    ))}
                  </tr>

                  {/* Living Costs */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Est. Living Expenses</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4">
                        {convertTextToDual(item.livingCost)}
                      </td>
                    ))}
                  </tr>

                  {/* Total Annual Cost */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors bg-cyan-500/5">
                    <td className="p-4 font-bold text-cyan-400">Est. Total Annual</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 font-black text-white">
                        {convertTextToDual(item.totalEstimated)}
                      </td>
                    ))}
                  </tr>

                  {/* GPA Requirement */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Min GPA Requirement</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 text-slate-200">
                        {item.gpaReq}
                      </td>
                    ))}
                  </tr>

                  {/* English Requirement */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">English Standard</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 text-slate-200">
                        {item.englishReq}
                      </td>
                    ))}
                  </tr>

                  {/* Popular Programs */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Popular Programs</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 text-slate-200">
                        {item.popularPrograms}
                      </td>
                    ))}
                  </tr>

                  {/* Scholarships Available */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Scholarships</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 text-emerald-400 font-medium">
                        {item.scholarships}
                      </td>
                    ))}
                  </tr>

                  {/* Application Deadline */}
                  <tr className="hover:bg-[#07142D]/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">Deadlines</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 text-slate-200">
                        {item.deadlines}
                      </td>
                    ))}
                  </tr>

                  {/* Action Row */}
                  <tr className="bg-[#07142D]/80">
                    <td className="p-4 font-bold text-slate-400">Next Action</td>
                    {comparedItems.map((item) => (
                      <td key={item.slug} className="p-4 space-y-2">
                        <button
                          onClick={() => navigate(`/student/direct-applications?uni=${encodeURIComponent(item.name)}`)}
                          className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs shadow-sm transition-all"
                        >
                          Apply Directly
                        </button>
                        <button
                          onClick={() => navigate(`/student/agency-assistance?targetUni=${encodeURIComponent(item.name)}`)}
                          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
                        >
                          Agency Guidance
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UniversityComparePage;
