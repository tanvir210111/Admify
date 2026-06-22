import React from "react";
import { motion } from "framer-motion";
function DashboardPreview() {
  return (
    <section className="py-24 md:py-36 relative z-10 overflow-hidden">
      {" "}
      <div className="container mx-auto px-6">
        {" "}
        <div className="text-center max-w-4xl mx-auto mb-20 md:mb-28">
          {" "}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-5 py-2 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 mb-8 text-sm md:text-base font-bold tracking-widest uppercase"
          >
            {" "}
            Unified Dashboard{" "}
          </motion.div>{" "}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-tight"
          >
            {" "}
            Everything in <span className="text-white">one place</span>{" "}
          </motion.h2>{" "}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg md:text-xl lg:text-2xl font-light leading-relaxed"
          >
            {" "}
            Manage your entire application process, track deadlines, and
            communicate with agents from a single, intuitive interface.{" "}
          </motion.p>{" "}
        </div>{" "}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          {" "}
          {/* Dashboard Frame */}{" "}
          <div className="rounded-2xl md:rounded-[2.5rem] border-2 border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden shadow-primary-500/10">
            {" "}
            {/* Fake Browser Header */}{" "}
            <div className="h-10 md:h-14 bg-slate-800/40 border-b border-slate-700/50 flex items-center px-6 gap-2.5">
              {" "}
              <div className="w-3.5 h-3.5 rounded-full bg-red-500/90" />{" "}
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90" />{" "}
              <div className="w-3.5 h-3.5 rounded-full bg-green-500/90" />{" "}
              <div className="mx-auto w-1/3 md:w-1/4 h-6 md:h-8 bg-slate-900 rounded-md border border-slate-700/50 flex items-center justify-center">
                {" "}
                <div className="w-1/2 h-2.5 bg-slate-700 rounded-full" />{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex h-[300px] md:h-[600px]">
              {" "}
              {/* Fake Sidebar */}{" "}
              <div className="w-12 md:w-64 border-r border-slate-700/50 p-2 md:p-6 space-y-5 bg-slate-950">
                {" "}
                <div className="h-6 md:h-10 bg-slate-800/40 rounded-lg mb-8 md:mb-10" />{" "}
                <div className="h-8 md:h-12 bg-primary-600/20 rounded-lg md:rounded-xl border border-primary-500/30 flex items-center px-4 gap-4">
                  {" "}
                  <div className="w-5 h-5 bg-primary-500 rounded hidden md:block" />{" "}
                  <div className="h-2.5 w-1/2 bg-primary-400 rounded hidden md:block" />{" "}
                </div>{" "}
                <div className="h-8 md:h-12 bg-slate-800/40 rounded-lg md:rounded-xl hidden md:flex items-center px-4 gap-4">
                  {" "}
                  <div className="w-5 h-5 bg-slate-600 rounded" />{" "}
                  <div className="h-2.5 w-1/3 bg-slate-600 rounded" />{" "}
                </div>{" "}
                <div className="h-8 md:h-12 bg-slate-800/40 rounded-lg md:rounded-xl hidden md:flex items-center px-4 gap-4">
                  {" "}
                  <div className="w-5 h-5 bg-slate-600 rounded" />{" "}
                  <div className="h-2.5 w-2/3 bg-slate-600 rounded" />{" "}
                </div>{" "}
              </div>{" "}
              {/* Main Content Area */}{" "}
              <div className="flex-1 p-4 md:p-10 space-y-6 md:space-y-8 bg-slate-950 overflow-hidden">
                {" "}
                <div className="flex justify-between items-center mb-4 md:mb-8">
                  {" "}
                  <div className="space-y-3">
                    {" "}
                    <div className="w-24 md:w-56 h-6 md:h-10 bg-slate-800/40 rounded-lg" />{" "}
                    <div className="w-16 md:w-40 h-3 md:h-5 bg-slate-800/40 rounded-lg" />{" "}
                  </div>{" "}
                  <div className="flex gap-4 md:gap-6">
                    {" "}
                    <div className="w-8 md:w-12 h-8 md:h-12 bg-slate-800/40 rounded-full" />{" "}
                    <div className="w-8 md:w-12 h-8 md:h-12 bg-slate-800/40 rounded-full border-2 border-primary-500" />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                  {" "}
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 md:h-28 bg-slate-800/40 border border-slate-700/50 rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col justify-between hover:bg-slate-800/40 transition-colors"
                    >
                      {" "}
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-slate-700 rounded-full" />{" "}
                      <div className="w-1/2 h-3 md:h-4 bg-slate-600 rounded" />{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
                <div className="flex gap-6 md:gap-8 h-full mt-6 md:mt-10">
                  {" "}
                  <div className="w-full md:w-2/3 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 md:p-8">
                    {" "}
                    <div className="w-32 md:w-48 h-4 md:h-6 bg-slate-800/40 rounded mb-6 md:mb-8" />{" "}
                    <div className="space-y-3 md:space-y-5">
                      {" "}
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-10 md:h-16 bg-slate-800/40 rounded-xl flex items-center px-4 md:px-6 justify-between"
                        >
                          {" "}
                          <div className="flex items-center gap-4 md:gap-6">
                            {" "}
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg" />{" "}
                            <div className="w-24 md:w-36 h-2 md:h-3 bg-slate-600 rounded" />{" "}
                          </div>{" "}
                          <div className="w-16 md:w-24 h-2 md:h-3 bg-primary-500/50 rounded" />{" "}
                        </div>
                      ))}{" "}
                    </div>{" "}
                  </div>{" "}
                  <div className="w-1/3 bg-slate-800/40 border border-slate-700/50 rounded-2xl hidden md:block p-8">
                    {" "}
                    <div className="w-32 h-6 bg-slate-800/40 rounded mb-8" />{" "}
                    <div className="w-full h-40 bg-slate-800/40 rounded-xl mb-6" />{" "}
                    <div className="w-3/4 h-3 bg-slate-700 rounded mb-3" />{" "}
                    <div className="w-1/2 h-3 bg-slate-700 rounded" />{" "}
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Floating UI Elements over Dashboard */}{" "}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-4 md:-right-12 top-1/4 glass p-4 md:p-6 rounded-2xl border-green-500/30 shadow-2xl hidden lg:block backdrop-blur-xl bg-slate-900 "
          >
            {" "}
            <div className="flex items-center gap-4">
              {" "}
              <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                {" "}
                <span className="text-green-400 font-bold text-xl">✓</span>{" "}
              </div>{" "}
              <div>
                {" "}
                <p className="text-white font-bold text-base">
                  Offer Received
                </p>{" "}
                <p className="text-slate-300 text-sm">
                  University of Toronto
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </motion.div>{" "}
        </motion.div>{" "}
      </div>{" "}
    </section>
  );
}
export default DashboardPreview;
