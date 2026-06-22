import React from "react";
import { Target, Search, Sparkles, Filter, CheckCircle2 } from "lucide-react";
function RecommendationPage() {
  const matches = [
    {
      name: "Stanford University",
      match: 98,
      prog: "M.S. Computer Science",
      status: "Ready to Apply",
    },
    {
      name: "University of Toronto",
      match: 92,
      prog: "M.Sc. Applied Computing",
      status: "SOP Generated",
    },
    {
      name: "ETH Zurich",
      match: 88,
      prog: "M.S. Data Science",
      status: "Profile Review",
    },
  ];
  return (
    <div className="space-y-8">
      {" "}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Matches
          </h1>{" "}
          <p className="text-slate-400">
            Your highly personalized university recommendations.
          </p>{" "}
        </div>{" "}
        <button className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-slate-600">
          {" "}
          <Filter className="w-4 h-4" /> Filter Results{" "}
        </button>{" "}
      </div>{" "}
      {/* Hero Banner */}{" "}
      <div className="bg-gradient-to-r from-primary-900/40 to-blue-900/40 border border-primary-500/20 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {" "}
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:20px_20px]" />{" "}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0 relative z-10">
          {" "}
          <Sparkles className="w-10 h-10 text-white font-bold" />{" "}
        </div>{" "}
        <div className="relative z-10">
          {" "}
          <h2 className="text-2xl font-bold text-white font-bold mb-2">
            Profile Analysis Complete
          </h2>{" "}
          <p className="text-slate-300 max-w-2xl">
            {" "}
            We've analyzed your academic records, test scores, and career goals
            against 10M+ data points. Here are your top matching
            institutions.{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      {/* Matches Grid */}{" "}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {" "}
        {matches.map((uni, i) => (
          <div
            key={i}
            className="glass p-6 rounded-2xl border border-slate-700/50 hover:border-primary-500/50 transition-colors group relative overflow-hidden"
          >
            {" "}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />{" "}
            <div className="flex justify-between items-start mb-6">
              {" "}
              <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center border border-slate-700/50">
                {" "}
                <Target className="w-6 h-6 text-primary-400" />{" "}
              </div>{" "}
              <div className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-bold flex items-center gap-1.5">
                {" "}
                <CheckCircle2 className="w-3 h-3" /> {uni.match}% Match{" "}
              </div>{" "}
            </div>{" "}
            <h3 className="text-xl font-bold text-white font-bold mb-1">
              {uni.name}
            </h3>{" "}
            <p className="text-slate-400 text-sm mb-6">{uni.prog}</p>{" "}
            <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
              {" "}
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {uni.status}
              </span>{" "}
              <button className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors">
                {" "}
                View Details{" "}
              </button>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}
export default RecommendationPage;
