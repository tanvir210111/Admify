import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { studentService } from "../../services/studentService";
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users2,
  Send,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

function ApplicationTrackingPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const apps = await studentService.getMyApplications();
        if (isMounted) setApplications(apps);
      } catch (err) {
        console.warn(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = applications.filter((app) => {
    if (activeTab === "direct") return app.applicationType === "direct" || !app.applicationType;
    if (activeTab === "agency") return app.applicationType === "agency";
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Applications</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Milestone Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <FileCheck2 className="w-7 h-7 text-cyan-400" />
            Application Progress Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time status tracking, verification milestones, and university communication timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/direct-applications"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold transition-all shadow-md"
          >
            Apply Directly
          </Link>
          <Link
            to="/student/agency-assistance"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
          >
            Agency Support
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            activeTab === "all"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-[#0B1228] text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          All Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab("direct")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            activeTab === "direct"
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : "bg-[#0B1228] text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          Direct Applications
        </button>
        <button
          onClick={() => setActiveTab("agency")}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            activeTab === "agency"
              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
              : "bg-[#0B1228] text-slate-400 border-slate-800 hover:text-white"
          }`}
        >
          Agency Handled Applications
        </button>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-1/3 bg-slate-800 rounded" />
                  <div className="h-4 w-1/4 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="h-2 w-full bg-slate-800/50 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No applications yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't submitted an application yet. Discover universities to claim your 1 Free Direct Application.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/student/universities"
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] text-xs font-bold transition-all shadow-sm"
            >
              Find Universities
            </Link>
            <Link
              to="/student/direct-applications"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
            >
              Direct Application
            </Link>
          </div>
        </div>
      ) : (
        /* Applications List with Timeline */
        <div className="space-y-6">
        {filtered.map((app) => (
          <div
            key={app._id || app.id}
            className="p-6 sm:p-8 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-6 shadow-xl"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#07142D] border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {app.logo || "🎓"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-white">{app.university}</h2>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        app.applicationType === "agency"
                          ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                          : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                      }`}
                    >
                      {app.applicationType === "agency" ? "Agency Assisted" : "Direct Submission"}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-300 font-medium">{app.program}</p>
                  {app.assignedAgency && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Agency: <strong className="text-white">{app.assignedAgency}</strong> • Counselor:{" "}
                      <strong className="text-purple-300">{app.assignedAgent}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Date: {app.date}</span>
                <span
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    app.stage === "Accepted"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : app.stage === "Documents Pending"
                      ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
                      : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                  }`}
                >
                  {app.stage}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>STAGE COMPLETION PROGRESS</span>
                <span className="text-cyan-400">{app.progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-[2px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500"
                  style={{ width: `${app.progress}%` }}
                />
              </div>
            </div>

            {/* Timeline Stepper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {app.steps?.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                    step.status === "completed"
                      ? "bg-[#07142D] border-slate-800 text-white"
                      : step.status === "current"
                      ? "bg-cyan-500/10 border-cyan-500/30 text-white shadow-sm"
                      : "bg-[#050B1F]/60 border-slate-800/80 text-slate-500"
                  }`}
                >
                  <div className="mt-0.5">
                    {step.status === "completed" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {step.status === "current" && <Clock className="w-5 h-5 text-cyan-400 animate-spin" />}
                    {step.status === "warning" && <AlertCircle className="w-5 h-5 text-amber-400" />}
                    {step.status === "upcoming" && (
                      <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{step.label}</h4>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{step.date}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Application Ref ID: <code className="text-cyan-400 font-mono">{app._id || app.id}</code>
              </span>

              <div className="flex items-center gap-2">
                {app.applicationType === "agency" && (
                  <Link
                    to="/student/messages"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat with Counselor</span>
                  </Link>
                )}
                <Link
                  to="/student/documents"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                >
                  Check Attached Documents
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}

export default ApplicationTrackingPage;
