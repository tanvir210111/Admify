import React, { useState } from "react";
import { studentService } from "../../services/studentService";
import {
  AlertTriangle,
  Flag,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  Plus,
  X,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

function StudentReportsPage() {
  const [reports, setReports] = useState(() => studentService.getReports());
  const [showModal, setShowModal] = useState(false);

  // Form
  const [targetType, setTargetType] = useState("Agent");
  const [targetName, setTargetName] = useState("");
  const [reason, setReason] = useState("Unresponsive communication or delayed filing");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetName.trim() || !description.trim()) {
      toast.error("Please fill in target name and description.");
      return;
    }

    const updated = studentService.submitReport({
      targetType,
      targetName,
      reason,
      description,
    });

    setReports(updated);
    setShowModal(false);
    setTargetName("");
    setDescription("");
    toast.success("Report submitted to Admify Trust & Safety Committee. Admin alerted.");
  };

  const handleQuickFlag = () => {
    toast.success("Flag recorded! Admin monitoring system has marked this interaction for review.");
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Account</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Trust & Safety</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
            Reports & Complaint Resolution
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit formal reports against agents, agencies, or platform issues. Admin monitors and resolves all complaints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQuickFlag}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Flag Activity</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>File Formal Report</span>
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Your Filed Inquiries & Reports</h2>

        {reports.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0B1228] border border-slate-800 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">No active complaints</h3>
            <p className="text-xs text-slate-400">All interactions and applications are in good standing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-6 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Report #{rep.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {rep.targetType}: {rep.targetName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{rep.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{rep.date}</span>
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        rep.status === "Resolved"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : rep.status === "Under Review"
                          ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                          : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>

                {rep.resolutionNote && (
                  <div className="p-3.5 rounded-2xl bg-[#07142D] border border-slate-800/80 text-xs">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      Admin Resolution Feedback
                    </span>
                    <p className="text-slate-300">{rep.resolutionNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-10">
          <div
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#07142D] border border-slate-800 shadow-2xl space-y-5 my-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-white">File Issue / Complaint</h3>
                <p className="text-xs text-slate-400">Escalated directly to Admify Platform Administrators</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Report Against
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                    className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Agent">Agent / Counselor</option>
                    <option value="Agency">Agency</option>
                    <option value="Application">Application</option>
                    <option value="Conversation">Conversation / Message</option>
                    <option value="Service Issue">Service / Platform Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                    Entity / Individual Name
                  </label>
                  <input
                    type="text"
                    required
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="e.g. Agent John Doe or App #9821"
                    className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Reason Category
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Unresponsive communication or delayed filing">Unresponsive communication or delayed filing</option>
                  <option value="Inaccurate admission information provided">Inaccurate admission information provided</option>
                  <option value="Unauthorized application fee solicitation">Unauthorized application fee solicitation</option>
                  <option value="Technical upload error or document loss">Technical upload error or document loss</option>
                  <option value="Other complaint">Other complaint</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                  Detailed Description & Evidence
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details, dates, or messages to assist administrative review..."
                  className="w-full bg-[#0B1228] border border-slate-700/60 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs shadow-md"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentReportsPage;
