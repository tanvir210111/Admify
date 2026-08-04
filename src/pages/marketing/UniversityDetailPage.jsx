import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Award, Users, Globe, BookOpen, Building, 
  Banknote, ArrowLeft, CheckCircle, GraduationCap, ChevronRight,
  Info, FileText, Calendar, Wallet, Briefcase, Heart,
  PieChart
} from "lucide-react";
import toast from "react-hot-toast";
import { universityDatabase } from "../../data/universityDetails";

function UniversityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const uni = universityDatabase[id];

  if (!uni) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 pb-12">
        <h1 className="text-4xl font-bold text-white mb-4">University Not Found</h1>
        <p className="text-slate-400 mb-8">We couldn't find details for this university.</p>
        <Link to="/university-search" className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all">
          Back to Search
        </Link>
      </div>
    );
  }

  const isLocalImage = uni.logo.startsWith('/');

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "admissions", label: "Admissions", icon: FileText },
    { id: "costs", label: "Costs & Aid", icon: Wallet },
    { id: "campus", label: "Campus Life", icon: Heart },
    { id: "careers", label: "Careers", icon: Briefcase }
  ];

  return (
    <div className="pb-20 relative min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] w-full">
        <div className="absolute inset-0">
          <img src={uni.coverImage} alt={`${uni.name} Campus`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>
        
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-6 pb-12">
            <Link to="/university-search" className="inline-flex items-center text-slate-300 hover:text-white text-sm font-medium mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Search
            </Link>
            
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 md:gap-8">
              {/* Logo */}
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-3xl bg-white p-4 shrink-0 shadow-2xl border-4 border-slate-900 z-10">
                <img 
                  src={uni.logo} 
                  alt={`${uni.name} Logo`} 
                  className={`w-full h-full ${isLocalImage ? 'object-contain' : 'object-cover'} rounded-xl`} 
                />
              </div>
              
              <div className="pb-2 z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold border border-primary-500/30">
                    <Award className="w-3.5 h-3.5 mr-1.5" />
                    {uni.rank}
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    {uni.acceptanceRate} Acceptance
                  </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tight drop-shadow-lg">{uni.name}</h1>
                <p className="text-slate-300 text-lg md:text-xl flex items-center font-light drop-shadow">
                  <MapPin className="w-5 h-5 mr-2 text-primary-400" />
                  {uni.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            
            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto custom-scrollbar gap-2 mb-8 border-b border-slate-800 pb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm transition-all border-b-2 shrink-0 ${
                    activeTab === tab.id 
                      ? "border-primary-500 text-primary-400 bg-primary-500/5 rounded-t-lg" 
                      : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-t-lg"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary-400' : 'text-slate-500'}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[500px]">
              <AnimatePresence mode="wait">
                
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-10"
                  >
                    <section>
                      <h3 className="text-2xl font-bold text-white mb-4">About the University</h3>
                      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800 text-slate-300 font-light leading-relaxed space-y-4 text-base md:text-lg">
                        <p>{uni.about}</p>
                        <p>{uni.history}</p>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-2xl font-bold text-white mb-4">Quick Demographics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass p-5 rounded-2xl border border-slate-800 text-center">
                          <Users className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                          <p className="text-white font-bold text-xl">{uni.totalStudents}</p>
                          <p className="text-slate-500 text-xs font-bold uppercase mt-1">Total Students</p>
                        </div>
                        <div className="glass p-5 rounded-2xl border border-slate-800 text-center">
                          <Globe className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                          <p className="text-white font-bold text-xl">{uni.internationalPct}</p>
                          <p className="text-slate-500 text-xs font-bold uppercase mt-1">International</p>
                        </div>
                        <div className="glass p-5 rounded-2xl border border-slate-800 text-center">
                          <PieChart className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                          <p className="text-white font-bold text-xl">{uni.facultyStudentRatio}</p>
                          <p className="text-slate-500 text-xs font-bold uppercase mt-1">Student:Faculty</p>
                        </div>
                        <div className="glass p-5 rounded-2xl border border-slate-800 text-center">
                          <Award className="w-8 h-8 mx-auto text-amber-400 mb-2" />
                          <p className="text-white font-bold text-xl">{uni.acceptanceRate}</p>
                          <p className="text-slate-500 text-xs font-bold uppercase mt-1">Acceptance Rate</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-2xl font-bold text-white mb-4">Popular Programs</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {uni.programs.map((prog, idx) => (
                          <div key={idx} className="glass p-5 rounded-xl border border-slate-800 flex items-start gap-3">
                            <GraduationCap className="w-6 h-6 text-primary-400 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="text-white font-bold text-lg">{prog.name}</h4>
                              <p className="text-slate-400 text-sm mt-1">{prog.degree}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {/* ADMISSIONS TAB */}
                {activeTab === "admissions" && (
                  <motion.div
                    key="admissions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div className="glass p-8 rounded-3xl border border-slate-800 bg-slate-900/50">
                      <div className="flex items-center gap-3 mb-6">
                        <Calendar className="w-6 h-6 text-primary-400" />
                        <h3 className="text-2xl font-bold text-white">Application Deadlines</h3>
                      </div>
                      <p className="text-lg text-white font-medium bg-slate-950 p-4 rounded-xl border border-slate-800">
                        {uni.applicationDeadline}
                      </p>
                      
                      <div className="mt-6">
                        <h4 className="text-slate-400 text-sm font-bold uppercase mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Intake Seasons
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {uni.intakeSeasons.map((season, idx) => (
                            <span key={idx} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium border border-slate-700">
                              {season}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass p-6 rounded-2xl border border-slate-800">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-400" /> Academic Requirements
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">GPA / Grades</p>
                            <p className="text-slate-300 mt-1">{uni.admissionReqs.gpa}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">Test Scores</p>
                            <p className="text-slate-300 mt-1">{uni.admissionReqs.testScores}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">English Proficiency</p>
                            <p className="text-slate-300 mt-1">{uni.admissionReqs.englishProficiency}</p>
                          </div>
                        </div>
                      </div>

                      <div className="glass p-6 rounded-2xl border border-slate-800">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-400" /> Required Documents
                        </h4>
                        <ul className="space-y-3">
                          {uni.admissionReqs.documents.map((doc, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-300">
                              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* COSTS & AID TAB */}
                {activeTab === "costs" && (
                  <motion.div
                    key="costs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div className="glass p-8 rounded-3xl border border-emerald-500/20 bg-emerald-950/10">
                      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Wallet className="w-6 h-6 text-emerald-400" /> Estimated Annual Costs (USD/Local)
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                          <span className="text-slate-300 font-medium">Tuition Fees</span>
                          <span className="text-white font-bold">{uni.costs.tuition}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                          <span className="text-slate-300 font-medium">Housing & Food</span>
                          <span className="text-white font-bold">{uni.costs.housingAndFood}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                          <span className="text-slate-300 font-medium">Books & Supplies</span>
                          <span className="text-white font-bold">{uni.costs.booksAndSupplies}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                          <span className="text-slate-300 font-medium">Student Fees</span>
                          <span className="text-white font-bold">{uni.costs.studentFees}</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/30 mt-2">
                          <span className="text-emerald-400 font-bold text-lg">Total Estimated Cost</span>
                          <span className="text-white font-black text-xl">{uni.costs.totalEstimated}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800">
                      <h4 className="text-white font-bold text-2xl mb-6 flex items-center gap-3">
                        <Award className="w-7 h-7 text-amber-400" /> Scholarships & Financial Aid
                      </h4>
                      <div className="space-y-4">
                        {uni.scholarshipsList?.map((scholarship, idx) => (
                          <div key={idx} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-2">
                              <h5 className="text-white font-bold text-lg">{scholarship.name}</h5>
                              <span className="inline-flex items-center px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-bold whitespace-nowrap">
                                {scholarship.amount}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{scholarship.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CAMPUS LIFE TAB */}
                {activeTab === "campus" && (
                  <motion.div
                    key="campus"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    <div className="glass p-6 rounded-2xl border border-slate-800">
                      <h4 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                        <Building className="w-6 h-6 text-primary-400" /> Housing & Accommodation
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-lg">
                        {uni.housing}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="glass p-6 rounded-2xl border border-slate-800">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-400" /> Key Facilities
                        </h4>
                        <ul className="space-y-3">
                          {uni.facilities.map((fac, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-300">
                              <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                              {fac}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass p-6 rounded-2xl border border-slate-800 flex flex-col justify-center">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-rose-400" /> Clubs & Societies
                        </h4>
                        <p className="text-slate-300 leading-relaxed">
                          {uni.clubs}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CAREERS TAB */}
                {activeTab === "careers" && (
                  <motion.div
                    key="careers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-8"
                  >
                    {/* Career Stats Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="glass p-6 rounded-3xl border border-emerald-500/20 bg-emerald-900/10 text-center flex flex-col justify-center items-center">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">Employment Rate</p>
                        <p className="text-4xl font-black text-emerald-400 mb-1">{uni.employmentRate.split(" ")[0]}</p>
                        <p className="text-emerald-500/80 text-sm font-medium">{uni.employmentRate.split(" ").slice(1).join(" ")}</p>
                      </div>
                      
                      <div className="glass p-6 rounded-3xl border border-blue-500/20 bg-blue-900/10 text-center flex flex-col justify-center items-center">
                        <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-wider">Avg. Starting Salary</p>
                        <p className="text-3xl font-black text-blue-400 mb-1">{uni.averageStartingSalary.split(" ")[0]}</p>
                        <p className="text-blue-500/80 text-sm font-medium">{uni.averageStartingSalary.split(" ").slice(1).join(" ")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Top Employers */}
                      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <Building className="w-6 h-6 text-primary-400" /> Top Employers
                        </h3>
                        <ul className="space-y-4">
                          {uni.topEmployers?.map((employer, idx) => (
                            <li key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                              <span className="text-slate-300 font-bold">{employer}</span>
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Industry Breakdown */}
                      <div className="glass p-6 md:p-8 rounded-3xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                          <PieChart className="w-6 h-6 text-purple-400" /> Industry Breakdown
                        </h3>
                        <div className="space-y-4">
                          {uni.industryBreakdown?.map((ind, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-300 font-medium">{ind.sector}</span>
                                <span className="text-white font-bold">{ind.pct}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full" style={{ width: ind.pct }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Career Services & Alumni */}
                    <div className="glass p-8 rounded-3xl border border-slate-800 space-y-8">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                          <Briefcase className="w-6 h-6 text-amber-400" /> Career Services
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-lg">
                          {uni.careerServices}
                        </p>
                      </div>

                      <div className="h-px w-full bg-slate-800" />

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-3">
                          <Globe className="w-6 h-6 text-blue-400" /> Alumni Network
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-lg">
                          {uni.alumniNetwork}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Sticky CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 glass p-6 lg:p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-800 shadow-inner">
                    <img src={uni.logo} className={`w-10 h-10 ${isLocalImage ? 'object-contain' : 'object-cover'} rounded-md`} alt="Logo mini" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Ready to Apply?</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Discover your chances of getting accepted to {uni.name} based on your unique academic profile.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={() => {
                      toast.success("Redirecting to registration...");
                      setTimeout(() => navigate('/register'), 1500);
                    }}
                    className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] flex items-center justify-center gap-2 text-lg"
                  >
                    Check AI Eligibility <ChevronRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => toast("Saving university to your wishlist!", { icon: '⭐' })}
                    className="w-full py-4 bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
                  >
                    Save to Wishlist
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
                  <p className="text-sm text-slate-500 font-medium">
                    Questions about admission? <br/>
                    <Link to="/contact" className="text-primary-400 hover:text-primary-300 hover:underline mt-1 inline-block">Speak to an Education Agent</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UniversityDetailPage;
