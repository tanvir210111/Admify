import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, ArrowRight, User, X, Sparkles, BookOpen, Heart, ThumbsUp } from "lucide-react";

function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedArticle, setSelectedArticle] = useState(null); // article object
  const [likes, setLikes] = useState({});

  const categories = [
    { code: "all", name: "All Articles" },
    { code: "visas", name: "Visa Guides" },
    { code: "admissions", name: "Admissions Hacks" },
    { code: "ai", name: "AI & EdTech" },
    { code: "life", name: "Student Life" }
  ];

  const featuredArticle = {
    title: "Navigating the 2026 Global Study Permit Allocations: A Data-Driven Guide",
    category: "visas",
    categoryLabel: "Visa Guides",
    readTime: "7 min read",
    date: "May 20, 2026",
    author: "Elena Petrova (Chief Advisor)",
    desc: "How international enrollment policies are shifting across Canada, the UK, and Australia in 2026, and how to utilize statistical profile modeling to map out reliable university fallbacks.",
    content: `International student enrollment guidelines are undergoing major modifications. Countries that historically offered highly predictable pathways—specifically Canada, Australia, and parts of Europe—have implemented revised caps, provincial allocations, and strict language testing indices to control student traffic.

For students planning their study abroad journeys for late 2026 or 2027, the standard application handbook is no longer sufficient.

1. The Attestation Dilemma
In Canada, the introduction of the Provincial Attestation Letter (PAL) requires direct verification before submitting a study permit. This adds an administrative layer that makes early applications crucial.

2. Australia's Ministerial Direction 107
Australian universities are now prioritized based on their risk indicators. High-risk profiles are experiencing slower processing times. Admify's university search tags have been updated to mark these risk categories transparently.

3. How to Navigate with Data Modeling
Instead of applying randomly, students should distribute their target list across dream, target, and safe brackets. Our AI university match calculations actively factor in these visa clearance fluctuations to help you optimize success.`,
    bgGlow: "from-purple-600/20 via-primary-600/10 to-transparent border-primary-500/30"
  };

  const articles = [
    {
      id: 1,
      title: "Securing Fully Funded Commonwealth Scholarships in the UK",
      category: "admissions",
      categoryLabel: "Admissions Hacks",
      readTime: "5 min read",
      date: "May 18, 2026",
      author: "Robert Chen (Former Dean)",
      desc: "An insider look into what commonwealth selectors prioritize in candidates, including leadership statements and developmental impacts.",
      content: `Winning a fully funded Commonwealth Scholarship is incredibly competitive. To stand out, you must understand the four developmental themes prioritized by the selection committee:

1. Scientific Innovation
2. Promoting Global Prosperity
3. Strengthening Resilience
4. Access and Inclusion

Your statement shouldn't just list academic achievements. It must detail how your education directly benefits your home country upon graduation. Use Admify's LOR generator to structure recommendation letters that emphasize your community impact and leadership capabilities.`
    },
    {
      id: 2,
      title: "Writing a Killer Statement of Purpose (SOP) Without Clichés",
      category: "ai",
      categoryLabel: "AI & EdTech",
      readTime: "6 min read",
      date: "May 14, 2026",
      author: "Sarah Lin (AI Lead)",
      desc: "Ditch phrases like 'Since my childhood...' and discover how to write an SOP focused on professional research and technical milestones.",
      content: `The most common mistake in statements of purpose is the opening cliché. Admissions committees read thousands of essays that begin with 'Since my early childhood, I have loved computers.' This immediately signals amateur writing.

Instead, start with action:
- A specific research question you investigated.
- A codebase latency hurdle you solved at work.
- A core mathematical proof that fascinated you.

Your SOP should read like a professional proposal. State clearly what you intend to study, which labs you plan to collaborate with, and what legacy you want to leave.`
    },
    {
      id: 3,
      title: "Toronto vs Melbourne: Living Cost & Student Job Breakdown",
      category: "life",
      categoryLabel: "Student Life",
      readTime: "8 min read",
      date: "May 10, 2026",
      author: "Marc Dupond (Growth Manager)",
      desc: "A realistic financial review comparing actual rent, grocery indices, transit costs, and hourly part-time wages in both cities.",
      content: `Choosing a study destination is as much a financial decision as it is academic. Toronto and Melbourne represent two of the most popular study destinations, but their costs differ significantly.

Rent Analysis:
- Toronto: Average shared room rent ranges from $800 to $1,100 CAD depending on proximity to downtown.
- Melbourne: Shared student apartments range from $750 to $950 AUD.

Work Allowances:
- Canada currently permits students to work up to 24 hours per week off-campus during academic terms.
- Australia permits students to work up to 48 hours per fortnight.

Use our integrated cost estimator on our University Search Page to calculate custom budgets tailored to your school selections.`
    }
  ];

  // Filtering Logic
  const filteredArticles = articles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "all" || art.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleLike = (title) => {
    setLikes((prev) => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <div className="py-12 md:py-20 relative">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-semibold mb-6 shadow-[0_0_15px_rgba(124,58,237,0.15)]"
          >
            <BookOpen className="w-4 h-4 text-primary-400" />
            Admissions Newsroom
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-6">
            Study Abroad <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">Insights</span>
          </h1>
          <p className="text-slate-300 text-lg font-light leading-relaxed">
            Get professional advice, country-wise visa strategies, scholarship updates, and tips on optimizing your profile matching scores from admissions advisors.
          </p>
        </div>

        {/* Featured Article Banner */}
        {(activeCategory === "all" || activeCategory === featuredArticle.category) && searchQuery === "" && (
          <div className="max-w-5xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-3xl p-8 md:p-12 border bg-gradient-to-br ${featuredArticle.bgGlow} shadow-2xl flex flex-col justify-between items-start gap-8 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl" />

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span className="bg-primary-600/20 border border-primary-500/30 text-primary-450 px-3 py-1 rounded-md">
                    {featuredArticle.categoryLabel}
                  </span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featuredArticle.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredArticle.readTime}</span>
                </div>

                <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight tracking-tight max-w-3xl hover:text-primary-400 transition-colors cursor-pointer" onClick={() => setSelectedArticle(featuredArticle)}>
                  {featuredArticle.title}
                </h2>

                <p className="text-slate-350 text-sm md:text-base font-light leading-relaxed max-w-4xl">
                  {featuredArticle.desc}
                </p>
              </div>

              <div className="w-full border-t border-slate-850 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-primary-400 text-sm font-bold">
                    EP
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{featuredArticle.author}</p>
                    <p className="text-slate-550 text-[10px]">Study Permit Specialist</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedArticle(featuredArticle)}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs md:text-sm px-5 py-3 transition-all border border-primary-500/50 shadow-[0_0_12px_rgba(124,58,237,0.2)] flex items-center gap-1.5"
                >
                  Read Featured Post <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Category Pills & Search Input panel */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch">
            
            {/* Categories */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 shrink-0 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.code}
                  onClick={() => setActiveCategory(cat.code)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 border ${
                    activeCategory === cat.code 
                      ? "bg-slate-800 border-slate-700 text-white shadow-lg" 
                      : "bg-slate-900/30 border-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative md:w-80 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 text-sm transition-all"
              />
            </div>

          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
          <AnimatePresence mode="popLayout">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  key={art.id}
                  className="glass rounded-3xl p-6 border border-slate-700/60 hover:border-slate-500/85 transition-all flex flex-col justify-between h-96 shadow-xl relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-400 uppercase">
                        {art.categoryLabel}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {art.readTime}
                      </span>
                    </div>

                    <h3 className="text-white font-extrabold text-base md:text-lg leading-snug tracking-tight mb-3 hover:text-primary-400 transition-colors cursor-pointer" onClick={() => setSelectedArticle(art)}>
                      {art.title}
                    </h3>

                    <p className="text-slate-400 text-xs font-light leading-relaxed line-clamp-3">
                      {art.desc}
                    </p>
                  </div>

                  <div className="border-t border-slate-850 pt-4 flex justify-between items-center mt-4">
                    <span className="text-slate-500 text-[10px] font-bold">By {art.author.split(" ")[0]}</span>
                    <button
                      onClick={() => setSelectedArticle(art)}
                      className="text-primary-400 hover:text-primary-300 font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      Read Post <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16 glass rounded-3xl border border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-650 mx-auto mb-3" />
                <h3 className="text-white font-bold text-base">No Articles Found</h3>
                <p className="text-slate-550 text-xs font-light mt-1">Try refining your search keyword or switching categories.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Article Reader Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="w-full max-w-3xl bg-slate-950 border border-slate-850 rounded-3xl p-8 md:p-10 relative overflow-y-auto max-h-[85vh] custom-scrollbar shadow-2xl shadow-black/80"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Article Header info */}
                <div className="space-y-4 mb-8 border-b border-slate-850 pb-6">
                  <span className="bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md border border-primary-500/20 inline-block">
                    {selectedArticle.categoryLabel}
                  </span>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                    {selectedArticle.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {selectedArticle.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selectedArticle.readTime}</span>
                    <span>•</span>
                    <span>{selectedArticle.date}</span>
                  </div>
                </div>

                {/* Read Content */}
                <div className="text-slate-300 text-sm md:text-base leading-relaxed font-light whitespace-pre-wrap space-y-4">
                  {selectedArticle.content}
                </div>

                {/* Likes Action */}
                <div className="border-t border-slate-850 mt-10 pt-6 flex justify-between items-center">
                  <button
                    onClick={() => toggleLike(selectedArticle.title)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all ${
                      likes[selectedArticle.title]
                        ? "bg-primary-600 border-primary-500 text-white shadow-[0_0_12px_rgba(124,58,237,0.3)]"
                        : "bg-slate-900 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${likes[selectedArticle.title] ? "fill-white" : ""}`} />
                    {likes[selectedArticle.title] ? "Liked!" : "Helpful Article"}
                  </button>

                  <span className="text-slate-500 text-xs font-semibold">Admify Editorial Review</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default BlogPage;
