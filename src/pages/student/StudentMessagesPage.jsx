import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useStudentBadges } from "../../context/StudentBadgeContext";
import { studentService } from "../../services/studentService";
import { api } from "../../lib/api";
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  ShieldCheck,
  Crown,
  Lock,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  UserCheck,
  Flag,
  Users2,
  Bot,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import MessageBubble from "../../components/chat/MessageBubble";
import MessageAttachmentPicker from "../../components/chat/MessageAttachmentPicker";
import VoiceRecorder from "../../components/chat/VoiceRecorder";
import {
  initSocket,
  getSocket,
  joinConversationRoom,
  leaveConversationRoom,
  emitTypingStart,
  emitTypingStop,
  fetchPresence,
} from "../../lib/socket";

// Helper to cleanly format text: strip regional indicator flags and format bold text
function cleanRegionalFlags(str) {
  if (!str) return "";
  return str.replace(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g, "").replace(/^DE\s+/i, "").trim();
}

function renderCleanFormattedText(text) {
  if (!text) return null;
  const cleaned = cleanRegionalFlags(text);
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldContent = part.slice(2, -2).replace(/\*/g, "");
      return (
        <strong key={idx} className="font-extrabold text-white">
          {boldContent}
        </strong>
      );
    }
    const cleanPart = part.replace(/\*/g, "");
    return <span key={idx}>{cleanPart}</span>;
  });
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { sidebarCounts, markEntityAsSeen } = useStudentBadges();
  const hasUnseenMessages = (sidebarCounts?.messages || 0) > 0;

  // Active agency service state from studentService
  const [agencyState] = useState(() => studentService.getAgencyAssistanceState(user));

  // Authorized contacts & conversations from unified backend
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [contactPresence, setContactPresence] = useState("offline");

  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // 1. Fetch authorized contacts from backend
  const loadContactsAndConversation = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/conversations/contacts");
      let list = res?.success && Array.isArray(res.data?.contacts) ? res.data.contacts : [];

      // Fallback: If backend returns no contacts yet, check agencyState to allow resolution
      if (list.length === 0 && (agencyState?.assignedAgent || agencyState?.selectedAgency)) {
        const fallbackContact = agencyState.assignedAgent || agencyState.selectedAgency;
        if (fallbackContact?._id || fallbackContact?.id) {
          list = [{
            _id: fallbackContact._id || fallbackContact.id,
            name: fallbackContact.name || fallbackContact.agentName,
            role: 'agent',
            avatar: fallbackContact.avatar || fallbackContact.agentAvatar,
            type: 'Counselor',
          }];
        }
      }

      setContacts(list);

      if (list.length > 0) {
        const contactToSelect = list[0];
        setSelectedContact(contactToSelect);
        await initConversationWithContact(contactToSelect);
      }
    } catch (err) {
      console.warn("Failed to load student contacts:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Resolve or retrieve conversation and load persistent messages
  const initConversationWithContact = async (contact) => {
    const contactId = contact?._id || contact?.id;
    if (!contactId) return;

    try {
      const convRes = await api.post("/api/conversations/direct", {
        receiverId: contactId,
      });

      if (convRes?.success && convRes.data?.conversation) {
        const conv = convRes.data.conversation;
        setConversation(conv);

        // Fetch messages for this conversation
        const msgRes = await api.get(`/api/conversations/${conv._id}/messages`);
        if (msgRes?.success && Array.isArray(msgRes.data?.messages)) {
          setChatMessages(msgRes.data.messages);
        }
      }
    } catch (err) {
      console.warn("Failed to resolve conversation:", err.message);
    }
  };

  useEffect(() => {
    loadContactsAndConversation();
  }, [user?._id]);

  // 3. Socket.io Real-Time Integration & Reconnection Handling
  useEffect(() => {
    const token = localStorage.getItem("admify_token") || localStorage.getItem("token");
    if (!token) return;

    const socket = initSocket(token);
    if (!socket || !conversation?._id) return;

    const convId = conversation._id;
    joinConversationRoom(convId);

    // Fetch initial presence
    if (selectedContact?._id || selectedContact?.id) {
      const cid = selectedContact._id || selectedContact.id;
      fetchPresence([cid], (res) => {
        if (res && res[cid]) setContactPresence(res[cid].status);
      });
    }

    const handleIncomingNewMessage = ({ message }) => {
      if (message.conversationId === convId) {
        setChatMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleIncomingMessageEdited = ({ message }) => {
      setChatMessages((prev) =>
        prev.map((m) => (m._id === message._id ? message : m))
      );
    };

    const handleIncomingMessageDeleted = ({ messageId }) => {
      setChatMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: "This message was deleted", attachments: [] }
            : m
        )
      );
    };

    const handleIncomingReactionUpdated = ({ messageId, reactions }) => {
      setChatMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    };

    const handleIncomingUserTyping = ({ conversationId, userId }) => {
      if (conversationId === convId && userId !== user?._id?.toString()) {
        setIsOtherTyping(true);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setIsOtherTyping(false), 3500);
      }
    };

    const handleIncomingUserStoppedTyping = ({ conversationId, userId }) => {
      if (conversationId === convId && userId !== user?._id?.toString()) {
        setIsOtherTyping(false);
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      }
    };

    const handleIncomingPresenceChanged = ({ userId, status }) => {
      const cid = (selectedContact?._id || selectedContact?.id)?.toString();
      if (userId?.toString() === cid) {
        setContactPresence(status);
      }
    };

    // Reconnection catch-up: rejoin room and re-fetch latest messages from REST
    const handleReconnect = async () => {
      joinConversationRoom(convId);
      try {
        const msgRes = await api.get(`/api/conversations/${convId}/messages`);
        if (msgRes?.success && Array.isArray(msgRes.data?.messages)) {
          setChatMessages(msgRes.data.messages);
        }
      } catch {}
    };

    socket.on("new_message", handleIncomingNewMessage);
    socket.on("message_edited", handleIncomingMessageEdited);
    socket.on("message_deleted", handleIncomingMessageDeleted);
    socket.on("message_reaction_updated", handleIncomingReactionUpdated);
    socket.on("user_typing", handleIncomingUserTyping);
    socket.on("user_stopped_typing", handleIncomingUserStoppedTyping);
    socket.on("user_presence_changed", handleIncomingPresenceChanged);
    socket.on("connect", handleReconnect);

    return () => {
      leaveConversationRoom(convId);
      socket.off("new_message", handleIncomingNewMessage);
      socket.off("message_edited", handleIncomingMessageEdited);
      socket.off("message_deleted", handleIncomingMessageDeleted);
      socket.off("message_reaction_updated", handleIncomingReactionUpdated);
      socket.off("user_typing", handleIncomingUserTyping);
      socket.off("user_stopped_typing", handleIncomingUserStoppedTyping);
      socket.off("user_presence_changed", handleIncomingPresenceChanged);
      socket.off("connect", handleReconnect);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversation?._id, selectedContact?._id, user?._id]);

  useEffect(() => {
    if (hasUnseenMessages) {
      markEntityAsSeen("messages", "all");
    }
  }, [hasUnseenMessages, markEntityAsSeen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleFileSelect = (file) => {
    setAttachmentFile(file);
    if (file.type?.startsWith("image/")) {
      setAttachmentPreview(URL.createObjectURL(file));
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleClearAttachment = () => {
    if (attachmentPreview) {
      URL.revokeObjectURL(attachmentPreview);
    }
    setAttachmentFile(null);
    setAttachmentPreview(null);
  };

  const handleSaveEdit = async (msgId, newText) => {
    if (!conversation) return;
    const res = await api.patch(`/api/conversations/${conversation._id}/messages/${msgId}`, {
      text: newText,
    });
    if (res?.success && res.data?.message) {
      setChatMessages((prev) =>
        prev.map((m) => (m._id === msgId ? res.data.message : m))
      );
      toast.success("Message edited successfully.");
    }
  };

  const handleToggleReaction = async (msgId, emoji) => {

    if (!conversation) return;
    try {
      await api.post(`/api/conversations/${conversation._id}/messages/${msgId}/reactions`, { emoji });
    } catch (err) {
      toast.error(err.message || "Failed to update reaction.");
    }
  };

  const handleVoiceRecorded = (file) => {
    setAttachmentFile(file);
    setAttachmentPreview(null);
    toast.success("Voice note attached. Click Send to deliver.");
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (conversation?._id) {
      emitTypingStart(conversation._id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachmentFile) || !conversation || sending) return;

    const content = inputText.trim();
    setSending(true);

    try {
      let res;
      if (attachmentFile) {
        const formData = new FormData();
        if (content) formData.append("text", content);
        formData.append("attachment", attachmentFile);
        res = await api.post(`/api/conversations/${conversation._id}/messages`, formData);
      } else {
        res = await api.post(`/api/conversations/${conversation._id}/messages`, {
          text: content,
        });
      }

      if (res?.success && res.data?.message) {
        setChatMessages((prev) => {
          if (prev.some((m) => m._id === res.data.message._id)) return prev;
          return [...prev, res.data.message];
        });
        setInputText("");
        handleClearAttachment();
        markEntityAsSeen("message", res.data.message._id);
        if (conversation?._id) emitTypingStop(conversation._id);
      }
    } catch (err) {
      toast.error(err.message || "Failed to deliver message.");
    } finally {
      setSending(false);
    }
  };

  const assignedAgency = agencyState?.selectedAgency;
  const assignedAgent = selectedContact || agencyState?.assignedAgent || (assignedAgency ? {
    name: assignedAgency.agentName,
    role: assignedAgency.agentRole,
    avatar: assignedAgency.agentAvatar,
    agencyName: assignedAgency.name,
    online: true,
  } : null);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. NO ACTIVE AGENCY VIEW (Prompt student to activate agency service)
  // ──────────────────────────────────────────────────────────────────────────
  if (!loading && contacts.length === 0 && !agencyState?.hasActiveRequest && !assignedAgency) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Communication</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Counselor Messages</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-cyan-400" />
              <span>Counselor Messaging</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Direct counselor messaging requires an active Agency Assistance (800 CR) or Full Managed Service (1,500 CR) order.
            </p>
          </div>
        </div>

        {/* Locked Screen */}
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#0B1228] via-[#07142D] to-[#0B1228] border border-cyan-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10 relative z-10">
            <Users2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              Agency Service Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              No Active Agency Counselor Assigned Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              To communicate directly with a certified admissions counselor for personalized university liaison, document verification, and visa support, activate an agency service from your Credit Wallet.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto relative z-10">
            <button
              onClick={() => navigate("/student/agency-assistance")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-[#050B1F] font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Users2 className="w-4 h-4" />
              <span>Explore Agency Services (800 CR) →</span>
            </button>
            <Link
              to="/student/chatbot"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0B1228] hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Use Free AI Chatbot</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ACTIVE COUNSELOR MESSAGING VIEW
  // ──────────────────────────────────────────────────────────────────────────
  const isFullManaged = assignedAgency?.serviceType === "FULL_AGENCY_MANAGED" || agencyState?.tier === "FULL_AGENCY_MANAGED";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Communication</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              {isFullManaged ? "Full Agency Managed Service Desk" : "Agency Assistance Counselor Desk"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-purple-400" />
            <span>Counselor Messages</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-purple-500/15 text-purple-300 border-purple-500/30">
              {isFullManaged ? "Dedicated Managing Counselor" : "Assigned Support Counselor"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Direct 1-on-1 persistent communication channel with your assigned admissions counselor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadContactsAndConversation}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition flex items-center gap-2 text-xs font-semibold"
            title="Refresh conversation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/student/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            title="File report with Admin Panel"
          >
            <Flag className="w-3.5 h-3.5 text-amber-400" />
            <span>Report Agent</span>
          </Link>
        </div>
      </div>

      {/* If No Contact has been assigned yet */}
      {!assignedAgent ? (
        <div className="p-10 rounded-3xl bg-[#0B1228] border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-white">No active counselor assigned yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Submit an Agency Assistance request. Once an agency or counselor is assigned to your profile, your persistent 1-to-1 conversation will appear here.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/student/agency-assistance"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20"
            >
              <Users2 className="w-4 h-4" />
              <span>Go to Agency Assistance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Active Messaging Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Assigned Agent Profile */}
          <div className="lg:col-span-1 p-5 rounded-3xl bg-[#0B1228] border border-slate-800 space-y-5 h-fit shadow-xl">
            <div className="text-center space-y-3 pb-4 border-b border-slate-800">
              <div className="relative inline-block">
                <img
                  src={assignedAgent.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                  alt={assignedAgent.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-500 shadow-md mx-auto"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0B1228] rounded-full" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{assignedAgent.name}</h3>
                <p className="text-xs text-purple-300 font-medium">{assignedAgent.role || "Certified Counselor"}</p>
                {assignedAgency && <p className="text-[11px] text-slate-400">{assignedAgency.name}</p>}
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Online & Active</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {assignedAgency && (
                <div className="p-3 rounded-xl bg-[#07142D] border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Agency</span>
                  <span className="text-white font-bold">{assignedAgency.name}</span>
                </div>
              )}
              {assignedAgency?.country && (
                <div className="p-3 rounded-xl bg-[#07142D] border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Country of Agency</span>
                  <span className="text-cyan-300 font-bold">{assignedAgency.country}</span>
                </div>
              )}
              <div className="p-3 rounded-xl bg-[#07142D] border border-slate-800/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Support Scope</span>
                <span className="text-slate-200 font-medium">Persistent messaging, document review & university liaison</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <Link
                to="/student/reports"
                className="w-full py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>Flag / Report to Admin</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Chat Window */}
          <div
            className={`lg:col-span-3 flex flex-col h-[650px] rounded-3xl bg-[#0B1228] transition-all shadow-xl overflow-hidden ${
              hasUnseenMessages
                ? "border-l-4 border-l-violet-500 shadow-[inset_0_0_24px_rgba(139,92,246,0.12)] border border-violet-500/40"
                : "border border-slate-800"
            }`}
          >
            {/* Chat Header */}
            <div className="p-4 px-6 bg-[#07142D] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={assignedAgent.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"}
                  alt={assignedAgent.name}
                  className="w-10 h-10 rounded-xl object-cover border border-purple-500/40"
                />
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{assignedAgent.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Counselor
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {assignedAgency?.name ? `Official Agency Liaison: ${assignedAgency.name}` : "Verified Admissions Counselor"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      contactPresence === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-300 capitalize">
                    {contactPresence}
                  </span>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCheck className="w-4 h-4" />
                  <span>Secure 1-to-1 Channel</span>
                </span>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Start your conversation</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Send a message to your assigned admissions counselor to coordinate your documents, university choices, and application deadlines.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <MessageBubble
                    key={msg._id || msg.id}
                    msg={msg}
                    currentUserId={user?._id}
                    senderAvatar={assignedAgent.avatar}
                    senderName={assignedAgent.name}
                    themeColor="purple"
                    onSaveEdit={handleSaveEdit}
                    onToggleReaction={handleToggleReaction}
                  />

                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator Banner */}
            {isOtherTyping && (
              <div className="px-6 py-1.5 text-xs text-purple-300 bg-purple-950/40 border-t border-purple-500/20 flex items-center gap-2 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                <span className="italic">{assignedAgent.name || "Counselor"} is typing...</span>
              </div>
            )}

            {/* Chat Input Bar with Attachment & Voice Recorder */}
            <form onSubmit={handleSendMessage} className="relative p-4 bg-[#07142D] border-t border-slate-800 flex items-center gap-2.5">
              <MessageAttachmentPicker
                attachment={attachmentFile}
                previewUrl={attachmentPreview}
                onSelect={handleFileSelect}
                onClear={handleClearAttachment}
                disabled={sending}
              />
              <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} disabled={sending} />
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onBlur={() => {
                  if (conversation?._id) emitTypingStop(conversation._id);
                }}
                placeholder={
                  attachmentFile
                    ? "Add an optional caption..."
                    : `Message ${assignedAgent.name} regarding applications, university requirements, or documents...`
                }
                className="flex-1 bg-[#0B1228] border border-slate-700/60 rounded-xl py-3 px-4 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={(!inputText.trim() && !attachmentFile) || sending}
                className="p-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
