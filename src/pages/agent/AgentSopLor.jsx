import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Edit3,
  MessageSquare,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Building2,
  GraduationCap,
  Send,
  X,
  AlertCircle,
  Eye,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentSopLor() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sop"); // 'sop' | 'lor'
  const [selectedItem, setSelectedItem] = useState(null);

  // Review modal state
  const [feedbackText, setFeedbackText] = useState("");
  const [reviewStatus, setReviewStatus] = useState("IN_REVIEW");
  const [submitting, setSubmitting] = useState(false);

  const fetchSopLor = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/agent/sop-lor");
      if (res?.data?.success) {
        setItems(res.data.data.items || []);
      }
    } catch (err) {
      console.error("Failed to load SOP/LOR cases:", err);
      toast.error("Failed to load SOP/LOR drafts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSopLor();
  }, []);

  const openReviewModal = (item) => {
    setSelectedItem(item);
    const draft = activeTab === "lor" ? item.lor : item.sop;
    setReviewStatus(draft?.status || "IN_REVIEW");
    setFeedbackText("");
  };

  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      const res = await api.put(`/api/agent/sop-lor/${selectedItem.applicationId}`, {
        type: activeTab,
        comment: feedbackText.trim() || undefined,
        status: reviewStatus,
      });

      if (res?.data?.success) {
        toast.success(`${activeTab.toUpperCase()} review saved successfully.`);
        setSelectedItem(null);
        fetchSopLor();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.studentName || "").toLowerCase().includes(q) ||
      (item.university || "").toLowerCase().includes(q) ||
      (item.program || "").toLowerCase().includes(q)
    );
  });

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Title */}
      <motion.div
        variants={fade}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-400" /> SOP & LOR Review Workspace
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Review Statements of Purpose (SOP) and Letters of Recommendation (LOR) for assigned university applicants without overwriting student original drafts.
          </p>
        </div>

        <button
          onClick={fetchSopLor}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-violet-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-violet-400" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade} className="flex gap-2 p-1.5 rounded-2xl bg-[#0B1228] border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab("sop")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "sop"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Statement of Purpose (SOP)
        </button>
        <button
          onClick={() => setActiveTab("lor")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "lor"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          Recommendation Letters (LOR)
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={fade}
        className="p-3 rounded-2xl border"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student, university, or program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-900/60 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </motion.div>

      {/* Cases List */}
      <motion.div
        variants={fade}
        className="rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-violet-400 mb-2" />
            Loading assigned drafts...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-white font-bold text-base">No Drafts Submitted</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
              {search
                ? "No drafts match your search."
                : "No students in your caseload have initiated SOP/LOR drafting for their applications yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/6">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Target University & Program</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Draft Length</th>
                  <th className="py-3.5 px-4">Counselor Feedback</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredItems.map((item) => {
                  const draft = activeTab === "lor" ? item.lor : item.sop;
                  const textLength = draft?.text ? draft.text.split(/\s+/).filter(Boolean).length : 0;
                  const commentCount = draft?.comments?.length || 0;

                  return (
                    <tr
                      key={item.applicationId}
                      className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                      onClick={() => openReviewModal(item)}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-white group-hover:text-violet-400 transition-colors">
                          {item.studentName}
                        </div>
                        <div className="text-[11px] text-slate-500">{item.studentEmail}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                          {item.university}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.program}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-slate-800/80 border-white/10 text-slate-300">
                          {draft?.status || "NOT_STARTED"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {textLength > 0 ? `${textLength} words` : "No draft yet"}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          {commentCount} feedback notes
                        </span>
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => openReviewModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Review & Suggest
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Review Drawer / Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl h-full bg-[#0B1228] border-l border-white/10 p-6 overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">
                    {activeTab.toUpperCase()} Review Dossier
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedItem.studentName}</h2>
                  <p className="text-xs text-slate-400">
                    {selectedItem.university} · {selectedItem.program}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Student Draft Preview */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Student Original Draft
                  </h4>
                  <span className="text-[10px] text-slate-500">Read-Only Protected</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed font-sans">
                  {(activeTab === "lor" ? selectedItem.lor?.text : selectedItem.sop?.text) || (
                    <span className="text-slate-500 italic">
                      The applicant has not yet composed or submitted text for this document.
                    </span>
                  )}
                </div>
              </div>

              {/* Counselor Feedback History */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Counselor Feedback Threads
                </h4>
                {((activeTab === "lor" ? selectedItem.lor?.comments : selectedItem.sop?.comments) || []).length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(activeTab === "lor" ? selectedItem.lor?.comments : selectedItem.sop?.comments).map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-white/5 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="font-semibold text-violet-400">{c.author || "Counselor"}</span>
                          <span>{new Date(c.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-300">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No previous counselor suggestions registered.</p>
                )}
              </div>

              {/* Add Feedback Form */}
              <form onSubmit={handleSaveReview} className="space-y-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Update Revision Status
                  </label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-violet-500"
                  >
                    <option value="IN_REVIEW">Under Counselor Review</option>
                    <option value="REVISION_REQUESTED">Revision Requested</option>
                    <option value="APPROVED">Approved / Ready to Submit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Add Counselor Recommendations & Edits
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific feedback on academic focus, thesis motivation, work experience links..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-md shadow-violet-600/30 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Submit Counselor Feedback"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
