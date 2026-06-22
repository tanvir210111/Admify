import React, { useState } from 'react';
import { Award, Search, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function ScholarshipsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const scholarships = [
    {
      id: 1,
      title: "Global Excellence Initiative",
      sponsor: "Admify Foundation",
      amount: "$15,000",
      coverage: "Partial Tuition",
      eligibility: "GPA 3.7+ & IELTS 7.5+",
      deadline: "June 15, 2026",
      match: "98%",
      type: "merit",
      status: "Eligible"
    },
    {
      id: 2,
      title: "Women in STEM Leaders",
      sponsor: "TechForward Alliance",
      amount: "Full Tuition",
      coverage: "100% Tuition",
      eligibility: "Female applicants, CS/Engineering",
      deadline: "July 01, 2026",
      match: "95%",
      type: "subject",
      status: "Eligible"
    },
    {
      id: 3,
      title: "Dean's Graduate Fellowship",
      sponsor: "Stanford University",
      amount: "$25,000 / Yr",
      coverage: "Tuition + Stipend",
      eligibility: "Top 5% Graduate applicants",
      deadline: "Aug 10, 2026",
      match: "92%",
      type: "merit",
      status: "Eligible"
    },
    {
      id: 4,
      title: "International Talents Grant",
      sponsor: "Global Education Fund",
      amount: "$10,000",
      coverage: "One-time Grant",
      eligibility: "Developing countries, GPA 3.5+",
      deadline: "June 30, 2026",
      match: "88%",
      type: "need",
      status: "Apply Now"
    }
  ];

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.sponsor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || s.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleApply = (title) => {
    toast.success(`Application drafted for "${title}"! Check your Documents.`, {
      style: {
        borderRadius: "10px",
        background: "#1e293b",
        color: "#fff",
        border: "1px solid rgba(51, 65, 85, 0.5)"
      }
    });
  };

  return (
    <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Award className="w-8 h-8 text-primary-400" /> Scholarships
          </h1>
          <p className="text-slate-400">
            Tailored financial aid matching your profile and academic achievements.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search scholarship name or sponsor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/40 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'merit', 'subject', 'need'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-sm font-medium rounded-xl capitalize transition-all ${
                filterType === type 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                  : 'bg-slate-800/40 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredScholarships.map((s, index) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass p-6 md:p-8 rounded-3xl border border-slate-700/50 bg-slate-900/80 hover:-translate-y-1 transition-transform relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-all pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2.5 py-1 bg-primary-500/10 text-primary-400 text-xs font-bold rounded-lg border border-primary-500/20">
                  {s.coverage}
                </span>
                <h2 className="text-xl font-bold text-white mt-3">{s.title}</h2>
                <p className="text-slate-400 text-sm">{s.sponsor}</p>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-black text-white">{s.amount}</span>
                <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                  {s.match} Match
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6 bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Eligibility:</span>
                <span className="text-slate-300 font-medium">{s.eligibility}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Deadline:</span>
                <span className="text-slate-300 font-medium">{s.deadline}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-green-400 font-bold">
                <CheckCircle2 className="w-4 h-4" /> {s.status}
              </div>
              <button
                onClick={() => handleApply(s.title)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-slate-700/50 flex items-center gap-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all"
              >
                Apply Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ScholarshipsPage;
