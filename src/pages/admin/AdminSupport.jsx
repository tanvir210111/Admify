import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Bot,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Filter,
  Trash2,
} from "lucide-react";
import { api } from "../../lib/api";
import { initSocket, getSocket } from "../../lib/socket";
import { triggerAdminBadgeRefresh, useAdminBadges } from "../../context/AdminBadgeContext";
import toast from "react-hot-toast";

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export default function AdminSupport() {
  const { getStatusCount, markEntityAsSeen } = useAdminBadges();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await api.get("/api/admin/support/conversations");
      if (res?.success) {
        const convList = res.data?.conversations || [];
        setConversations(convList);
        if (!selectedConv && convList.length > 0) {
          selectConversation(convList[0]);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to load support inbox");
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (conv) => {
    setSelectedConv(conv);
    const sid = conv.sessionId || conv.id || conv._id;
    if (!sid) return;
    if (!conv.isSeenByAdmin) {
      conv.isSeenByAdmin = true;
      markEntityAsSeen("support", sid);
    }
    try {
      setLoadingMessages(true);
      const res = await api.get(`/api/admin/support/conversations/${sid}`);
      if (res?.success) {
        setMessages(res.data?.messages || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.data?.message || err?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    const token = localStorage.getItem("admify_token") || localStorage.getItem("token");
    const socket = initSocket(token) || getSocket();
    if (!socket) return;

    const handleNewRequest = () => {
      fetchConversations();
    };

    const handleMessageReceived = (data) => {
      if (data?.sessionId && selectedConv && (selectedConv.sessionId === data.sessionId || selectedConv.id === data.sessionId)) {
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      }
      fetchConversations();
    };

    const handleConversationDeleted = (data) => {
      if (data?.sessionId) {
        setConversations((prev) =>
          prev.filter((c) => (c.sessionId || c.id || c._id) !== data.sessionId)
        );
        if (selectedConv && (selectedConv.sessionId === data.sessionId || selectedConv.id === data.sessionId)) {
          setSelectedConv(null);
          setMessages([]);
        }
      }
    };

    socket.on("new_support_request", handleNewRequest);
    socket.on("support_message_received", handleMessageReceived);
    socket.on("support_conversation_deleted", handleConversationDeleted);

    return () => {
      socket.off("new_support_request", handleNewRequest);
      socket.off("support_message_received", handleMessageReceived);
      socket.off("support_conversation_deleted", handleConversationDeleted);
    };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;
    const sid = selectedConv.sessionId || selectedConv.id || selectedConv._id;

    try {
      setSending(true);
      const res = await api.post(`/api/admin/support/conversations/${sid}/reply`, {
        text: replyText.trim(),
        message: replyText.trim(),
      });

      if (res?.success) {
        const newMsg = res.data?.reply || res.data?.message || { sender: 'agent', text: replyText.trim(), createdAt: new Date() };
        setMessages((prev) => [...prev, newMsg]);
        setReplyText("");
        toast.success("Reply delivered to student");
        fetchConversations();
      } else {
        toast.error(res?.message || "Failed to send reply");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.data?.message || err?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConv) return;
    const sid = selectedConv.sessionId || selectedConv.id || selectedConv._id;
    if (!sid) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/api/admin/support/conversations/${sid}`);
      if (res?.success) {
        toast.success("Conversation deleted successfully.");
        setShowDeleteModal(false);
        setConversations((prev) =>
          prev.filter((c) => (c.sessionId || c.id || c._id) !== sid)
        );
        setSelectedConv(null);
        setMessages([]);
        fetchConversations();
      } else {
        toast.error(res?.message || "Failed to delete conversation");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.data?.message || err?.message || "Failed to delete conversation");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = conversations.filter((c) => {
    const studentObj = c.student || c.user || {};
    const matchSearch =
      studentObj.name?.toLowerCase().includes(search.toLowerCase()) ||
      studentObj.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="space-y-4 max-w-[1500px] mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-violet-400" /> Support Desk & Bot Handover
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time human-in-the-loop support inbox for escalated student inquiries and inquiries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchConversations}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingConvs ? "animate-spin" : ""}`} /> Refresh Inbox
          </button>
        </div>
      </div>

      {/* Main Support Chat Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Column: Conversation List */}
        <div className="lg:col-span-4 border-r border-slate-800 flex flex-col h-full bg-slate-950/40">
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search students, emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex items-center gap-1">
              {["all", "needs_agent", "open", "resolved"].map((st) => {
                const count = getStatusCount("supportInbox", st);
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition capitalize flex items-center gap-1 ${
                      statusFilter === st
                        ? "bg-violet-600 text-white"
                        : "bg-slate-800/80 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{st.replace("_", " ")}</span>
                    {count > 0 && (
                      <span className="px-1 py-0.1 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300">
                        [{count}]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {loadingConvs ? (
              <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" />
                Loading conversations...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active support threads found.
              </div>
            ) : (
              filtered.map((c) => {
                const convId = c.sessionId || c.id || c._id;
                const isSelected = (selectedConv?.sessionId || selectedConv?.id || selectedConv?._id) === convId;
                const isUnseen = !c.isSeenByAdmin;
                const studentName = c.student?.name || c.user?.name || `Visitor (${(c.sessionId || '').slice(-6)})`;
                const studentEmail = c.student?.email || c.user?.email || "";
                return (
                  <div
                    key={convId}
                    onClick={() => selectConversation(c)}
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? "bg-violet-900/20 border-l-4 border-violet-500"
                        : isUnseen
                        ? "bg-violet-950/30 border-l-4 border-l-violet-500 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)] hover:bg-violet-950/40"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700 flex-shrink-0">
                      {studentName?.[0]?.toUpperCase() || "V"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-xs truncate">
                          {studentName}
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.lastMessage || "No messages yet"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {(c.status === "needs_agent" || c.isLiveAgentRequest) && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Handover Requested
                          </span>
                        )}
                        {c.status === "resolved" && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Resolved
                          </span>
                        )}
                        {studentEmail && (
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                            {studentEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Messages Thread */}
        <div className="lg:col-span-8 flex flex-col h-full bg-slate-900/30">
          {selectedConv ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                    {(selectedConv.student?.name || selectedConv.user?.name || "V")?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      {selectedConv.student?.name || selectedConv.user?.name || "Visitor"}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedConv.student?.email || selectedConv.user?.email || "Public Visitor"}
                      {selectedConv.student?.phone ? ` • ${selectedConv.student.phone}` : ""} • ID: {selectedConv.sessionId || selectedConv.id || selectedConv._id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      selectedConv.status === "needs_agent" || selectedConv.isLiveAgentRequest
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    Status: {selectedConv.isLiveAgentRequest ? "needs_agent" : (selectedConv.status || "open")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Delete this complete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Conversation</span>
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="p-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
                    Loading conversation transcript...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No message history found for this conversation.
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isSystem = m.sender === "system" || Boolean(m.isLiveAgentRequest);
                    const isAdmin = m.sender === "admin" || m.sender === "agent";
                    const isBot = m.sender === "bot" || m.sender === "ai";

                    if (isSystem) {
                      return (
                        <div key={idx} className="my-3 text-center px-4">
                          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-1.5 text-xs text-amber-300 font-medium shadow-sm">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>{m.message || m.text}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          {isAdmin ? (
                            <span className="text-[10px] font-bold text-violet-400 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin Staff
                            </span>
                          ) : isBot ? (
                            <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                              <Bot className="w-3 h-3" /> Admify AI
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3" /> {selectedConv.student?.name || "Visitor"}
                            </span>
                          )}
                          <span className="text-[9px] text-slate-500">
                            {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                            isAdmin
                              ? "bg-violet-600 text-white rounded-tr-none shadow-md shadow-violet-900/20"
                              : isBot
                              ? "bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none"
                              : "bg-slate-800/80 text-slate-100 border border-slate-700/50 rounded-tl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{m.message || m.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type official reply to student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
                >
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <MessageSquare className="w-12 h-12 mb-3 text-slate-700" />
              <h3 className="font-bold text-slate-300">Select a conversation</h3>
              <p className="text-xs text-slate-500 mt-1">Choose a student inquiry from the left to read and respond.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete this conversation?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Permanent Deletion Confirmation</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete the complete conversation history, including AI and Live Agent messages. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConversation}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-900/30"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Conversation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
