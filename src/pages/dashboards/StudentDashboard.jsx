import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Clock,
  Wallet,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Bell,
  FileText,
  AlertCircle,
  GraduationCap,
  Edit3,
  ArrowRight,
  MessageSquare,
  Award,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
function StudentDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };
  const [isLoading, setIsLoading] = useState(true);
  const [showSopModal, setShowSopModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);
  const handleGenerateSop = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSopModal(false);
      toast.success("SOP Generated successfully! Check your documents.", {
        style: {
          borderRadius: "10px",
          background: "#1e293b",
          color: "#fff",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        },
      });
    }, 2000);
  };
  if (isLoading) {
    return (
      <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20 animate-pulse">
        {" "}
        <div className="flex justify-between items-end mb-8">
          {" "}
          <div className="space-y-4">
            {" "}
            <div className="h-8 w-64 bg-slate-800/40 rounded-lg"></div>{" "}
            <div className="h-4 w-96 bg-slate-800/40 rounded-lg"></div>{" "}
          </div>{" "}
          <div className="h-10 w-36 bg-slate-800/40 rounded-xl"></div>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          {" "}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-slate-800/40 rounded-3xl border border-slate-700/50"
            ></div>
          ))}{" "}
        </div>{" "}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {" "}
          <div className="xl:col-span-2 space-y-6">
            {" "}
            <div className="h-64 bg-slate-800/40 rounded-3xl border border-slate-700/50"></div>{" "}
            <div className="h-96 bg-slate-800/40 rounded-3xl border border-slate-700/50"></div>{" "}
          </div>{" "}
          <div className="space-y-6">
            {" "}
            <div className="h-80 bg-slate-800/40 rounded-3xl border border-slate-700/50"></div>{" "}
            <div className="h-64 bg-slate-800/40 rounded-3xl border border-slate-700/50"></div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
  return (
    <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20">
      {" "}
      {/* SOP Generation Modal */}{" "}
      {showSopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {" "}
          <div
            className="fixed inset-0 bg-slate-950 backdrop-blur-sm"
            onClick={() => !isGenerating && setShowSopModal(false)}
          ></div>{" "}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700/50 rounded-3xl p-6 md:p-8 w-full max-w-lg relative z-10 shadow-2xl shadow-black"
          >
            {" "}
            <button
              onClick={() => !isGenerating && setShowSopModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              {" "}
              <X className="w-5 h-5" />{" "}
            </button>{" "}
            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center mb-6">
              {" "}
              <Sparkles className="w-6 h-6 text-primary-400" />{" "}
            </div>{" "}
            <h2 className="text-2xl font-bold text-white mb-2">Generate SOP</h2>{" "}
            <p className="text-slate-400 mb-6">
              Our AI will generate a personalized Statement of Purpose based on
              your 3.8 GPA and target program at Stanford.
            </p>{" "}
            <div className="space-y-4 mb-8">
              {" "}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                {" "}
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">
                  Target University
                </label>{" "}
                <div className="text-white font-medium">
                  Stanford University
                </div>{" "}
              </div>{" "}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                {" "}
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">
                  Target Program
                </label>{" "}
                <div className="text-white font-medium">
                  M.S. Computer Science
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <button
              onClick={handleGenerateSop}
              disabled={isGenerating}
              className="w-full py-3.5 bg-primary-600 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {" "}
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing
                  Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate Document (-150
                  Credits)
                </>
              )}{" "}
            </button>{" "}
          </motion.div>{" "}
        </div>
      )}{" "}
      {/* Welcome Header */}{" "}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            {" "}
            Welcome back, Alex{" "}
            <span className="inline-block animate-wave origin-[70%_70%]">
              👋
            </span>{" "}
          </h1>{" "}
          <p className="text-slate-400 text-lg">
            Your profile is{" "}
            <strong className="text-primary-400">85% complete</strong>. Let's
            finish your application strategy!
          </p>{" "}
        </div>{" "}
        <div className="flex flex-wrap items-center gap-4">
          {" "}
          <button
            onClick={() => setShowSopModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            {" "}
            <Sparkles className="w-4 h-4" /> Generate SOP{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {" "}
        {/* Row 1: Key Metrics */}{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {" "}
          <motion.div
            variants={itemVariants}
            className="glass p-6 rounded-3xl border-l-4 border-l-primary-500 border-y border-r border-slate-700/50 hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden group"
          >
            {" "}
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-500/20 transition-colors" />{" "}
            <div className="flex justify-between items-start mb-4">
              {" "}
              <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                {" "}
                <Target className="w-6 h-6" />{" "}
              </div>{" "}
              <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-lg border border-green-500/20">
                +12%
              </span>{" "}
            </div>{" "}
            <p className="text-slate-400 text-sm font-medium mb-1">
              Overall Profile Match
            </p>{" "}
            <h3 className="text-3xl font-black text-white">92%</h3>{" "}
          </motion.div>{" "}
          <motion.div
            variants={itemVariants}
            className="glass p-6 rounded-3xl border-l-4 border-l-blue-500 border-y border-r border-slate-700/50 hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden group"
          >
            {" "}
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors" />{" "}
            <div className="flex justify-between items-start mb-4">
              {" "}
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                {" "}
                <GraduationCap className="w-6 h-6" />{" "}
              </div>{" "}
            </div>{" "}
            <p className="text-slate-400 text-sm font-medium mb-1">
              Academic Scores
            </p>{" "}
            <div className="flex gap-4">
              {" "}
              <div>
                <span className="text-2xl font-black text-white">3.8</span>
                <span className="text-slate-500 text-sm ml-1">GPA</span>
              </div>{" "}
              <div>
                <span className="text-2xl font-black text-white">7.5</span>
                <span className="text-slate-500 text-sm ml-1">IELTS</span>
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
          <motion.div
            variants={itemVariants}
            className="glass p-6 rounded-3xl border-l-4 border-l-orange-500 border-y border-r border-slate-700/50 hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden group"
          >
            {" "}
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors" />{" "}
            <div className="flex justify-between items-start mb-4">
              {" "}
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                {" "}
                <FileText className="w-6 h-6" />{" "}
              </div>{" "}
              <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/20">
                2 Pending
              </span>{" "}
            </div>{" "}
            <p className="text-slate-400 text-sm font-medium mb-1">
              Active Applications
            </p>{" "}
            <h3 className="text-3xl font-black text-white">
              3{" "}
              <span className="text-base text-slate-500 font-normal">
                Submissions
              </span>
            </h3>{" "}
          </motion.div>{" "}
          <motion.div
            variants={itemVariants}
            className="glass p-6 rounded-3xl border-l-4 border-l-emerald-500 border-y border-r border-slate-700/50 hover:-translate-y-1 transition-transform cursor-default relative overflow-hidden group"
          >
            {" "}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-colors" />{" "}
            <div className="flex justify-between items-start mb-4">
              {" "}
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                {" "}
                <Wallet className="w-6 h-6" />{" "}
              </div>{" "}
              <button className="text-xs text-primary-400 font-bold hover:underline">
                Top up
              </button>{" "}
            </div>{" "}
            <p className="text-slate-400 text-sm font-medium mb-1">
              Wallet Credits
            </p>{" "}
            <h3 className="text-3xl font-black text-white">
              2,450{" "}
              <span className="text-base text-slate-500 font-normal">CR</span>
            </h3>{" "}
          </motion.div>{" "}
        </div>{" "}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {" "}
          {/* Main Content Column */}{" "}
          <div className="xl:col-span-2 space-y-6">
            {" "}
            {/* AI Insights Panel */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-8 rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-900 to-primary-900/10 relative overflow-hidden"
            >
              {" "}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />{" "}
              <div className="flex items-center justify-between mb-6 relative z-10">
                {" "}
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {" "}
                  <TrendingUp className="w-6 h-6 text-primary-400" /> AI
                  Admission Prediction{" "}
                </h2>{" "}
                <div className="px-3 py-1.5 bg-slate-800/40 border border-slate-600 rounded-lg text-sm text-slate-300 font-medium flex items-center gap-2">
                  {" "}
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                  Live Analysis{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                {" "}
                {/* CSS Circle Chart */}{" "}
                <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
                  {" "}
                  <svg className="w-full h-full transform -rotate-90">
                    {" "}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-slate-800"
                      strokeWidth="12"
                      fill="none"
                    />{" "}
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      className="stroke-primary-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="440"
                      strokeDashoffset={440 - (440 * 78) / 100}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                    />{" "}
                  </svg>{" "}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {" "}
                    <span className="text-4xl font-black text-white">
                      78%
                    </span>{" "}
                    <span className="text-xs text-primary-300 uppercase tracking-widest font-bold">
                      Success
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex-1 w-full space-y-4">
                  {" "}
                  <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex gap-4 items-start">
                    {" "}
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <h4 className="text-white font-bold text-sm mb-1">
                        Strong Academic Background
                      </h4>{" "}
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Your 3.8 GPA puts you in the top 15% of applicants for
                        your targeted Master's programs.
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 flex gap-4 items-start">
                    {" "}
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />{" "}
                    <div>
                      {" "}
                      <h4 className="text-white font-bold text-sm mb-1">
                        Improvement Area: SOP
                      </h4>{" "}
                      <p className="text-slate-400 text-xs leading-relaxed">
                        Your draft SOP needs more focus on career goals. Use the
                        AI SOP Generator to restructure your narrative.
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Application Tracker */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-8 rounded-3xl border border-slate-700/50 bg-slate-900 "
            >
              {" "}
              <div className="flex justify-between items-center mb-8">
                {" "}
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {" "}
                  <FileText className="w-6 h-6 text-orange-400" /> Application
                  Tracker{" "}
                </h2>{" "}
                <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  View Timeline
                </button>{" "}
              </div>{" "}
              <div className="space-y-6">
                {" "}
                {/* Application Item 1 */}{" "}
                <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  {" "}
                  <div className="flex justify-between items-start mb-4">
                    {" "}
                    <div>
                      {" "}
                      <h3 className="text-white font-bold text-lg">
                        Stanford University
                      </h3>{" "}
                      <p className="text-primary-400 text-sm font-medium">
                        M.S. Computer Science
                      </p>{" "}
                    </div>{" "}
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">
                      In Review
                    </span>{" "}
                  </div>{" "}
                  <div className="relative pt-6">
                    {" "}
                    {/* Status dots */}{" "}
                    <div className="flex justify-between mb-2 relative z-10">
                      {" "}
                      <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />{" "}
                      <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />{" "}
                      <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />{" "}
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />{" "}
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />{" "}
                    </div>{" "}
                    {/* Track line */}{" "}
                    <div className="absolute top-[28px] left-0 w-full h-1 bg-slate-700 rounded-full z-0 overflow-hidden">
                      {" "}
                      <div className="h-full bg-primary-500 w-[50%]" />{" "}
                    </div>{" "}
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase mt-2">
                      {" "}
                      <span>Draft</span> <span>Submitted</span>{" "}
                      <span className="text-primary-300">In Review</span>{" "}
                      <span>Interview</span> <span>Decision</span>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                {/* Application Item 2 */}{" "}
                <div className="p-5 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                  {" "}
                  <div className="flex justify-between items-start mb-4">
                    {" "}
                    <div>
                      {" "}
                      <h3 className="text-white font-bold text-lg">
                        University of Toronto
                      </h3>{" "}
                      <p className="text-primary-400 text-sm font-medium">
                        M.Sc. Applied Computing
                      </p>{" "}
                    </div>{" "}
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs font-bold rounded-lg uppercase tracking-wider">
                      Docs Pending
                    </span>{" "}
                  </div>{" "}
                  <div className="relative pt-6">
                    {" "}
                    <div className="flex justify-between mb-2 relative z-10">
                      {" "}
                      <div className="w-3 h-3 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />{" "}
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />{" "}
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />{" "}
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />{" "}
                      <div className="w-3 h-3 bg-slate-700 rounded-full" />{" "}
                    </div>{" "}
                    <div className="absolute top-[28px] left-0 w-full h-1 bg-slate-700 rounded-full z-0 overflow-hidden">
                      {" "}
                      <div className="h-full bg-primary-500 w-[0%]" />{" "}
                    </div>{" "}
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium uppercase mt-2">
                      {" "}
                      <span className="text-primary-300">Draft</span>{" "}
                      <span>Submitted</span> <span>In Review</span>{" "}
                      <span>Interview</span> <span>Decision</span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="mt-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center justify-between">
                    {" "}
                    <p className="text-xs text-yellow-400 font-medium">
                      Action Required: Upload Financial Documents
                    </p>{" "}
                    <button className="text-xs bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-bold">
                      Upload
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* AI Recommendations Table */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-8 rounded-3xl border border-slate-700/50 bg-slate-900 overflow-hidden"
            >
              {" "}
              <div className="flex justify-between items-center mb-6">
                {" "}
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  {" "}
                  <Sparkles className="w-6 h-6 text-primary-400" /> Recommended
                  Universities{" "}
                </h2>{" "}
                <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  See 15+ Matches
                </button>{" "}
              </div>{" "}
              <div className="overflow-x-auto custom-scrollbar">
                {" "}
                <table className="w-full text-left border-collapse min-w-[700px]">
                  {" "}
                  <thead>
                    {" "}
                    <tr className="border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider">
                      {" "}
                      <th className="pb-4 font-bold">Institution</th>{" "}
                      <th className="pb-4 font-bold">Country</th>{" "}
                      <th className="pb-4 font-bold">Est. Fee</th>{" "}
                      <th className="pb-4 font-bold">AI Match</th>{" "}
                      <th className="pb-4 font-bold text-right">
                        Deadline
                      </th>{" "}
                    </tr>{" "}
                  </thead>{" "}
                  <tbody className="text-sm">
                    {" "}
                    {[
                      {
                        name: "Stanford University",
                        loc: "USA",
                        flag: "🇺🇸",
                        fee: "$55k",
                        match: 98,
                        date: "Dec 15",
                      },
                      {
                        name: "MIT",
                        loc: "USA",
                        flag: "🇺🇸",
                        fee: "$58k",
                        match: 94,
                        date: "Dec 1",
                      },
                      {
                        name: "University of Oxford",
                        loc: "UK",
                        flag: "🇬🇧",
                        fee: "£35k",
                        match: 91,
                        date: "Jan 10",
                      },
                      {
                        name: "ETH Zurich",
                        loc: "Switzerland",
                        flag: "🇨🇭",
                        fee: "CHF 1.5k",
                        match: 88,
                        date: "Nov 30",
                      },
                    ].map((rec, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-700/50 hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      >
                        {" "}
                        <td className="py-4 font-bold text-white group-hover:text-primary-300 transition-colors">
                          {rec.name}
                        </td>{" "}
                        <td className="py-4 text-slate-300 flex items-center gap-2">
                          <span className="text-lg">{rec.flag}</span> {rec.loc}
                        </td>{" "}
                        <td className="py-4 text-slate-300 font-mono">
                          {rec.fee}
                        </td>{" "}
                        <td className="py-4">
                          {" "}
                          <div className="flex items-center gap-2">
                            {" "}
                            <div className="w-20 h-1.5 bg-slate-800/40 rounded-full overflow-hidden">
                              {" "}
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_5px_#22c55e]"
                                style={{ width: `${rec.match}%` }}
                              />{" "}
                            </div>{" "}
                            <span className="text-green-400 font-bold text-xs">
                              {rec.match}%
                            </span>{" "}
                          </div>{" "}
                        </td>{" "}
                        <td className="py-4 text-right">
                          {" "}
                          <span className="px-3 py-1 bg-slate-800/40 rounded-lg text-slate-300 text-xs font-medium border border-slate-700/50">
                            {rec.date}
                          </span>{" "}
                        </td>{" "}
                      </tr>
                    ))}{" "}
                  </tbody>{" "}
                </table>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
          {/* Right Sidebar Column */}{" "}
          <div className="space-y-6">
            {" "}
            {/* Upcoming Deadlines Tracker */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-6 rounded-3xl border border-slate-700/50 bg-slate-900 "
            >
              {" "}
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                {" "}
                <Clock className="w-5 h-5 text-red-400" /> Deadline Tracker{" "}
              </h2>{" "}
              <div className="space-y-4">
                {" "}
                {[
                  {
                    title: "Stanford Early Decision",
                    date: "Dec 15, 2026",
                    days: 12,
                    urg: "high",
                  },
                  {
                    title: "IELTS Exam Date",
                    date: "Jan 10, 2027",
                    days: 38,
                    urg: "medium",
                  },
                  {
                    title: "Oxford Scholarship form",
                    date: "Jan 30, 2027",
                    days: 58,
                    urg: "low",
                  },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-colors"
                  >
                    {" "}
                    <div className="flex justify-between items-start mb-2">
                      {" "}
                      <h4 className="text-white font-bold text-sm leading-tight">
                        {d.title}
                      </h4>{" "}
                      <span
                        className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase border ${d.urg === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" : d.urg === "medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}
                      >
                        {" "}
                        In {d.days}d{" "}
                      </span>{" "}
                    </div>{" "}
                    <p className="text-xs text-slate-400 font-medium">
                      {d.date}
                    </p>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
              <button className="w-full mt-4 py-3 border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/40 rounded-xl text-sm font-medium transition-all">
                {" "}
                + Add Custom Reminder{" "}
              </button>{" "}
            </motion.div>{" "}
            {/* Scholarship Suggestions */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-6 rounded-3xl border border-slate-700/50 bg-slate-900 "
            >
              {" "}
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                {" "}
                <Award className="w-5 h-5 text-purple-400" /> Scholarships
                Match{" "}
              </h2>{" "}
              <div className="space-y-4">
                {" "}
                {[
                  {
                    title: "Global Excellence Award",
                    provider: "Stanford",
                    amount: "$25,000",
                    match: "Eligible",
                  },
                  {
                    title: "Women in STEM Grant",
                    provider: "Admify Fund",
                    amount: "$10,000",
                    match: "High Chance",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="group bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all cursor-pointer"
                  >
                    {" "}
                    <div className="flex justify-between items-start mb-1">
                      {" "}
                      <h4 className="text-white font-bold text-sm leading-tight group-hover:text-purple-300 transition-colors">
                        {s.title}
                      </h4>{" "}
                      <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        {s.match}
                      </span>{" "}
                    </div>{" "}
                    <p className="text-xs text-slate-400 mb-3">{s.provider}</p>{" "}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
                      {" "}
                      <span className="text-purple-400 font-bold">
                        {s.amount}
                      </span>{" "}
                      <button className="text-xs font-bold text-white bg-slate-700 hover:bg-purple-600 px-3 py-1.5 rounded-lg transition-colors">
                        Apply
                      </button>{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* SOP & LOR Quick Actions */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-6 rounded-3xl border border-slate-700/50 bg-slate-900 "
            >
              {" "}
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                {" "}
                <Edit3 className="w-5 h-5 text-teal-400" /> Document AI{" "}
              </h2>{" "}
              <p className="text-sm text-slate-400 mb-6">
                Instantly generate or refine your application documents.
              </p>{" "}
              <div className="space-y-3">
                {" "}
                <button className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-700 rounded-2xl border border-slate-600 transition-colors group">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                      {" "}
                      <FileText className="w-5 h-5 text-teal-400" />{" "}
                    </div>{" "}
                    <div className="text-left">
                      {" "}
                      <span className="block text-white font-bold text-sm">
                        Generate SOP
                      </span>{" "}
                      <span className="block text-xs text-slate-400">
                        Statement of Purpose
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />{" "}
                </button>{" "}
                <button className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-700 rounded-2xl border border-slate-600 transition-colors group">
                  {" "}
                  <div className="flex items-center gap-3">
                    {" "}
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      {" "}
                      <FileText className="w-5 h-5 text-blue-400" />{" "}
                    </div>{" "}
                    <div className="text-left">
                      {" "}
                      <span className="block text-white font-bold text-sm">
                        Draft LOR
                      </span>{" "}
                      <span className="block text-xs text-slate-400">
                        Letter of Recommendation
                      </span>{" "}
                    </div>{" "}
                  </div>{" "}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />{" "}
                </button>{" "}
              </div>{" "}
            </motion.div>{" "}
            {/* Notifications Panel */}{" "}
            <motion.div
              variants={itemVariants}
              className="glass p-6 rounded-3xl border border-slate-700/50 bg-slate-900 "
            >
              {" "}
              <div className="flex justify-between items-center mb-6">
                {" "}
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {" "}
                  <Bell className="w-5 h-5 text-slate-300" /> Notifications{" "}
                </h2>{" "}
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center">
                  3
                </span>{" "}
              </div>{" "}
              <div className="space-y-4">
                {" "}
                <div className="flex gap-3">
                  {" "}
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    {" "}
                    <MessageSquare className="w-4 h-4 text-blue-400" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-sm text-slate-200 leading-snug">
                      <span className="font-bold">Agent Sarah</span> reviewed
                      your Stanford application draft.
                    </p>{" "}
                    <span className="text-xs text-slate-500">
                      2 hours ago
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex gap-3">
                  {" "}
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    {" "}
                    <Sparkles className="w-4 h-4 text-purple-400" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <p className="text-sm text-slate-200 leading-snug">
                      New{" "}
                      <span className="font-bold text-purple-400">
                        95% match
                      </span>{" "}
                      found: MIT Data Science.
                    </p>{" "}
                    <span className="text-xs text-slate-500">
                      Yesterday
                    </span>{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
      </motion.div>{" "}

    </div>
  );
}
export default StudentDashboard;
