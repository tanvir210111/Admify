import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Search,
  MessageSquare,
  Users,
  Eye,
  FileText,
  Clock,
  RefreshCw,
  AlertTriangle,
  Lock,
  ChevronRight,
  Filter,
  CheckCircle,
  FileIcon,
  Download,
} from "lucide-react";
import { api } from "../../lib/api";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const timelineEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setLoadingList(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await api.get("/api/admin/conversations", { params });
      if (res?.success) {
        const list = res.data?.conversations || [];
        setConversations(list);
        if (!selectedConv && list.length > 0) {
          inspectConversation(list[0]._id);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to load supervisory conversations.");
    } finally {
      setLoadingList(false);
    }
  };

  const inspectConversation = async (convId) => {
    try {
      setLoadingTimeline(true);
      const res = await api.get(`/api/admin/conversations/${convId}`);
      if (res?.success) {
        setSelectedConv(res.data?.conversation);
        setTimeline(res.data?.messages || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Supervisory inspection access denied.");
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchConversations();
  };

  return (
    <motion.div
      variants={fade}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[1600px] mx-auto text-slate-100 pb-12"
    >
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only Supervisory Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5 mt-1.5">
            <ShieldCheck className="w-6 h-6 text-cyan-400" /> Platform Conversation Oversight
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Mandatory audit-logged inspection of user-to-user correspondence for compliance and dispute investigation.
          </p>
        </div>

        <button
          onClick={fetchConversations}
          disabled={loadingList}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0B1228] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin text-cyan-400" : ""}`} />
          Refresh Registry
        </button>
      </div>

      {/* Security Disclaimer Notice */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Supervisory Access Policy & Audit Notice</p>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            Every conversation inspection or attachment access is permanently logged in the Admin Audit Registry.
            Supervisors may not modify, delete, or inject unauthorized messages into direct conversations.
          </p>
        </div>
      </div>

      {/* Main Split Console Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-12 gap-0 h-[700px] rounded-2xl border overflow-hidden"
        style={{ background: "#0B1228", borderColor: "rgba(255, 255, 255, 0.08)" }}
      >
        {/* Left Pane: Conversation Registry (4 Cols) */}
        <div className="md:col-span-4 border-r border-white/10 flex flex-col h-full bg-slate-900/40">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-white/10 space-y-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by participant name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </form>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {["all", "active", "archived"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                    statusFilter === st
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white bg-white/5 border border-transparent"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {loadingList ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading conversation index...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No conversations found.</div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedConv?._id === c._id;
                const pNames = (c.participants || [])
                  .map((p) => p.user?.name || p.role || "User")
                  .join(" ↔ ");

                return (
                  <div
                    key={c._id}
                    onClick={() => inspectConversation(c._id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-cyan-500/10 border-l-4 border-l-cyan-400"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white truncate max-w-[200px]">{pNames}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {c.messageCount || 0} msgs
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="capitalize text-cyan-400 font-medium">{c.type || "Direct"}</span>
                      <span>•</span>
                      <span>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString() : "Active"}</span>
                    </div>

                    {c.lastMessageText && (
                      <p className="text-[11px] text-slate-400 truncate mt-1 italic">
                        "{c.lastMessageText}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Supervisory Timeline (8 Cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-[#050B1F]">
          {selectedConv ? (
            <>
              {/* Timeline Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      ID: {selectedConv._id}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {selectedConv.status || "ACTIVE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {(selectedConv.participants || [])
                        .map((p) => `${p.user?.name || "User"} (${p.role || p.user?.role || "participant"})`)
                        .join(" — ")}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 justify-end">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> Audit Logged
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Created {new Date(selectedConv.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
                {loadingTimeline ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    Decrypting timeline and generating audit log...
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <MessageSquare className="w-10 h-10 opacity-30 text-cyan-400" />
                    <p className="text-xs">No recorded messages in this conversation.</p>
                  </div>
                ) : (
                  timeline.map((msg) => {
                    const senderName = msg.senderId?.name || msg.senderUser?.name || msg.user?.name || "Participant";
                    const senderRole = msg.senderRole || msg.senderId?.role || "user";

                    return (
                      <div
                        key={msg._id}
                        className={`p-3.5 rounded-xl border space-y-1.5 ${
                          msg.isDeleted
                            ? "bg-rose-950/10 border-rose-500/20"
                            : "bg-white/[0.02] border-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{senderName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-white/5 text-cyan-300 border border-white/10">
                              {senderRole}
                            </span>
                            {msg.isDeleted && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Soft-Deleted
                              </span>
                            )}
                            {msg.isEdited && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Edited
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="text-xs text-slate-200">
                          {msg.isDeleted ? (
                            <p className="italic text-rose-300/80">"{msg.text || "This message was deleted"}"</p>
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}
                        </div>

                        {/* Edit History for Compliance */}
                        {msg.editHistory && msg.editHistory.length > 0 && (
                          <div className="mt-2 p-2 rounded-lg bg-black/30 border border-amber-500/20 space-y-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                              Compliance Edit Log ({msg.editHistory.length})
                            </span>
                            {msg.editHistory.map((h, hIdx) => (
                              <div key={hIdx} className="text-[10px] text-slate-400 flex items-center justify-between">
                                <span className="italic">"{h.previousText}"</span>
                                <span>{new Date(h.editedAt).toLocaleTimeString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Attachments ({msg.attachments.length})
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {msg.attachments.map((att, aIdx) => (
                                <a
                                  key={aIdx}
                                  href={`/api/admin/conversations/${selectedConv._id}/attachments/${att.filename}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 transition-colors"
                                >
                                  <FileIcon className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-[150px]">{att.originalName || att.filename}</span>
                                  <Download className="w-3 h-3 text-slate-400 ml-1" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {msg.reactions.map((r, rIdx) => (
                              <span key={rIdx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">
                                {r.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={timelineEndRef} />
              </div>

              {/* Read-Only Supervisory Footer */}
              <div className="p-3 border-t border-white/10 bg-slate-900/40 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Supervisory monitoring is strictly read-only. Message creation and modifications are disabled.</span>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center">
              <ShieldCheck className="w-12 h-12 opacity-20 text-cyan-400" />
              <p className="text-xs font-semibold text-slate-400">Select a Conversation</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Choose any user-to-user conversation thread on the left to inspect timeline and audit logs.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
