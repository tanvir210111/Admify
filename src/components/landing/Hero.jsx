import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Sparkles,
  Globe2,
  Users,
  Building2,
  CheckCircle2,
} from "lucide-react";
import AnimatedCounter from "../ui/AnimatedCounter";
function Hero() {
  return (
    <>
      {" "}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        {" "}
        {/* Animated Particles/Blobs */}{" "}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none"
        />{" "}
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"
        />{" "}
        {/* Subtle grid background */}{" "}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />{" "}
        <div className="container mx-auto px-6 relative z-10">
          {" "}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
            {" "}
            {/* Left Text Content */}{" "}
            <div className="flex-1 text-center lg:text-left">
              {" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/40 border border-slate-600 shadow-xl shadow-primary-500/10 mb-8 text-sm md:text-base font-semibold backdrop-blur-md hover:border-primary-400/50 transition-colors cursor-default"
              >
                {" "}
                <div className="flex relative">
                  {" "}
                  <span className="absolute inset-0 bg-primary-500 rounded-full animate-ping opacity-75" />{" "}
                  <span className="relative flex w-2 h-2 rounded-full bg-primary-500 my-auto mx-1" />{" "}
                </div>{" "}
                <span className="text-white">
                  Admify 1.0 is now live
                </span>{" "}
              </motion.div>{" "}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight leading-[1.15]"
              >
                {" "}
                Global Education, <br className="hidden lg:block" />{" "}
                <span className="bg-gradient-to-r from-primary-400 via-blue-400 to-primary-300 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent pb-2 block">
                  {" "}
                  Engineered by AI{" "}
                </span>{" "}
              </motion.h1>{" "}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-lg md:text-xl lg:text-2xl max-w-2xl mb-12 mx-auto lg:mx-0 leading-relaxed font-light"
              >
                {" "}
                Stop guessing. Start matching. Our predictive AI analyzes
                millions of data points to find your optimal university, secure
                scholarships, and automate your application process.{" "}
              </motion.p>{" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                {" "}
                <Link to="/register">
                  {" "}
                  <button className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-4 md:py-5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1">
                    {" "}
                    Start Your Journey <ChevronRight className="w-5 h-5" />{" "}
                  </button>{" "}
                </Link>{" "}
                <Link to="/login">
                  {" "}
                  <button className="w-full sm:w-auto px-8 py-4 md:py-5 bg-slate-800/40 backdrop-blur-md border border-slate-600 text-white hover:bg-slate-700 hover:border-slate-400 rounded-xl font-bold text-lg transition-all hover:-translate-y-1">
                    {" "}
                    View Demo{" "}
                  </button>{" "}
                </Link>{" "}
              </motion.div>{" "}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm md:text-base text-slate-400 font-medium"
              >
                {" "}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />{" "}
                  <span className="text-slate-300">
                    No credit card required
                  </span>
                </div>{" "}
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />{" "}
                  <span className="text-slate-300">14-day free trial</span>
                </div>{" "}
              </motion.div>{" "}
              {/* Statistics */}{" "}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-16 pt-10 border-t border-slate-700/50 flex flex-wrap gap-8 lg:gap-16 justify-center lg:justify-start"
              >
                {" "}
                <div className="flex items-center gap-4 group cursor-default">
                  {" "}
                  <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-600 group-hover:border-primary-400/60 transition-colors shadow-lg">
                    {" "}
                    <Users className="w-6 h-6 md:w-7 md:h-7 text-primary-400" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white leading-none tracking-tight">
                      <AnimatedCounter to={50} suffix="K+" />
                    </h4>{" "}
                    <p className="text-slate-300 text-sm md:text-base mt-1 font-medium">
                      Students
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center gap-4 group cursor-default">
                  {" "}
                  <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-600 group-hover:border-blue-400/60 transition-colors shadow-lg">
                    {" "}
                    <Building2 className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white leading-none tracking-tight">
                      <AnimatedCounter to={10} suffix="K+" />
                    </h4>{" "}
                    <p className="text-slate-300 text-sm md:text-base mt-1 font-medium">
                      Universities
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center gap-4 group cursor-default">
                  {" "}
                  <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-600 group-hover:border-purple-400/60 transition-colors shadow-lg">
                    {" "}
                    <Globe2 className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />{" "}
                  </div>{" "}
                  <div>
                    {" "}
                    <h4 className="text-3xl md:text-4xl font-extrabold text-white leading-none tracking-tight">
                      <AnimatedCounter to={45} suffix="+" />
                    </h4>{" "}
                    <p className="text-slate-300 text-sm md:text-base mt-1 font-medium">
                      Countries
                    </p>{" "}
                  </div>{" "}
                </div>{" "}
              </motion.div>{" "}
            </div>{" "}
            {/* Right Floating Card / Visual */}{" "}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                type: "spring",
                damping: 20,
              }}
              className="flex-1 w-full max-w-lg relative perspective-1000 mt-12 lg:mt-0"
            >
              {" "}
              {/* Glowing orb behind card */}{" "}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/40 via-blue-500/30 to-purple-500/40 blur-[80px] rounded-full" />{" "}
              <motion.div
                whileHover={{ y: -5, rotateX: 2, rotateY: -2 }}
                className="relative glass p-6 md:p-8 rounded-[2rem] border-2 border-slate-600 shadow-2xl shadow-primary-900/30 bg-slate-900 backdrop-blur-xl"
              >
                {" "}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/50">
                  {" "}
                  <div className="flex items-center gap-4">
                    {" "}
                    <div className="relative">
                      {" "}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-500 p-[2px] shadow-lg shadow-primary-500/30">
                        {" "}
                        <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center">
                          {" "}
                          <Sparkles className="w-7 h-7 text-white" />{" "}
                        </div>{" "}
                      </div>{" "}
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        {" "}
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>{" "}
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-slate-900"></span>{" "}
                      </span>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h3 className="text-white font-bold text-xl">
                        AI Match Found
                      </h3>{" "}
                      <p className="text-slate-300 text-sm">
                        Processing profile...
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="px-4 py-2 bg-green-500/15 text-green-400 rounded-full text-sm font-bold border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)] tracking-wide">
                    {" "}
                    98% Match{" "}
                  </div>{" "}
                </div>{" "}
                <div className="space-y-6">
                  {" "}
                  <div className="flex gap-5 items-center bg-slate-800/40 p-4 rounded-2xl border border-slate-600 hover:bg-slate-700/60 transition-colors">
                    {" "}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-600 shadow-md">
                      {" "}
                      <img
                        src="https://picsum.photos/seed/stanford/100/100"
                        alt="Stanford"
                        className="w-full h-full object-cover"
                      />{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <h4 className="text-lg md:text-xl font-bold text-white mb-1">
                        Stanford University
                      </h4>{" "}
                      <p className="text-slate-300 text-sm font-medium">
                        M.S. Computer Science
                      </p>{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-600 space-y-5">
                    {" "}
                    <div className="flex justify-between items-center text-sm">
                      {" "}
                      <span className="text-slate-300 font-semibold">
                        Profile Match Probability
                      </span>{" "}
                      <span className="text-white font-bold bg-slate-700 px-3 py-1 rounded-md ">
                        Excellent
                      </span>{" "}
                    </div>{" "}
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                      {" "}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "98%" }}
                        transition={{
                          delay: 1,
                          duration: 1.5,
                          ease: "easeOut",
                        }}
                        className="bg-gradient-to-r from-primary-500 to-blue-400 h-full rounded-full relative shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                      >
                        {" "}
                        <div className="absolute inset-0 bg-slate-900/20 animate-pulse" />{" "}
                      </motion.div>{" "}
                    </div>{" "}
                    <p className="text-sm text-slate-300 leading-relaxed pt-2">
                      {" "}
                      Your GRE score{" "}
                      <span className="text-white font-bold">330</span> and GPA{" "}
                      <span className="text-white font-bold">3.9</span>{" "}
                      perfectly align with the incoming cohort average.{" "}
                    </p>{" "}
                  </div>{" "}
                  <button className="w-full py-4 md:py-5 bg-primary-600 text-white font-bold rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]">
                    {" "}
                    Generate Application Strategy{" "}
                  </button>{" "}
                </div>{" "}
              </motion.div>{" "}
              {/* Floating decorative elements */}{" "}
              <motion.div
                animate={{ y: [0, -15, 0], opacity: [0.9, 1, 0.9] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -right-8 top-20 glass px-6 py-4 rounded-2xl text-sm font-bold text-white border-primary-400/40 flex items-center gap-4 shadow-2xl backdrop-blur-xl hidden md:flex bg-slate-900 "
              >
                {" "}
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  {" "}
                  <CheckCircle2 className="w-6 h-6 text-green-400" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-white text-base">SOP Generated</p>{" "}
                  <p className="text-slate-300 text-xs font-normal">
                    Plagiarism free
                  </p>{" "}
                </div>{" "}
              </motion.div>{" "}
              <motion.div
                animate={{ y: [0, 20, 0], opacity: [0.9, 1, 0.9] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="absolute -left-12 bottom-24 glass px-6 py-4 rounded-2xl text-sm font-bold text-white border-blue-400/40 flex items-center gap-4 shadow-2xl backdrop-blur-xl hidden md:flex bg-slate-900 "
              >
                {" "}
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  {" "}
                  <Sparkles className="w-6 h-6 text-blue-400" />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <p className="text-white text-base">Scholarship Match</p>{" "}
                  <p className="text-slate-300 text-xs font-normal">
                    $25,000 / yr found
                  </p>{" "}
                </div>{" "}
              </motion.div>{" "}
            </motion.div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Trusted By Section */}{" "}
      <section className="py-12 border-y border-slate-700/50 bg-slate-900 relative z-10">
        {" "}
        <div className="container mx-auto px-6 text-center">
          {" "}
          <p className="text-sm font-bold text-slate-400 mb-10 uppercase tracking-[0.2em]">
            Trusted by students admitted to top universities
          </p>{" "}
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {" "}
            <div className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
              Stanford
            </div>{" "}
            <div className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
              Oxford
            </div>{" "}
            <div className="text-2xl md:text-3xl font-sans font-black tracking-tighter text-white">
              MIT
            </div>{" "}
            <div className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide">
              Harvard
            </div>{" "}
            <div className="text-2xl md:text-3xl font-sans font-bold text-white tracking-wide">
              ETH Zürich
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
    </>
  );
}
export default Hero;
