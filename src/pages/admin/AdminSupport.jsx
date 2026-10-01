import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  User,
  Bot,
  Shield,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { api } from "../../lib/api";
import { initSocket, getSocket } from "../../lib/socket";
import { useAdminBadges } from "../../context/AdminBadgeContext";
import SafeMarkdown from "../../components/chat/SafeMarkdown";
import toast from "react-hot-toast";

const NEAR_BOTTOM = 120;

const fade = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

const getSenderType = (m) => {
  if (m.sender === "system" || m.isLiveAgentRequest) return "system";
  if (m.sender === "admin" || m.sender === "agent") return "admin";
  if (m.sender === "bot" || m.sender === "ai" || m.role === "model" || m.role === "assistant") return "bot";
  return "visitor";
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
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const scrollContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const wasNearBottomRef = useRef(true);
  const prevMsgCountRef = useRef(0);

  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const handleScrollEvent = useCallback(() => {
    const near = isNearBottom();
    wasNearBottomRef.current = near;
    if (near) setShowScrollIndicator(false);
  }, [isNearBottom]);

  useLayoutEffect(() => {
    if (messages.length === 0) {
      prevMsgCountRef.current = 0;
      wasNearBottomRef.current = true;
      setShowScrollIndicator(false);
      return;
    }
    const prev = prevMsgCountRef.current;
    prevMsgCountRef.current = messages.length;
    if (prev === 0) {
      requestAnimationFrame(() => {
        const el = scrollContainerRef.current;
        if (el) { el.scrollTop = el.scrollHeight; wasNearBottomRef.current = true; }
      });
      return;
    }
    if (messages.length > prev) {
      requestAnimationFrame(() => {
        if (wasNearBottomRef.current) {
          scrollToBottom("smooth");
          setShowScrollIndicator(false);
        } else {
          setShowScrollIndicator(true);
        }
      });
    }
  }, [messages, scrollToBottom]);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await api.get("/api/admin/support/conversations");
      if (res?.success) {
        const convList = res.data?.conversations || [];
        setConversations(convList);
        if (!selectedConv && convList.length > 0) selectConversation(convList[0]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.message || "Failed to load support inbox");
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (conv) => {
    prevMsgCountRef.current = 0;
    wasNearBottomRef.current = true;
    setShowScrollIndicator(false);
    setMessages([]);
    setSelectedConv(conv);
    const sid = conv.sessionId || conv.id || conv._id;
    if (!sid) return;
    if (!conv.isSeenByAdmin) { conv.isSeenByAdmin = true; markEntityAsSeen("support", sid); }
    try {
      setLoadingMessages(true);
      const res = await api.get(`/api/admin/support/conversations/${sid}`);
      if (res?.success) setMessages(res.data?.messages || []);
    } catch (err) {
      toast.error(err.response?.data?.message || err?.data?.message || err?.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  useEffect(() => {
    fetchConversations();
    const token = localStorage.getItem("admify_token") || localStorage.getItem("token");
    const socket = initSocket(token) || getSocket();
    if (!socket) return;
    const handleNewRequest = () => fetchConversations();
    const handleMessageReceived = (data) => {
      if (data?.sessionId && selectedConv && (selectedConv.sessionId === data.sessionId || selectedConv.id === data.sessionId)) {
        if (data.message) setMessages((prev) => [...prev, data.message]);
      }
      fetchConversations();
    };
    const handleConversationDeleted = (data) => {
      if (data?.sessionId) {
        setConversations((prev) => prev.filter((c) => (c.sessionId || c.id || c._id) !== data.sessionId));
        if (selectedConv && (selectedConv.sessionId === data.sessionId || selectedConv.id === data.sessionId)) {
          setSelectedConv(null); setMessages([]);
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

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;
    const sid = selectedConv.sessionId || selectedConv.id || selectedConv._id;
    try {
      setSending(true);
      const res = await api.post(`/api/admin/support/conversations/${sid}/reply`, { text: replyText.trim(), message: replyText.trim() });
      if (res?.success) {
        const newMsg = res.data?.reply || res.data?.message || { sender: "agent", text: replyText.trim(), createdAt: new Date() };
        setMessages((prev) => [...prev, newMsg]);
        setReplyText("");
        toast.success("Reply delivered to student");
        fetchConversations();
      } else { toast.error(res?.message || "Failed to send reply"); }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.data?.message || err?.message || "Failed to send reply");
    } finally { setSending(false); }
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
        setConversations((prev) => prev.filter((c) => (c.sessionId || c.id || c._id) !== sid));
        setSelectedConv(null); setMessages([]);
        fetchConversations();
      } else { toast.error(res?.message || "Failed to delete conversation"); }
    } catch (err) {
      toast.error(err.response?.data?.message || err?.data?.message || err?.message || "Failed to delete conversation");
    } finally { setDeleting(false); }
  };

  const filtered = conversations.filter((c) => {
    const s = c.student || c.user || {};
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()) || c.lastMessage?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const visitorName = selectedConv ? selectedConv.student?.name || selectedConv.user?.name || `Visitor (${(selectedConv.sessionId || "").slice(-6)})` : "Visitor";
  const getSenderLabel = (type) => { if (type === "admin") return "Admin Staff"; if (type === "bot") return "Admify AI"; return visitorName; };

  return (
    <motion.div initial="hidden" animate="show" variants={fade} className="flex-1 flex flex-col min-h-0 w-full max-w-[1600px] mx-auto text-slate-100 overflow-hidden">

      {/* Page title */}
      <div className="flex-shrink-0 mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" /> Support Desk &amp; Bot Handover
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">Real-time human-in-the-loop support inbox for escalated student inquiries</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={fetchConversations} className="p-2 sm:p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingConvs ? "animate-spin" : ""}`} /> Refresh Inbox
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

        {/* LEFT: Conversation list */}
        <div className={`${selectedConv ? "hidden lg:flex" : "flex"} lg:col-span-4 lg:border-r border-slate-800 flex-col h-full min-h-0 bg-slate-950/40 overflow-hidden`}>
          <div className="p-3 border-b border-slate-800 space-y-2 flex-shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input type="text" placeholder="Search students, emails..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 transition-colors" />
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar">
              {["all", "needs_agent", "open", "resolved"].map((st) => {
                const count = getStatusCount("supportInbox", st);
                return (
                  <button key={st} onClick={() => setStatusFilter(st)} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition capitalize flex items-center gap-1 flex-shrink-0 cursor-pointer ${statusFilter === st ? "bg-violet-600 text-white" : "bg-slate-800/80 text-slate-400 hover:text-white"}`}>
                    <span>{st.replace("_", " ")}</span>
                    {count > 0 && <span className="px-1 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300">[{count}]</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {loadingConvs ? (
              <div className="p-8 text-center text-slate-500"><RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-violet-400" /><span className="text-xs">Loading conversations...</span></div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No active support threads found.</div>
            ) : filtered.map((c) => {
              const convId = c.sessionId || c.id || c._id;
              const isSelected = (selectedConv?.sessionId || selectedConv?.id || selectedConv?._id) === convId;
              const isUnseen = !c.isSeenByAdmin;
              const sName = c.student?.name || c.user?.name || `Visitor (${(c.sessionId || "").slice(-6)})`;
              const sEmail = c.student?.email || c.user?.email || "";
              return (
                <div key={convId} onClick={() => selectConversation(c)} className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${isSelected ? "bg-violet-900/20 border-l-4 border-violet-500" : isUnseen ? "bg-violet-950/30 border-l-4 border-l-violet-500 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)] hover:bg-violet-950/40" : "hover:bg-slate-800/40"}`}>
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700 flex-shrink-0">{sName?.[0]?.toUpperCase() || "V"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs truncate">{sName}</h4>
                      <span className="text-[10px] text-slate-500 flex-shrink-0 ml-1">{c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMessage || "No messages yet"}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {(c.status === "needs_agent" || c.isLiveAgentRequest) && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">Handover Requested</span>}
                      {c.status === "resolved" && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Resolved</span>}
                      {sEmail && <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">{sEmail}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Conversation panel
            Architecture:
              flex-col h-full min-h-0 overflow-hidden relative
              ├── Header       (flex-shrink-0)
              ├── Messages     (flex-1 min-h-0 overflow-y-auto)  ← ONLY this scrolls
              ├── [Indicator]  (absolute, floats above composer)
              └── Composer     (flex-shrink-0)
        */}
        <div className={`${selectedConv ? "flex" : "hidden lg:flex"} lg:col-span-8 flex-col h-full min-h-0 bg-slate-900/30 overflow-hidden relative`}>
          {selectedConv ? (
            <>
              {/* 1. FIXED HEADER */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button type="button" onClick={() => { setSelectedConv(null); setMessages([]); }} className="lg:hidden p-1.5 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer flex-shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0 shadow-lg shadow-violet-900/30">
                    {visitorName[0]?.toUpperCase() || "V"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm truncate leading-tight">{visitorName}</h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {selectedConv.student?.email || selectedConv.user?.email || "Public Visitor"}
                      {selectedConv.student?.phone ? ` · ${selectedConv.student.phone}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${selectedConv.status === "needs_agent" || selectedConv.isLiveAgentRequest ? "bg-amber-500/10 text-amber-400 border-amber-500/25" : "bg-slate-800 text-slate-300 border-slate-700"}`}>
                    {selectedConv.isLiveAgentRequest ? "needs_agent" : selectedConv.status || "open"}
                  </span>
                  <button type="button" onClick={() => setShowDeleteModal(true)} className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>

              {/* 2. MESSAGE HISTORY — THE ONLY SCROLLABLE ELEMENT
                  flex-1      → fills remaining height between header and composer
                  min-h-0     → allows flex item to shrink below its content size
                  overflow-y-auto → enables vertical scrollbar when content overflows
                  overflow-x-hidden → prevents horizontal page expansion from long content
              */}
              <div ref={scrollContainerRef} onScroll={handleScrollEvent} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="px-4 pt-4 pb-2 flex flex-col">

                  {loadingMessages && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mb-2 text-violet-400" />
                      <span className="text-xs">Loading conversation...</span>
                    </div>
                  )}

                  {!loadingMessages && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                      <MessageSquare className="w-10 h-10 mb-3 text-slate-700" />
                      <span className="text-xs">No message history found for this conversation.</span>
                    </div>
                  )}

                  {!loadingMessages && messages.map((m, idx) => {
                    const senderType = getSenderType(m);
                    const prevType = idx > 0 ? getSenderType(messages[idx - 1]) : null;
                    const nextType = idx < messages.length - 1 ? getSenderType(messages[idx + 1]) : null;
                    const isFirstInGroup = senderType !== prevType;
                    const isLastInGroup = senderType !== nextType;
                    const topMargin = idx === 0 ? "mt-0" : isFirstInGroup ? "mt-5" : "mt-1";

                    // System / escalation notice — centred pill
                    if (senderType === "system") {
                      return (
                        <div key={idx} className={`flex justify-center ${topMargin}`}>
                          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full px-4 py-1.5 text-[11px] text-amber-300 font-medium max-w-[90%] shadow-sm">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>{m.message || m.text}</span>
                          </div>
                        </div>
                      );
                    }

                    const isAdmin = senderType === "admin";
                    const isBot = senderType === "bot";

                    const bubbleClass = isAdmin
                      ? "bg-violet-600 text-white shadow-md shadow-violet-900/20"
                      : isBot
                      ? "bg-slate-800 text-slate-200 border border-slate-700/60 shadow-sm"
                      : "bg-slate-800/70 text-slate-100 border border-slate-700/40 shadow-sm";

                    const AvatarIcon = isBot ? Bot : isAdmin ? Shield : User;
                    const avatarClass = isBot
                      ? "bg-cyan-900/40 border-cyan-500/25 text-cyan-400"
                      : isAdmin
                      ? "bg-violet-800/50 border-violet-500/30 text-violet-300"
                      : "bg-slate-800 border-slate-700 text-slate-400";

                    const labelClass = isAdmin ? "text-violet-400" : isBot ? "text-cyan-400" : "text-slate-400";

                    return (
                      <div key={idx} className={`flex ${isAdmin ? "flex-row-reverse" : "flex-row"} items-end gap-2 ${topMargin}`}>

                        {/* Avatar — only for last message in group */}
                        <div className="w-7 flex-shrink-0 self-end">
                          {isLastInGroup
                            ? <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${avatarClass}`}><AvatarIcon className="w-3.5 h-3.5" /></div>
                            : <div className="w-7 h-7" />}
                        </div>

                        {/* Message column */}
                        <div className={`flex flex-col ${isAdmin ? "items-end" : "items-start"} min-w-0`} style={{ maxWidth: "72%" }}>

                          {/* Sender label — first message in group only */}
                          {isFirstInGroup && (
                            <span className={`text-[10px] font-semibold mb-1 flex items-center gap-1 ${labelClass}`}>
                              <AvatarIcon className="w-3 h-3" />
                              {getSenderLabel(senderType)}
                            </span>
                          )}

                          {/* Bubble */}
                          <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words ${bubbleClass}`} style={{ overflowWrap: "anywhere" }}>
                            {isBot
                              ? <SafeMarkdown content={m.message || m.text} />
                              : <p className="whitespace-pre-wrap">{m.message || m.text}</p>}
                          </div>

                          {/* Timestamp — last message in group only */}
                          {isLastInGroup && m.createdAt && (
                            <span className="text-[10px] text-slate-600 mt-1">
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Bottom sentinel */}
                  <div ref={messagesEndRef} className="h-2 flex-shrink-0" />
                </div>
              </div>

              {/* ↓ New messages indicator — appears when scrolled up and new msg arrives */}
              <AnimatePresence>
                {showScrollIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute bottom-[4.5rem] inset-x-0 flex justify-center z-20 pointer-events-none"
                  >
                    <button
                      type="button"
                      onClick={() => { scrollToBottom("smooth"); setShowScrollIndicator(false); }}
                      className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/95 hover:bg-violet-500 text-white text-xs font-bold shadow-xl shadow-violet-900/50 border border-violet-400/30 backdrop-blur-sm transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" /> New messages
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3. FIXED COMPOSER */}
              <form onSubmit={handleSendReply} className="flex-shrink-0 px-4 py-3 border-t border-slate-800 bg-slate-950/60 backdrop-blur-sm flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type official reply to student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-500"
                />
                <button type="submit" disabled={sending || !replyText.trim()} className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-violet-600/20 cursor-pointer flex-shrink-0">
                  {sending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-300 text-sm">Select a conversation</h3>
              <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">Choose a student inquiry from the left panel to read the full conversation and respond.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete this conversation?</h3>
                <p className="text-xs text-slate-400 mt-0.5">Permanent Deletion Confirmation</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">This will permanently delete the complete conversation history, including all AI messages, Live Agent exchanges, and associated data. This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" disabled={deleting} onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer">Cancel</button>
              <button type="button" disabled={deleting} onClick={handleDeleteConversation} className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-900/30">
                {deleting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Deleting...</span></> : <><Trash2 className="w-3.5 h-3.5" /><span>Delete Conversation</span></>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
