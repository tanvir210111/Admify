import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, MapPin, DollarSign, Award, CheckCircle, Sparkles, Filter, ChevronDown, Landmark } from "lucide-react";

function UniversitySearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCountry, setActiveCountry] = useState("all");
  const [activeDegree, setActiveDegree] = useState("all");
  const [activeDiscipline, setActiveDiscipline] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const countries = [
    { code: "all", name: "All Countries" },
    { code: "usa", name: "United States" },
    { code: "uk", name: "United Kingdom" },
    { code: "canada", name: "Canada" },
    { code: "australia", name: "Australia" },
    { code: "germany", name: "Germany" }
  ];

  const degrees = [
    { code: "all", name: "All Levels" },
    { code: "undergrad", name: "Bachelor's Degree" },
    { code: "grad", name: "Master's Degree" },
    { code: "phd", name: "Ph.D. / Doctorate" }
  ];

  const disciplines = [
    { code: "all", name: "All Fields" },
    { code: "cs", name: "Computer Science & AI" },
    { code: "business", name: "MBA & Business" },
    { code: "engineering", name: "Engineering" },
    { code: "health", name: "Medicine & Health" }
  ];

  // Fictional High-Fidelity Universities Data
  const universities = [
    {
      name: "Stanford University",
      location: "Stanford, California (USA)",
      country: "usa",
      ranking: "QS World Rank #3",
      degree: "grad",
      discipline: "cs",
      tuition: "$54,000 / year",
      match: 98,
      matchType: "Dream Match",
      badgeStyle: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
      tags: ["STEM Certified", "Direct integration", "Top Research Lab"]
    },
    {
      name: "University of Toronto",
      location: "Toronto, Ontario (Canada)",
      country: "canada",
      ranking: "QS World Rank #21",
      degree: "grad",
      discipline: "cs",
      tuition: "$42,000 / year",
      match: 95,
      matchType: "Target Match",
      badgeStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
      tags: ["STEM Certified", "3-Year PGWP Eligible", "Top Placement"]
    },
    {
      name: "Oxford University",
      location: "Oxford, Oxfordshire (UK)",
      country: "uk",
      ranking: "QS World Rank #2",
      degree: "grad",
      discipline: "business",
      tuition: "$49,000 / year",
      match: 94,
      matchType: "Dream Match",
      badgeStyle: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
      tags: ["Rhodes Scholars", "Historic Campus", "Executive Mentoring"]
    },
    {
      name: "University of Melbourne",
      location: "Melbourne, Victoria (Australia)",
      country: "australia",
      ranking: "QS World Rank #14",
      degree: "undergrad",
      discipline: "engineering",
      tuition: "$38,000 / year",
      match: 91,
      matchType: "Target Match",
      badgeStyle: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
      tags: ["2-Year PSW Eligible", "Industry Internship", "Sleek Living"]
    },
    {
      name: "Technical University of Munich",
      location: "Munich, Bavaria (Germany)",
      country: "germany",
      ranking: "QS World Rank #37",
      degree: "grad",
      discipline: "engineering",
      tuition: "$0 (Tuition Free)",
      match: 89,
      matchType: "Safe Match",
      badgeStyle: "bg-green-500/10 text-green-400 border border-green-500/25",
      tags: ["No Tuition Fees", "German Language Opt.", "Automotive Hub"]
    },
    {
      name: "Imperial College London",
      location: "London, England (UK)",
      country: "uk",
      ranking: "QS World Rank #6",
      degree: "grad",
      discipline: "cs",
      tuition: "$46,000 / year",
      match: 93,
      matchType: "Dream Match",
      badgeStyle: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
      tags: ["STEM Certified", "Direct Partner", "London HQ Placement"]
    }
  ];

  // Filtering Logic
  const filteredUniversities = universities.filter((uni) => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCountry = activeCountry === "all" || uni.country === activeCountry;
    const matchesDegree = activeDegree === "all" || uni.degree === activeDegree;
    const matchesDiscipline = activeDiscipline === "all" || uni.discipline === activeDiscipline;

    return matchesSearch && matchesCountry && matchesDegree && matchesDiscipline;
  });

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
          >
            <Landmark className="w-4 h-4" />
            Discover Your Academic Future
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Global University <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Search</span>
          </h1>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Search, filter, and evaluate admission probabilities at 4,000+ high-ranking international colleges and universities mapped with our customized AI models.
          </p>
        </div>

        {/* Global Search and Tab Filtering Section */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between mb-8">
            
            {/* Elegant Search Bar Input */}
            <div className="relative flex-grow">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by university name, city or specific tags (e.g. STEM, Tuition Free)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl pl-14 pr-6 py-4.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-light"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2.5 px-6 py-4.5 rounded-2xl border transition-all font-bold text-sm shrink-0 ${
                showFilters 
                  ? "bg-primary-600/20 border-primary-500 text-primary-300 shadow-[0_0_15px_rgba(124,58,237,0.25)]" 
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Quick Country Tabs */}
          <div className="flex gap-2.5 overflow-x-auto pb-3.5 custom-scrollbar border-b border-slate-850">
            {countries.map((c) => (
              <button
                key={c.code}
                onClick={() => setActiveCountry(c.code)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 border ${
                  activeCountry === c.code 
                    ? "bg-slate-800 border-slate-700 text-white shadow-lg shadow-black/20" 
                    : "bg-slate-900/30 border-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Collapsible Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Degree Filter Selector */}
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-3">Degree Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {degrees.map((d) => (
                        <button
                          key={d.code}
                          onClick={() => setActiveDegree(d.code)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            activeDegree === d.code 
                              ? "bg-primary-600/20 border-primary-500 text-primary-300" 
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                          }`}
                        >
                          {d.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discipline / field selector */}
                  <div>
                    <label className="block text-slate-400 text-xs uppercase tracking-wider font-bold mb-3">Discipline / Academic Field</label>
                    <div className="grid grid-cols-2 gap-2">
                      {disciplines.map((field) => (
                        <button
                          key={field.code}
                          onClick={() => setActiveDiscipline(field.code)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            activeDiscipline === field.code 
                              ? "bg-blue-600/20 border-blue-500 text-blue-300" 
                              : "bg-slate-950 border-slate-850 text-slate-400 hover:text-white"
                          }`}
                        >
                          {field.name}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Info */}
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
          <p className="text-slate-400 text-sm font-light">
            Showing <span className="text-white font-bold">{filteredUniversities.length}</span> matching institutions
          </p>
          {(activeCountry !== "all" || activeDegree !== "all" || activeDiscipline !== "all" || searchQuery !== "") && (
            <button
              onClick={() => {
                setActiveCountry("all");
                setActiveDegree("all");
                setActiveDiscipline("all");
                setSearchQuery("");
              }}
              className="text-primary-400 hover:text-primary-300 text-xs font-bold transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          <AnimatePresence mode="popLayout">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((uni, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={uni.name}
                  className="glass rounded-3xl p-6.5 border border-slate-700/60 hover:border-slate-500/80 transition-all flex flex-col justify-between shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-xl" />

                  {/* Card Top */}
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-white font-extrabold text-lg md:text-xl tracking-tight leading-snug">
                          {uni.name}
                        </h3>
                        <p className="text-slate-400 text-xs md:text-sm flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {uni.location}
                        </p>
                      </div>

                      {/* AI Match Badge */}
                      <div className="shrink-0 text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${uni.badgeStyle} flex items-center gap-1`}>
                          <Sparkles className="w-3 h-3 text-current animate-pulse" />
                          {uni.match}% Match
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold block mt-1 uppercase tracking-wide">
                          {uni.matchType}
                        </span>
                      </div>
                    </div>

                    {/* Rankings & Cost stats */}
                    <div className="grid grid-cols-3 gap-3 bg-slate-950/60 rounded-xl p-3.5 border border-slate-850 mb-6">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Rank</p>
                        <p className="text-white text-xs font-bold mt-0.5 flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" /> QS {uni.ranking.split("#")[1]}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Degree</p>
                        <p className="text-white text-xs font-bold mt-0.5">
                          {uni.degree === "grad" ? "Master's" : uni.degree === "undergrad" ? "Bachelor's" : "Ph.D."}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold">Tuition Est.</p>
                        <p className="text-white text-xs font-bold mt-0.5 flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3 text-emerald-400 shrink-0" /> {uni.tuition.split(" ")[0]}
                        </p>
                      </div>
                    </div>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {uni.tags.map((tag) => (
                        <span key={tag} className="bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-3 border-t border-slate-850 pt-5">
                    <button className="flex-grow py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs md:text-sm transition-all border border-primary-500/50 shadow-[0_0_12px_rgba(124,58,237,0.2)]">
                      Check AI Eligibility
                    </button>
                    <button className="px-4 py-3 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 font-bold rounded-xl text-xs md:text-sm transition-all">
                      Details
                    </button>
                  </div>

                </motion.div>
              ))
            ) : (
              <div className="col-span-2 text-center py-20 glass rounded-3xl border border-slate-800">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-bold text-lg">No Universities Found</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto font-light leading-relaxed">
                  We couldn't find matching institutions. Try broadening your query or choosing "All Countries".
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Country Showcase Segment */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white font-extrabold text-2xl md:text-3xl text-center mb-12">
            Top Study Destinations
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { country: "United States", stats: "1,200+ Courses", desc: "World leaders in research & innovation.", color: "from-blue-600/20 to-indigo-600/20 border-blue-500/20" },
              { country: "Canada", stats: "800+ Courses", desc: "Easy PGWP, high quality of living.", color: "from-red-600/20 to-rose-600/20 border-red-500/20" },
              { country: "United Kingdom", stats: "950+ Courses", desc: "Fast 1-year master's degrees.", color: "from-purple-600/20 to-pink-600/20 border-purple-500/20" },
              { country: "Australia", stats: "600+ Courses", desc: "Great post-study work opportunities.", color: "from-amber-600/20 to-orange-600/20 border-amber-500/20" }
            ].map((item, idx) => (
              <div key={idx} className={`glass bg-gradient-to-br ${item.color} p-6 rounded-2xl border flex flex-col justify-between h-48 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}>
                <div>
                  <h4 className="text-white font-extrabold text-lg">{item.country}</h4>
                  <span className="text-[10px] font-black uppercase text-primary-400 tracking-wide mt-1.5 inline-block">
                    {item.stats}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default UniversitySearchPage;
