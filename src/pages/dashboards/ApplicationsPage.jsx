import React from 'react';
import { FileCheck, Clock, CheckCircle2, AlertCircle, XCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function ApplicationsPage() {
  const applications = [
    {
      id: 1,
      university: "Stanford University",
      program: "M.S. Computer Science",
      logo: "🌲",
      date: "May 10, 2026",
      stage: "In Review",
      progress: 60,
      steps: [
        { label: "Submitted", date: "May 10", status: "completed" },
        { label: "Documents Verified", date: "May 12", status: "completed" },
        { label: "In Review", date: "May 14", status: "current" },
        { label: "Decision", date: "Pending", status: "upcoming" }
      ],
      color: "from-red-500 to-rose-600"
    },
    {
      id: 2,
      university: "Massachusetts Institute of Technology",
      program: "M.S. Data Science",
      logo: "🏛️",
      date: "May 15, 2026",
      stage: "Documents Pending",
      progress: 35,
      steps: [
        { label: "Submitted", date: "May 15", status: "completed" },
        { label: "Documents Pending", date: "Requires Action", status: "warning" },
        { label: "In Review", date: "Pending", status: "upcoming" },
        { label: "Decision", date: "Pending", status: "upcoming" }
      ],
      color: "from-purple-500 to-indigo-600"
    },
    {
      id: 3,
      university: "Harvard University",
      program: "M.S. Artificial Intelligence",
      logo: "🦁",
      date: "May 08, 2026",
      stage: "Accepted",
      progress: 100,
      steps: [
        { label: "Submitted", date: "May 08", status: "completed" },
        { label: "Documents Verified", date: "May 10", status: "completed" },
        { label: "In Review", date: "May 12", status: "completed" },
        { label: "Accepted", date: "May 18", status: "success" }
      ],
      color: "from-emerald-500 to-teal-600"
    }
  ];

  return (
    <div className="relative min-h-screen max-w-[1600px] mx-auto pb-20">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-primary-400" /> My Applications
          </h1>
          <p className="text-slate-400">
            Real-time status tracking and checklist verification for all submitted applications.
          </p>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="space-y-6">
        {applications.map((app, idx) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="glass p-6 md:p-8 rounded-3xl border border-slate-700/50 bg-slate-900/80 relative overflow-hidden group"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl shadow-inner border border-slate-700/50">
                  {app.logo}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white leading-tight">{app.university}</h2>
                  <p className="text-primary-400 text-sm font-medium">{app.program}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500 font-medium">Submitted on {app.date}</span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  app.stage === 'Accepted'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : app.stage === 'Documents Pending'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                      : 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                }`}>
                  {app.stage}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-slate-500 mb-2 font-bold">
                <span>PROGRESS STRATEGY</span>
                <span>{app.progress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden p-[2px] border border-slate-700/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${app.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-blue-500 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                />
              </div>
            </div>

            {/* Steps Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {app.steps.map((step, sIdx) => (
                <div key={sIdx} className="p-4 bg-slate-800/20 rounded-2xl border border-slate-700/20 flex gap-3 items-start">
                  <div className="mt-0.5">
                    {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
                    {step.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />}
                    {step.status === 'current' && <Clock className="w-5 h-5 text-primary-400 animate-spin" />}
                    {step.status === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                    {step.status === 'upcoming' && <div className="w-5 h-5 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-black">?</div>}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${
                      step.status === 'upcoming' ? 'text-slate-600' : 'text-white'
                    }`}>{step.label}</h4>
                    <span className="text-xs text-slate-500">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ApplicationsPage;
