import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, Plus, Edit, Eye, MessageSquare, ListTodo } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const STUDENTS = [
  { name: "Ahmad Khalid", email: "ahmad@gmail.com", country: "Canada", degree: "Master's", gpa: "3.85", ielts: "7.5", stage: "Visa Pending", status: "Active", intake: "Fall 2026", university: "University of Toronto" },
  { name: "Liu Wei", email: "liu.wei@outlook.com", country: "United Kingdom", degree: "Bachelor's", gpa: "3.70", ielts: "7.0", stage: "Enrolled", status: "Completed", intake: "Fall 2026", university: "University of Manchester" },
  { name: "Sarah Jenkins", email: "s.jenkins@yahoo.com", country: "Australia", degree: "Master's", gpa: "3.40", ielts: "6.5", stage: "Document Upload", status: "Active", intake: "Spring 2027", university: "University of Melbourne" },
  { name: "Amara Diallo", email: "amara@diallo.org", country: "Germany", degree: "Master's", gpa: "3.90", ielts: "7.5", stage: "Decided (Offer)", status: "Active", intake: "Fall 2026", university: "TU Munich" },
  { name: "Carlos Ruiz", email: "carlos.ruiz@gmail.com", country: "Canada", degree: "Bachelor's", gpa: "3.10", ielts: "6.0", stage: "Profile Setup", status: "Pending", intake: "Spring 2027", university: "McGill University" },
  { name: "Yuki Tanaka", email: "yuki@tanaka.co.jp", country: "Switzerland", degree: "Master's", gpa: "3.95", ielts: "8.0", stage: "Interview Prep", status: "Active", intake: "Fall 2026", university: "ETH Zurich" },
  { name: "Ivan Petrov", email: "ivan.p@yandex.ru", country: "Germany", degree: "Master's", gpa: "3.65", ielts: "7.0", stage: "Submitted", status: "Active", intake: "Fall 2026", university: "TU Munich" },
];

export default function AgentStudents() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("All");
  const [degreeFilter, setDegreeFilter] = useState("All");

  const filtered = STUDENTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === "All" || s.country === countryFilter;
    const matchesDegree = degreeFilter === "All" || s.degree === degreeFilter;
    return matchesSearch && matchesCountry && matchesDegree;
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1600px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" /> Student Management System
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage active student study plans, entry qualifications, and document files</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg hover:brightness-110 transition-all">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </motion.div>

      {/* Overview Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students Assigned", val: "48", color: "text-violet-400" },
          { label: "Active Admissions", val: "36", color: "text-emerald-400" },
          { label: "Applications Submitted", val: "134", color: "text-blue-400" },
          { label: "Visas Approved", val: "28", color: "text-indigo-400" },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-sm mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Database Container */}
      <motion.div variants={fade} className="rounded-2xl border overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Filter Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 p-4 border-b border-white/6 items-stretch justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by student name or email..."
              className="w-full bg-white/4 border border-white/8 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Country Selector */}
            <select
              value={countryFilter}
              onChange={e => setCountryFilter(e.target.value)}
              className="bg-[#0b1228] border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
            >
              <option value="All">All Countries</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="Switzerland">Switzerland</option>
            </select>

            {/* Degree Selector */}
            <select
              value={degreeFilter}
              onChange={e => setDegreeFilter(e.target.value)}
              className="bg-[#0b1228] border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500/50"
            >
              <option value="All">All Degrees</option>
              <option value="Bachelor's">Bachelor's</option>
              <option value="Master's">Master's</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/6 text-[11px] text-slate-500 uppercase tracking-widest">
                {["Student Name", "Country Preference", "Degree", "GPA", "IELTS", "Stage", "Status", "Intake / University", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={i} className="border-b border-white/4 hover:bg-white/3 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-slate-200 font-semibold">{s.name}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{s.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{s.country}</td>
                  <td className="px-4 py-3.5 text-slate-300">{s.degree}</td>
                  <td className="px-4 py-3.5 font-bold font-mono text-indigo-400">{s.gpa}</td>
                  <td className="px-4 py-3.5 font-bold font-mono text-violet-400">{s.ielts}</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-xs border border-violet-500/25 font-medium">
                      {s.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      s.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      s.status === "Completed" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-slate-300 text-xs font-bold">{s.university}</p>
                      <p className="text-slate-500 text-[10px]">{s.intake}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {[
                        { icon: Eye, label: "View Details" },
                        { icon: Edit, label: "Edit Student" },
                        { icon: MessageSquare, label: "Send Message" },
                        { icon: ListTodo, label: "Assign Task" }
                      ].map((item, j) => (
                        <button
                          key={j}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                          title={item.label}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
